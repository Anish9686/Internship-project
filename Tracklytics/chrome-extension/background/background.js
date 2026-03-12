import { categorizeWebsite, extractDomain } from '../utils/categorizer.js';
import { saveBrowsingData, getBrowsingData, clearBrowsingData } from '../utils/storage.js';

let activeTabId = null;
let activeWindowId = null;
let startTime = null;
let currentDomain = null;

const SYNC_INTERVAL_MINUTES = 5;

// === Tracking Logic ===

const handleTabChange = async (tabId, windowId) => {
    // If we were already tracking a tab, save the elapsed time
    if (activeTabId !== null && startTime !== null && currentDomain) {
        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTime) / 1000);

        if (durationSeconds > 0) {
            const category = categorizeWebsite(currentDomain);
            await saveBrowsingData(currentDomain, category, durationSeconds);
        }
    }

    // Start tracking the new tab
    if (tabId && windowId !== chrome.windows.WINDOW_ID_NONE) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab && tab.url && tab.url.startsWith('http')) {
                activeTabId = tabId;
                activeWindowId = windowId;
                startTime = Date.now();
                currentDomain = extractDomain(tab.url);
            } else {
                activeTabId = null;
                startTime = null;
                currentDomain = null;
            }
        } catch (error) {
            console.error("Error getting tab info:", error);
            activeTabId = null;
            startTime = null;
            currentDomain = null;
        }
    } else {
        activeTabId = null;
        startTime = null;
        currentDomain = null;
    }
};

// Listeners for active tab tracking
chrome.tabs.onActivated.addListener(activeInfo => {
    handleTabChange(activeInfo.tabId, activeInfo.windowId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.url) {
        // Active tab navigated to a new URL
        handleTabChange(tabId, tab.windowId);
    }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Browser lost focus
        handleTabChange(null, windowId);
    } else {
        // Browser gained focus, find active tab
        const [tab] = await chrome.tabs.query({ active: true, windowId });
        if (tab) {
            handleTabChange(tab.id, windowId);
        }
    }
});

// === API Sync Logic ===

const syncDataToBackend = async () => {
    const data = await getBrowsingData();
    if (!data || data.length === 0) return;

    try {
        // We use activityData parameter as expected by controllers/activityController.js
        const response = await fetch('http://localhost:5000/api/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Assuming extension needs auth? The route is protected.
                // Normally we'd grab the JWT from chrome.storage. 
                // For this implementation, we simulate without auth or assuming mock dashboard
                'Authorization': `Bearer MOCK_TOKEN_UNLESS_PROVIDED_IN_DASHBOARD`
            },
            body: JSON.stringify({ activityData: data })
        });

        if (response.ok) {
            console.log("Successfully synced data to backend.");
            // Clear local storage after successful sync to prevent duplicate syncing
            await clearBrowsingData();
        } else {
            console.error("Failed to sync data", await response.text());
        }
    } catch (error) {
        console.error("Error syncing to backend:", error);
    }
};

// Periodic alarm to trigger sync
chrome.alarms.create("syncData", { periodInMinutes: SYNC_INTERVAL_MINUTES });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "syncData") {
        syncDataToBackend();
    }
});

// Manual sync listener for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "syncNow") {
        // Force flush current tracking state first
        if (currentDomain) {
            const endTime = Date.now();
            const durationSeconds = Math.round((endTime - startTime) / 1000);
            if (durationSeconds > 0) {
                const category = categorizeWebsite(currentDomain);
                saveBrowsingData(currentDomain, category, durationSeconds).then(() => {
                    // Reset start time so we don't double count
                    startTime = Date.now();
                    syncDataToBackend().then(() => sendResponse({ status: "success" }));
                });
                return true; // Keep channel open
            }
        }

        syncDataToBackend().then(() => sendResponse({ status: "success" }));
        return true; // Keep message channel open for async
    }
});

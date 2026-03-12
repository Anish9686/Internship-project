import { getBrowsingData } from '../utils/storage.js';

const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
};

const updateUI = async () => {
    const data = await getBrowsingData();
    let productiveSecs = 0;
    let unproductiveSecs = 0;

    data.forEach(item => {
        if (item.category === 'productive') productiveSecs += item.duration;
        if (item.category === 'unproductive') unproductiveSecs += item.duration;
    });

    document.getElementById('productive-time').textContent = formatTime(productiveSecs);
    document.getElementById('unproductive-time').textContent = formatTime(unproductiveSecs);
};

document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    document.getElementById('sync-btn').addEventListener('click', () => {
        const statusEl = document.getElementById('status-text');
        statusEl.textContent = 'Syncing...';
        chrome.runtime.sendMessage({ action: "syncNow" }, (response) => {
            if (response && response.status === "success") {
                statusEl.textContent = 'Synced successfully!';
                updateUI(); // Data might be cleared after sync
                setTimeout(() => statusEl.textContent = 'Tracking active...', 2000);
            } else {
                statusEl.textContent = 'Sync failed.';
            }
        });
    });

    document.getElementById('dashboard-btn').addEventListener('click', () => {
        // Change URL to match the exact Dashboard React URL
        chrome.tabs.create({ url: 'http://localhost:5173' });
    });
});

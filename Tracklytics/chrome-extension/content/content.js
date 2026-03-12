// Listen for visibility changes to accurately track active time on the page
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page is visible and active
        chrome.runtime.sendMessage({ type: 'page_visible', url: window.location.href });
    } else {
        // Page is hidden or minimized
        chrome.runtime.sendMessage({ type: 'page_hidden', url: window.location.href });
    }
});

// This can communicate back to the background script

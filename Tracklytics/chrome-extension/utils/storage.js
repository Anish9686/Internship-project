export const saveBrowsingData = async (domain, category, duration) => {
    if (!domain || duration < 1) return; // Ignore invalid or tiny durations

    const today = new Date().toISOString().split('T')[0];

    try {
        const data = await chrome.storage.local.get(['browsingData']);
        let allData = data.browsingData || [];

        // Find existing entry for today and this domain
        const existingIndex = allData.findIndex(d => d.website === domain && d.date === today);

        if (existingIndex >= 0) {
            allData[existingIndex].duration += duration;
        } else {
            allData.push({
                website: domain,
                category: category,
                duration: duration,
                date: today
            });
        }

        await chrome.storage.local.set({ browsingData: allData });
    } catch (error) {
        console.error("Error saving browsing data:", error);
    }
};

export const getBrowsingData = async () => {
    const data = await chrome.storage.local.get(['browsingData']);
    return data.browsingData || [];
};

export const clearBrowsingData = async () => {
    await chrome.storage.local.set({ browsingData: [] });
};

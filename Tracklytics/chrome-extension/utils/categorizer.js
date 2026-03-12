export const categorizeWebsite = (domain) => {
    const productiveSites = [
        'github.com',
        'stackoverflow.com',
        'leetcode.com',
        'chat.openai.com',
        'chatgpt.com',
        'claude.ai'
    ];

    const unproductiveSites = [
        'instagram.com',
        'facebook.com',
        'youtube.com',
        'twitter.com',
        'x.com',
        'reddit.com',
        'tiktok.com'
    ];

    if (productiveSites.some(site => domain.includes(site))) return 'productive';
    if (unproductiveSites.some(site => domain.includes(site))) return 'unproductive';

    return 'neutral';
};

export const extractDomain = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return null;
    }
};

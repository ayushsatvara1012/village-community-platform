import { API_URL } from '../config';

// 15 curated DiceBear avatars with specific customizations (verified for v9.x toon-head)
export const DICEBEAR_AVATARS = [
    { seed: 'Ram', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'sideComed', eyes: 'humble', beard: 'fullBeard', clothes: 'turtleNeck', clothesColor: 'f97316', backgroundColor: 'b6e3f4' } },
    { seed: 'Sita', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'd1d4f9' } },
    { seed: 'Hanuman', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'spiky', eyes: 'humble', beard: 'longBeard', clothes: 'turtleNeck', clothesColor: 'b11f1f', backgroundColor: 'ffdfbf' } },
    { seed: 'Kiya', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'd1d4f9' } },
    { seed: 'Ravi', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'undercut', eyes: 'humble', beard: 'fullBeard', clothes: 'turtleNeck', clothesColor: '151613', backgroundColor: 'ffd5dc' } },
    { seed: 'Pooja', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'c0aede' } },
    { seed: 'Bharat', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'sideComed', eyes: 'humble', beard: 'fullBeard', clothes: 'turtleNeck', clothesColor: '147f3c', backgroundColor: 'ffebae' } },
    { seed: 'KaiKai', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'e1f4f5' } },
    { seed: 'Jamvn', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'sideComed', eyes: 'humble', beard: 'longBeard', clothes: 'turtleNeck', clothesColor: '731ac3', backgroundColor: 'd1fae5' } },
    { seed: 'Laxmi', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'fef3c7' } },
    { seed: 'Ravan', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'sideComed', eyes: 'humble', beard: 'longBeard', clothes: 'turtleNeck', clothesColor: '545454', backgroundColor: 'd1fae5' } },
    { seed: 'Mandodri', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'fff7ed' } },
    { seed: 'Abimanyu', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'spiky', eyes: 'humble', beard: 'fullBeard', clothes: 'turtleNeck', clothesColor: '0b3286', backgroundColor: 'f0fdf4' } },
    { seed: 'Panchali', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'ecfdf5' } },
    { seed: 'Karna', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'spiky', eyes: 'humble', beard: 'moustacheTwirl', clothes: 'turtleNeck', clothesColor: 'eab308', backgroundColor: 'fff1f2' } },
    { seed: 'Yashoda', options: { skinColor: 'f1c3a5', mouth: 'smile', hairColor: '2c1b18', hair: 'bun', eyes: 'happy', beard: '', backgroundColor: 'f5f3ff' } }
];

/**
 * Generates a DiceBear SVG URL for the "toon-head" style (v9.x).
 */
export const dicebearUrl = (seed, options = {}) => {
    const finalOptions = { ...options };
    if (finalOptions.backgroundColor) {
        finalOptions.backgroundType = 'solid';
    }
    const params = new URLSearchParams({
        seed,
        ...finalOptions
    }).toString();
    return `https://api.dicebear.com/9.x/toon-head/svg?${params}`;
};

/**
 * Returns the predefined options for a given avatar seed.
 */
export const getAvatarOptions = (seed) => {
    return DICEBEAR_AVATARS.find(a => a.seed === seed)?.options || { backgroundColor: 'f1f5f9' };
};

/**
 * Generates a DiceBear SVG URL for the "initials" style (v9.x).
 */
export const initialsUrl = (name) => {
    const params = new URLSearchParams({
        seed: name || 'User',
        fontSize: 45,
        fontWeight: 600,
        backgroundType: 'solid',
        backgroundColor: '6366f1,a855f7,ec4899,f43f5e,f97316,eab308,22c55e,06b6d4,3b82f6'
    }).toString();
    return `https://api.dicebear.com/9.x/initials/svg?${params}`;
};

/**
 * Robustly converts a potentially relative image path into a full URL.
 * Also handles legacy localhost URLs.
 */
export const getFullImageUrl = (url) => {
    if (!url) return '';

    // If it's already an absolute URL (starts with http)
    if (url.startsWith('http')) {
        // Fix legacy hardcoded 127.0.0.1 by replacing it with current API_URL
        if (url.includes('127.0.0.1:8000') && !API_URL.includes('127.0.0.1:8000')) {
            return url.replace('http://127.0.0.1:8000', API_URL);
        }
        return url;
    }

    // If it's a relative path (starts with /), prepend API_URL
    if (url.startsWith('/')) {
        return `${API_URL}${url}`;
    }

    // Default fallback
    return url;
};

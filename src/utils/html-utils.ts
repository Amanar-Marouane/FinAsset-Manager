/**
 * Decodes HTML entities in a string (browser or Node-safe)
 */
export const decodeHtmlEntities = (str: unknown) : string => {
    if (!str || typeof str !== 'string') return '';

    if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        return textarea.value;
    }

    // Fallback for Node: simple replacements for common entities
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

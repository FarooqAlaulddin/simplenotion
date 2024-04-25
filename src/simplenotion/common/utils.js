/**
 * Retrieves the value of a nested property within an object using dot notation.
 * @param {string} path - The path to the nested property using dot notation.
 * @param {object} obj - The object from which to retrieve the property value.
 * @returns {*} The value of the nested property, or undefined if the property is not found.
 */
export const getProperty = (path, obj) => {

    if (path.startsWith('.')) {
        path = path.substring(1);
    }

    if (!path || typeof path !== 'string' || !obj || typeof obj !== 'object') return;

    const keys = path.split('.');

    let result = obj;
    for (const key of keys) {
        if (!result.hasOwnProperty(key)) return; // Property not found, return undefined
        result = result[key]; // Move to the next nested object
    }

    return result;
};
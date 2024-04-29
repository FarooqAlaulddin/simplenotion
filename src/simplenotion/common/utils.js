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

    if (!path || typeof path !== 'string' || !obj || typeof obj !== 'object') return null;

    const keys = path.split('.');

    let result = obj;
    for (const key of keys) {
        if (!result.hasOwnProperty(key)) return null; // Property not found, return undefined
        result = result[key]; // Move to the next nested object
    }

    return result;
};


// Function to read JSON file based on environment (Node.js or browser)
export const readFile = async (path) => {
    let jsonData;

    if (typeof window === 'undefined') {
        // Node.js environment
        const fs = require('fs').promises;
        try {
            const fileData = await fs.readFile(path, 'utf-8');
            jsonData = JSON.parse(fileData);
        } catch (error) {
            console.error(`Error reading JSON file: ${error}`);
            return null
        }
    } else {
        // Browser environment
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON: ${response.statusText}`);
            }
            jsonData = await response.json();
        } catch (error) {
            console.error(`Error fetching JSON: ${error}`);
            return null
        }
    }

    return jsonData;
}
// import notionConfigs from '+sn/notionConfigs.json';
import { SimpleNotionException } from '+sn/errors';
import { ConfigurationManager } from '+sn/conf';

/**
 * Ez
 * @param {string} databaseName;
 * @param {array} properties;
 */
const checkSupportedPropertyTyeps = async (databaseName, properties) => {
    const unSupportedTypes = [];
    const supportedPropertyTypes = await ConfigurationManager.prototype.base('database.supportedPropertyTypes');

    Object.entries(properties).forEach(([name, property]) => {
        if (!supportedPropertyTypes.includes(property.type)) {
            unSupportedTypes.push(name);
        }
    });

    if (unSupportedTypes.length > 0) {
        throw new SimpleNotionException(
            1000,
            `Please consider changing the property types of the following fields: ${unSupportedTypes} in ${databaseName} database.`);
    }
};

export default checkSupportedPropertyTyeps;

import { readFile, getProperty } from '+sn/common';

// defined user configs?
const USER_DEFINED_CONFIGS_PATH = process.env.simplenotion || null;
let USER_DEFINED_CONFIGS = undefined;

if (USER_DEFINED_CONFIGS_PATH) {
    USER_DEFINED_CONFIGS = readFile(USER_DEFINED_CONFIGS_PATH + "/simplenotion.json");
} else {
    USER_DEFINED_CONFIGS = null;
}

export const config = {
    settings: {
        Logs: false,
        Promise_Handler: 'allSettled',
        test: "in_default",
        insertMode: "non-strict",
        Supported_Database_Property_Types: ["title", "rich_text", "date", "number"]
    },
    isReady: async () => {
        if (USER_DEFINED_CONFIGS === null) return true;
        USER_DEFINED_CONFIGS = await USER_DEFINED_CONFIGS;
        return true
    },
    get: function (field) {

        let fieldValue = undefined;
        if (typeof USER_DEFINED_CONFIGS === 'object') {
            fieldValue = getProperty(field, USER_DEFINED_CONFIGS);
            if (fieldValue !== null) {
                return fieldValue
            }
        }

        fieldValue = getProperty(field, config);
        if (fieldValue !== null) {
            return fieldValue
        }

        return null;
    }
};

export class ConfigObject {

    constructor(priorityConfigs = null) {
        this.priorityConfigs = priorityConfigs

        return this
    }

    async isReady() {
        return await config.isReady()
    }

    get(field) {

        if (typeof this.priorityConfigs === 'object') {
            const fieldValue = getProperty(field, this.priorityConfigs)
            if (fieldValue !== null) {
                return fieldValue;
            }
        }

        return config.get(field);
    }
}

export async function Config(...args) {
    const cnf = new ConfigObject(...args);
    await cnf.isReady();
    return cnf;
}
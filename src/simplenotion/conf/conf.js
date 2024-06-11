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
        test: "in_default",
        Insert_Is_Atomic: false,
        Supported_Database_Property_Types: ["title", "rich_text", "date", "number"]
    },
    notion: {
        // null means optional
        pageProperties: {
            url: function (url) {
                return { url: url }
            },
            title: function (...args) { return { title: [this.rich_text_text(...args)] } },
            rich_text_text: function (content, url = null) {
                return {
                    text: { content: content },
                    ...(url ? { link: this.url(url) } : null)
                }
            },
            rich_text: function (...args) {
                let type = 'text';
                // TODO: base on the incoming args, decide if type = text | mention | equation
                return {
                    rich_text: [
                        this[`rich_text_${type}`](...args)
                    ]
                }
            },
            number: function (number) {
                return {
                    number: Number(number),
                }
            },
            date: function (start, end = null, time_zone = null) {
                // TODO: more checks @ https://developers.notion.com/reference/property-value-object#date-property-values
                return {
                    date: {
                        start: start,
                        ...(end ? { end: end } : null),
                        ...(time_zone ? { time_zone: time_zone } : null)
                    }
                }
            },
            // instanceof: function (propery, ) {
            //     console.log(this[propery]('text', value))
            // }
        }
    },

    // functions..
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
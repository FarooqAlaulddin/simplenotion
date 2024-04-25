import simpleNotionConfig from './simplenotion.json';
import base from './base.json';

import { SimpleNotionException } from '+sn/errors';

const USER_DEFINED_BEHAVIORAL_CONFIGS_NAME = 'simplenotion.json';

/**
 * configurationManager is the tool resposible for getting the required configs in the following order:
 * - Object Level.
 * - simplenotion.json located in the current working directory of the node.js process.
 * - Default config defined in +sn/conf.
 * @param {object} classUniqueConfigs
 * @return {object}
 */
export const ConfigurationManager = function (classUniqueConfigs = {}) {
    // console.log(process.env.simplenotion + '/' + 'simplenotion.json');
    this.classUniqueConfigs = classUniqueConfigs;
    return true;
};

/**
 * behavioral is a function that can retrieve behavioral config settings from different locations.
 * - It will first tries to see if field is defined at the class level, if so it will return it.
 * - Otherwise, it will tries to see if field is defined at the global level, if so it will return it.
 * - if field is not found, it will use behavioral.json
 * @param {string} field - String based fields (i.e. foo.boo).
 * @return {string}
 */

ConfigurationManager.prototype.behavioral = async function (field) {
    // check if field is in class-defined-configs
    if (typeof this.classUniqueConfigs === 'object') {
        const reqField = getProperty(field, this.classUniqueConfigs);
        if (reqField) return reqField;
    }

    try {

        // if user had defined simplenotion.json at process.cwd && <field> is present
        const USER_DEFINED_BEHAVIORAL_CONFIGS = await getUserDefinedBehavioralPresent();
        const reqField = getProperty(field, USER_DEFINED_BEHAVIORAL_CONFIGS);

        if (reqField) return reqField;

        // return default value for field
        else return getPropertyFromDefaultBehavioral(field);
    } catch (err) {
        // incase somthing happend during readFileSync, ingore errors and use default value for field
        return getPropertyFromDefaultBehavioral(field);
    }


};

ConfigurationManager.prototype.base = function (field) {
    const reqField = getProperty(field, base);

    if (reqField) {
        return reqField;
    }

    throw new Error(`${field} is not in base.json`);
};

/**
 * getProperty
 * @param {string} path - String based fields (i.e. foo.boo).
 * @param {object} obj - JSON contains config set.
 * @return {object|null}
 */
const getProperty = (path, obj) => {
    if (!path) return;

    const keys = path.split('.');

    // first level fields
    if (keys.length === 1) return obj[path];

    // nested fields
    let reqField = null;
    for (const i in keys) {
        if (typeof obj[keys[i]] === 'object') {
            reqField = obj[keys[i]];
        } else {
            return reqField[keys[i]];
        }
    }

    return null;
};


const getUserDefinedBehavioralPresent = async () => {

    // Dynamic import path, cwd, readFileSync, and existsSync
    const [path, { cwd }, { readFileSync, existsSync }] = await Promise.all([
        import('path'),
        import('process'),
        import('fs')
            .then(module => ({ readFileSync: module.readFileSync, existsSync: module.existsSync }))
    ]);

    const USER_DEFINED_BEHAVIORAL_CONFIGS_PATH = cwd() + path.sep + USER_DEFINED_BEHAVIORAL_CONFIGS_NAME;
    let USER_DEFINED_BEHAVIORAL_CONFIGS = null;

    if (!existsSync(USER_DEFINED_BEHAVIORAL_CONFIGS_PATH)) {
        throw new SimpleNotionException(0, `Global '${USER_DEFINED_BEHAVIORAL_CONFIGS_NAME}' was not found. Default configuration will be used instead.`);
    }

    try {
        USER_DEFINED_BEHAVIORAL_CONFIGS = readFileSync(USER_DEFINED_BEHAVIORAL_CONFIGS_PATH, { encoding: 'utf8', flag: 'r' });
    } catch (error) {
        throw new SimpleNotionException(0, error);
    }

    try {
        return JSON.parse(USER_DEFINED_BEHAVIORAL_CONFIGS);
    } catch (error) {
        throw new SimpleNotionException(0, `${error} in ${USER_DEFINED_BEHAVIORAL_CONFIGS_PATH}.`);
    }

};


const getPropertyFromDefaultBehavioral = (field) => {
    return getProperty(field, simpleNotionConfig);
};

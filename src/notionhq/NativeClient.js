import {
    Client,
    LogLevel,
} from '@notionhq/client';


/**
 * Notion native client class
 */
export default class NativeClient {
    #nativeClient;

    /**
     * @constructor
     * @param {string} NOTION_SECRET_TOKEN
     */
    constructor(NOTION_SECRET_TOKEN) {
        this.#nativeClient = new Client({
            auth: NOTION_SECRET_TOKEN,
            logLevel: LogLevel.ERROR,
        });
    }

    /**
     * @method
     * @param {string} NOTION_SECRET_TOKEN
     * @return {true|false}
     */
    _setNativeClient(NOTION_SECRET_TOKEN) {
        this.#nativeClient = new Client({
            auth: NOTION_SECRET_TOKEN,
            logLevel: LogLevel.ERROR,
        });

        return typeof this.#nativeClient === 'object';
    }

    /**
     * @method
     * @return {Object}
     */
    _getNativeClient() {
        return this.#nativeClient;
    }
}

import { NativeClient } from '+notionhq';
import { SimpleNotionException } from '+sn/errors';
import { checkSupportedPropertyTyeps, DataTypes } from '+sn/common';
import { ConfigurationManager } from '+sn/conf';
import { Query } from '+sn/database';

/** @module Database */

/**
 * Simplenotion Database class. The purpose of this class is to make the interaction process with notion database easier.
 */
export class Database extends NativeClient {
    #isDatabaseReady = false;
    #metadata = null;

    /**
     * The purpose of this class is to make the interaction process with notion database easier.
     * @param { string } notionToken - Notion Integration Token Key. Make sure the Integration is applied to the database/s.
     * @param { string } databaseID - Unique identifier for a notion database.
     * @param { object } userClassConfig
     */
    constructor(notionToken = null, databaseID = null, userClassConfig = {}) {
        super();

        /* FIXME:
            if notionToken == null or?and? databaseID == null
                userClassConfig for the tokens
        */
        this._setNativeClient(notionToken);
        this.databaseID = databaseID;

        // contains everything needed to connect t
        this.notionClient = this._getNativeClient();


        // To be populated
        this.name = null;
        this.createdTime = null;
        this.lastEditedTime = null;
        this.parent = null;
        this.properties = null;

        this.userClassConfig = userClassConfig;
    }

    // *************************************************************************************************************
    // Secondary Methods
    // *************************************************************************************************************

    /*
        *** Async Methods ***
    */

    /**
     * isReady() makes initial connection to the notion database to make sure of the following:
     *  - Connection to the Notion Client is established given the notionToken.
     *  - Populates Metadata.
     *  - Checks database property types compatibility with simplenotion.
     * @return {boolean} true - if the above criteria is true, otherwise it will throw error.
     */
    async isReady() {
        if (this.#isDatabaseReady === true) return true;

        try {
            this.#metadata = await this._getNativeClient().databases.retrieve(
                { 'database_id': this.databaseID });
            this.name = this.#metadata.title[0].plain_text;
            this.createdTime = this.#metadata.created_time;
            this.lastEditedTime = this.#metadata.last_edited_time;
            this.parent = this.#metadata.parent;
            this.properties = this.#metadata.properties;
        } catch (error) {
            throw new SimpleNotionException(1001, error);
        }

        await checkSupportedPropertyTyeps(this.name, this.properties).catch((err) => console.log(err));


        // sort database properties alphabetically
        this.properties = Object.fromEntries(Object.entries(this.properties).sort());


        // config setup
        this.configurationManager = new ConfigurationManager(this.userClassConfig);

        // Notion Database Object Provider
        this.dataTypes = new DataTypes();

        // ************************************
        // Database ready for action!
        this.#isDatabaseReady = true;
        // ************************************


        // BEYOND THIS POINT DATABASE SHOULD BE READY FOR USE!
        // Define functionalities that needs to know for sure that database is ready for use.

        // Create Query instance
        this.query = new Query(this);

        return true;
    }

    /**
     * Method used to insert data into notion database.
     */
    async insert(...args) {
        // User data.
        // Array warp, incase the first param is not array of objects.
        const incomingData = [args[0]].flat();

        // Notion Database accept data in a certain format. Incoming data must follow this format.
        const notionDatabaseInputFormat = [];



        // Rows => Row =>
        incomingData.map((row) => {
            // temp row object to hold all the properties
            let tempRowObject = {};

            Object.entries(row).map(([fieldName, content]) => {
                // Check if fieldName is indeed a database field
                if (!this.propertyNames.includes(fieldName)) {
                    const message = `Trying to insert data '${content}' into unknow database field '${fieldName}'. Remove '${fieldName}' field from your input data or create a new '${fieldName}' field in ${this.name} database.`;
                    throw new SimpleNotionException(1002, message);
                }

                // get fieldName Type
                const fieldNameType = this.getFieldTypeByFieldName(fieldName);

                // contact the generated dataType object to tempRowObject.
                tempRowObject = { ...tempRowObject, ...this.dataTypes['SET_' + fieldNameType](fieldName, content) };
            });

            // push new tempRowObject to notionDatabaseInputFormat
            notionDatabaseInputFormat.push(tempRowObject);
        });

        const insertMethod = await this.configurationManager.behavioral('insertMode');

        if (insertMethod === 'non-strict') {
            // Method used to insert data into database using Promise.allSettled().
            const notionResponse = await Promise.allSettled(this.#pushInsertPromsises(notionDatabaseInputFormat));
            return this.#handleCompletedNotionPromises(notionResponse);

        } else if (insertMethod === 'strict') {
            /* TODO:
                - need to be woked on after Query function is complete/
                - Query function is called to get the last inputed PageIDs
                - This Query result is passed to delete function to peform the delete required.
                OR
                    - Maybe handle input without a promise collection?
                        meaning having a for loop and checking the result if it was inputed or not?
            */

            // Method used to insert data into database using Promise.all().
            // let notionResponse = await Promise.all(this.#pushInsertPromsises(notionDatabaseInputFormat));
            // return notionResponse;
        }


        throw new SimpleNotionException(1004);
    }


    async delete(ids) {
        const promises = ids.map(id => this.#deleteNotionPageInDatabaseParent(id))
        const notionResponse = await Promise.allSettled(promises);
        return this.#handleCompletedNotionPromises(notionResponse)
    }

    // Getters

    /**
     * Get to get database field names.
     * @return {Array<string>} - Database field names as array of strings.
     */
    get propertyNames() {
        return Object.keys(this.properties);
    }


    /**
     * Method to get native notion field type by field name.
     * @param {string} fieldName
     * @return {string} The native notion data type of the passed fieldName.
     */
    getFieldTypeByFieldName(fieldName) {
        return Object.entries(this.properties).find(([key]) => key === fieldName)[1].type;
    }

    // *************************************************************************************************************
    // Helpers Methods - Hidden
    // *************************************************************************************************************


    #handleCompletedNotionPromises(notionResponse) {
        return notionResponse.map((p) => {
            if (p.status == 'fulfilled') {
                return { 'id': p.value.id, 'status': p.status };
            } else if (p.status == 'rejected') {
                let message = '';
                try {
                    message = JSON.parse(p.reason.body).message;
                } catch (err) {
                    message = p.reason.message;
                }
                return { 'id': null, 'status': p.status, 'message': message };
            }
        });
    }

    /**
     * pushInsertPromsises function pushs notion format object to a promise array to be handled as a collection
     * @private
     * @param {Array.<object>} notionDatabaseInputFormat
     * @return {Array.<promises>} Array of promises
     */
    #pushInsertPromsises(notionDatabaseInputFormat) {
        const promises = [];
        notionDatabaseInputFormat.forEach((row) => {
            promises.push(this.#createNotionPageInDatabaseParent(row));
        });
        return promises;
    }


    /**
     * Method used to delete a notion block by id
     * @private
     * @param {string} pageId
     * @return {Promise} notion API promise object
     */
    #deleteNotionPageInDatabaseParent(pageId) {
        return this._getNativeClient().blocks.delete({
            block_id: pageId,
        });
    }

    /**
     * Method used to insert a single row in the specified database.
     * As for Notion, every single row of the database is basically a page.
     * So, this method is going to create a page using the parent's metadata and attach it to parent (parent_id = database_id)
     * @private
     * @param {object} page proprties and content of the newly created row (aka page).
     * @return {Promise} notion API promise object:
     * - on success => page object(notion page) containing metadata for the newly created row (aka page).
     * - on error => error object(http-type) containing the reason why the row (aka page) was not created.
     */
    #createNotionPageInDatabaseParent(page) {
        return this._getNativeClient().pages.create({
            parent: {
                'type': 'database_id',
                'database_id': this.databaseID,
            },
            properties: page,
        });
    }
}
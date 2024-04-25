import { NativeClient } from '+notionhq';
import { SimpleNotionException } from '+sn/errors';
import { DataTypes } from '+sn/common';
import { getProperty } from '+sn/common/utils';


/** @module Query */

/** @typedef {import('./Database').Database} Database */

/** @typedef {{name: string, databaseId: string, database: Database}} databaseRef*/

/** @typedef {'and' | 'or'} op */

/**
 * Qyery is a class for database queries.
 */
export class Query extends NativeClient {

    // query to be executed
    #query = {};
    #selectedProperties = [];
    #selectedRowProperties = []

    // query level
    #querylevel = [];

    // store any error info that happens during query build to be thrown at run()
    #isQueryReadyforExecute = true;
    #error = { 'code': 2, 'message': '' };


    /**
     * The purpose of this class is to make the querying notion database easier.
     * @param {Array<Database>} databaseObjects - Object of type Database
     */
    constructor(databaseObjects, ...args) {
        super();

        /* TODO: I am thinking that this class could be used to query 1 or more database at the same time. For now
            - Create instance for this class from the Database class and pass <this> object to make query to that specific database
            - Later, if two ore more objects are passed.. this class shuld handle searching more than 1 database
            -        if no databaseObjects passed, this class should get configs from global config file or userconfig passed to this object at init
        */

        // databaseObjects can be array of or single Database object
        databaseObjects = [databaseObjects].flat();

        // Main object to hold information of the database { name:String, database: Object }\
        /** @type {databaseRef[]} */
        this.databaseRefs = this.handleDatabaseRef(databaseObjects);

        this.dataTypes = new DataTypes();
    }

    /**
     * Method used to configure database as [{name:String, database: Object }, ...] from the 1st arg of the constructor,
     * which might have 1 database object or more.
     * @param {Array<DatabaseObject>} databaseObjects - Array of database objects.
     * @return {databaseRef[]} array of database references
     */
    handleDatabaseRef(databaseObjects) {
        const refs = [];

        databaseObjects.forEach((databaseObject) => {
            refs.push({
                name: databaseObject.name,
                databaseId: databaseObject.databaseID,
                database: databaseObject,
            });
        });

        // By default, select the first refs.
        this.indexOfDatabaseInUse = 0;

        return refs;
    }


    /**
     * Method to loop through databaseObjects to make sure that every Database object is in Ready state.
     * @param {Array<DatabaseObject>} databaseObjects - Array of database objects.
     * @return {boolean} whether all instances of Database objects are in ready state
    */
    async isReady() {
        try {
            this.databaseRefs.forEach(async (databaseRef) => {
                const isReady = await databaseRef.database.isReady();
                if (!isReady) {
                    throw new SimpleNotionException(1005);
                }
            });
        } catch (error) {
            return false;
        }

        return true;
    }

    /**
     * Method to create notion filter object
     * @param {string} query Query provided =>
     * [nameOfProperty, notionFilter, dataOfProperty]
     * @return {object} preparedProperty => Notion filter object
     */
    prepareProperty(query) {
        if (query.length !== 3) {
            this.#setError(1007, 'where() first argument needs to be either [] or [[], ..] => [nameOfProperty, notionFilter, dataOfProperty]');
            return -1;
        }

        const filterType = query[1];
        const content = query[2];

        const { name, type } = this.databaseRefs[this.indexOfDatabaseInUse].database.properties[query[0]];
        const preparedProperty = {
            'property': name,
            [type]: {
                [filterType]: content,
            },
        };

        return preparedProperty;
    }

    /**
     * Filter output by table fields
     * @param {string[]} fields 
     * @return {Query}
     */
    get(fields = []) {
        this.#selectedProperties = [];
        this.#selectedRowProperties = [];

        const actualTableProperties = this.#getTableProperties();

        fields.forEach(field => {
            if (typeof field !== 'string') this.#setError(1008, 'only strings allowed');

            if (!field.startsWith('.')) {
                if (!actualTableProperties.hasOwnProperty(field)) this.#setError(1008, `trying to query unknwon property: ${field}`);
                this.#selectedProperties.push(field);
            } else {
                // TODO: more checks?
                this.#selectedRowProperties.push(field);
            }

        })

        return this;
    }

    /**
     * Where
     * @param {string[]} query
     * @param {op} op
     * @return {Query}
     */
    where(query = [], op = '') {
        // we always expect input to be array of arrays, so if we got array => array of arrays
        // const incomingQuery = isArrayOfArrays(query) ? query : [query];
        const incomingQuery = query;

        if (incomingQuery.length == 0) return this;
        else if (incomingQuery.length == 1) {
            this.#query = this.prepareProperty(incomingQuery[0]);
        } else {
            this.#query = this.#convertArrayToObject(incomingQuery);

            // console.log(this.#query);

            // console.log(this.#query);

            // complete the code that converts 'incomingQuery' array form to object form

            // console.log(JSON.stringify(this.#query, null, 4));
        }

        // console.log('where');
        return this;
    }


    #convertArrayToObject = (arr) => {
        // https://stackoverflow.com/questions/75964970/convert-array-to-object-with-special-conditions/75965249#75965249

        const operator = arr[0];
        const result = { [operator]: [] };

        arr.slice(1).reduce((current, val) => {
            if (val === 'and' || val === 'or') {
                // x = {[val]: []}; current.push(x); return x[val];
                return current[current.push({ [val]: [] }) - 1][val];
            } else {
                // TODO: Maybe support [nameOfProperty, notionFilter, dataOfProperty1, dataOfProperty2, ...] by breaking it to multiple entry
                current.push(this.prepareProperty(val));
                return current;
            }
        }, result[operator]);

        return result;
    };


    /** 
     * Get notion table properties
    */
    #getTableProperties() {
        const tableProperties = this.databaseRefs[this.indexOfDatabaseInUse].database.properties
        return tableProperties
    }

    #getSelectedTablePropertyIDs() {
        const tableProperties = this.#getTableProperties()
        const allowedselectedProperties = this.#selectedProperties;
        const selectedTablePropertyIDs = Object.values(tableProperties).filter(p => allowedselectedProperties.includes(p.name)).map(p => p.id)
        return selectedTablePropertyIDs
    }

    /**
     * Reset after query execte.
     */
    #reset() {
        this.#isQueryReadyforExecute = true;
        this.#error = { 'code': 2, 'message': '' };
        this.#query = {};
        this.#selectedProperties = [];
        this.#selectedRowProperties = [];
        this.#querylevel = [];
    }

    /**
     * Set Query build error
     * @param {number} code
     * @param {string} message
     */
    #setError(code = '2', message = '') {
        this.#isQueryReadyforExecute = false;
        this.#error.code = code;
        this.#error.message = message;
    }

    /**
     * Method to run the constructed query to notion.
     */
    async run() {
        if (!this.#isQueryReadyforExecute) {
            throw new SimpleNotionException(this.#error.code, this.#error.message);
        }

        try {
            const notionQuery = {
                'database_id': this.databaseRefs[this.indexOfDatabaseInUse].databaseId,
                'filter_properties': [...new Set([...this.#getSelectedTablePropertyIDs(), 'title'])],
            }

            if (Object.keys(this.#query).length !== 0) {
                notionQuery['filter'] = this.#query
            }

            const response = await this.databaseRefs[this.indexOfDatabaseInUse].database.notionClient.databases.query(notionQuery);
            const results = []

            response.results.forEach(row => {

                const rowFiltered = {}

                Object.entries(row.properties).forEach(([key, value]) => {
                    const text = this.dataTypes['GET_' + value.type](value)
                    rowFiltered[key] = text
                })

                this.#selectedRowProperties.forEach(prop => {
                    if (!rowFiltered.hasOwnProperty(prop)) {
                        rowFiltered[prop] = getProperty(prop, row)
                    }
                })

                results.push(rowFiltered)
            })

            return results;

        } catch (error) {
            throw new SimpleNotionException(1006, error);
        }
    }
}

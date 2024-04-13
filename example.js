// import { Database } from '+sn/database';
// import { Database } from './dist/simplenotion';
// const { Database } = require('./dist/simplenotion.umd.cjs');

import dotenv from 'dotenv';

dotenv.config();

import data from "./example_data.json";

const NOTION_SECRET_TOKEN = process.env.NOTION_SECRET_TOKEN
const TRANSACTIONS_DATABASE_ID = process.env.TRANSACTIONS_DATABASE_ID
// console.log(NOTION_SECRET_TOKEN, TRANSACTIONS_DATABASE_ID);

/* global process */
const database = new Database(NOTION_SECRET_TOKEN, TRANSACTIONS_DATABASE_ID);

await database.isReady().catch(e => console.log(e))

console.log(database.propertyNames);

// insert_example(data);
// query_example()


function insert_example(d) {
    database.insert(d).then((res) => {
        console.log('Index then =>', res);
    }).catch((error) => {
        console.log('Index catch =>', error);
    });
}

function query_example() {
    database
        .query
        .get(['name', 'description'])
        .where(
            [
                'and',
                ['description', 'contains', 'y'],
                ['amount', 'greater_than', 20],
                'or',
                ['name', 'contains', 'st'],
                ['name', 'contains', 'sp'],
            ],
        )
        .run().then((res) => {
            console.log(res);
        }).catch((err) => console.log(err))
}

// database.delete(['47ed87bf-36bb-4c92-916f-44a298b67508']).then((res) => {
//     console.log('Index then =>', res);
// }).catch((error) => {
//     console.log('Index catch =>', error);
// });

// console.log(database.propertyNames);





console.log('\n..Script Ended..\n');
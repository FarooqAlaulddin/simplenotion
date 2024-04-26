// sum.test.js
import { expect } from 'vitest'

import { SN } from "./sn";

SN('get notion database property names', async ({ database }) => {
    const fields = database.propertyNames
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.every(item => typeof item === 'string')).toBe(true);
});

SN('insert #1 data into database', async ({ database, mock_db_data_1, skip }) => {
    skip();
    const res = await database.insert(mock_db_data_1);
    const resSuccess = res.filter(item => item.status === 'fulfilled');
    // Expectation
    expect(resSuccess.length).toBe(res.length);
});

SN('query #1 data from database', async ({ database, SKIP_LOCALLY }) => {

    const query = await database.query.get(['name', 'amount']).where([
        'or',
        ['name', 'contains', 'coffee'],
        ['name', 'contains', 'store']
    ]).run()

    /* 
    [
        { amount: 21.67, name: 'Grocery Store' },
        { amount: 20, name: 'Clothing Store' },
        { amount: 8.18, name: 'Temple Coffee' }
    ]
    */

    expect(query.length).toBe(3);
    expect(query.every(item => item.hasOwnProperty('amount') && item.hasOwnProperty('name'))).toBe(true);
    expect(query.every(item => item.name.toLowerCase().includes('coffee') || item.name.toLowerCase().includes('store'))).toBe(true);

});


SN('query #2 data from database', async ({ database, SKIP_LOCALLY }) => {

    const query = await database.query.get(['name', 'amount']).where([
        'and',
        ['amount', 'less_than', 20],
        'or',
        ['name', 'contains', 'Starbucks'],
        ['name', 'contains', 'Local']
    ]).run()

    /* 
    [
        { amount: 5.99, name: 'Starbucks' },
        { amount: 12.45, name: 'Local Bakery' }
    ]
    */

    expect(query.length).toBe(2);
    expect(query.every(item => item.hasOwnProperty('amount') && item.hasOwnProperty('name'))).toBe(true);
    expect(query.every(item => item.name.toLowerCase().includes('starbucks') || item.name.toLowerCase().includes('local'))).toBe(true);

});


SN('query #3 data from database with unknown field', async ({ database, SKIP_LOCALLY }) => {

    const query = database.query.get(['name', 'amount', 'unknown']).where([
        'and',
        ['amount', 'less_than', 20],
        'or',
        ['name', 'contains', 'Starbucks'],
        ['name', 'contains', 'Local']
    ]).run()

    /* 
    [
        { amount: 5.99, name: 'Starbucks' },
        { amount: 12.45, name: 'Local Bakery' }
    ]
    */
    await expect(query).rejects.to.contain({ code: 1008 });

});

SN('query #3 data from database with unknown field', async ({ database }) => {

    const query = await database.query.get(['.id']).where([
        'and',
        ['amount', 'less_than', 20],
        'or',
        ['name', 'contains', 'Starbucks'],
        ['name', 'contains', 'Local']
    ]).run()

    console.log(query);
})
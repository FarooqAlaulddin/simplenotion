// sum.test.js
import { expect } from 'vitest'

import { SN } from "./sn";

SN('get notion database property names', async ({ database }) => {
    const fields = database.propertyNames
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.every(item => typeof item === 'string')).toBe(true);
});

SN('check if database is empty', async ({ database }) => {

    const query = await database.query.get(['.id']).run()
    expect(query.length).toBe(0)

});

SN('insert #1 data into database', async ({ database, mock_db_data_1 }) => {

    const extra_field = [{
        "type": "card_payment",
        "status": "pending",
        "description": "TEMPLE COFFEE Sacramento CA",
        "date": "must.fail",
        "amount": "8.18",
        "name": "Temple Coffee"
    }]

    const res = await database.insert([...mock_db_data_1, ...extra_field]);

    expect(res.fulfilled.length).toBe(mock_db_data_1.length);
    expect(res.rejected.length).toBe(1);

});

SN('query #1 data from database', async ({ database }) => {

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


SN('query #2 data from database', async ({ database }) => {

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


SN('query #3 data from database with unknown field', async ({ database }) => {

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

SN('query #4 data from database with row propery .id', async ({ database }) => {

    const query = await database.query.get(['.id']).where([
        'and',
        ['amount', 'less_than', 20],
        'or',
        ['name', 'contains', 'Starbucks'],
        ['name', 'contains', 'Local']
    ]).run()

    /*
    [
        { name: 'Starbucks', '.id': 'cb517822-1c2c-4c78-a2d8-553ca5322084' },
        {
          name: 'Local Bakery',
          '.id': '7ea36ddf-f4af-4e3e-a664-d886dd4cc9c2'
        }
    ]
    */

    expect(query.length).toBe(2);
    expect(query.every(item => item.hasOwnProperty('name') && item.hasOwnProperty('.id'))).toBe(true);

})


SN('delete #1 all rows of the database', async ({ database }) => {

    const query = await database.query.get(['.id']).run()
    const items = query.map(item => item['.id']);

    const res = await database.delete(items);
    // const resSuccess = res.filter(item => item.status === 'fulfilled');
    expect(res.fulfilled.length).toBe(items.length);
    expect(res.rejected.length).toBe(0);

})


// SN.fails('insert #1 should fail due to rejected promise. When `Insert_Is_Atomic = true`, transcation is aborted', async ({ database, mock_db_data_1 }) => {

//     // database.Configs.get(".settings.Insert_Is_Atomic")

//     const data_edit = [{
//         "type": "card_payment",
//         "status": "pending",
//         "description": "TEMPLE COFFEE Sacramento CA",
//         "date": "must.fail",
//         "amount": "8.18",
//         "name": "Temple Coffee"
//     }]

//     const res = await database.insert([...mock_db_data_1, ...data_edit]);

//     expect(res.rejected.length).toBe(1);
//     expect(res.rejected[0]).rejects.to.contain({ index: 5 });

//     const items = query.map(item => item['.id']);

//     expect(items.length).toBe(0);

// });
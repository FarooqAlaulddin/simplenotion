// my-test.ts
import { test, afterEach } from 'vitest'
import { Database } from '+sn/database';

let database = null;

const mock_db_data_1 = [
    {
        "type": "card_payment",
        "status": "pending",
        "description": "TEMPLE COFFEE Sacramento CA",
        "date": "2024-02-23",
        "amount": "8.18",
        "name": "Temple Coffee"
    },
    {
        "type": "card_payment",
        "status": "pending",
        "description": "STARBUCKS COFFEE San Francisco CA",
        "date": "2024-03-15",
        "amount": "5.99",
        "name": "Starbucks"
    },
    {
        "type": "card_payment",
        "status": "pending",
        "description": "LOCAL BAKERY Los Angeles CA",
        "date": "2024-01-10",
        "amount": "12.45",
        "name": "Local Bakery"
    },
    {
        "type": "card_payment",
        "status": "posted",
        "description": "CLOTHING STORE Miami FL",
        "date": "2024-02-05",
        "amount": "20.00",
        "name": "Clothing Store"
    },
    {
        "type": "card_payment",
        "status": "posted",
        "description": "GROCERY STORE Chicago IL",
        "date": "2024-02-28",
        "amount": "21.67",
        "name": "Grocery Store"
    },
]

// afterEach(({ task }) => {
//     const state = task.result.state;
// })


export const SN = test.extend({
    NOTION_SECRET_TOKEN: import.meta.env.VITE_TESTS_NOTION_SECRET_TOKEN,
    NOTION_DATABASE_1: import.meta.env.VITE_TESTS_NOTION_DATABASE_1,
    mock_db_data_1,
    database: async function ({ }, use) {

        const NOTION_SECRET_TOKEN = import.meta.env.VITE_TESTS_NOTION_SECRET_TOKEN;
        const NOTION_DATABASE_1 = import.meta.env.VITE_TESTS_NOTION_DATABASE_1;

        database = new Database(NOTION_SECRET_TOKEN, NOTION_DATABASE_1);
        await database.isReady();

        await use(database);

        database = null;
    },
    SKIP_LOCALLY: function ({ skip }) {
        if (process.env?.VITE_TESTS_IS_GETHUB_ACTIONS === 'Actions') return
        skip();
    },
})
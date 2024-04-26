// my-test.ts
import { test } from 'vitest'
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

export const SN = test.extend({

    NOTION_SECRET_TOKEN: import.meta.env.VITE_TESTS_NOTION_SECRET_TOKEN,
    NOTION_DATABASE_1: import.meta.env.VITE_TESTS_NOTION_DATABASE_1,
    database: async function ({ }, use) {
        const NOTION_SECRET_TOKEN = import.meta.env.VITE_TESTS_NOTION_SECRET_TOKEN;
        const NOTION_DATABASE_1 = import.meta.env.VITE_TESTS_NOTION_DATABASE_1;

        database = new Database(NOTION_SECRET_TOKEN, NOTION_DATABASE_1);
        await database.isReady().catch(e => console.log(e))

        await use(database);

        database = null;
    },
    mock_db_data_1,
    SKIP_LOCALLY: function ({ skip }) {
        if (process.env?.GITHUB_ACTIONS === true) return
        skip()
    }
})
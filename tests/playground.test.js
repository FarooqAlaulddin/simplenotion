import { expect } from 'vitest'

import { SN } from "./sn";

import { Database } from '+sn/database';


SN('Playground', async ({ mock_db_data_1, NOTION_SECRET_TOKEN, NOTION_DATABASE_1 }) => {

    const database = new Database(NOTION_SECRET_TOKEN, NOTION_DATABASE_1, {
        settings: { Insert_Is_Atomic: true }
    });
    await database.isReady();

    // const extra_failed_field = [{
    //     "type": "card_payment",
    //     "status": "pending",
    //     "description": "TEMPLE COFFEE Sacramento CA",
    //     "date": "must.fail",
    //     "amount": "8.18",
    //     "name": "Temple Coffee"
    // }]

    // const res = await database.insert(mock_db_data_1); // [...mock_db_data_1, ...extra_failed_field]

    // expect(res.rejected.length).toBe(1);
    // expect(res.rejected[0]).to.contain({ index: 5 });

    // const items = query.map(item => item['.id']);

    // expect(items.length).toBe(0);

});
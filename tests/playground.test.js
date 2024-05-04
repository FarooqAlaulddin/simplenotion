import { expect } from 'vitest'

import { SN } from "./sn";

SN('Playground', async ({ database, mock_db_data_1 }) => {
    const fields = database.propertyNames

    // console.log(database.Configs.get(".settings.Insert_Is_Atomic"));

    // mock_db_data_1.push({
    //     "type": "card_payment",
    //     "status": "pending",
    //     "description": "TEMPLE COFFEE Sacramento CA",
    //     "date": "must.fail",
    //     "amount": "8.18",
    //     "name": "Temple Coffee"
    // })

    // const res = await database.insert(mock_db_data_1);

    // expect(res.rejected.length).toBe(1);
    // expect(res.rejected[0]).rejects.to.contain({ index: 5 });

    // const items = query.map(item => item['.id']);

    // expect(items.length).toBe(0);

});
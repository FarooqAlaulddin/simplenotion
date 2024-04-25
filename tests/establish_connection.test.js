// sum.test.js
import { expect } from 'vitest'
import { Database } from '+sn/database';

import { SN } from "./sn";

SN('notion required variables exists', ({ NOTION_DATABASE_1, NOTION_SECRET_TOKEN }) => {
    expect(NOTION_SECRET_TOKEN).toBeDefined;
    expect(NOTION_DATABASE_1).toBeDefined;
    // expect(false).toBe(true)
})

SN('connect to a notion database', async ({ NOTION_DATABASE_1, NOTION_SECRET_TOKEN }) => {
    const database = new Database(NOTION_SECRET_TOKEN, NOTION_DATABASE_1);
    await expect(database.isReady()).resolves.toBe(true);
})

SN('failed connect to a notion database', async () => {
    const database = new Database('ffff', 'dddd');
    await expect(database.isReady()).rejects.to.contain({ code: 1001 });
})
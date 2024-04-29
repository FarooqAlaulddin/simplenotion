import { expect } from 'vitest'

import { SN } from "./sn";

SN('Playground', async ({ database }) => {
    const fields = database.propertyNames
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.every(item => typeof item === 'string')).toBe(true);
});
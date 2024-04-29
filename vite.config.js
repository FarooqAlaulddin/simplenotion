import { defineConfig } from 'vite';
import { resolve, sep } from 'path';
import * as packageJson from './package.json';

export default defineConfig({

    resolve: {
        alias: {
            "+notionhq": "/src/notionhq",
            "+": "/",
            "+sn": "/src/simplenotion",
            "+sn/database": "/src/simplenotion/database",
            "+sn/page": "/src/simplenotion/page",
            "+sn/errors": "/src/simplenotion/errors",
            "+sn/common": "/src/simplenotion/common",
            "+sn/conf": "/src/simplenotion/conf"
        },
        extensions: ['.js', '.json'],
    },

    test: {
        testTimeout: 1000 * 60,
        bail: 1,
        include: ['./tests/**/*.test.js'],
    },

    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, '/src/index.js'),
            name: 'simplenotion',
            // the proper extensions will be added
            fileName: 'simplenotion',
        }
    }

});

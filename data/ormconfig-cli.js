/* eslint-disable @typescript-eslint/no-var-requires */
const { config } = require('dotenv-safe');
const { join } = require('path');

const envFiles = {
    example: join(__dirname, './.env.example'),
    test: join(__dirname, './.env.local'),
    local: join(__dirname, './.env.local'),
};

/**
 * Get the env file according to current environment, if there is no specified, default to LOCAL
 */
config({
    path: envFiles[process.env.NODE_ENV] || envFiles.local,
    example: envFiles.example,
});

/**
 * Base DB config applicable to migrations and seeds
 */
const base = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['./libs/database/**/*.entity.ts'],
    ssl: process.env.DATABASE_SSL === 'true',
};

module.exports = [
    {
        ...base,
        migrations: ['./data/migrations/*.ts'],
        cli: {
            migrationsDir: `./data/migrations`,
        },
    },
    {
        ...base,
        name: 'seeds',
        migrations: ['./data/seeds-dev/*.ts'],
        cli: {
            migrationsDir: `./data/seeds-dev`,
        },
    },
    {
        ...base,
        name: 'seeds-prod',
        migrations: ['./data/seeds-prod/*.ts'],
        cli: {
            migrationsDir: `./data/seeds-prod`,
        },
    },
];

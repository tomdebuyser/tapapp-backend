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
 const sslRequired = !["local", "test"].includes(process.env.NODE_ENV);
 const base = {
     type: 'postgres',
     url: process.env.DATABASE_URL,
     entities: ['./libs/models/**/*.entity.ts'],
     ssl: sslRequired,
     extra: {
         ssl:
             sslRequired
                 ? { rejectUnauthorized: false }
                 : false,
     },
 };

module.exports = [
    {
        ...base,
        migrations: ['./data/migrations/*.ts'],
        migrationsTableName: 'migrations',
        cli: {
            migrationsDir: `./data/migrations`,
        },
    },
    {
        ...base,
        name: 'seeds',
        migrations: ['./data/seeds-dev/*.ts'],
        migrationsTableName: 'seeds-dev',
        cli: {
            migrationsDir: `./data/seeds-dev`,
        },
    },
    {
        ...base,
        name: 'seeds-prod',
        migrations: ['./data/seeds-prod/*.ts'],
        migrationsTableName: 'seeds-prod',
        cli: {
            migrationsDir: `./data/seeds-prod`,
        },
    },
];

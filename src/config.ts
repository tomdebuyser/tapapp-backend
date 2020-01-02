import { config } from 'dotenv-safe';
import { join } from 'path';

const environment = process.env.NODE_ENV;
function assertNodeEnv(env: string | undefined): asserts env {
    if (!env) {
        throw Error('NODE ENV must be specified');
    }
}

assertNodeEnv(environment);

const environmentsWithEnvFiles = ['local', 'testing'];
if (environmentsWithEnvFiles.includes(environment)) {
    const envFiles = {
        example: join(__dirname, '../.env.example'),
        testing: join(__dirname, '../.env.local'),
        local: join(__dirname, '../.env.local'),
    };

    config({
        path: envFiles[environment] || envFiles.local,
        example: envFiles.example,
    });
}

class Config {
    static get port(): string {
        return process.env.PORT as string;
    }

    static get swaggerPath(): string {
        return process.env.SWAGGER_PATH as string;
    }

    static get projectName(): string {
        return process.env.PROJECT_NAME as string;
    }
}

export { Config };

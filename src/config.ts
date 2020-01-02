import { readFileSync } from 'fs';
import { join } from 'path';

const rawConfig = readFileSync(join(__dirname, '../config.json')).toString();

class Config {
    private _config: Record<string, unknown>;

    constructor(config: string) {
        this._config = JSON.parse(config);
    }

    get port(): string {
        return this._config.port as string;
    }

    get swaggerPath(): string {
        return this._config.swaggerPath as string;
    }

    get projectName(): string {
        return this._config.projectName as string;
    }
}

export default new Config(rawConfig);

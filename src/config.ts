import { config } from 'dotenv-safe';

config();

export class Config {
    static get port(): string {
        return process.env.PORT || '3001';
    }
}

/**
 * These are ordered in ascending in level / priority.
 * See: https://github.com/pinojs/pino/blob/master/docs/api.md#level-string
 */
export type LogLevel =
    | 'silent'
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'fatal';

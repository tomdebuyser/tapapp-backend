import { LogLevel } from './logger.types';

/**
 * Injection token for the Namespace.
 */
export const namespaceToken = 'namespace';
/**
 * Key under which the trace id will be stored in our cls-hooked Namespace.
 */
export const traceIdKey = 'TRACE_ID';
/**
 * Key for incoming request's trace id header.
 */
export const traceIdHeaderName = 'x-request-id';

/**
 * Mapping of the LogLevel type, to a number indicating the level's priority.
 */
export const logLevelNumeric: Record<LogLevel, number> = {
    silent: 0,
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
    fatal: 6,
};

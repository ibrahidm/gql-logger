export default class Logger {
    readonly appName?: string;
    readonly level: number;
    readonly trace: string;
    readonly correlation?: string | undefined;
    readonly session?: string;
    readonly userId?: string;
    readonly identifier?: string;
    private LOG_LEVELS;
    constructor({ level, appName, correlation, session, userId, identifier, }: {
        level: number;
        appName?: string;
        correlation?: string;
        session?: string;
        userId?: string;
        identifier?: string;
    });
    start(self: string, status?: number): void;
    end(self: string, status?: number): void;
    debug(origin: string, message: string, status?: number): void;
    info(origin: string, message: string, status?: number): void;
    warn(origin: string, message: string, status?: number): void;
    error(origin: string, error: Error, status?: number, timeEnd?: boolean): void;
    private time;
    private timeEnd;
}

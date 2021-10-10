import uid from 'uniqid';

export default class Logger {
  readonly appName?: string;
  readonly level: number;
  readonly trace: string;
  readonly correlation?: string | undefined;
  readonly session?: string;
  readonly userId?: string;
  readonly identifier?: string;

  private LOG_LEVELS = {
    OFF: 0,
    ERROR: 1,
    INFO: 2,
    WARN: 3,
    DEBUG: 4,
  };

  constructor({
    level = 4,
    appName,
    correlation,
    session,
    userId,
    identifier,
  }: {
    level: number;
    appName?: string;
    correlation?: string;
    session?: string;
    userId?: string;
    identifier?: string;
  }) {
    this.appName = appName;
    this.level = process.env.LOG_LEVEL
      ? parseInt(process.env.LOG_LEVEL)
      : level;
    this.trace = `${correlation ? correlation : 'UNSET'}-${uid()}`;
    this.session = session;
    this.userId = userId;
    this.identifier = identifier;
  }

  start(self: string, status?: number): void {
    this.info(self, `${self} called`, status);
    this.time(`${self} - ${this.trace}`);
  }

  end(self: string, status?: number): void {
    this.info(self, `${self} invoked successfully`, status);
    this.timeEnd(`${self} - ${this.trace}`);
  }

  debug(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.DEBUG) return;
    console.debug({
      origin,
      message,
      trace: this.trace,
      status: status || 200,
      ts: Date.now(),
      type: this.debug.name,
      ...(this.session && { session: this.session }),
      ...(this.userId && { userId: this.userId }),
      ...(this.identifier && { identifier: this.identifier }),
      ...(this.appName && { app: this.appName }),
    });
  }

  info(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.INFO) return;
    console.info({
      origin,
      message,
      trace: this.trace,
      status: status || 200,
      ts: Date.now(),
      type: this.info.name,
      ...(this.session && { session: this.session }),
      ...(this.userId && { userId: this.userId }),
      ...(this.identifier && { identifier: this.identifier }),
      ...(this.appName && { app: this.appName }),
    });
  }

  warn(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.WARN) return;
    console.warn({
      origin,
      message,
      trace: this.trace,
      status: status || 200,
      ts: Date.now(),
      type: this.warn.name,
      ...(this.session && { session: this.session }),
      ...(this.userId && { userId: this.userId }),
      ...(this.identifier && { identifier: this.identifier }),
      ...(this.appName && { app: this.appName }),
    });
  }

  error(origin: string, error: Error, status?: number, timeEnd = true): void {
    if (this.level < this.LOG_LEVELS.ERROR) return;
    console.error({
      origin,
      message: error.message,
      trace: this.trace,
      status: status || 500,
      ts: Date.now(),
      type: this.error.name,
      ...(this.session && { session: this.session }),
      ...(this.userId && { userId: this.userId }),
      ...(this.identifier && { identifier: this.identifier }),
      ...(this.appName && { app: this.appName }),
    });
    timeEnd && this.timeEnd(`${self} - ${this.trace}`);
  }

  private time(label: string): void {
    console.time(label);
  }

  private timeEnd(label: string): void {
    console.timeEnd(label);
  }
}

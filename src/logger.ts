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
    level?: number;
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

  private output(
    sender: string,
    origin: string,
    message: string,
    status: number
  ): Record<string, unknown> {
    return {
      origin,
      message,
      trace: this.trace,
      status,
      ts: Date.now(),
      type: sender,
      ...(this.session && { session: this.session }),
      ...(this.userId && { userId: this.userId }),
      ...(this.identifier && { identifier: this.identifier }),
      ...(this.appName && { app: this.appName }),
    };
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
    const self = this.debug.name;
    console.debug({
      ...this.output(self, origin, message, status || 200),
    });
  }

  info(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.INFO) return;
    const self = this.info.name;
    console.info({
      ...this.output(self, origin, message, status || 200),
    });
  }

  warn(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.WARN) return;
    const self = this.warn.name;
    console.warn({
      ...this.output(self, origin, message, status || 200),
    });
  }

  error(origin: string, error: Error, status?: number, timeEnd = true): void {
    if (this.level < this.LOG_LEVELS.ERROR) return;
    const self = this.error.name;
    console.error({
      ...this.output(self, origin, error.message, status || 500),
    });
    timeEnd && this.timeEnd(`${origin} - ${this.trace}`);
  }

  private time(label: string): void {
    console.time(label);
  }

  private timeEnd(label: string): void {
    console.timeEnd(label);
  }
}

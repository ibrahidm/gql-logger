import uid from 'uniqid';
import { Console } from 'console';
import { ILoggerInput } from './interfaces';
import emitter from './emitter';

const logger = new Console({
  stdout: process.stdout,
  groupIndentation: 6,
  stderr: process.stderr,
});

export default class Logger {
  readonly appName?: string;
  readonly cascade: boolean;
  readonly level: number;
  readonly listMode: boolean;

  correlation?: string;
  identifier?: string;
  session?: string;
  trace: string;
  traceStart: number;
  userId?: string;

  private list: string[] = [];
  private stack: string[] = [];
  private tsMap: Record<string, number> = {};
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
    listMode = false,
    cascade = true,
  }: ILoggerInput) {
    this.appName = appName;
    this.level = process.env.LOG_LEVEL
      ? parseInt(process.env.LOG_LEVEL)
      : level;
    this.correlation = correlation;
    this.session = session;
    this.userId = userId;
    this.identifier = identifier;
    this.listMode = listMode;
    this.cascade = cascade;
    this.traceStart = Date.now();
    this.trace = this.setTrace();
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

  refreshInstance({
    correlation,
    session,
    userId,
    identifier,
  }: {
    correlation?: string;
    session?: string;
    userId?: string;
    identifier?: string;
  }) {
    session && (this.session = session);
    userId && (this.userId = userId);
    identifier && (this.identifier = identifier);
    correlation && (this.correlation = correlation);
    this.trace = this.setTrace();
    this.list = [];
    this.stack = [];
    this.tsMap = {};
    this.traceStart = Date.now();
    emitter.emit('instanceRefreshed', this);
  }

  private setTrace() {
    return `${this.correlation ? this.correlation : 'UNSET'}-${uid()}`;
  }

  start(self: string, status?: number): void {
    this.stack.push(self);
    if (this.listMode) {
      const ts = Date.now();
      this.tsMap[self] = ts;
      this.list.push(`${self} - ${ts}`);
    } else {
      this.time(`${self} - ${this.trace}`);
      this.info(self, `${self} called`, status);
      this.cascade && logger.groupCollapsed();
    }
  }

  end(self: string, status?: number): void {
    this.stack.pop();
    if (this.listMode && !this.stack.length) this.listModeOutput();
    else if (!this.listMode) {
      this.cascade && logger.groupEnd();
      this.info(self, `${self} invoked successfully`, status);
      this.timeEnd(`${self} - ${this.trace}`);
      if (!this.stack.length) logger.log('\n');
    }
  }

  debug(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.DEBUG) return;
    const self = this.debug.name;
    logger.debug({
      ...this.output(self, origin, message, status || 200),
    });
  }

  info(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.INFO) return;
    const self = this.info.name;
    logger.info({
      ...this.output(self, origin, message, status || 200),
    });
  }

  warn(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.WARN) return;
    const self = this.warn.name;
    logger.warn({
      ...this.output(self, origin, message, status || 200),
    });
  }

  error(origin: string, error: Error, status?: number, timeEnd = true): void {
    if (this.level < this.LOG_LEVELS.ERROR) return;
    if (this.listMode) {
      this.stack.pop();
      const label = `Error: ${this.list.pop()} - ${error.message}`;
      this.list.push(label);
      if (!this.stack.length) this.listModeOutput();
    } else {
      const self = this.error.name;
      logger.error({
        ...this.output(self, origin, error.message, status || 500),
      });
      timeEnd && this.timeEnd(`${origin} - ${this.trace}`);
    }
  }

  private time(label: string): void {
    logger.time(label);
  }

  private timeEnd(label: string): void {
    logger.timeEnd(label);
  }

  private listModeOutput(): void {
    logger.groupCollapsed();
    logger.log(
      `\n${this.trace} =>`,
      this.list,
      ` - ${Date.now() - this.traceStart}ms\n`
    );
    logger.groupEnd();
    this.list = [];
    this.tsMap = {};
  }
}

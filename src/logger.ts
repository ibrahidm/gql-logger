import uid from 'uniqid';
import { ILoggerInput, mode } from './interfaces';
import emitter from './emitter';
import iconsole from './iconsole';
import QueueLogger from './loggers/queueLogger';
import ListLogger from './loggers/listLogger';
import CascadeLogger from './loggers/cascadeLogger';

export default class Logger {
  readonly appName?: string;
  readonly level: number;

  correlation?: string;
  identifier?: string;
  session?: string;
  trace: string;
  traceStart: number;
  userId?: string;
  mode: mode;
  logger: QueueLogger | ListLogger | CascadeLogger;

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
    decoratorCount = 10,
    mode = 'queue',
  }: ILoggerInput) {
    this.appName = appName;
    this.level = process.env.LOG_LEVEL
      ? parseInt(process.env.LOG_LEVEL)
      : level;
    this.correlation = correlation;
    this.session = session;
    this.userId = userId;
    this.identifier = identifier;
    this.traceStart = Date.now();
    this.trace = this.setTrace();
    this.mode = mode;
    this.logger = this.setLogger();
    emitter.setMaxListeners(decoratorCount);
  }

  private setLogger() {
    switch (this.mode) {
      case 'queue':
        return new QueueLogger(this.trace);
      case 'list':
        return new ListLogger(this.trace);
      case 'cascade':
        return new CascadeLogger({
          appName: this.appName,
          correlation: this.correlation,
          session: this.session,
          userId: this.userId,
          identifier: this.identifier,
          trace: this.trace,
        });
    }
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
    this.traceStart = Date.now();
    emitter.emit('instanceRefreshed', this);
  }

  private setTrace() {
    return `${this.correlation ? this.correlation : 'UNSET'}-${uid()}`;
  }

  start(self: string, status?: number): void {
    if (this.level === 0) return;
    const trace = this.trace;
    const traceStart = this.traceStart;
    const ts = Date.now();
    this.logger.startLog({ self, ts, trace, traceStart, status });
  }

  end(self: string, status?: number): void {
    if (this.level === 0) return;
    this.logger.endLog(self, status);
  }

  error(origin: string, error: Error, status?: number): void {
    if (this.level === 0) return;
    this.logger.errorLog(origin, error, status);
  }

  debug(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.DEBUG) return;
    const self = this.debug.name;
    iconsole.debug({
      ...this.output(self, origin, message, status || 200),
    });
  }

  info(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.INFO) return;
    const self = this.info.name;
    iconsole.info({
      ...this.output(self, origin, message, status || 200),
    });
  }

  warn(origin: string, message: string, status?: number): void {
    if (this.level < this.LOG_LEVELS.WARN) return;
    const self = this.warn.name;
    iconsole.warn({
      ...this.output(self, origin, message, status || 200),
    });
  }
}

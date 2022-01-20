import iconsole from '../iconsole';
import { ILoggerInput, IStartInput } from '../interfaces';

interface ICascadeLoggerInput {
  appName?: string;
  correlation?: string;
  session?: string;
  userId?: string;
  identifier?: string;
  trace: string;
}

export default class CascadeLogger {
  readonly appName?: string;
  correlation?: string;
  identifier?: string;
  session?: string;
  trace: string;
  traceStart: number;
  userId?: string;

  private list: string[] = [];
  protected stack: string[] = [];
  private tsMap: Record<string, number> = {};

  constructor({
    trace,
    appName,
    correlation,
    session,
    userId,
    identifier,
  }: ICascadeLoggerInput) {
    this.appName = appName;
    this.trace = trace;
    this.correlation = correlation;
    this.session = session;
    this.userId = userId;
    this.identifier = identifier;
    this.traceStart = Date.now();
  }

  startLog({ self, ts, trace, traceStart, status }: IStartInput) {
    this.trace = trace;
    this.time(`${self} - ${trace}`);
    iconsole.info({
      ...this.outputLog('info', self, `${self} called`, status || 200),
    });
    iconsole.groupCollapsed();
  }

  endLog(self: string, status?: number) {
    iconsole.groupEnd();
    iconsole.info({
      ...this.outputLog(
        'info',
        self,
        `${self} invoked successfully`,
        status || 200
      ),
    });
    this.timeEnd(`${self} - ${this.trace}`);
    if (!this.stack.length) iconsole.log('\n');
  }

  errorLog(origin: string, error: Error, status?: number) {
    iconsole.error({
      ...this.outputLog('error', origin, error.message, status || 500),
    });
    this.timeEnd(`${origin} - ${this.trace}`);
  }

  protected time(label: string): void {
    iconsole.time(label);
  }

  protected timeEnd(label: string): void {
    iconsole.timeEnd(label);
  }

  private outputLog(
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
}

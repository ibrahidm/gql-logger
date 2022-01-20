import iconsole from '../iconsole';
import { IStartInput } from '../interfaces';

export default class QueueLogger {
  private list: string[] = [];
  private stack: string[] = [];
  private tsMap: Record<string, number> = {};
  private traceStart: number = Date.now();
  private traceEnd: number = Date.now();

  constructor(private trace: string) {}

  startLog({ self, ts, trace, traceStart }: IStartInput): void {
    this.manageTrace(trace);
    this.traceStart = traceStart;
    this.stack.push(self);
    this.tsMap[self] = ts;
    this.list.push(`${self} - ${trace}`);
  }

  endLog() {
    this.stack.pop();
    this.traceEnd = Date.now();
    this.queueInterval();
  }

  errorLog(origin: string, error: Error) {
    this.stack.pop();
    const label = `Error: ${this.list.pop()} - ${error.message}`;
    this.list.push(label);
    this.traceEnd = Date.now();
    if (!this.stack.length) this.queueInterval();
  }

  private manageTrace(trace: string) {
    if (trace !== this.trace) {
      this.trace = trace;
      this.outputLog();
    }
  }

  outputLog(): void {
    if (!this.list.length) return;
    iconsole.groupCollapsed();
    iconsole.log(
      `\n${this.trace} =>`,
      this.list,
      ` - ${this.traceEnd - this.traceStart}ms\n`
    );
    iconsole.groupEnd();
    this.list = [];
    this.tsMap = {};
  }

  private queueInterval() {
    const listLength = this.list.length;
    setTimeout(() => {
      if (listLength !== this.list.length || !this.list.length) {
        this.queueInterval();
      } else {
        this.outputLog();
      }
    }, 10000);
  }
}

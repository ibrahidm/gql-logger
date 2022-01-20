import iconsole from '../iconsole';
import { IStartInput } from '../interfaces';

export default class ListLogger {
  private list: string[] = [];
  private stack: string[] = [];
  private tsMap: Record<string, number> = {};
  private traceStart: number = Date.now();
  private traceEnd: number = Date.now();

  constructor(private trace: string) {}

  startLog({ self, ts, traceStart, trace }: IStartInput) {
    this.trace = trace;
    this.traceStart = traceStart;
    this.stack.push(self);
    this.tsMap[self] = ts;
    this.list.push(`${self} - ${ts}`);
  }

  endLog() {
    this.stack.pop();
    !this.stack.length && this.outputLog();
  }

  errorLog(origin: string, error: Error) {
    this.stack.pop();
    const label = `Error: ${this.list.pop()} - ${error.message}`;
    this.list.push(label);
    if (!this.stack.length) this.outputLog();
  }

  outputLog() {
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
}

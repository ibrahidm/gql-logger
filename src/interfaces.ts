export type mode = 'queue' | 'cascade' | 'list';

export interface ILoggerInput {
  level?: number;
  appName?: string;
  correlation?: string;
  session?: string;
  userId?: string;
  identifier?: string;
  decoratorCount?: number;
  mode?: mode;
}

export interface IStartInput {
  self: string;
  ts: number;
  trace: string;
  traceStart: number;
  status?: number;
}

export interface ILoggerInput {
  level?: number;
  appName?: string;
  correlation?: string;
  session?: string;
  userId?: string;
  identifier?: string;
  listMode?: boolean;
  cascade?: boolean;
}

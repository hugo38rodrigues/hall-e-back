// shared/logger.ts
export interface Logger {
  info(msg: string, meta?: string): void
  warn(msg: string, meta?: string): void
  error(msg: string, meta?: string): void
  debug?(msg: string, meta?: string): void
}
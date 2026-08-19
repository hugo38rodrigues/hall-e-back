// database/postgres.types.ts
export interface RetryOptions {
  maxRetries: number
  delay: number
}

export interface SslOptions {
  require: boolean
  rejectUnauthorized: boolean
}

export interface PostgresConfig {
  dbName: string
  user: string
  pass: string
  host: string
  port: number
  ssl: SslOptions | undefined
  env: string
  schema?: string
}
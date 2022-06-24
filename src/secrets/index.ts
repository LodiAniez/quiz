import { config } from "dotenv"
config()

/**
 * Load all secrets here so we could call
 * config method once in a single file
 */

export const EMAIL_USERNAME: string | undefined = process.env.EMAIL_USERNAME || undefined
export const EMAIL_PASSWORD: string | undefined = process.env.EMAIL_PASSWORD || undefined
export const DB_HOST: string | undefined = process.env.DB_HOST || undefined
export const DB_NAME: string | undefined = process.env.DB_NAME || undefined
export const DB_USER: string | undefined = process.env.DB_USER || undefined
export const DB_PASSWORD: string | undefined = process.env.DB_PASSWORD || undefined
export const EMAIL_TOKEN_SECRET: string | undefined = process.env.EMAIL_TOKEN_SECRET || undefined
export const PORT: string | undefined = process.env.PORT || undefined
export const ACCESS_TOKEN_SECRET: string | undefined = process.env.ACCESS_TOKEN_SECRET || undefined
export const REFRESH_TOKEN_SECRET: string | undefined = process.env.REFRESH_TOKEN_SECRET || undefined
export const SALTROUND: string | undefined = process.env.SALTROUND || undefined
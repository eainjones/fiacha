/**
 * Environment Variable Validation
 *
 * This module validates that required environment variables are present.
 * Import this at the top of entry points to fail fast if config is missing.
 */

type EnvConfig = {
  // Required for all environments
  DATABASE_URL: string
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string

  // Optional - only needed for specific features
  SUPABASE_SERVICE_ROLE_KEY?: string
  RESEND_API_KEY?: string
  OPENAI_API_KEY?: string
  FIRECRAWL_API_KEY?: string
}

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'OPENAI_API_KEY',
  'FIRECRAWL_API_KEY',
] as const

/**
 * Validates that all required environment variables are set.
 * Throws an error with details about which variables are missing.
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = []

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\n` +
        'Please check your .env file or environment configuration.'
    )
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  }
}

/**
 * Get a single environment variable with type safety.
 * Throws if the variable is required but not set.
 */
export function getEnv<K extends keyof EnvConfig>(
  key: K,
  options?: { required?: boolean }
): EnvConfig[K] {
  const value = process.env[key]

  if (options?.required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value as EnvConfig[K]
}

/**
 * Check if we're running in production.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if we're running in development.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Validate on import in all environments to fail fast on missing config
validateEnv()

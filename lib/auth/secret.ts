const developmentSecret = 'tea-counter-local-development-secret-change-before-deploying'

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters in production')
  }
  return secret || developmentSecret
}

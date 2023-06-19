export function findOriginURL() {
  const origin =
    process.env.VERCEL_ENV === 'production'
      ? 'https://ai.proactice.co'
      : process.env.VERCEL_URL !== null
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`

  return new URL(origin)
}

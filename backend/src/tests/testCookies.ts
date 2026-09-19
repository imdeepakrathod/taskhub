export function getSetCookieHeader(header: unknown, cookieName: string): string {
  const headers = Array.isArray(header)
    ? header.filter((value): value is string => typeof value === 'string')
    : typeof header === 'string'
      ? [header]
      : []

  const cookieHeader = headers.find((value) => value.startsWith(`${cookieName}=`))

  if (!cookieHeader) {
    throw new Error(`Cookie "${cookieName}" was not set`)
  }

  return cookieHeader
}

export function getCookiePair(header: unknown, cookieName: string): string {
  return getSetCookieHeader(header, cookieName).split(';', 1)[0]
}

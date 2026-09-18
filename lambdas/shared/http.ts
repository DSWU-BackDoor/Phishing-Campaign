export function parseJsonBody<T = Record<string, unknown>>(
  body: string | undefined,
): T | null {
  if (!body) return null

  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}

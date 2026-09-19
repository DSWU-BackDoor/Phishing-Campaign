export const EVENT_TYPES = ['PAGE_VIEW', 'FORM_SUBMIT', 'REPORT'] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const SOURCES = ['everytime', 'qr', 'instagram', 'direct'] as const
export type Source = (typeof SOURCES)[number]

export function isEventType(value: unknown): value is EventType {
  return typeof value === 'string' && (EVENT_TYPES as readonly string[]).includes(value)
}

export function isSource(value: unknown): value is Source {
  return typeof value === 'string' && (SOURCES as readonly string[]).includes(value)
}

export interface StatsSummary {
  visits: number
  submits: number
  reports: number
  trainingEmailCount: number
  sources: Record<Source, number>
}

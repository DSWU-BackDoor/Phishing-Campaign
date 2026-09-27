export const EVENT_TYPES = ['PAGE_VIEW', 'FORM_SUBMIT', 'REPORT', 'EMAIL_CLICK'] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const SOURCES = ['everytime', 'qr', 'instagram', 'direct'] as const
export type Source = (typeof SOURCES)[number]

/** source가 필요한 이벤트 타입 목록. 이 외의 이벤트는 source 없이도 처리된다. */
export const SOURCE_REQUIRED_EVENTS: readonly EventType[] = ['PAGE_VIEW']

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
  emailClicks: number
  sources: Record<Source, number>
}

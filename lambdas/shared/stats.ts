import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { doc, TELEMETRY_TABLE_NAME } from './dynamo'
import { SOURCES, type Source } from './types'

export const SESSION_EVENT_TTL_SECONDS = 7 * 24 * 60 * 60

const SUMMARY_PK = 'CAMPAIGN#CURRENT'
const SUMMARY_SK = 'SUMMARY'

function nowIso(): string {
  return new Date().toISOString()
}

function epochSecondsFromNow(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds
}

/**
 * 세션당 이벤트 1회 제한을 조건부 쓰기로 선점한다.
 * 최초 기록이면 true, 이미 기록된 이벤트(중복)면 false를 반환한다.
 */
export async function tryClaimSessionEvent(
  sessionId: string,
  eventKind: string,
): Promise<boolean> {
  try {
    await doc.send(
      new PutCommand({
        TableName: TELEMETRY_TABLE_NAME,
        Item: {
          PK: `SESSION#${sessionId}`,
          SK: `EVENT#${eventKind}`,
          createdAt: nowIso(),
          ttl: epochSecondsFromNow(SESSION_EVENT_TTL_SECONDS),
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    )

    return true
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return false
    }

    throw error
  }
}

/**
 * SUMMARY 레코드를 0으로 초기화한다(최초 1회만 성공, 이후는 조용히 무시).
 * sources 맵에 ADD로 값을 더하려면 맵과 각 키가 미리 존재해야 하므로,
 * 카운터를 증가시키기 전에 항상 이 함수를 먼저 호출해 존재를 보장한다.
 */
export async function ensureSummaryInitialized(): Promise<void> {
  const zeroSources = Object.fromEntries(
    SOURCES.map((source) => [source, 0]),
  )

  try {
    await doc.send(
      new PutCommand({
        TableName: TELEMETRY_TABLE_NAME,
        Item: {
          PK: SUMMARY_PK,
          SK: SUMMARY_SK,
          visits: 0,
          submits: 0,
          reports: 0,
          trainingEmailCount: 0,
          sources: zeroSources,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    )
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return
    }

    throw error
  }
}

interface SummaryIncrements {
  visits?: number
  submits?: number
  reports?: number
  trainingEmailCount?: number
  source?: Source
}

/**
 * SUMMARY 레코드의 카운터를 원자적으로 증가시킨다.
 * 호출 전 ensureSummaryInitialized()가 실행되어 있어야 한다.
 */
export async function incrementSummary(
  increments: SummaryIncrements,
): Promise<void> {
  const setParts: string[] = []
  const values: Record<string, number> = {}
  const names: Record<string, string> = {}

  for (const key of ['visits', 'submits', 'reports', 'trainingEmailCount'] as const) {
    const amount = increments[key]

    if (amount === undefined) continue

    const valueKey = `:${key}`
    setParts.push(`${key} ${valueKey}`)
    values[valueKey] = amount
  }

  if (increments.source) {
    names['#src'] = increments.source
    setParts.push('sources.#src :src')
    values[':src'] = 1
  }

  if (setParts.length === 0) return

  await doc.send(
    new UpdateCommand({
      TableName: TELEMETRY_TABLE_NAME,
      Key: { PK: SUMMARY_PK, SK: SUMMARY_SK },
      UpdateExpression: `ADD ${setParts.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
    }),
  )
}

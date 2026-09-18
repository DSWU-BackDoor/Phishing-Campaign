import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { isAuthorizedAdmin } from '../shared/auth'
import { TELEMETRY_TABLE_NAME, doc } from '../shared/dynamo'
import { ok, serverError, unauthorized } from '../shared/response'
import { SOURCES, type StatsSummary } from '../shared/types'

const EMPTY_STATS: StatsSummary = {
  visits: 0,
  submits: 0,
  reports: 0,
  trainingEmailCount: 0,
  sources: Object.fromEntries(SOURCES.map((source) => [source, 0])) as StatsSummary['sources'],
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  if (!isAuthorizedAdmin(event)) return unauthorized()

  try {
    const result = await doc.send(
      new GetCommand({
        TableName: TELEMETRY_TABLE_NAME,
        Key: { PK: 'CAMPAIGN#CURRENT', SK: 'SUMMARY' },
      }),
    )

    if (!result.Item) return ok(EMPTY_STATS)

    const item = result.Item

    const stats: StatsSummary = {
      visits: item.visits ?? 0,
      submits: item.submits ?? 0,
      reports: item.reports ?? 0,
      trainingEmailCount: item.trainingEmailCount ?? 0,
      sources: {
        ...EMPTY_STATS.sources,
        ...(item.sources ?? {}),
      },
    }

    return ok(stats)
  } catch (error) {
    console.error('GET /stats 처리 실패', error)
    return serverError()
  }
}

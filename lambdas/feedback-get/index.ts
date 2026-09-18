import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { isAuthorizedAdmin } from '../shared/auth'
import { TELEMETRY_TABLE_NAME, doc } from '../shared/dynamo'
import { ok, serverError, unauthorized } from '../shared/response'

interface FeedbackItem {
  id: string
  content: string
  createdAt: string
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  if (!isAuthorizedAdmin(event)) return unauthorized()

  try {
    const result = await doc.send(
      new QueryCommand({
        TableName: TELEMETRY_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': 'CAMPAIGN#FEEDBACK' },
        ScanIndexForward: false,
      }),
    )

    const items: FeedbackItem[] = (result.Items ?? []).map((item) => ({
      id: item.id,
      content: item.content,
      createdAt: item.createdAt,
    }))

    return ok({ items })
  } catch (error) {
    console.error('GET /feedback 처리 실패', error)
    return serverError()
  }
}

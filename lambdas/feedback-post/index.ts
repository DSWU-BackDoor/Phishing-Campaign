import { randomUUID } from 'node:crypto'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { TELEMETRY_TABLE_NAME, doc } from '../shared/dynamo'
import { parseJsonBody } from '../shared/http'
import { badRequest, ok, serverError } from '../shared/response'
import { tryClaimSessionEvent } from '../shared/stats'

interface FeedbackRequestBody {
  sessionId?: string
  content?: string
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const body = parseJsonBody<FeedbackRequestBody>(event.body)

  if (!body) return badRequest('요청 본문이 올바르지 않습니다.')

  const { sessionId } = body
  const content = body.content?.trim()

  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return badRequest('sessionId는 필수입니다.')
  }

  if (!content || content.length < 1 || content.length > 1000) {
    return badRequest('후기는 1~1,000자로 입력해주세요.')
  }

  try {
    // 세션당 1회 제한: 이미 작성한 세션이면 재적재 없이 성공 응답만 반환한다(멱등 처리).
    const claimed = await tryClaimSessionEvent(sessionId, 'FEEDBACK')

    if (claimed) {
      const createdAt = new Date().toISOString()
      const id = randomUUID()

      await doc.send(
        new PutCommand({
          TableName: TELEMETRY_TABLE_NAME,
          Item: {
            PK: 'CAMPAIGN#FEEDBACK',
            SK: `${createdAt}#${id}`,
            id,
            sessionId,
            content,
            createdAt,
          },
        }),
      )
    }

    return ok({ status: 'success' })
  } catch (error) {
    console.error('POST /feedback 처리 실패', error)
    return serverError()
  }
}

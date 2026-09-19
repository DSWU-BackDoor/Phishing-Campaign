import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { parseJsonBody } from '../shared/http'
import { badRequest, ok, serverError } from '../shared/response'
import { ensureSummaryInitialized, incrementSummary, tryClaimSessionEvent } from '../shared/stats'
import { isEventType, isSource } from '../shared/types'

interface EventsRequestBody {
  sessionId?: string
  eventType?: string
  source?: string
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const body = parseJsonBody<EventsRequestBody>(event.body)

  if (!body) return badRequest('요청 본문이 올바르지 않습니다.')

  const { sessionId, eventType, source } = body

  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return badRequest('sessionId는 필수입니다.')
  }

  if (!isEventType(eventType)) {
    return badRequest('eventType이 올바르지 않습니다.')
  }

  if (!isSource(source)) {
    return badRequest('source가 올바르지 않습니다.')
  }

  try {
    // 동일 세션의 동일 eventType 중복 인입은 통계 증가 없이 200으로 무시한다.
    const claimed = await tryClaimSessionEvent(sessionId, eventType)

    if (claimed) {
      await ensureSummaryInitialized()

      switch (eventType) {
        case 'PAGE_VIEW':
          await incrementSummary({ visits: 1, source })
          break

        case 'FORM_SUBMIT':
          await incrementSummary({ submits: 1 })
          break

        case 'REPORT':
          await incrementSummary({ reports: 1 })
          break
      }
    }

    return ok({ status: 'ok' })
  } catch (error) {
    console.error('POST /events 처리 실패', error)
    return serverError()
  }
}

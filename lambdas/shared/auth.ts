import { timingSafeEqual } from 'node:crypto'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { ADMIN_SECRET_KEY } from './dynamo'

export function isAuthorizedAdmin(event: APIGatewayProxyEventV2): boolean {
  // HTTP API(payload v2)는 헤더 키를 소문자로 정규화해서 전달한다.
  const provided = event.headers?.['x-admin-key']

  if (!provided) return false

  const providedBuf = Buffer.from(provided)
  const expectedBuf = Buffer.from(ADMIN_SECRET_KEY)

  // 길이가 다르면 timingSafeEqual이 예외를 던지므로 먼저 길이를 확인한다.
  if (providedBuf.length !== expectedBuf.length) return false

  return timingSafeEqual(providedBuf, expectedBuf)
}

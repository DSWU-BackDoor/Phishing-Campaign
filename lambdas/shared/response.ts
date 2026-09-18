import type { APIGatewayProxyResultV2 } from 'aws-lambda'

// CORS 헤더는 API Gateway(HTTP API)의 cors_configuration이 모든 응답(성공/에러 포함)에
// 자동으로 부여하므로 Lambda 응답에서는 별도로 설정하지 않는다.
// (Lambda와 API Gateway가 동시에 CORS 헤더를 세팅하면 중복 헤더로 브라우저가 요청을 거부할 수 있음)

const baseHeaders = {
  'content-type': 'application/json',
}

export function json(
  statusCode: number,
  body: unknown,
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: baseHeaders,
    body: JSON.stringify(body),
  }
}

export function ok(body: unknown): APIGatewayProxyResultV2 {
  return json(200, body)
}

export function badRequest(message: string): APIGatewayProxyResultV2 {
  return json(400, { status: 'error', message })
}

export function unauthorized(): APIGatewayProxyResultV2 {
  return json(401, { status: 'error', message: 'Unauthorized' })
}

export function serverError(): APIGatewayProxyResultV2 {
  return json(500, { status: 'error', message: 'Internal Server Error' })
}

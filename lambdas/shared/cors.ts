// 실제 CORS 응답 헤더는 API Gateway(HTTP API)의 cors_configuration에서 관리한다
// (infra/modules/api). 이 목록은 그 설정과 값을 맞추기 위한 참고용 상수이며,
// 로컬 개발 서버(sam local 등)에서 직접 CORS를 판단해야 할 때만 사용한다.
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://d10h8rd9w1ws66.cloudfront.net',
] as const

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false

  return (ALLOWED_ORIGINS as readonly string[]).includes(origin)
}

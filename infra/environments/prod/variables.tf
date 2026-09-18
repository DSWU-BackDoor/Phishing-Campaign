variable "aws_region" {
  type    = string
  default = "ap-southeast-2"
}

variable "frontend_domain" {
  description = "CORS 허용 대상이 되는 배포된 프론트엔드 도메인 (infra/frontend.tf의 CloudFront 출력값)"
  type        = string
}

variable "additional_allowed_origins" {
  description = "frontend_domain 외에 CORS를 추가로 허용할 origin. 운영 환경은 기본적으로 비워둔다(localhost 미허용)."
  type        = list(string)
  default     = []
}

variable "lambda_dist_path" {
  description = "esbuild로 번들된 Lambda 산출물 디렉터리 경로. `npm --prefix ../../../lambdas run build`를 먼저 실행해야 한다."
  type        = string
  default     = "../../../lambdas/dist"
}

variable "campaign_id" {
  type    = string
  default = "2026-MIDTERM-SNACK-EVENT"
}

variable "admin_secret_key" {
  description = "관리자 엔드포인트(x-admin-key) 인증용 시크릿. tfvars에 커밋하지 말고 TF_VAR_admin_secret_key 환경변수로 주입할 것."
  type        = string
  sensitive   = true
}

variable "alarm_email" {
  description = "Lambda 에러/예산 초과 알림을 받을 이메일 주소 목록"
  type        = list(string)
}

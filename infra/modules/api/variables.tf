variable "project_name" {
  description = "리소스 이름 접두사"
  type        = string
  default     = "phishing-campaign"
}

variable "lambda_dist_path" {
  description = "esbuild로 번들된 Lambda 산출물 디렉터리 경로 (lambdas/dist). `npm run build`를 미리 실행해야 한다."
  type        = string
}

variable "allowed_origins" {
  description = "HTTP API CORS 허용 origin 목록"
  type        = list(string)
}

variable "telemetry_table_name" {
  type = string
}

variable "telemetry_table_arn" {
  type = string
}

variable "emails_table_name" {
  type = string
}

variable "emails_table_arn" {
  type = string
}

variable "admin_secret_key" {
  description = "관리자 엔드포인트(x-admin-key) 인증용 시크릿 값"
  type        = string
  sensitive   = true
}

variable "campaign_id" {
  description = "현재 캠페인 식별자 (예: 2026-MIDTERM-SNACK-EVENT)"
  type        = string
}

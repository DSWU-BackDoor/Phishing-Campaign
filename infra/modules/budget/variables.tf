variable "project_name" {
  type    = string
  default = "phishing-campaign"
}

variable "monthly_limit_usd" {
  description = "월 예산 한도 (USD)"
  type        = string
  default     = "1"
}

variable "alert_threshold_percent" {
  description = "알림을 발생시킬 예산 대비 실제 지출 비율(%)"
  type        = number
  default     = 100
}

variable "alert_emails" {
  description = "예산 초과 알림을 받을 이메일 주소 목록"
  type        = list(string)
}

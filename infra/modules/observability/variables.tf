variable "project_name" {
  type    = string
  default = "phishing-campaign"
}

variable "function_names" {
  description = "CloudWatch Logs/Alarms을 구성할 Lambda 함수 이름 목록"
  type        = list(string)
}

variable "log_retention_days" {
  type    = number
  default = 14
}

variable "alarm_emails" {
  description = "Lambda 에러율 알림을 받을 이메일 주소 목록"
  type        = list(string)
}

variable "error_threshold" {
  description = "알림을 발생시킬 평가 기간 내 최소 에러 건수"
  type        = number
  default     = 1
}

variable "evaluation_period_seconds" {
  type    = number
  default = 300
}

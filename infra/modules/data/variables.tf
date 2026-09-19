variable "telemetry_table_name" {
  description = "통계/세션 중복 방지/후기 통합 테이블 이름"
  type        = string
  default     = "TelemetryStats"
}

variable "emails_table_name" {
  description = "2차 훈련 신청 이메일 격리 테이블 이름"
  type        = string
  default     = "TrainingEmails"
}

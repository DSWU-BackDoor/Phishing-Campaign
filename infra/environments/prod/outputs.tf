output "api_endpoint" {
  value = module.api.api_endpoint
}

output "telemetry_table_name" {
  value = module.data.telemetry_table_name
}

output "emails_table_name" {
  value = module.data.emails_table_name
}

output "sns_alarm_topic_arn" {
  value = module.observability.sns_topic_arn
}

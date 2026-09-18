output "telemetry_table_name" {
  value = aws_dynamodb_table.telemetry_stats.name
}

output "telemetry_table_arn" {
  value = aws_dynamodb_table.telemetry_stats.arn
}

output "emails_table_name" {
  value = aws_dynamodb_table.training_emails.name
}

output "emails_table_arn" {
  value = aws_dynamodb_table.training_emails.arn
}

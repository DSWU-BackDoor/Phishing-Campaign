output "sns_topic_arn" {
  value = aws_sns_topic.alarms.arn
}

output "log_group_names" {
  value = [for lg in aws_cloudwatch_log_group.lambda : lg.name]
}

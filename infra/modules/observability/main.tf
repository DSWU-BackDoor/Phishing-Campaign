resource "aws_cloudwatch_log_group" "lambda" {
  for_each = toset(var.function_names)

  name              = "/aws/lambda/${each.value}"
  retention_in_days = var.log_retention_days
}

resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-lambda-alarms"
}

resource "aws_sns_topic_subscription" "alarms_email" {
  for_each = toset(var.alarm_emails)

  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = each.value
}

# Lambda 에러가 평가 기간 내 threshold 이상 발생하면 SNS(이메일)로 알림.
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = toset(var.function_names)

  alarm_name          = "${each.value}-errors"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  dimensions          = { FunctionName = each.value }
  statistic           = "Sum"
  period              = var.evaluation_period_seconds
  evaluation_periods  = 1
  threshold           = var.error_threshold
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  alarm_description = "${each.value} Lambda 에러 발생 (${var.evaluation_period_seconds}초 내 ${var.error_threshold}건 이상)"
  alarm_actions     = [aws_sns_topic.alarms.arn]
  ok_actions        = [aws_sns_topic.alarms.arn]
}

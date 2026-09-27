output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "function_names" {
  description = "API Gateway 연결 함수 + 발송 전담 함수를 포함한 전체 목록"
  value       = local.all_function_names
}

output "function_arns" {
  value = merge(
    { for key, fn in aws_lambda_function.this : key => fn.arn },
    { send_training_email = aws_lambda_function.send_training_email.arn },
  )
}

output "send_training_email_function_name" {
  value = aws_lambda_function.send_training_email.function_name
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "function_names" {
  value = [for key, fn in aws_lambda_function.this : fn.function_name]
}

output "function_arns" {
  value = { for key, fn in aws_lambda_function.this : key => fn.arn }
}

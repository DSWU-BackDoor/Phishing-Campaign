# 함수별 라우트와 DynamoDB 최소 권한(least privilege)을 한 곳에서 관리한다.
locals {
  functions = {
    events = {
      dir       = "events"
      route     = "POST /events"
      actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
      resources = [var.telemetry_table_arn]
    }
    training_email = {
      dir       = "training-email"
      route     = "POST /training-email"
      actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
      resources = [var.telemetry_table_arn, var.emails_table_arn]
    }
    feedback_post = {
      dir       = "feedback-post"
      route     = "POST /feedback"
      actions   = ["dynamodb:PutItem"]
      resources = [var.telemetry_table_arn]
    }
    feedback_get = {
      dir       = "feedback-get"
      route     = "GET /feedback"
      actions   = ["dynamodb:Query"]
      resources = [var.telemetry_table_arn]
    }
    stats_get = {
      dir       = "stats-get"
      route     = "GET /stats"
      actions   = ["dynamodb:GetItem"]
      resources = [var.telemetry_table_arn]
    }
  }

  function_name = { for key, fn in local.functions : key => "${var.project_name}-${replace(key, "_", "-")}" }

  common_environment = {
    TELEMETRY_TABLE_NAME = var.telemetry_table_name
    EMAILS_TABLE_NAME    = var.emails_table_name
    ADMIN_SECRET_KEY     = var.admin_secret_key
    CAMPAIGN_ID          = var.campaign_id
  }
}

data "archive_file" "lambda" {
  for_each = local.functions

  type        = "zip"
  source_dir  = "${var.lambda_dist_path}/${each.value.dir}"
  output_path = "${path.module}/.build/${each.key}.zip"
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  for_each = local.functions

  name               = "${local.function_name[each.key]}-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  for_each = local.functions

  role       = aws_iam_role.lambda[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "lambda_dynamodb" {
  for_each = local.functions

  statement {
    actions   = each.value.actions
    resources = each.value.resources
  }
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  for_each = local.functions

  name   = "${local.function_name[each.key]}-dynamodb"
  role   = aws_iam_role.lambda[each.key].id
  policy = data.aws_iam_policy_document.lambda_dynamodb[each.key].json
}

resource "aws_lambda_function" "this" {
  for_each = local.functions

  function_name    = local.function_name[each.key]
  role             = aws_iam_role.lambda[each.key].arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  memory_size      = 128
  timeout          = 3
  filename         = data.archive_file.lambda[each.key].output_path
  source_code_hash = data.archive_file.lambda[each.key].output_base64sha256

  environment {
    variables = local.common_environment
  }
}

resource "aws_apigatewayv2_api" "this" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type", "x-admin-key"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "this" {
  for_each = local.functions

  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.this[each.key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "this" {
  for_each = local.functions

  api_id    = aws_apigatewayv2_api.this.id
  route_key = each.value.route
  target    = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"
}

resource "aws_lambda_permission" "apigateway" {
  for_each = local.functions

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

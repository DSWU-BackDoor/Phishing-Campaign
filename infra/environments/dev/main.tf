terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  allowed_origins = distinct(concat([var.frontend_domain], var.additional_allowed_origins))
}

# infra/modules/hosting(프론트엔드 S3/CloudFront)는 이미 배포되어 별도 state로 관리 중이므로
# 이 환경에서는 호출하지 않고, CORS에 필요한 도메인만 var.frontend_domain으로 주입받는다.

module "data" {
  source = "../../modules/data"
}

module "api" {
  source = "../../modules/api"

  lambda_dist_path = var.lambda_dist_path
  allowed_origins  = local.allowed_origins

  telemetry_table_name = module.data.telemetry_table_name
  telemetry_table_arn  = module.data.telemetry_table_arn
  emails_table_name    = module.data.emails_table_name
  emails_table_arn     = module.data.emails_table_arn

  admin_secret_key = var.admin_secret_key
  campaign_id      = var.campaign_id
}

module "observability" {
  source = "../../modules/observability"

  function_names = module.api.function_names
  alarm_emails   = var.alarm_email
}

module "budget" {
  source = "../../modules/budget"

  alert_emails = var.alarm_email
}

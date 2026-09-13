terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# 기본 AWS 리전
provider "aws" {
  region = "ap-southeast-2"
}

# CloudFront Free-Plan용 WAF
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
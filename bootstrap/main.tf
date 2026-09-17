terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
  profile = "dain_Dev"
}

# 1. State 보관용 S3 버킷
resource "aws_s3_bucket" "tfstate" {
  bucket = "backdoor-tfstate-2026" 

  # 실수로 버킷이 삭제되는 것을 테라폼 단에서 방지
  lifecycle {
    prevent_destroy = true
  }
}

# 2. 히스토리 복구를 위한 버전 관리 활성화
resource "aws_s3_bucket_versioning" "tfstate_versioning" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. 기본 암호화 (SSE-S3)
resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate_crypto" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 4. 외부 퍼블릭 접근 차단
resource "aws_s3_bucket_public_access_block" "tfstate_block" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "state_bucket_name" {
  value       = aws_s3_bucket.tfstate.id
  description = "메인 테라폼 backend.tf에 입력할 버킷 이름"
}
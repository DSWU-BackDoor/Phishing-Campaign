# 통계 집계(CAMPAIGN#CURRENT/SUMMARY), 세션 중복 방지 이력(SESSION#.../EVENT#...),
# 한 줄 후기(CAMPAIGN#FEEDBACK/...)를 한 테이블에 단일 테이블 설계로 저장한다.
resource "aws_dynamodb_table" "telemetry_stats" {
  name         = var.telemetry_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

# 2차 모의 훈련 신청 이메일은 피싱 폼 텔레메트리와 분리된 별도 테이블에 격리 저장하고,
# 행사 종료 후 자동 파기를 위해 TTL(30일)을 건다.
resource "aws_dynamodb_table" "training_emails" {
  name         = var.emails_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"
  range_key    = "campaignId"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "campaignId"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

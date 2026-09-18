frontend_domain = "https://d10h8rd9w1ws66.cloudfront.net"
campaign_id     = "2026-MIDTERM-SNACK-EVENT"

alarm_email = ["epohda002@naver.com", "ecolead@naver.com"]

# admin_secret_key는 민감정보이므로 이 파일에 두지 않는다.
# 적용 전 아래처럼 환경변수로 주입할 것:
#   export TF_VAR_admin_secret_key="<임의의 강력한 문자열>"   (PowerShell: $env:TF_VAR_admin_secret_key = "...")

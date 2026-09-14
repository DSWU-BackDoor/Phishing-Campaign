# Infrastructure

AWS 인프라를 Terraform으로 구성합니다.

## Frontend

### 구성

- **S3**: 프론트엔드 정적 파일 저장. 퍼블릭 접근 차단
- **CloudFront**: 정적 파일 캐싱 및 배포. HTTP 요청을 HTTPS로 리다이렉트
- **OAC (Origin Access Control)**: CloudFront가 서명된 요청으로 S3에 접근하도록 설정
- **S3 버킷 정책**: 생성한 CloudFront 배포에만 `s3:GetObject` 권한 부여
- **AWS WAF**: CloudFront Free 플랜 사용을 위해 Web ACL을 생성하고 배포에 연결

S3는 `ap-southeast-2` 리전에 생성합니다.
CloudFront용 WAF는 `us-east-1` 리전에 `CLOUDFRONT` 범위로 생성합니다.

### 파일 구성

| 파일 | 설명 |
| --- | --- |
| `main.tf` | AWS Provider 및 S3, CloudFront, OAC, WAF 리소스 정의 |
| `variables.tf` | 프론트엔드 S3 버킷 이름 변수 |
| `outputs.tf` | S3 버킷 이름, CloudFront 배포 ID 및 도메인 출력 |
| `.terraform.lock.hcl` | Provider 버전 및 체크섬 정보 |

AWS Provider 버전 제약은 `~> 6.0`입니다.

### 배포

Terraform 설치 및 AWS 인증 설정 후 저장소 루트에서 실행합니다.

```bash
cd infra/frontend
terraform init
terraform plan 
terraform apply
```

`frontend_bucket_name`의 기본값은 `phishing-campaign-frontend-bucket`입니다.
S3 버킷 이름은 전역적으로 고유해야 하므로 사용 가능한 이름으로 지정합니다.

이 코드는 인프라만 생성합니다. 프론트엔드 빌드 및 빌드 결과물의 S3 업로드는 별도로 진행해야 합니다.

### CloudFront 무료 플랜 설정

**현재 Terraform 코드로 생성하면 CloudFront 요금제는 Pay-as-you-go(사용량 기반 과금)입니다. Free 플랜은 자동으로 적용되지 않으므로 생성 후 AWS 웹 콘솔에서 직접 변경해야 합니다.**

1. AWS 콘솔에서 CloudFront로 이동합니다.
2. 생성된 배포를 선택합니다.
3. 요금제 변경 메뉴에서 **Free 플랜**을 선택하고 적용합니다.
4. 적용된 요금제가 Free인지 확인합니다.

CloudFront Free 플랜 사용에는 WAF Web ACL 연결이 필요하므로, 이 코드에서도 WAF를 생성하고 CloudFront에 연결합니다. **WAF를 생성했다는 것만으로 Free 플랜이 적용되는 것은 아닙니다.**

현재 WAF는 기본 동작이 `allow`이며 별도의 차단 규칙은 없습니다. CloudWatch 지표와 요청 샘플링은 활성화되어 있습니다.

Free 플랜 적용 전에는 사용량 기반 요금이 발생할 수 있으므로 배포 후 요금제를 확인합니다.

### 요청 및 캐시 처리

- 기본 문서: `index.html`
- 허용 및 캐시 대상 HTTP 메서드: `GET`, `HEAD`
- 캐시 정책: AWS 관리형 `Managed-CachingOptimized`
- S3에서 `403` 또는 `404`를 반환하면 `/index.html`을 HTTP `200`으로 반환하여 SPA 라우팅 지원
- 지역별 접근 제한 없음
- CloudFront 기본 도메인과 기본 TLS 인증서 사용

별도의 사용자 지정 도메인이나 ACM 인증서는 구성하지 않습니다.

### 출력값

| 출력값 | 설명 |
| --- | --- |
| `frontend_bucket_name` | 정적 파일을 업로드할 S3 버킷 이름 |
| `cloudfront_distribution_id` | CloudFront 배포 ID |
| `cloudfront_domain_name` | 프론트엔드 접속에 사용할 CloudFront 도메인 |

```bash
terraform output
```

파일 업로드 후 `https://<cloudfront_domain_name>`으로 접속합니다.

### 참고 문서

- [CloudFront 요금제 및 변경 안내](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html)
- [CloudFront와 AWS WAF 연결 요건](https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html)
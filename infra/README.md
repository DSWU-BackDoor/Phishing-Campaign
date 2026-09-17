# Infrastructure

AWS 인프라를 Terraform으로 구성합니다.

프론트엔드와 백엔드 인프라는 `infra/`에서 통합 관리하며,
Terraform State는 S3 Remote Backend를 통해 공유합니다.

## 파일 구성

| 파일 | 설명 |
| --- | --- |
| `main.tf` | Terraform 버전 및 AWS Provider 설정 |
| `backend.tf` | S3 Remote Backend 설정 |
| `frontend.tf` | S3, CloudFront, OAC, WAF 리소스 정의 |
| `variables.tf` | Terraform 변수 |
| `outputs.tf` | Terraform 출력값 |
| `.terraform.lock.hcl` | Provider 버전 및 체크섬 정보 |

## Remote State

협업을 위해 Terraform State를 S3 Remote Backend에서 관리합니다.

- Bucket: `backdoor-tfstate-2026`
- Region: `ap-southeast-2`
- S3 Versioning 활성화
- S3 State Locking 사용 (`use_lockfile = true`)

`terraform.tfstate` 파일은 Git에 커밋하거나 직접 공유하지 않습니다.

---

## Frontend

### 구성

- **S3**: 프론트엔드 정적 파일 저장, 퍼블릭 접근 차단
- **CloudFront**: 정적 파일 캐싱 및 배포, HTTP 요청을 HTTPS로 리다이렉트
- **OAC (Origin Access Control)**: CloudFront가 서명된 요청으로 S3에 접근하도록 설정
- **S3 버킷 정책**: 생성한 CloudFront 배포에만 `s3:GetObject` 권한 부여
- **AWS WAF**: CloudFront Free 플랜 사용을 위해 Web ACL을 생성하고 배포에 연결

S3는 `ap-southeast-2` 리전에 생성합니다.

CloudFront용 WAF는 `us-east-1` 리전에 `CLOUDFRONT` 범위로 생성합니다.

### CloudFront 무료 플랜 설정

Terraform으로 생성한 CloudFront 배포는 기본적으로 Pay-as-you-go로 생성됩니다.

Free 플랜은 AWS Console에서 직접 변경해야 하며,
WAF Web ACL이 연결되어 있어야 합니다.

현재 WAF는 기본 동작이 `allow`이며 별도의 차단 규칙은 없습니다.

### 요청 및 캐시 처리

- 기본 문서: `index.html`
- 허용 및 캐시 대상 HTTP 메서드: `GET`, `HEAD`
- 캐시 정책: AWS 관리형 `Managed-CachingOptimized`
- `403`, `404` 응답 시 `/index.html`을 HTTP `200`으로 반환하여 SPA 라우팅 지원
- 지역별 접근 제한 없음
- CloudFront 기본 도메인 및 기본 TLS 인증서 사용

### 출력값

| 출력값 | 설명 |
| --- | --- |
| `frontend_bucket_name` | 정적 파일을 업로드할 S3 버킷 이름 |
| `cloudfront_distribution_id` | CloudFront 배포 ID |
| `cloudfront_domain_name` | 프론트엔드 접속에 사용할 CloudFront 도메인 |
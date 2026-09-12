# Phishing-Campaign frontend

React + Vite 기반 프론트엔드 프로젝트입니다.

## 페이지

- `/`
  - 모의 간식행사 랜딩 페이지
  - 학번, 이름, 생년월일, 연락처 입력값은 서버로 전송하거나 저장하지 않습니다.
  - 제출 시 `FORM_SUBMIT` 이벤트만 기록합니다.
  - 신고 시 `REPORT` 이벤트만 기록합니다.
  - 선택적으로 2차 모의 훈련 이메일을 신청할 수 있습니다.

- `/admin`
  - 관리자 통계 대시보드
  - 방문, 제출, 신고, 2차 훈련 이메일 신청 수와 유입 경로를 표시합니다.
  - API 연결 시 5초마다 통계를 갱신합니다.

- `/?source=everytime`
- `/?source=qr`
- `/?source=instagram`

위 쿼리 파라미터를 통해 유입 경로를 구분합니다.
그 외의 접근은 `direct`로 처리합니다.

---

### 주요 파일

- `src/App.jsx`
  - 페이지 라우팅 설정

- `src/pages/PhishingLandingPage.jsx`
  - 모의 피싱 랜딩 페이지
  - 방문, 제출, 신고 이벤트 처리

- `src/components/EducationModal.jsx`
  - 피싱 예방 교육 안내
  - 2차 모의 훈련 이메일 신청

- `src/pages/AdminDashboardPage.jsx`
  - 관리자 통계 대시보드

- `src/lib/api.js`
  - MOCK DATA/ API 요청 처리
  - 이벤트 기록
  - 2차 훈련 이메일 제출
  - 통계 조회

- `src/lib/validation.js`
  - 입력값 형식 검증

- `src/phishingConfig.json`
  - 캠페인 ID, 학교명, 부스 일정, 티켓 코드 등 캠페인 설정

---

## API

프론트엔드는 아래 3개의 API를 사용합니다.

```text
POST /events
POST /training-email
GET  /stats
```

`VITE_API_URL` 환경변수가 설정되어 있으면 실제 API를 사용하고,
설정되어 있지 않으면 `sessionStorage` 기반 MOCK 모드로 동작합니다.

---

### POST /events

사용자의 행동 이벤트를 기록합니다.

#### Request

```json
{
  "campaignId": "2026-MIDTERM-SNACK-EVENT",
  "sessionId": "random-uuid",
  "eventType": "PAGE_VIEW",
  "source": "everytime"
}
```

#### eventType

```text
PAGE_VIEW
FORM_SUBMIT
REPORT
```

#### source

```text
everytime
qr
instagram
direct
```

실제 피싱 폼에 입력한 학번, 이름, 생년월일, 연락처는 이 API에 포함하지 않습니다.

---

### POST /training-email

2차 모의 훈련 신청 이메일을 저장합니다.

#### Request

```json
{
  "campaignId": "2026-MIDTERM-SNACK",
  "email": "example@duksung.ac.kr"
}
```

이 이메일은 사용자가 2차 모의 훈련 참여에 동의하고 직접 신청한 경우에만 전송합니다.

이메일 신청 건수는 관리자 통계의 `trainingEmailCount`로 사용합니다.

---

### GET /stats

관리자 대시보드에서 캠페인 통계를 조회합니다.

#### Response

```json
{
  "visits": 10,
  "submits": 4,
  "reports": 2,
  "trainingEmailCount": 1,
  "sources": {
    "everytime": 5,
    "qr": 2,
    "instagram": 2,
    "direct": 1
  }
}
```

### 필드 설명

- `visits`
  - 방문 세션 수

- `submits`
  - 모의 신청폼 제출 수

- `reports`
  - 사이트 신고 수

- `trainingEmailCount`
  - 2차 모의 훈련 이메일 신청 수

- `sources`
  - 유입 경로별 방문 수

---

환경변수가 존재하면 실제 API를 사용하고,
없으면 MOCK 모드로 실행됩니다.

MOCK에서는 실제 이메일을 저장하지 않으며,
이벤트와 통계 확인을 위한 값만 `sessionStorage`에 저장합니다.
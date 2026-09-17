# Phishing-Campaign frontend

React + Vite 기반 모의 피싱 캠페인 프론트엔드 프로젝트입니다.

## 페이지

- `/`
  - 모의 간식 행사 랜딩 페이지
  - 학번, 이름, 생년월일, 연락처 입력값은 서버로 전송하거나 저장하지 않습니다.
  - 제출 시 `FORM_SUBMIT` 이벤트만 기록합니다.
  - 신고 시 `REPORT` 이벤트만 기록합니다.
  - 피싱 예방 안내 후 선택적으로 2차 모의 훈련 이메일을 신청할 수 있습니다.
  - 캠페인 참여 후 선택적으로 후기를 작성할 수 있습니다.

- `/admin`
  - 관리자 통계 대시보드
  - 방문, 제출, 신고, 2차 훈련 이메일 신청 수와 유입 경로를 표시합니다.
  - 참가자가 작성한 후기를 조회할 수 있습니다.
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
  - 피싱 예방 안내
  - 2차 모의 훈련 이메일 신청
  - 참가자 후기 작성

- `src/pages/AdminDashboardPage.jsx`
  - 관리자 통계 대시보드
  - 참가자 후기 조회

- `src/lib/api.js`
  - MOCK / API 요청 처리
  - 이벤트 기록
  - 2차 모의 훈련 이메일 제출
  - 후기 등록 및 조회
  - 통계 조회

- `src/lib/validation.js`
  - 입력값 형식 검증

- `src/phishingConfig.json`
  - 학교명, 부스 일정, 티켓 코드 등 캠페인 화면 설정

---

## API

프론트엔드는 아래 API를 사용합니다.

```text
POST /events

POST /training-email

POST /feedback
GET  /feedback

GET  /stats
```

`VITE_API_URL` 환경변수가 설정되어 있으면 실제 API를 사용하고,
설정되어 있지 않으면 로컬 MOCK 모드로 동작합니다.

---

### POST /events

사용자의 행동 이벤트를 기록합니다.

#### Request

```json
{
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

동일한 세션에서도 서로 다른 이벤트는 각각 기록됩니다.

예를 들어 한 사용자가 사이트에 방문한 후 모의 신청폼을 제출한 경우
`PAGE_VIEW`와 `FORM_SUBMIT`이 각각 1회 기록됩니다.

동일한 `sessionId`에서 같은 `eventType`이 반복되는 경우에는 중복 기록하지 않습니다.

```text
PAGE_VIEW     → 세션당 1회
FORM_SUBMIT   → 세션당 1회
REPORT        → 세션당 1회
```

실제 피싱 폼에 입력한 학번, 이름, 생년월일, 연락처는 이 API에 포함하지 않습니다.

---

### POST /training-email

2차 모의 훈련 신청 이메일을 저장합니다.

#### Request

```json
{
  "sessionId": "random-uuid",
  "email": "example@duksung.ac.kr"
}
```

2차 모의 훈련 이메일은 사용자가 참여에 동의하고 직접 신청한 경우에만 전송합니다.

동일한 `sessionId`에서는 한 번만 신청할 수 있습니다.

이메일 신청 건수는 관리자 통계의 `trainingEmailCount`로 사용합니다.

---

### POST /feedback

참가자가 작성한 캠페인 후기를 저장합니다.

#### Request

```json
{
  "sessionId": "random-uuid",
  "content": "실제 상황이었다면 링크를 눌렀을 것 같아요."
}
```

후기는 1~1,000자로 입력할 수 있으며, 동일한 `sessionId`에서는 한 번만 작성할 수 있습니다.

후기에는 이름, 학번, 연락처 등의 개인정보를 작성하지 않도록 안내합니다.

---

### GET /feedback

관리자 페이지에서 참가자가 작성한 후기를 조회합니다.

#### Response

```json
{
  "items": [
    {
      "id": "feedback-uuid",
      "content": "실제 상황이었다면 링크를 눌렀을 것 같아요.",
      "createdAt": "2026-09-17T04:20:00.000Z"
    }
  ]
}
```

### 필드 설명

- `id`
  - 후기 식별자

- `content`
  - 참가자가 작성한 후기

- `createdAt`
  - 후기 작성 시간

---

### GET /stats

관리자 대시보드에서 전체 통계를 조회합니다.

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
  - 모의 신청폼 제출 세션 수

- `reports`
  - 사이트 신고 세션 수

- `trainingEmailCount`
  - 2차 모의 훈련 이메일 신청 세션 수

- `sources`
  - 유입 경로별 방문 세션 수

---

## MOCK / API 모드

### MOCK 모드

`VITE_API_URL` 환경변수가 없으면 MOCK 모드로 실행됩니다.

```text
참가자 페이지
      ↓
localStorage
      ↑
관리자 페이지
```

MOCK 모드에서는 다음 데이터를 `localStorage`에 저장하여 같은 브라우저의 관리자 페이지에서 확인할 수 있습니다.

- 방문, 제출, 신고 통계
- 유입 경로별 통계
- 2차 모의 훈련 이메일 신청 건수
- 참가자 후기

실제 이메일 주소는 MOCK 환경에서 저장하지 않습니다.

세션 식별자와 이벤트 및 제출 중복 방지 정보는 `sessionStorage`에 저장합니다.

```text
localStorage
├── phishing_stats
└── phishing_feedback

sessionStorage
├── phishing_session_id
├── recorded_{sessionId}_{eventType}
├── training_email_submitted
└── feedback_submitted
```

### API 모드

`VITE_API_URL` 환경변수가 설정되어 있으면 실제 API를 사용합니다.

```text
참가자
   ↓
API
   ↓
Backend / Database
   ↑
API
   ↑
관리자 페이지
```

배포 환경에서는 여러 사용자가 전송한 이벤트, 후기 및 2차 모의 훈련 이메일 신청 정보를 백엔드에서 저장하고 관리자 페이지에서 조회합니다.

프론트엔드의 `sessionStorage`를 통한 중복 제출 방지와 별도로,
백엔드에서도 다음 기준으로 중복 요청을 처리해야 합니다.

```text
/events
→ sessionId + eventType 기준 중복 방지

/feedback
→ sessionId 기준 세션당 1회

/training-email
→ sessionId 기준 세션당 1회
```
# Phishing-Campaign

---

## 🤝 Git & 협업 규칙 (Collaboration Guide)

### 1. 브랜치 및 이슈 전략

1. Issue 생성: 진행할 작업에 대해 간략히 작성 -> 해당 Issue 번호를 활용해 feat/#이슈번호-키워드를 작성하여 브랜치를 생성한다.
2. 작업: 각자의 역할에 따라 브랜치를 생성했다면 작업을 진행하고, develop 브랜치로 merge(merge 전 PR 리뷰 필수)

- `main`: 운영 배포 환경 (`prod-` 인프라 연동, 직접 Push 금지, PR 필수)
- `develop`: 개발 및 사전 결합 환경 (`dev-` 인프라 연동, PR 필수)
- `feat/#이슈번호-키워드`: 기능 단위 로컬 작업 브랜치 (base: `develop`)
- `fix/#이슈번호-키워드`: 버그 수정 브랜치 (base: `develop`)

| 브랜치명                 | 역할                              | 배포 대상          | 머지 규칙                                          |
| ------------------------ | --------------------------------- | ------------------ | -------------------------------------------------- |
| `main`                   | 실제 운영 환경 (9/30 실전 캠페인) | AWS `prod-` 리소스 | `develop`에서만 머지 가능, PR 필수, 직접 푸시 금지 |
| `develop`                | 개발 및 결합 테스트 환경          | AWS `dev-` 리소스  | 기능 브랜치(`feat/*`) 머지, PR 필수                |
| `feat/#이슈번호-키워드`  | 기능 단위 로컬 작업 브랜치        | 로컬 / Mock        | 작업 완료 후 `develop`을 향해 PR 생성              |
| `fix/#이슈번호-키워드`   | 버그 수정 브랜치                  | 로컬 / dev         | 작업 완료 후 `develop`을 향해 PR 생성              |
| `infra/#이슈번호-키워드` | 인프라/IaC 수정 브랜치            | dev/prod           | 작업 완료 후 `develop`을 향해 PR 생성              |

### 2. 작업 및 머지 워크플로우

1. GitHub Issue 생성 (라벨: `area:frontend`, `area:backend`, `area:infra`)
2. `develop` 브랜치에서 분기: `git checkout -b feat/#<이슈번호>-<작업키워드>`
3. 작업 완료 후 `develop` 브랜치로 PR 생성 (본문에 `Closes #<이슈번호>` 명시)
4. 팀원 1인 코드 리뷰 및 Approve 후 **Squash and Merge** 수행
5. dev 환경 통합 검증 완료 후, 릴리즈 시점에 `develop` -> `main` 머지 (운영 배포)

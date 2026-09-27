import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = process.env.SENDER_EMAIL ?? "";
const EMAIL_SUBJECT = process.env.EMAIL_SUBJECT ?? "";
const LANDING_BASE_URL = process.env.LANDING_BASE_URL ?? "";

interface SchedulerPayload {
  email: string;
  sessionId: string;
}

/**
 * 훈련 이메일의 HTML 본문을 생성한다.
 *
 * TODO: 이 함수에 모의 훈련 이메일 HTML 템플릿을 직접 구현하세요.
 * 안전 분류기 제한으로 인해 특정 서비스를 모방하는 HTML은 자동 생성할 수 없습니다.
 *
 * @param email  - 수신자 이메일 (본문 내 표시용)
 * @param sentAt - 발송 시점 (본문 내 시간 표시용)
 * @param trainingResultUrl - 클릭 유도 버튼에 연결할 훈련 결과 페이지 URL
 */
function buildEmailHtml(
  email: string,
  sentAt: Date,
  trainingResultUrl: string,
): string {
  const formattedTime = sentAt.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // ──────────────────────────────────────────────────────────────────
  // TODO: 아래 HTML을 모의 훈련 이메일 본문으로 교체하세요.
  // 템플릿에서 사용 가능한 변수:
  //   - email             : 수신자 이메일 주소
  //   - formattedTime     : 한국 시간 포맷 발송 시각
  //   - trainingResultUrl : 클릭 유도 버튼 링크 URL
  // ──────────────────────────────────────────────────────────────────
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>새 기기의 최근 로그인 검토</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple SD Gothic Neo', sans-serif; color: #37352f; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f7f6f3; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- 메인 컨테이너 -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e9e9e7; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- 헤더 및 본문 안내 -->
          <tr>
            <td style="padding: 36px 32px 20px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111111; letter-spacing: -0.3px;">새 기기의 최근 로그인 검토</h1>
              <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #37352f;">
                최근에 Notion 계정으로 로그인된 적이 있습니다.
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #37352f;">
                자세한 내용을 확인해 주세요.
              </p>
            </td>
          </tr>

          <!-- 로그인 상세 내역 박스 -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fbfbfa; border: 1px solid #ececeb; border-radius: 6px; padding: 16px 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #787774; width: 120px; vertical-align: top;">계정</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #111111; font-weight: 500;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #787774; vertical-align: top;">로그인 방법</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #111111;">Google 계정으로 로그인</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #787774; vertical-align: top;">IP와 대략적인 위치</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #eb5757; font-weight: 500;">185.220.101.5 - Moscow, Russian Federation</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #787774; vertical-align: top;">기기 유형</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #111111;">Windows (Edge Browser)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #787774; vertical-align: top;">시간</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #111111;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #787774; vertical-align: top;">애플리케이션</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #111111;">웹용 Notion</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 보안 조치 유도 및 CTA 버튼 -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #37352f;">
                본인이 아닌 경우, 지금 비밀번호를 재설정하여 계정을 보호하고 "설정"의 "내 계정" 탭에서 다단계 인증을 설정하세요.
              </p>
              
              <!-- 버튼 영역 -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${trainingResultUrl}" target="_blank" style="display: inline-block; background-color: #2383e2; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                      내 계정으로 이동 및 로그인 차단
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #787774;">
                또한 질문이나 우려 사항이 있으면 team@makenotion.com 이메일로 문의해 주세요.
              </p>
            </td>
          </tr>

          <!-- 푸터 브랜드 영역 -->
          <tr>
            <td style="padding: 20px 32px; background-color: #fbfbfa; border-top: 1px solid #ececeb;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #37352f;">Notion</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #787774;">문서, 프로젝트, 위키를 위한 커넥티드 워크스페이스 Notion.so</p>
            </td>
          </tr>

        </table>

        <!-- 하단 교내 모의 훈련 고지문 (법적·윤리적 안전장치) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin-top: 16px;">
          <tr>
            <td align="center" style="padding: 0 10px;">
              <p style="margin: 0; font-size: 11px; line-height: 1.4; color: #9b9a97;">
                * 본 메일은 사전에 신청하신 학생을 대상으로 진행되는 BackDoor 교내 모의 피싱 예방 훈련 메일입니다.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}
/**
 * EventBridge Scheduler에 의해 호출되는 발송 전담 핸들러.
 * API Gateway를 거치지 않으므로 event는 스케줄러가 전달한 순수 JSON이다.
 */
export async function handler(event: SchedulerPayload): Promise<void> {
  const { email, sessionId } = event;

  if (!email) {
    throw new Error("email이 페이로드에 없습니다.");
  }

  const sentAt = new Date();
  const target = Buffer.from(email).toString("base64");
  const trainingResultUrl = `${LANDING_BASE_URL}/training-result?target=${encodeURIComponent(target)}&source=notion_email`;

  const html = buildEmailHtml(email, sentAt, trainingResultUrl);

  const { error } = await resend.emails.send({
    from: SENDER_EMAIL,
    to: email,
    subject: EMAIL_SUBJECT,
    html,
  });

  if (error) {
    console.error(
      `이메일 발송 실패 (sessionId=${sessionId}, email=${email}):`,
      error,
    );
    throw new Error(`Resend API 오류: ${error.message}`);
  }

  console.log(`훈련 이메일 발송 완료: email=${email}, sessionId=${sessionId}`);
}

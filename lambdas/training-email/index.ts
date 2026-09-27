import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { CAMPAIGN_ID, EMAILS_TABLE_NAME, doc } from "../shared/dynamo";
import { parseJsonBody } from "../shared/http";
import { badRequest, ok, serverError } from "../shared/response";
import {
  ensureSummaryInitialized,
  incrementSummary,
  tryClaimSessionEvent,
} from "../shared/stats";

const EMAIL_TTL_SECONDS = 30 * 24 * 60 * 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DELAY_MS = 2 * 60 * 1000; // 30분

const scheduler = new SchedulerClient({});

const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN ?? "";
const DISPATCHER_LAMBDA_ARN = process.env.DISPATCHER_LAMBDA_ARN ?? "";

interface TrainingEmailRequestBody {
  sessionId?: string;
  email?: string;
}

const SUCCESS_RESPONSE = {
  status: "success",
  message: "2차 모의 훈련 신청이 완료되었습니다.",
};

/**
 * EventBridge Scheduler에 30분 뒤 단발성 스케줄을 등록하여
 * send-training-email 람다를 호출하도록 한다.
 */
async function scheduleTrainingEmail(
  email: string,
  sessionId: string,
): Promise<void> {
  const fireAt = new Date(Date.now() + DELAY_MS);
  const scheduleName = `training-${sessionId}-${Date.now()}`;

  await scheduler.send(
    new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: `at(${fireAt.toISOString().replace(/\.\d{3}Z$/, "")})`,
      ScheduleExpressionTimezone: "UTC",
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
      ActionAfterCompletion: "DELETE",
      Target: {
        Arn: DISPATCHER_LAMBDA_ARN,
        RoleArn: SCHEDULER_ROLE_ARN,
        Input: JSON.stringify({ email, sessionId }),
      },
    }),
  );

  console.log(
    `Scheduled training email for ${email} at ${fireAt.toISOString()} (schedule: ${scheduleName})`,
  );
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const body = parseJsonBody<TrainingEmailRequestBody>(event.body);

  if (!body) return badRequest("요청 본문이 올바르지 않습니다.");

  const { sessionId, email } = body;

  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return badRequest("sessionId는 필수입니다.");
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return badRequest("올바른 이메일 형식이 아닙니다.");
  }

  try {
    // 세션당 1회 제한: 이미 신청한 세션이면 재적재 없이 성공 응답만 반환한다(멱등 처리).
    const claimed = await tryClaimSessionEvent(sessionId, "TRAINING_EMAIL");

    if (claimed) {
      const nowIso = new Date().toISOString();
      const ttl = Math.floor(Date.now() / 1000) + EMAIL_TTL_SECONDS;

      let stored = true;

      try {
        await doc.send(
          new PutCommand({
            TableName: EMAILS_TABLE_NAME,
            Item: {
              email,
              campaignId: CAMPAIGN_ID,
              sessionId,
              createdAt: nowIso,
              ttl,
            },
            // 동일 이메일이 다른 세션으로 이미 신청되어 있으면 중복 적재를 방지한다.
            ConditionExpression: "attribute_not_exists(email)",
          }),
        );
      } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
          stored = false;
        } else {
          throw error;
        }
      }

      if (stored) {
        await ensureSummaryInitialized();
        await incrementSummary({ trainingEmailCount: 1 });

        // DynamoDB 저장 성공 시에만 30분 뒤 발송 스케줄 등록
        await scheduleTrainingEmail(email, sessionId);
      }
    }

    return ok(SUCCESS_RESPONSE);
  } catch (error) {
    console.error("POST /training-email 처리 실패", error);
    return serverError();
  }
}

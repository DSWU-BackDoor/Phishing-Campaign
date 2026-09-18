import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})

export const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

export const TELEMETRY_TABLE_NAME = requireEnv('TELEMETRY_TABLE_NAME')
export const EMAILS_TABLE_NAME = requireEnv('EMAILS_TABLE_NAME')
export const ADMIN_SECRET_KEY = requireEnv('ADMIN_SECRET_KEY')
export const CAMPAIGN_ID = requireEnv('CAMPAIGN_ID')

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`환경 변수 ${name}가 설정되지 않았습니다.`)
  }

  return value
}

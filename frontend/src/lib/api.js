import campaign from '../phishingConfig.json'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export const apiMode = Boolean(API_BASE_URL)

export const emptyStats = {
  visits: 0,
  submits: 0,
  reports: 0,
  trainingEmailCount: 0,
  sources: {
    everytime: 0,
    qr: 0,
    instagram: 0,
    direct: 0,
  },
}

const STORAGE_KEY = 'phishing_stats'
const SESSION_ID_KEY = 'phishing_session_id'
const TRAINING_EMAIL_SUBMIT_KEY = 'training_email_submitted'

function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }

  return sessionId
}

function getSource() {
  const params = new URLSearchParams(window.location.search)
  const source = params.get('source')?.toLowerCase()

  const sourceMap = {
    everytime: 'everytime',
    qr: 'qr',
    poster_qr: 'qr',
    instagram: 'instagram',
    direct: 'direct',
  }

  return sourceMap[source] ?? 'direct'
}

function readLocalStats() {
  const saved = sessionStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return structuredClone(emptyStats)
  }

  try {
    return JSON.parse(saved)
  } catch {
    return structuredClone(emptyStats)
  }
}

function writeLocalStats(stats) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

function alreadyRecorded(eventType) {
  const sessionId = getSessionId()
  const key = `recorded_${sessionId}_${eventType}`

  if (sessionStorage.getItem(key)) {
    return true
  }

  sessionStorage.setItem(key, 'true')
  return false
}

function recordLocal(eventType) {
  if (alreadyRecorded(eventType)) {
    return
  }

  const stats = readLocalStats()

  switch (eventType) {
    case 'PAGE_VIEW': {
      stats.visits += 1

      const source = getSource()
      stats.sources[source] += 1

      break
    }

    case 'FORM_SUBMIT':
      stats.submits += 1
      break

    case 'REPORT':
      stats.reports += 1
      break

    default:
      console.warn('알 수 없는 이벤트:', eventType)
      return
  }

  writeLocalStats(stats)
}

export async function recordEvent(eventType) {
  // AWS API 연결 전 LOCAL MOCK
  if (!apiMode) {
    recordLocal(eventType)
    return
  }

  // AWS 연결 후
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    // 실제 피싱 폼 입력값은 포함하지 않음
    body: JSON.stringify({
      campaignId: campaign.campaignId,
      sessionId: getSessionId(),
      eventType,
      source: getSource(),
    }),
  })

  if (!response.ok) {
    throw new Error(`이벤트 기록 실패: ${response.status}`)
  }
}

export async function submitTrainingEmail(email) {
  // AWS API 연결 전 LOCAL MOCK
  if (!apiMode) {
    // 이메일 자체는 저장하지 않고 제출 여부만 기록
    const alreadySubmitted = sessionStorage.getItem(TRAINING_EMAIL_SUBMIT_KEY)

    if (!alreadySubmitted) {
      const stats = readLocalStats()

      stats.trainingEmailCount += 1

      writeLocalStats(stats)
      sessionStorage.setItem(TRAINING_EMAIL_SUBMIT_KEY, 'true')
    }

    return {
      success: true,
    }
  }

  // AWS 연결 후에는 이메일을 실제 백엔드로 전달
  const response = await fetch(`${API_BASE_URL}/training-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      campaignId: campaign.campaignId,
      email,
    }),
  })

  if (!response.ok) {
    throw new Error(`2차 훈련 이메일 저장 실패: ${response.status}`)
  }

  return response.json()
}

export async function getStats() {
  // AWS API 연결 전 LOCAL MOCK
  if (!apiMode) {
    return readLocalStats()
  }

  // AWS 연결 후
  const response = await fetch(`${API_BASE_URL}/stats`)

  if (!response.ok) {
    throw new Error(`통계 조회 실패: ${response.status}`)
  }

  return response.json()
}
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

// VITE_API_URL이 있으면 실제 API 모드, 없으면 로컬 Mock 모드
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

// Storage Keys
// Mock 통계
// 관리자 페이지와 데이터를 공유해야 하므로 localStorage 사용
const STORAGE_KEY = 'phishing_stats'

// 참가자 세션 식별
const SESSION_ID_KEY = 'phishing_session_id'

// 2차 훈련 이메일 세션당 1회 제출 방지
const TRAINING_EMAIL_SUBMIT_KEY = 'training_email_submitted'

// 후기 세션당 1회 제출 방지
const FEEDBACK_SUBMIT_KEY = 'feedback_submitted'

// Mock 후기 - 관리자 페이지와 데이터를 공유해야 하므로 localStorage 사용
const FEEDBACK_KEY = 'phishing_feedback'

// Session
function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()

    sessionStorage.setItem(
      SESSION_ID_KEY,
      sessionId,
    )
  }

  return sessionId
}

// Feedback
export async function submitFeedback(value) {
  const content = value.trim()

  if (!content || content.length > 1000) {
    throw new Error('후기는 1~1,000자로 입력해주세요.')
  }

  const sessionId = getSessionId()

  // 프론트에서 세션당 후기 1회 제한
  if (sessionStorage.getItem(FEEDBACK_SUBMIT_KEY)) {
    throw new Error('후기는 한 세션당 한 번만 작성할 수 있습니다.')
  }

  // LOCAL MOCK
  if (!apiMode) {
    const items = await getFeedback()

    items.unshift({
      id: crypto.randomUUID(),
      sessionId,
      content,
      createdAt: new Date().toISOString(),
    })

    localStorage.setItem(
      FEEDBACK_KEY,
      JSON.stringify(items),
    )

    sessionStorage.setItem(
      FEEDBACK_SUBMIT_KEY,
      'true',
    )

    return {
      success: true,
    }
  }

  // AWS API
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      sessionId,
      content,
    }),
  })

  if (!response.ok) {
    throw new Error(`후기 저장 실패: ${response.status}`)
  }

  // API 저장 성공 후에만 제출 완료 처리
  sessionStorage.setItem(
    FEEDBACK_SUBMIT_KEY,
    'true',
  )

  return response.json()
}


export async function getFeedback() {
  // LOCAL MOCK
  if (!apiMode) {
    try {
      return JSON.parse(
        localStorage.getItem(FEEDBACK_KEY) || '[]',
      )
    } catch {
      return []
    }
  }

  // AWS API
  const response = await fetch(
    `${API_BASE_URL}/feedback`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(`후기 조회 실패: ${response.status}`)
  }

  const data = await response.json()

  if (!Array.isArray(data.items)) {
    throw new Error('후기 응답 형식 오류')
  }

  return data.items
}

// Source
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

// Local Mock Stats
function readLocalStats() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return structuredClone(emptyStats)
  }

  try {
    const parsed = JSON.parse(saved)

    // 기존 Mock 데이터에 새로운 필드가 없는 경우 대비
    return {
      ...structuredClone(emptyStats),
      ...parsed,

      sources: {
        ...emptyStats.sources,
        ...(parsed.sources || {}),
      },
    }
  } catch {
    return structuredClone(emptyStats)
  }
}


function writeLocalStats(stats) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stats),
  )
}

// Event Duplicate Prevention
function alreadyRecorded(eventType) {
  const sessionId = getSessionId()

  // 같은 세션에서도 이벤트 종류별로 각각 1회 기록
  const key = `recorded_${sessionId}_${eventType}`

  if (sessionStorage.getItem(key)) {
    return true
  }

  sessionStorage.setItem(key, 'true')

  return false
}

// Local Event Recording
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

// Event API
export async function recordEvent(eventType) {
  // LOCAL MOCK
  if (!apiMode) {
    recordLocal(eventType)

    return {
      success: true,
    }
  }

  // AWS API
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    // 실제 피싱 폼 입력값은 포함하지 않음
    body: JSON.stringify({
      sessionId: getSessionId(),
      eventType,
      source: getSource(),
    }),
  })

  if (!response.ok) {
    throw new Error(`이벤트 기록 실패: ${response.status}`)
  }

  return response.json()
}

// Training Email
export async function submitTrainingEmail(email) {
  const sessionId = getSessionId()

  // 프론트에서 세션당 이메일 신청 1회 제한
  if (sessionStorage.getItem(TRAINING_EMAIL_SUBMIT_KEY)) {
    throw new Error(
      '2차 훈련 이메일은 한 세션당 한 번만 신청할 수 있습니다.',
    )
  }

  // LOCAL MOCK
  if (!apiMode) {
    // Mock에서는 실제 이메일 주소를 저장하지 않고 신청 횟수만 관리자 통계에 반영
    const stats = readLocalStats()

    stats.trainingEmailCount += 1

    writeLocalStats(stats)

    sessionStorage.setItem(
      TRAINING_EMAIL_SUBMIT_KEY,
      'true',
    )

    return {
      success: true,
    }
  }

  // AWS API
  const response = await fetch(
    `${API_BASE_URL}/training-email`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        sessionId,
        email,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      `2차 훈련 이메일 저장 실패: ${response.status}`,
    )
  }

  // API 저장 성공 후에만 제출 완료 처리
  sessionStorage.setItem(
    TRAINING_EMAIL_SUBMIT_KEY,
    'true',
  )

  return response.json()
}

// Stats

export async function getStats() {
  // LOCAL MOCK
  if (!apiMode) {
    return readLocalStats()
  }

  // AWS API
  const response = await fetch(
    `${API_BASE_URL}/stats`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(`통계 조회 실패: ${response.status}`)
  }

  return response.json()
}
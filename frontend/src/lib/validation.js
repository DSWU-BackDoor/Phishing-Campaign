const labels = { student: '학번을', name: '이름을', birthDate: '생년월일을', phone: '연락처를' }

export function validateField(id, value) {
  if (!value.trim()) return `${labels[id]} 입력해주세요.`

  if (id === 'birthDate') {
    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(value)) {
      return '생년월일을 YYYY.MM.DD 형식으로 입력해주세요.'
    }
    const [year, month, day] = value.split('.').map(Number)
    const date = new Date(0)
    date.setHours(0, 0, 0, 0)
    date.setFullYear(year, month - 1, day)
    if (year < 1 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return '실제로 존재하는 생년월일을 입력해주세요.'
    }
    if (date > new Date()) return '생년월일은 오늘 이후 날짜일 수 없어요.'
  }

  if (id === 'phone') {
    if (!value.startsWith('010')) {
      return '연락처는 010으로 시작해야 해요.'
    }
    if (!/^010-\d{4}-\d{4}$/.test(value)) {
      return '010 뒤의 숫자 8자리를 모두 입력해주세요.'
    }
  }
  return ''
}

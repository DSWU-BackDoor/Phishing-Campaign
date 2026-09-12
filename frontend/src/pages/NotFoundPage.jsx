import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>페이지를 찾을 수 없어요</h1>
      <p>주소를 다시 확인해주세요.</p>
      <Link to="/">첫 화면으로 돌아가기</Link>
    </main>
  )
}

import { Route, Routes } from 'react-router-dom'
import PhishingLandingPage from './pages/PhishingLandingPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import TrainingResultPage from './pages/TrainingResultPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PhishingLandingPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/training-result" element={<TrainingResultPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}



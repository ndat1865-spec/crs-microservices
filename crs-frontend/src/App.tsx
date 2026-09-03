import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import AdminCoursesPage from './pages/AdminCoursesPage'
import ApiKeysPage from './pages/ApiKeysPage'
import CoursesPage from './pages/CoursesPage'
import LoginPage from './pages/LoginPage'
import MyRegistrationsPage from './pages/MyRegistrationsPage'
import RegisterCoursePage from './pages/RegisterCoursePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/admin/courses" element={<ProtectedRoute requiredRole="ADMIN"><AdminCoursesPage /></ProtectedRoute>} />
          <Route path="/admin/api-keys" element={<ProtectedRoute requiredRole="ADMIN"><ApiKeysPage /></ProtectedRoute>} />
          <Route path="/register-course" element={<ProtectedRoute requiredRole="STUDENT"><RegisterCoursePage /></ProtectedRoute>} />
          <Route path="/my-registrations" element={<ProtectedRoute requiredRole="STUDENT"><MyRegistrationsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/courses" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

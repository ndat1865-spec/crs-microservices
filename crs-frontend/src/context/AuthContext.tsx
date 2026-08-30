import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LoginResponse } from '../types/auth'

interface AuthUser { id: number; username: string; role: 'ADMIN' | 'STUDENT' }
interface AuthContextValue { user: AuthUser | null; login: (data: LoginResponse) => void; logout: () => void; isAuthenticated: boolean }

const TOKEN_KEY = 'crs_token'
const USER_KEY = 'crs_user'
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function restoreUser(): AuthUser | null {
  if (!localStorage.getItem(TOKEN_KEY)) return null
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) as AuthUser : null
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(restoreUser)
  const login = (data: LoginResponse) => {
    const authUser: AuthUser = { id: data.userId, username: data.username, role: data.role }
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return context
}

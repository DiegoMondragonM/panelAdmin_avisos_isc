import { useState } from 'react'
import { getToken, clearToken } from '../api/client'
import { login as apiLogin } from '../api/auth'
import { AuthContext } from './auth-context'

const USER_KEY = 'admin_usuario'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getInitialUser() {
  if (!getToken()) {
    localStorage.removeItem(USER_KEY)
    return null
  }
  return loadStoredUser()
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(getInitialUser)

  async function login(email, password) {
    const data = await apiLogin(email, password)
    setUsuario(data.usuario)
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
    return data
  }

  function logout() {
    clearToken()
    localStorage.removeItem(USER_KEY)
    setUsuario(null)
  }

  const isAuthenticated = Boolean(getToken() && usuario?.rol === 'admin')

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

import { API_BASE_URL } from '../config'

const TOKEN_KEY = 'admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    })
  } catch {
    const err = new Error(
      'No se pudo conectar con el servidor. Verifica que el API esté en línea y reinicia el panel (npm run dev).',
    )
    err.network = true
    throw err
  }

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    data = await response.json()
  }

  if (response.status === 401 && !skipAuth) {
    clearToken()
    window.location.href = '/login'
    throw new Error(data?.error || 'Sesión expirada')
  }

  if (!response.ok) {
    const message = data?.error || `Error del servidor: ${response.status}`
    const err = new Error(message)
    err.status = response.status
    throw err
  }

  return data
}

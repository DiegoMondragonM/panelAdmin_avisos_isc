import { apiFetch, setToken } from './client'

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  })

  const rol = String(data.usuario?.rol || '').toLowerCase().trim()
  if (rol !== 'admin') {
    throw new Error(
      `Sin permisos (rol: "${data.usuario?.rol || 'desconocido'}"). Solo administradores pueden acceder.`,
    )
  }

  setToken(data.token)
  return data
}

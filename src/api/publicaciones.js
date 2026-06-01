import { apiFetch } from './client'

export function getPublicacion(id) {
  return apiFetch(`/publicaciones/${id}`)
}

export function listPublicaciones(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') query.set(key, value)
  })
  const qs = query.toString()
  return apiFetch(`/admin/publicaciones${qs ? `?${qs}` : ''}`)
}

export function createPublicacion(body) {
  return apiFetch('/admin/publicaciones', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updatePublicacion(id, body) {
  return apiFetch(`/admin/publicaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function publicarPublicacion(id) {
  return apiFetch(`/admin/publicaciones/${id}/publicar`, { method: 'PATCH' })
}

export function vencerPublicacion(id) {
  return apiFetch(`/admin/publicaciones/${id}/vencer`, { method: 'PATCH' })
}

export function deletePublicacion(id) {
  return apiFetch(`/admin/publicaciones/${id}`, { method: 'DELETE' })
}

import { apiFetch } from './client'

export function getMetricas(params = {}) {
  const query = new URLSearchParams()
  if (params.desde) query.set('desde', params.desde)
  if (params.hasta) query.set('hasta', params.hasta)
  const qs = query.toString()
  return apiFetch(`/admin/metricas${qs ? `?${qs}` : ''}`)
}

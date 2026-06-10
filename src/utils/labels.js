export const TIPO_LABELS = {
  curso: 'Curso',
  concurso: 'Concurso',
  conferencia: 'Conferencia',
  taller: 'Taller',
  beca: 'Beca',
  otro: 'Otro',
}

export const ESTADO_LABELS = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  vencida: 'Vencida',
}

export function labelTipo(tipo) {
  return TIPO_LABELS[tipo] || tipo
}

export function labelEstado(estado) {
  return ESTADO_LABELS[estado] || estado
}

export function labelFuente(fuente) {
  if (fuente === 'mooc') return 'Curso en línea'
  if (fuente === 'manual') return 'Manual'
  return fuente || '—'
}

// Tipos de evento de interacción que reporta el backend (solo visualización)
export const EVENTO_LABELS = {
  view_detail: 'Ver detalle',
  open_link: 'Abrir enlace',
  tap_notification: 'Abrir notificación',
  favorite: 'Favorito',
  unfavorite: 'Quitar favorito',
  view: 'Vista',
  click: 'Clic',
}

export function labelEvento(tipoEvento) {
  if (!tipoEvento) return '—'
  const key = String(tipoEvento).trim().toLowerCase().replace(/\s+/g, '_')
  return EVENTO_LABELS[key] || tipoEvento.replace(/_/g, ' ')
}

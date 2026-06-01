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
  if (fuente === 'mooc') return 'MOOC'
  if (fuente === 'manual') return 'Manual'
  return fuente
}

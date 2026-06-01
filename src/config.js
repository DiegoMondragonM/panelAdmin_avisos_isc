// En desarrollo usa el proxy de Vite (/api) para evitar errores de CORS en el navegador
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'http://163.192.134.248/api')

export const TIPOS_PUBLICACION = [
  'curso',
  'concurso',
  'conferencia',
  'taller',
  'beca',
  'otro',
]

export const ESTADOS_PUBLICACION = ['borrador', 'publicada', 'vencida']

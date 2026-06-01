/**
 * Palabras clave del plan de estudios ISC para priorizar publicaciones en el top del dashboard.
 * Coincide con título, descripción y tags de cada publicación.
 */
const ISC_KEYWORDS = [
  // Fundamentos y programación
  'algoritmo', 'estructura de datos', 'orientada a objetos', 'patrones de diseño',
  'programacion funcional', 'programación funcional', 'poo', 'oop',
  // Desarrollo web y móvil
  'frontend', 'backend', 'html', 'css', 'javascript', 'react', 'vue', 'angular',
  'node.js', 'nodejs', 'django', 'spring boot', 'spring', 'movil', 'móvil', 'flutter',
  'react native', 'android', 'ios', 'api rest', 'rest', 'graphql',
  // Bases de datos
  'sql', 'postgresql', 'mysql', 'nosql', 'mongodb', 'redis', 'firebase',
  'base de datos', 'modelado de datos', 'optimizacion de consultas',
  // DevOps y cloud
  'linux', 'servidor', 'docker', 'kubernetes', 'ci/cd', 'github actions', 'jenkins',
  'aws', 'azure', 'gcp', 'devops', 'nube', 'cloud',
  // Seguridad
  'ciberseguridad', 'hacking etico', 'hacking ético', 'criptografia', 'criptografía',
  'owasp', 'seguridad informatica', 'seguridad informática',
  // IA y datos
  'machine learning', 'deep learning', 'ciencia de datos', 'analisis de datos',
  'análisis de datos', 'nlp', 'lenguaje natural', 'computer vision',
  'inteligencia artificial', 'vision por computadora',
  // Redes e infraestructura
  'redes', 'tcp', 'ip', 'http', 'dns', 'iot', 'embebido', 'embebidos', 'robotica',
  'robótica', 'telecomunicaciones', 'infraestructura',
  // Gestión y metodologías
  'git', 'control de versiones', 'agil', 'ágil', 'scrum', 'kanban',
  'gestion de proyectos', 'gestión de proyectos', 'arquitectura de software',
  'microservicio', 'microservicios',
  // Tags del catálogo ISC
  'python', 'java', 'web', 'datos', 'ia', 'backend', 'frontend',
]

/** Slugs de tags del catálogo que pertenecen al área ISC */
const ISC_TAG_SLUGS = new Set([
  'ia', 'web', 'movil', 'redes', 'ciberseguridad', 'nube', 'datos',
  'robotica-iot', 'python', 'java', 'javascript', 'base-de-datos',
  'devops', 'flutter', 'backend', 'frontend', 'machine-learning',
])

function publicationText(pub) {
  const parts = [pub.titulo, pub.descripcion, pub.tipo]
  if (pub.tags?.length) {
    pub.tags.forEach((t) => {
      parts.push(t.nombre, t.slug)
    })
  }
  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function isPublicacionISC(pub) {
  if (pub.fuente === 'manual') return true

  const text = publicationText(pub)
  if (ISC_KEYWORDS.some((kw) => text.includes(kw))) return true

  if (pub.tags?.some((t) => ISC_TAG_SLUGS.has(t.slug))) return true

  return false
}

function num(value) {
  return parseInt(value, 10) || 0
}

/**
 * Arma el top del dashboard: manuales + MOOC/cursos alineados al plan ISC.
 */
export function buildTopPublicacionesISC(topFromMetricas = [], publicaciones = []) {
  const statsById = new Map(
    topFromMetricas.map((p) => [p.id, p]),
  )

  const published = publicaciones.filter((p) => p.estado === 'publicada')
  const relevant = published.filter(isPublicacionISC)

  const merged = relevant.map((p) => {
    const stats = statsById.get(p.id)
    return {
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      fuente: p.fuente,
      tags: p.tags,
      total_interacciones: stats?.total_interacciones ?? '0',
      vistas: stats?.vistas ?? '0',
      clics: stats?.clics ?? '0',
      favoritos: stats?.favoritos ?? '0',
      tap_notif: stats?.tap_notif ?? '0',
      esManual: p.fuente === 'manual',
      esISC: p.fuente !== 'manual',
    }
  })

  merged.sort((a, b) => {
    if (a.esManual !== b.esManual) return a.esManual ? -1 : 1
    return num(b.total_interacciones) - num(a.total_interacciones)
  })

  return merged.slice(0, 15)
}

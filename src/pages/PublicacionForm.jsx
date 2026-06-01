import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { listTags } from '../api/tags'
import {
  createPublicacion,
  updatePublicacion,
  getPublicacion,
  publicarPublicacion,
} from '../api/publicaciones'
import { TIPOS_PUBLICACION } from '../config'
import { labelTipo } from '../utils/labels'
import { toDatetimeLocal, fromDatetimeLocal } from '../utils/dates'
import PublicacionPreview from '../components/PublicacionPreview'
import FlashMessage from '../components/FlashMessage'

const emptyForm = {
  titulo: '',
  descripcion: '',
  tipo: 'concurso',
  link: '',
  imagen_url: '',
  fecha_inicio: '',
  fecha_fin: '',
  fecha_inscripcion_inicio: '',
  fecha_inscripcion_fin: '',
  tag_ids: [],
  estado: 'borrador',
}

function buildBody(form) {
  return {
    titulo: form.titulo.trim(),
    tipo: form.tipo,
    descripcion: form.descripcion.trim() || undefined,
    link: form.link.trim() || undefined,
    imagen_url: form.imagen_url.trim() || undefined,
    fecha_inicio: fromDatetimeLocal(form.fecha_inicio),
    fecha_fin: fromDatetimeLocal(form.fecha_fin),
    fecha_inscripcion_inicio: fromDatetimeLocal(form.fecha_inscripcion_inicio),
    fecha_inscripcion_fin: fromDatetimeLocal(form.fecha_inscripcion_fin),
    tag_ids: form.tag_ids,
  }
}

function validateForm(form) {
  if (form.titulo.trim().length < 3) return 'El título debe tener al menos 3 caracteres.'
  if (form.fecha_inicio && form.fecha_fin) {
    if (new Date(form.fecha_inicio) > new Date(form.fecha_fin)) {
      return 'La fecha de inicio del evento no puede ser posterior a la de fin.'
    }
  }
  if (form.fecha_inscripcion_inicio && form.fecha_inscripcion_fin) {
    if (new Date(form.fecha_inscripcion_inicio) > new Date(form.fecha_inscripcion_fin)) {
      return 'La apertura de inscripciones no puede ser posterior al cierre.'
    }
  }
  return null
}

export default function PublicacionForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [tags, setTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [pubEstado, setPubEstado] = useState(null)

  useEffect(() => {
    listTags()
      .then((res) => setTags(res.tags || []))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    getPublicacion(id)
      .then((res) => {
        const pub = res.publicacion
        if (!pub) throw new Error('Publicación no encontrada')
        if (pub.fuente !== 'manual') {
          throw new Error('Solo se pueden editar publicaciones manuales')
        }
        setPubEstado(pub.estado)
        setForm({
          titulo: pub.titulo || '',
          descripcion: pub.descripcion || '',
          tipo: pub.tipo || 'otro',
          link: pub.link || '',
          imagen_url: pub.imagen_url || '',
          fecha_inicio: toDatetimeLocal(pub.fecha_inicio),
          fecha_fin: toDatetimeLocal(pub.fecha_fin),
          fecha_inscripcion_inicio: toDatetimeLocal(pub.fecha_inscripcion_inicio),
          fecha_inscripcion_fin: toDatetimeLocal(pub.fecha_inscripcion_fin),
          tag_ids: (pub.tags || []).map((t) => t.id),
          estado: pub.estado,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const filteredTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase()
    if (!q) return tags
    return tags.filter((t) => t.nombre.toLowerCase().includes(q))
  }, [tags, tagSearch])

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleTag(tagId) {
    setForm((f) => {
      const ids = f.tag_ids.includes(tagId)
        ? f.tag_ids.filter((i) => i !== tagId)
        : [...f.tag_ids, tagId]
      return { ...f, tag_ids: ids }
    })
  }

  async function save(andPublish = false) {
    setError('')
    setSuccess('')
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    const body = buildBody(form)

    try {
      if (isEdit) {
        await updatePublicacion(id, body)
        if (andPublish && pubEstado === 'borrador') {
          await publicarPublicacion(id)
          navigate('/publicaciones', {
            state: { message: `Publicación actualizada y publicada: ${form.titulo}` },
          })
        } else {
          navigate('/publicaciones', {
            state: { message: `Cambios guardados: ${form.titulo}` },
          })
        }
      } else {
        const res = await createPublicacion(body)
        const newId = res.publicacion.id
        if (andPublish) {
          await publicarPublicacion(newId)
          navigate('/publicaciones', {
            state: { message: `Publicación creada y publicada: ${form.titulo}` },
          })
        } else {
          navigate('/publicaciones', {
            state: { message: `Borrador guardado: ${form.titulo}` },
          })
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(e, andPublish = false) {
    e.preventDefault()
    save(andPublish)
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Cargando publicación...</p>
      </div>
    )
  }

  const canPublish = !isEdit || pubEstado === 'borrador'

  return (
    <>
      <div className="main-title">
        <div>
          <h3>{isEdit ? 'Editar publicación' : 'Nueva publicación'}</h3>
          {isEdit && pubEstado && (
            <span className={`badge badge-${pubEstado}`}>{pubEstado}</span>
          )}
        </div>
        <Link to="/publicaciones" className="btn">
          ← Volver a la lista
        </Link>
      </div>

      {!isEdit && (
        <p className="form-hint">
          Puedes guardar como <strong>borrador</strong> o <strong>crear y publicar</strong> de
          inmediato. Al publicar se envía notificación push a usuarios con intereses coincidentes.
        </p>
      )}

      <FlashMessage message={success} type="success" onClose={() => setSuccess('')} />
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-layout">
        <form
          className="pub-form"
          onSubmit={(e) => handleSubmit(e, false)}
        >
          <section className="form-section">
            <h4>Información general</h4>

            <label>
              Título *
              <input
                value={form.titulo}
                onChange={(e) => updateField('titulo', e.target.value)}
                required
                minLength={3}
                maxLength={200}
                placeholder="Ej. Hackathon ISC 2026"
              />
              <span className="field-hint">{form.titulo.length}/200</span>
            </label>

            <label>
              Tipo *
              <select
                value={form.tipo}
                onChange={(e) => updateField('tipo', e.target.value)}
                required
              >
                {TIPOS_PUBLICACION.map((t) => (
                  <option key={t} value={t}>
                    {labelTipo(t)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Descripción
              <textarea
                value={form.descripcion}
                onChange={(e) => updateField('descripcion', e.target.value)}
                rows={5}
                placeholder="Describe el evento, requisitos, premios..."
              />
            </label>
          </section>

          <section className="form-section">
            <h4>Enlaces e imagen</h4>

            <label>
              Enlace (inscripción o más info)
              <input
                type="url"
                value={form.link}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="https://isc.tecnm.mx/evento"
              />
            </label>

            <label>
              URL de imagen de portada
              <input
                type="url"
                value={form.imagen_url}
                onChange={(e) => updateField('imagen_url', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </section>

          <section className="form-section">
            <h4>Fechas del evento</h4>
            <div className="form-row">
              <label>
                Inicio del evento
                <input
                  type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={(e) => updateField('fecha_inicio', e.target.value)}
                />
              </label>
              <label>
                Fin del evento
                <input
                  type="datetime-local"
                  value={form.fecha_fin}
                  onChange={(e) => updateField('fecha_fin', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h4>Inscripciones (opcional)</h4>
            <div className="form-row">
              <label>
                Apertura
                <input
                  type="datetime-local"
                  value={form.fecha_inscripcion_inicio}
                  onChange={(e) => updateField('fecha_inscripcion_inicio', e.target.value)}
                />
              </label>
              <label>
                Cierre
                <input
                  type="datetime-local"
                  value={form.fecha_inscripcion_fin}
                  onChange={(e) => updateField('fecha_inscripcion_fin', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h4>Tags / intereses</h4>
            <input
              type="search"
              className="tag-search"
              placeholder="Buscar tag..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
            <div className="tags-grid">
              {filteredTags.map((tag) => (
                <label key={tag.id} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={form.tag_ids.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  {tag.nombre}
                </label>
              ))}
            </div>
            {form.tag_ids.length > 0 && (
              <p className="field-hint">{form.tag_ids.length} tag(s) seleccionados</p>
            )}
          </section>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? 'Guardando...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Guardar borrador'}
            </button>
            {canPublish && (
              <button
                type="button"
                className="btn btn-success-solid"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, true)}
              >
                {submitting
                  ? 'Procesando...'
                  : isEdit
                    ? 'Guardar y publicar'
                    : 'Crear y publicar'}
              </button>
            )}
            <Link to="/publicaciones" className="btn">
              Cancelar
            </Link>
          </div>
        </form>

        <PublicacionPreview form={form} tags={tags} />
      </div>
    </>
  )
}

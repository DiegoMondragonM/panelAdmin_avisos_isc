import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicacion } from '../api/publicaciones'
import { labelTipo, labelEstado } from '../utils/labels'
import { formatDateTime, isPorVencer } from '../utils/dates'

export default function PublicacionDetalleModal({ pubId, onClose, onAction }) {
  const [pub, setPub] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pubId) return undefined
    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
        setPub(null)
      }
    })
    getPublicacion(pubId)
      .then((res) => setPub(res.publicacion))
      .catch((err) => setError(err.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [pubId])

  if (!pubId) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h4 id="modal-title">Detalle de publicación</h4>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {loading && <p className="modal-body">Cargando...</p>}
        {error && <div className="alert alert-error modal-body">{error}</div>}

        {!loading && pub && (
          <div className="modal-body">
            {pub.imagen_url && (
              <img src={pub.imagen_url} alt="" className="modal-image" />
            )}
            <div className="modal-badges">
              <span className={`badge badge-${pub.estado}`}>{labelEstado(pub.estado)}</span>
              <span className="badge badge-tipo">{labelTipo(pub.tipo)}</span>
              <span className="badge badge-fuente">{pub.fuente}</span>
              {isPorVencer(pub) && (
                <span className="badge badge-warning">Por vencer</span>
              )}
            </div>
            <h3>{pub.titulo}</h3>
            {pub.descripcion && <p className="modal-desc">{pub.descripcion}</p>}
            {pub.link && (
              <p>
                <a href={pub.link} target="_blank" rel="noreferrer">
                  {pub.link}
                </a>
              </p>
            )}
            <dl className="detail-list">
              <div>
                <dt>Autor</dt>
                <dd>{pub.autor || '—'}</dd>
              </div>
              <div>
                <dt>Evento</dt>
                <dd>
                  {formatDateTime(pub.fecha_inicio)} — {formatDateTime(pub.fecha_fin)}
                </dd>
              </div>
              <div>
                <dt>Inscripción</dt>
                <dd>
                  {formatDateTime(pub.fecha_inscripcion_inicio)} —{' '}
                  {formatDateTime(pub.fecha_inscripcion_fin)}
                </dd>
              </div>
              <div>
                <dt>Actualizado</dt>
                <dd>{formatDateTime(pub.updated_at)}</dd>
              </div>
            </dl>
            {pub.tags?.length > 0 && (
              <div className="preview-tags">
                {pub.tags.map((t) => (
                  <span key={t.id} className="tag-pill">
                    {t.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {pub && (
          <div className="modal-footer">
            {pub.fuente === 'manual' && pub.estado !== 'vencida' && (
              <Link
                to={`/publicaciones/${pub.id}/editar`}
                className="btn btn-primary"
                onClick={onClose}
              >
                Editar
              </Link>
            )}
            {pub.estado === 'borrador' && (
              <button
                type="button"
                className="btn btn-success-solid"
                onClick={() => onAction(pub.id, 'publicar', pub.titulo)}
              >
                Publicar
              </button>
            )}
            {pub.estado === 'publicada' && (
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => onAction(pub.id, 'vencer', pub.titulo)}
              >
                Marcar vencida
              </button>
            )}
            <button type="button" className="btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

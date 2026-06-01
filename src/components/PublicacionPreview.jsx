import { labelTipo, labelEstado } from '../utils/labels'
import { formatDateTime, fromDatetimeLocal } from '../utils/dates'

export default function PublicacionPreview({ form, tags }) {
  const selectedTags = tags.filter((t) => form.tag_ids.includes(t.id))

  return (
    <aside className="preview-panel">
      <h4>Vista previa</h4>
      <div className="preview-card">
        {form.imagen_url ? (
          <img
            src={form.imagen_url}
            alt=""
            className="preview-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="preview-image-placeholder">Sin imagen</div>
        )}
        <div className="preview-body">
          <span className={`badge badge-${form.estado || 'borrador'}`}>
            {labelEstado(form.estado || 'borrador')}
          </span>
          <span className="badge badge-tipo">{labelTipo(form.tipo)}</span>
          <h5>{form.titulo || 'Título de la publicación'}</h5>
          <p className="preview-desc">
            {form.descripcion || 'La descripción aparecerá aquí...'}
          </p>
          {form.link && (
            <a href={form.link} target="_blank" rel="noreferrer" className="preview-link">
              Ver enlace →
            </a>
          )}
          <dl className="preview-dates">
            {(form.fecha_inicio || form.fecha_fin) && (
              <div>
                <dt>Evento</dt>
                <dd>
                  {formatDateTime(fromDatetimeLocal(form.fecha_inicio))} —{' '}
                  {formatDateTime(fromDatetimeLocal(form.fecha_fin))}
                </dd>
              </div>
            )}
            {(form.fecha_inscripcion_inicio || form.fecha_inscripcion_fin) && (
              <div>
                <dt>Inscripción</dt>
                <dd>
                  {formatDateTime(fromDatetimeLocal(form.fecha_inscripcion_inicio))} —{' '}
                  {formatDateTime(fromDatetimeLocal(form.fecha_inscripcion_fin))}
                </dd>
              </div>
            )}
          </dl>
          {selectedTags.length > 0 && (
            <div className="preview-tags">
              {selectedTags.map((t) => (
                <span key={t.id} className="tag-pill">
                  {t.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

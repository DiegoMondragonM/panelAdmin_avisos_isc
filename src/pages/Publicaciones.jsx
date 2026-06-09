import { useEffect, useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  listPublicaciones,
  publicarPublicacion,
  vencerPublicacion,
  deletePublicacion,
} from '../api/publicaciones'
import { TIPOS_PUBLICACION } from '../config'
import { labelTipo, labelEstado, labelFuente } from '../utils/labels'
import { formatDate, isPorVencer } from '../utils/dates'
import FlashMessage from '../components/FlashMessage'
import PublicacionDetalleModal from '../components/PublicacionDetalleModal'
import ConfirmModal, { ACTION_CONFIRM } from '../components/ConfirmModal'

const TABS = [
  { key: '', label: 'Todas', fuente: '' },
  { key: 'borrador', label: 'Borradores', fuente: 'manual' },
  { key: 'publicada', label: 'Publicadas', fuente: 'manual' },
  { key: 'vencida', label: 'Vencidas', fuente: '' },
]

const LIST_LIMIT = 50

const EMPTY_CONFIRM = { open: false, action: null, id: null, titulo: '' }

export default function Publicaciones() {
  const location = useLocation()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ estado: '', tipo: '', fuente: '', page: 1 })
  const [busqueda, setBusqueda] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [flash, setFlash] = useState('')
  const [detalleId, setDetalleId] = useState(null)
  const [actionMsg, setActionMsg] = useState('')
  const [counts, setCounts] = useState({ borrador: 0, publicada: 0, vencida: 0 })
  const [confirmState, setConfirmState] = useState(EMPTY_CONFIRM)

  useEffect(() => {
    const { message, estado } = location.state || {}
    if (!message && estado === undefined) return undefined

    let cancelled = false
    void Promise.resolve().then(() => {
      if (cancelled) return
      if (message) setFlash(message)
      if (estado !== undefined) {
        const tab = TABS.find((t) => t.key === estado)
        setFiltros((f) => ({
          ...f,
          estado,
          fuente: tab?.fuente || '',
          page: 1,
        }))
      }
      navigate(location.pathname, { replace: true, state: {} })
    })
    return () => {
      cancelled = true
    }
  }, [location.key, location.pathname, location.state, navigate])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      listPublicaciones({ estado: 'borrador', fuente: 'manual', limit: 1, page: 1 }),
      listPublicaciones({ estado: 'publicada', fuente: 'manual', limit: 1, page: 1 }),
      listPublicaciones({ estado: 'vencida', limit: 1, page: 1 }),
    ])
      .then(([borradores, publicadas, vencidas]) => {
        if (cancelled) return
        setCounts({
          borrador: borradores.total,
          publicada: publicadas.total,
          vencida: vencidas.total,
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  useEffect(() => {
    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    })
    listPublicaciones({ ...filtros, limit: LIST_LIMIT })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filtros, refreshKey])

  const publicaciones = useMemo(() => {
    if (!data?.publicaciones) return []
    const q = busqueda.trim().toLowerCase()
    if (!q) return data.publicaciones
    return data.publicaciones.filter(
      (p) =>
        p.titulo?.toLowerCase().includes(q) ||
        p.tipo?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.nombre?.toLowerCase().includes(q)),
    )
  }, [data, busqueda])

  function tableMetaText() {
    if (!data) return ''
    if (filtros.estado === 'publicada' && filtros.fuente === 'manual') {
      return `${data.total} aviso(s) publicado(s) directamente por el administrador`
    }
    if (filtros.estado === 'borrador' && filtros.fuente === 'manual') {
      return `${data.total} borrador(es) registrado(s) por el administrador`
    }
    let text = `Total: ${data.total} registro(s) · mostrando ${publicaciones.length}`
    if (data.paginas > 1) text += ` · página ${data.page} de ${data.paginas}`
    if (busqueda) text += ` · búsqueda: "${busqueda}"`
    return text
  }

  function handleAction(id, action, titulo = '') {
    setActionMsg('')
    setConfirmState({ open: true, action, id, titulo })
  }

  async function executeConfirmedAction() {
    const { action, id } = confirmState
    setActionLoading(id)
    try {
      if (action === 'publicar') {
        await publicarPublicacion(id)
        setFlash('El aviso fue publicado exitosamente.')
      } else if (action === 'vencer') {
        await vencerPublicacion(id)
        setFlash('El aviso fue marcado como vencido correctamente.')
      } else if (action === 'eliminar') {
        await deletePublicacion(id)
        setFlash('El aviso fue eliminado del sistema.')
      }
      setConfirmState(EMPTY_CONFIRM)
      setDetalleId(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionMsg(err.message)
      setConfirmState(EMPTY_CONFIRM)
    } finally {
      setActionLoading(null)
    }
  }

  function setTab(tab) {
    setFiltros((f) => ({
      ...f,
      estado: tab.key,
      fuente: tab.fuente || '',
      page: 1,
    }))
    setBusqueda('')
  }

  return (
    <>
      <div className="main-title">
        <h3>Publicaciones</h3>
        <Link to="/publicaciones/nueva" className="btn btn-primary">
          + Nueva publicación
        </Link>
      </div>

      <FlashMessage message={flash} type="success" onClose={() => setFlash('')} />
      {actionMsg && <div className="alert alert-error">{actionMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key || 'all'}
            type="button"
            className={`tab ${filtros.estado === tab.key ? 'tab-active' : ''}`}
            onClick={() => setTab(tab)}
            title={
              tab.key === 'publicada'
                ? 'Solo publicaciones manuales publicadas por el administrador'
                : undefined
            }
          >
            {tab.label}
            {tab.key === 'borrador' && counts.borrador > 0 && (
              <span className="tab-count">{counts.borrador}</span>
            )}
            {tab.key === 'publicada' && counts.publicada > 0 && (
              <span className="tab-count">{counts.publicada}</span>
            )}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por título o etiqueta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          value={filtros.tipo}
          onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value, page: 1 }))}
        >
          <option value="">Todos los tipos</option>
          {TIPOS_PUBLICACION.map((t) => (
            <option key={t} value={t}>
              {labelTipo(t)}
            </option>
          ))}
        </select>
      </div>

      {filtros.estado === 'publicada' && (
        <p className="form-hint tab-hint">
          Se muestran únicamente los avisos publicados directamente por el administrador.
          Los cursos en línea externos no se incluyen en esta vista.
        </p>
      )}

      {loading && (
        <div className="page-loading">
          <div className="spinner" />
          <p>Cargando publicaciones...</p>
        </div>
      )}

      {!loading && data && (
        <>
          <p className="table-meta">{tableMetaText()}</p>

          {publicaciones.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron registros con los criterios seleccionados.</p>
              <Link to="/publicaciones/nueva" className="btn btn-primary">
                Registrar nuevo aviso
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Fuente</th>
                    <th>Evento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {publicaciones.map((pub) => (
                    <tr key={pub.id}>
                      <td className="cell-titulo">
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setDetalleId(pub.id)}
                        >
                          {pub.titulo}
                        </button>
                        {isPorVencer(pub) && (
                          <span className="badge badge-warning">Próximo a vencer</span>
                        )}
                      </td>
                      <td>{labelTipo(pub.tipo)}</td>
                      <td>
                        <span className={`badge badge-${pub.estado}`}>
                          {labelEstado(pub.estado)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-fuente-${pub.fuente === 'mooc' ? 'mooc' : 'manual'}`}
                        >
                          {labelFuente(pub.fuente)}
                        </span>
                      </td>
                      <td className="cell-dates">
                        <span>{formatDate(pub.fecha_inicio)}</span>
                        <span className="date-sep">→</span>
                        <span>{formatDate(pub.fecha_fin)}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setDetalleId(pub.id)}
                        >
                          Ver detalle
                        </button>
                        {pub.fuente === 'manual' && pub.estado !== 'vencida' && (
                          <Link
                            to={`/publicaciones/${pub.id}/editar`}
                            className="btn btn-sm"
                          >
                            Editar
                          </Link>
                        )}
                        {pub.estado === 'borrador' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={actionLoading === pub.id}
                            onClick={() => handleAction(pub.id, 'publicar', pub.titulo)}
                          >
                            Publicar
                          </button>
                        )}
                        {pub.estado === 'publicada' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            disabled={actionLoading === pub.id}
                            onClick={() => handleAction(pub.id, 'vencer', pub.titulo)}
                          >
                            Marcar vencida
                          </button>
                        )}
                        {pub.fuente === 'manual' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            disabled={actionLoading === pub.id}
                            onClick={() => handleAction(pub.id, 'eliminar', pub.titulo)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.paginas > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={filtros.page <= 1}
                onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}
              >
                Anterior
              </button>
              <span>
                Página {data.page} de {data.paginas}
              </span>
              <button
                type="button"
                disabled={filtros.page >= data.paginas}
                onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <PublicacionDetalleModal
        pubId={detalleId}
        onClose={() => setDetalleId(null)}
        onAction={(id, action, titulo) => handleAction(id, action, titulo)}
      />

      {confirmState.open && (() => {
        const cfg = ACTION_CONFIRM[confirmState.action]
        if (!cfg) return null
        return (
          <ConfirmModal
            isOpen
            title={cfg.title}
            message={cfg.getMessage(confirmState.titulo)}
            detail={cfg.getDetail()}
            confirmLabel={cfg.confirmLabel}
            variant={cfg.variant}
            icon={cfg.icon}
            loading={actionLoading === confirmState.id}
            onConfirm={executeConfirmedAction}
            onClose={() => setConfirmState(EMPTY_CONFIRM)}
          />
        )
      })()}
    </>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  BsFillGrid1X2Fill,
  BsPeopleFill,
  BsBellFill,
  BsPencilSquare,
  BsListCheck,
} from 'react-icons/bs'
import { getMetricas } from '../api/metricas'
import { listPublicaciones } from '../api/publicaciones'
import { buildTopPublicacionesISC } from '../utils/iscTopics'
import { labelTipo, labelFuente } from '../utils/labels'

function num(value) {
  return parseInt(value, 10) || 0
}

export default function Dashboard() {
  const [metricas, setMetricas] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMetricas(),
      listPublicaciones({ estado: 'publicada', limit: 50 }),
    ])
      .then(([metricasRes, pubsRes]) => {
        setMetricas(metricasRes)
        setPublicaciones(pubsRes.publicaciones || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const topISC = useMemo(() => {
    if (!metricas) return []
    return buildTopPublicacionesISC(
      metricas.top_publicaciones || [],
      publicaciones,
    )
  }, [metricas, publicaciones])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Cargando información del panel...</p>
      </div>
    )
  }

  if (error) return <div className="alert alert-error">{error}</div>
  if (!metricas) return null

  const { resumen, por_dia, por_tipo_evento } = metricas
  const borradores = num(resumen.total_borradores)

  const cards = [
    {
      title: 'Publicaciones',
      value: num(resumen.total_publicaciones),
      icon: <BsFillGrid1X2Fill className="card_icon" />,
    },
    {
      title: 'Usuarios',
      value: num(resumen.total_usuarios),
      icon: <BsPeopleFill className="card_icon" />,
    },
    {
      title: 'Dispositivos activos',
      value: num(resumen.dispositivos_activos),
      icon: <BsBellFill className="card_icon" />,
    },
    {
      title: 'Interacciones del período',
      value: num(resumen.interacciones_periodo),
      icon: <BsFillGrid1X2Fill className="card_icon" />,
    },
  ]

  const chartPorDia = (por_dia || []).map((d) => ({
    dia: d.dia?.slice(5) || d.dia,
    total: num(d.total),
  }))

  const chartEventos = (por_tipo_evento || []).map((e) => ({
    tipo: e.tipo_evento?.replace(/_/g, ' ') || e.tipo_evento,
    total: num(e.total),
  }))

  return (
    <>
      <div className="main-title">
        <h3>Inicio</h3>
        <div className="quick-actions">
          <Link to="/publicaciones/nueva" className="btn btn-primary">
            <BsPencilSquare className="icon" /> Nueva publicación
          </Link>
          <Link to="/publicaciones" className="btn">
            <BsListCheck className="icon" /> Ver publicaciones
          </Link>
        </div>
      </div>

      {borradores > 0 && (
        <div className="alert alert-info">
          Hay <strong>{borradores}</strong> aviso(s) en borrador pendiente(s) de revisión y publicación.{' '}
          <Link to="/publicaciones" state={{ estado: 'borrador' }}>
            Ver borradores
          </Link>
        </div>
      )}

      <div className="main-cards">
        {cards.map((card) => (
          <div className="card" key={card.title}>
            <div className="card-inner">
              <div>
                <p>{card.title}</p>
                <h4>{card.value}</h4>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="stats-row">
        <span>En borrador: {borradores}</span>
        <span>Avisos propios: {num(resumen.total_manuales)}</span>
        <span>Cursos en línea: {num(resumen.total_mooc)}</span>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h4>Interacciones por día</h4>
          {chartPorDia.length === 0 ? (
            <p className="chart-empty">Sin actividad registrada en el período</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="dia" stroke="#9e9ea4" fontSize={12} />
                <YAxis stroke="#9e9ea4" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#263043', border: 'none' }}
                  formatter={(value) => [value, 'Interacciones']}
                />
                <Line type="monotone" dataKey="total" stroke="#2962ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-box">
          <h4>Interacciones por tipo de aviso</h4>
          {chartEventos.length === 0 ? (
            <p className="chart-empty">Sin actividad registrada en el período</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartEventos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="tipo" stroke="#9e9ea4" fontSize={11} />
                <YAxis stroke="#9e9ea4" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#263043', border: 'none' }}
                  formatter={(value) => [value, 'Interacciones']}
                />
                <Bar dataKey="total" fill="#ff6d00" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <section className="top-section">
        <div className="top-section-header">
          <div>
            <h4>Avisos más consultados — Área ISC</h4>
            <p className="section-subtitle">
              Avisos propios y cursos en línea vinculados al plan de estudios de Ingeniería en Sistemas Computacionales
              (programación, desarrollo web, bases de datos, seguridad, redes, gestión de proyectos).
            </p>
          </div>
        </div>

        {topISC.length === 0 ? (
          <p className="chart-empty">
            No hay avisos activos registrados para el área de ISC.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Fuente</th>
                  <th>Vistas</th>
                  <th>Clics</th>
                  <th>Favoritos</th>
                  <th>Interacciones</th>
                </tr>
              </thead>
              <tbody>
                {topISC.map((p) => (
                  <tr key={p.id}>
                    <td>{p.titulo}</td>
                    <td>{labelTipo(p.tipo)}</td>
                    <td>
                      <span
                        className={`badge badge-fuente-${p.fuente === 'mooc' ? 'mooc' : 'manual'}`}
                      >
                        {labelFuente(p.fuente)}
                      </span>
                    </td>
                    <td>{num(p.vistas)}</td>
                    <td>{num(p.clics)}</td>
                    <td>{num(p.favoritos)}</td>
                    <td>{num(p.total_interacciones)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

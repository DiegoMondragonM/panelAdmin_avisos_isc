import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      if (err.status === 403) {
        setError('No tienes permisos para esta acción.')
      } else {
        setError(err.message || 'Credenciales incorrectas')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Panel Admin</h1>
        <p className="login-subtitle">Avisos ISC — Administración</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="adminisc@tecnm.mx"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}

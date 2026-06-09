import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle } from 'react-icons/bs'
import { useAuth } from './context/useAuth'

function Header() {
  const { usuario, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-left">
        <p>
          Bienvenido, <strong>{usuario?.nombre || 'Administrador'}</strong>
        </p>
      </div>
      <div className="header-right">
        <BsFillBellFill className="icon" />
        <BsFillEnvelopeFill className="icon" />
        <BsPersonCircle className="icon icon_header" />
        <button type="button" className="btn-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default Header

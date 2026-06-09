import { NavLink } from 'react-router-dom'
import {
  BsGrid1X2Fill,
  BsFillGrid1X2Fill,
  BsListCheck,
  BsPlusCircleFill,
} from 'react-icons/bs'

function Sidebar() {
  return (
    <aside id="sidebar">
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <BsGrid1X2Fill className="icon_header" /> Avisos ISC
        </div>
      </div>
      <ul className="sidebar-list">
        <li className="sidebar-list-item">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <BsFillGrid1X2Fill className="icon" /> Inicio
          </NavLink>
        </li>
        <li className="sidebar-list-item">
          <NavLink
            to="/publicaciones"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <BsListCheck className="icon" /> Publicaciones
          </NavLink>
        </li>
        <li className="sidebar-list-item sidebar-cta">
          <NavLink
            to="/publicaciones/nueva"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <BsPlusCircleFill className="icon" /> Nueva publicación
          </NavLink>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar

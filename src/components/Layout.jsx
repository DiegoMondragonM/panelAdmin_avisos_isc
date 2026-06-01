import { Outlet } from 'react-router-dom'
import Header from '../Header'
import Sidebar from '../Sidebar'

export default function Layout() {
  return (
    <div className="grid-container">
      <Sidebar />
      <Header />
      <main className="main-container">
        <Outlet />
      </main>
    </div>
  )
}

import { useEffect } from 'react'

export default function FlashMessage({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const t = setTimeout(() => onClose?.(), 5000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`alert alert-${type === 'success' ? 'success' : type}`} role="status">
      <span>{message}</span>
      <button type="button" className="alert-close" onClick={onClose} aria-label="Cerrar">
        ×
      </button>
    </div>
  )
}

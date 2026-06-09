import { useEffect } from 'react'
import {
  BsTrash3Fill,
  BsSendFill,
  BsClockHistory,
  BsExclamationTriangleFill,
} from 'react-icons/bs'

const VARIANTS = {
  danger: {
    iconColor: '#ef5350',
    btnClass: 'btn-danger-solid',
    bgClass: 'confirm-icon-bg-danger',
  },
  warning: {
    iconColor: '#ffa726',
    btnClass: 'btn-warning-solid',
    bgClass: 'confirm-icon-bg-warning',
  },
  primary: {
    iconColor: '#2962ff',
    btnClass: 'btn-primary',
    bgClass: 'confirm-icon-bg-primary',
  },
}

const DEFAULT_ICON = BsExclamationTriangleFill

export default function ConfirmModal({
  isOpen,
  title,
  message,
  detail,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  icon: Icon = DEFAULT_ICON,
  onConfirm,
  onClose,
}) {
  // Close on ESC
  useEffect(() => {
    if (!isOpen) return undefined
    function onKey(e) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  const v = VARIANTS[variant] || VARIANTS.danger

  return (
    <div
      className="modal-overlay confirm-overlay"
      onClick={loading ? undefined : onClose}
      role="presentation"
    >
      <div
        className="modal-content confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        {/* Icon */}
        <div className={`confirm-icon-wrap ${v.bgClass}`}>
          <Icon size={24} color={v.iconColor} />
        </div>

        {/* Body */}
        <div className="confirm-body">
          <h4 id="confirm-title" className="confirm-title">
            {title}
          </h4>
          {message && (
            <p id="confirm-message" className="confirm-message">
              {message}
            </p>
          )}
          {detail && <p className="confirm-detail">{detail}</p>}
        </div>

        {/* Actions */}
        <div className="confirm-footer">
          <button
            type="button"
            className="btn confirm-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${v.btnClass} confirm-confirm`}
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? (
              <>
                <span className="confirm-spinner" /> Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Pre-configured variants for each action — import and use directly
export const ACTION_CONFIRM = {
  publicar: {
    title: 'Publicar aviso',
    confirmLabel: 'Sí, publicar',
    variant: 'primary',
    icon: BsSendFill,
    getMessage: (titulo) =>
      `"${titulo}" aparecerá en el feed público y se enviará notificación push a los usuarios con intereses coincidentes.`,
    getDetail: () => '¿Deseas continuar?',
  },
  vencer: {
    title: 'Marcar como vencida',
    confirmLabel: 'Sí, marcar vencida',
    variant: 'warning',
    icon: BsClockHistory,
    getMessage: (titulo) =>
      `"${titulo}" dejará de mostrarse en el feed público.`,
    getDetail: () => 'Podrás eliminarlo después si ya no es necesario.',
  },
  eliminar: {
    title: 'Eliminar publicación',
    confirmLabel: 'Sí, eliminar',
    variant: 'danger',
    icon: BsTrash3Fill,
    getMessage: (titulo) => `Vas a eliminar permanentemente "${titulo}".`,
    getDetail: () => 'Esta acción no se puede deshacer.',
  },
}

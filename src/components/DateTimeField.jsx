import { forwardRef } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { es } from 'date-fns/locale'
import { BsCalendarEvent, BsClock } from 'react-icons/bs'
import 'react-datepicker/dist/react-datepicker.css'
import './DateTimeField.css'

registerLocale('es', es)

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINUTES = [0, 15, 30, 45]

function datetimeLocalToDate(value) {
  if (!value) return null
  return new Date(value)
}

function dateToDatetimeLocal(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Parses "HH:mm" (24h) → { hours12, minutes, period }
function parse24h(timeStr) {
  const [h, m] = (timeStr || '09:00').split(':').map(Number)
  return {
    hours12: h === 0 ? 12 : h > 12 ? h - 12 : h,
    minutes: m || 0,
    period: h >= 12 ? 'PM' : 'AM',
  }
}

// Converts 12h parts → "HH:mm"
function to24h(h12, min, period) {
  let h = h12
  if (period === 'PM' && h12 !== 12) h = h12 + 12
  if (period === 'AM' && h12 === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

// Compact time combobox rendered inside the calendar popup
function TimeCombobox({ value, onChange }) {
  const { hours12, minutes, period } = parse24h(value)

  return (
    <div className="time-combobox">
      <span className="time-combobox-label">
        <BsClock /> Hora
      </span>
      <div className="time-combobox-controls">
        <select
          className="time-select"
          value={hours12}
          onChange={(e) => onChange(to24h(+e.target.value, minutes, period))}
        >
          {HOURS_12.map((h) => (
            <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
          ))}
        </select>

        <span className="time-colon">:</span>

        <select
          className="time-select"
          value={minutes}
          onChange={(e) => onChange(to24h(hours12, +e.target.value, period))}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
          ))}
        </select>

        <select
          className="time-select time-select-ampm"
          value={period}
          onChange={(e) => onChange(to24h(hours12, minutes, e.target.value))}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  )
}

const TriggerInput = forwardRef(({ value, onClick, placeholder, hasValue }, ref) => (
  <button type="button" className="dtp-trigger" onClick={onClick} ref={ref}>
    <BsCalendarEvent className="dtp-icon-left" />
    <span className={hasValue ? 'dtp-value' : 'dtp-placeholder'}>
      {value || placeholder}
    </span>
    {hasValue && <BsClock className="dtp-icon-right" />}
  </button>
))
TriggerInput.displayName = 'TriggerInput'

export default function DateTimeField({
  label,
  value,
  onChange,
  placeholder = 'Sin definir',
  minDate,
  maxDate,
  required = false,
}) {
  const selected = datetimeLocalToDate(value)

  function handleChange(date) {
    onChange(dateToDatetimeLocal(date))
  }

  return (
    <div className="dtp-wrapper">
      {label && (
        <span className="dtp-label">
          {label}
          {required && <span className="dtp-required"> *</span>}
        </span>
      )}
      <DatePicker
        selected={selected}
        onChange={handleChange}
        showTimeInput
        timeFormat="HH:mm"
        dateFormat="dd MMM yyyy '·' hh:mm aa"
        locale="es"
        placeholderText={placeholder}
        customInput={<TriggerInput placeholder={placeholder} hasValue={Boolean(value)} />}
        customTimeInput={<TimeCombobox />}
        calendarClassName="dtp-calendar"
        popperClassName="dtp-popper"
        minDate={minDate}
        maxDate={maxDate}
        popperPlacement="bottom-start"
        isClearable={Boolean(value)}
        onChangeRaw={(e) => e?.preventDefault()}
      />
    </div>
  )
}

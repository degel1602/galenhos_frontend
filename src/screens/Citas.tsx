import { useState } from 'react'
import { ApiRequestError, api } from '../api/client'
import type { Appointment } from '../api/types'
import { appointmentStatusBadge } from '../components/Badge'

const errorMessages: Record<string, string> = {
  INVALID_APPOINTMENT: 'Los datos de la cita no son válidos. Revise pacienteId, doctorId, fechas y motivo.',
  DOCTOR_NOT_AVAILABLE: 'El médico no tiene disponibilidad en el horario solicitado.',
  APPOINTMENT_NOT_FOUND: 'No existe ninguna cita con ese id.',
}

function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError) {
    return errorMessages[err.code] ?? err.message ?? fallback
  }
  return fallback
}

export function Citas() {
  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <AgendarCita />
      <BuscarCita />
    </div>
  )
}

function AgendarCita() {
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<Appointment | null>(null)

  async function handleSubmit() {
    if (!patientId || !doctorId || !startsAt || !endsAt || !reason) {
      setError('Complete todos los campos.')
      return
    }
    setLoading(true)
    setError('')
    setCreated(null)
    try {
      const appointment = await api.createCita({
        patientId,
        doctorId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        reason,
      })
      setCreated(appointment)
    } catch (err) {
      setError(friendlyError(err, 'No se pudo agendar la cita.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a', marginBottom: 14 }}>Agendar cita</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="ID del paciente" value={patientId} onChange={setPatientId} placeholder="uuid del paciente" />
        <Field label="ID del médico" value={doctorId} onChange={setDoctorId} placeholder="uuid del médico" />
        <Field label="Inicio" value={startsAt} onChange={setStartsAt} type="datetime-local" />
        <Field label="Fin" value={endsAt} onChange={setEndsAt} type="datetime-local" />
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Motivo</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motivo de la consulta"
          rows={2}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      {created && (
        <div className="gp-card-in" style={{ marginTop: 14, padding: 14, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#07153a', marginBottom: 4 }}>Cita agendada correctamente</div>
          <div style={{ fontSize: 12, color: '#54617f' }}>ID: {created.id}</div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="gp-primary-btn"
        style={{ marginTop: 16, padding: '11px 24px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        {loading ? 'Agendando…' : 'Agendar cita'}
      </button>
    </div>
  )
}

function BuscarCita() {
  const [id, setId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appointment, setAppointment] = useState<Appointment | null>(null)

  async function handleBuscar() {
    if (!id.trim()) {
      setError('Ingrese el id de la cita.')
      return
    }
    setLoading(true)
    setError('')
    setAppointment(null)
    try {
      const result = await api.getCitaById(id.trim())
      setAppointment(result)
    } catch (err) {
      setError(friendlyError(err, 'No se pudo obtener la cita.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a', marginBottom: 14 }}>Buscar cita por ID</div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={id}
          onChange={e => { setId(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleBuscar()}
          placeholder="uuid de la cita"
          style={{ flex: 1, maxWidth: 360, padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
        />
        <button
          onClick={handleBuscar}
          disabled={loading}
          className="gp-primary-btn"
          style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      {appointment && (
        <div className="gp-card-in" style={{ marginTop: 14, padding: 16, borderRadius: 12, background: '#f7faff', border: '1px solid #dbe3f4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#07153a' }}>Cita {appointment.id}</span>
            {appointmentStatusBadge(appointment.status)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, color: '#54617f' }}>
            <div><strong style={{ color: '#07153a' }}>Paciente:</strong> {appointment.patientId}</div>
            <div><strong style={{ color: '#07153a' }}>Médico:</strong> {appointment.doctorId}</div>
            <div><strong style={{ color: '#07153a' }}>Inicio:</strong> {new Date(appointment.slot.startsAt).toLocaleString()}</div>
            <div><strong style={{ color: '#07153a' }}>Fin:</strong> {new Date(appointment.slot.endsAt).toLocaleString()}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#07153a' }}>Motivo:</strong> {appointment.reason}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
      />
    </div>
  )
}

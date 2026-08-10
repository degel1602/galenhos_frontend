import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { TextField } from './formFields'
import { registrarAdmision } from './api'
import type { PendienteAdmision } from './types'

export function DetallePacienteModal({ paciente, onClose, onSuccess }: { paciente: PendienteAdmision; onClose: () => void; onSuccess: (mensaje: string) => void }) {
  const [nombreAcompanante, setNombreAcompanante] = useState('')
  const [telefonoAcompanante, setTelefonoAcompanante] = useState('')
  const [direccionPaciente, setDireccionPaciente] = useState(paciente.Direccion ?? '')
  const [observacion, setObservacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function handleRegistrar() {
    setError('')
    if (!nombreAcompanante.trim()) {
      setError('El nombre del acompañante es obligatorio.')
      return
    }
    if (!telefonoAcompanante.trim()) {
      setError('El teléfono del acompañante es obligatorio.')
      return
    }
    if (!direccionPaciente.trim()) {
      setError('La dirección del paciente es obligatoria.')
      return
    }
    setEnviando(true)
    try {
      const body = {
        idTriaje: paciente.idTriaje,
        idPacienteTriaje: paciente.IdpacienteTriaje,
        idEmpleado: 2937,
        nombreAcompanante: nombreAcompanante.trim() || null,
        telefonoAcompanante: telefonoAcompanante.trim() || null,
        direccionPaciente: direccionPaciente.trim() || null,
        observacion: observacion.trim() || null,
      }
      const mensaje = await registrarAdmision(body)
      onSuccess(mensaje)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión al registrar la admisión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal title={paciente.Paciente || 'Paciente NN'} subtitle="Registrar admisión desde el triaje" onClose={onClose} width={560}>
      <div style={{ marginBottom: 18, padding: 14, borderRadius: 12, background: '#f0f4ff', border: '1px solid #dbe3f4' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#07153a', textTransform: 'uppercase', letterSpacing: '.01em' }}>{paciente.Paciente || 'Paciente NN'}</div>
        {paciente.NroDocumento && <div style={{ fontSize: 12.5, color: '#7a86a1', marginTop: 4 }}>Documento: {paciente.NroDocumento}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TextField label="Nombre del acompañante *" value={nombreAcompanante} onChange={v => setNombreAcompanante(v)} placeholder="Ej: María Pérez" />
        <TextField label="Teléfono del acompañante *" value={telefonoAcompanante} onChange={v => setTelefonoAcompanante(v)} placeholder="Ej: 987654321" />
      </div>

      <div style={{ marginTop: 14 }}>
        <TextField label="Dirección del paciente *" value={direccionPaciente} onChange={v => setDireccionPaciente(v)} placeholder="Dirección del paciente" />
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Observación</label>
        <textarea
          value={observacion}
          onChange={e => setObservacion(e.target.value)}
          placeholder="Observación de la admisión"
          rows={3}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleRegistrar} disabled={enviando} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: enviando ? 'wait' : 'pointer' }}>
          {enviando ? 'Registrando...' : 'Registrar admisión'}
        </button>
      </div>
    </Modal>
  )
}
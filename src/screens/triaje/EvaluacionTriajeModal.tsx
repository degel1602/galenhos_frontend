import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { TextField } from './formFields'
import type { PacienteTriaje, Prioridad, TriajeEvaluacion } from './types'
import { prioridadInfo } from './types'

export function EvaluacionTriajeModal({ paciente, onClose, onSubmit }: {
  paciente: PacienteTriaje
  onClose: () => void
  onSubmit: (evaluacion: TriajeEvaluacion) => void
}) {
  const yaEvaluado = paciente.estado === 'triado' && paciente.evaluacion
  const [motivo, setMotivo] = useState(paciente.evaluacion?.motivo ?? '')
  const [pa, setPa] = useState(paciente.evaluacion?.pa ?? '')
  const [fc, setFc] = useState(paciente.evaluacion?.fc ?? '')
  const [fr, setFr] = useState(paciente.evaluacion?.fr ?? '')
  const [temp, setTemp] = useState(paciente.evaluacion?.temp ?? '')
  const [spo2, setSpo2] = useState(paciente.evaluacion?.spo2 ?? '')
  const [prioridad, setPrioridad] = useState<Prioridad>(paciente.evaluacion?.prioridad ?? 'amarillo')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!motivo.trim() || !pa.trim() || !fc.trim() || !fr.trim() || !temp.trim() || !spo2.trim()) {
      setError('Complete el motivo de consulta y todos los signos vitales.')
      return
    }
    onSubmit({ motivo, pa, fc, fr, temp, spo2, prioridad })
  }

  return (
    <Modal title={`Evaluación de triaje · ${paciente.nombre}`} subtitle={`${paciente.codigo}${paciente.hcCodigo ? ` · ${paciente.hcCodigo}` : ''}`} onClose={onClose} width={620}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Motivo de consulta</label>
        <textarea
          value={motivo}
          onChange={e => { setMotivo(e.target.value); setError('') }}
          placeholder="Describa el motivo de la atención"
          rows={2}
          disabled={!!yaEvaluado}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: yaEvaluado ? '#f3f5fb' : '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <TextField label="Presión arterial" value={pa} onChange={v => { setPa(v); setError('') }} placeholder="120/80" disabled={!!yaEvaluado} />
        <TextField label="Frec. cardiaca (lpm)" value={fc} onChange={v => { setFc(v); setError('') }} placeholder="82" disabled={!!yaEvaluado} />
        <TextField label="Frec. respiratoria (rpm)" value={fr} onChange={v => { setFr(v); setError('') }} placeholder="18" disabled={!!yaEvaluado} />
        <TextField label="Temperatura (°C)" value={temp} onChange={v => { setTemp(v); setError('') }} placeholder="36.8" disabled={!!yaEvaluado} />
        <TextField label="SpO₂ (%)" value={spo2} onChange={v => { setSpo2(v); setError('') }} placeholder="98" disabled={!!yaEvaluado} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 8 }}>Prioridad de atención</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(prioridadInfo) as Prioridad[]).map(key => (
            <button
              key={key}
              onClick={() => !yaEvaluado && setPrioridad(key)}
              disabled={!!yaEvaluado}
              className={yaEvaluado ? '' : 'gp-switch-btn'}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: yaEvaluado ? 'default' : 'pointer',
                border: prioridad === key ? '2px solid #0f2a5c' : '1px solid #e0e6f1',
                background: prioridad === key ? '#eef1fb' : '#fff',
                color: '#07153a',
              }}
            >
              {prioridadInfo[key].label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          {yaEvaluado ? 'Cerrar' : 'Cancelar'}
        </button>
        {!yaEvaluado && (
          <button onClick={handleSubmit} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Guardar y enviar a admisión
          </button>
        )}
      </div>
    </Modal>
  )
}
import { useEffect, useState } from 'react'
import { ApiRequestError, api } from '../api/client'
import type { Patient } from '../api/types'

const PAGE_SIZE = 20

function fullName(p: Patient): string {
  return [p.paternalSurname, p.maternalSurname, p.firstName, p.secondName, p.thirdName]
    .filter(Boolean)
    .join(' ')
}

export function Pacientes() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Patient[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [documento, setDocumento] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState<Patient | null>(null)
  const [busquedaError, setBusquedaError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError('')
    api.listPacientes(page, PAGE_SIZE)
      .then(res => {
        if (cancelled) return
        setItems(res.items)
        setTotalPages(res.totalPages)
        setTotalItems(res.totalItems)
      })
      .catch(err => {
        if (cancelled) return
        setListError(err instanceof ApiRequestError ? err.message : 'No se pudo cargar el listado de pacientes.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page])

  async function handleBuscar() {
    const num = documento.trim()
    if (!num) {
      setBusquedaError('Ingrese un número de documento.')
      return
    }
    setBuscando(true)
    setBusquedaError('')
    setResultado(null)
    try {
      const patient = await api.getPacienteByDocumento(num)
      setResultado(patient)
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'PATIENT_NOT_FOUND') {
        setBusquedaError(`No existe ningún paciente con documento "${num}".`)
      } else {
        setBusquedaError(err instanceof ApiRequestError ? err.message : 'Ocurrió un error al buscar el paciente.')
      }
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a', marginBottom: 14 }}>Buscar paciente por número de documento</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={documento}
            onChange={e => { setDocumento(e.target.value); setBusquedaError('') }}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            placeholder="Ej: 45220357"
            style={{ flex: 1, maxWidth: 280, padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
          />
          <button
            onClick={handleBuscar}
            disabled={buscando}
            className="gp-primary-btn"
            style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {buscando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>

        {busquedaError && (
          <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
            {busquedaError}
          </div>
        )}

        {resultado && (
          <div className="gp-card-in" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, background: '#f7faff', border: '1px solid #dbe3f4' }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#66b6ff,#263c7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
              {resultado.paternalSurname.slice(0, 1)}{resultado.firstName.slice(0, 1)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a' }}>{fullName(resultado)}</div>
              <div style={{ fontSize: 12, color: '#7a86a1' }}>Documento: {resultado.documentNumber}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a' }}>Listado de pacientes</div>
          <div style={{ fontSize: 12, color: '#7a86a1' }}>{totalItems} registro{totalItems === 1 ? '' : 's'}</div>
        </div>

        {listError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11, marginBottom: 14 }}>
            {listError}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#7a86a1', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <th style={{ padding: '0 10px 10px' }}>Documento</th>
                <th style={{ padding: '0 10px 10px' }}>Apellido paterno</th>
                <th style={{ padding: '0 10px 10px' }}>Apellido materno</th>
                <th style={{ padding: '0 10px 10px' }}>Nombres</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ padding: '18px 10px', color: '#94a0bd', textAlign: 'center' }}>Cargando…</td></tr>
              )}
              {!loading && items.length === 0 && !listError && (
                <tr><td colSpan={4} style={{ padding: '18px 10px', color: '#94a0bd', textAlign: 'center' }}>No hay pacientes registrados.</td></tr>
              )}
              {!loading && items.map(p => (
                <tr key={p.documentNumber} className="gp-row" style={{ borderTop: '1px solid #eef1f6' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#07153a' }}>{p.documentNumber}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{p.paternalSurname}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{p.maternalSurname || '—'}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{[p.firstName, p.secondName, p.thirdName].filter(Boolean).join(' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <span style={{ fontSize: 12, color: '#7a86a1' }}>Página {page} de {Math.max(totalPages, 1)}</span>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="gp-ghost-btn"
            style={{ padding: '7px 14px', border: '1px solid #e0e6f1', borderRadius: 10, background: '#fff', fontSize: 13, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages || loading}
            className="gp-ghost-btn"
            style={{ padding: '7px 14px', border: '1px solid #e0e6f1', borderRadius: 10, background: '#fff', fontSize: 13, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

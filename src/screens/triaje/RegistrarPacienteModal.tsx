import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { ReporteTriajeModal } from '../../reports/triaje/ReporteTriaje'
import { TextField, SelectField, SearchableSelect } from './formFields'
import { authHeaders, cargarCatalogo, consultarSis, guardarFiliacionSis } from './api'
import type { PacienteTriaje, SisAfiliadoData, TipoDocumento, UbicacionItem } from './types'
import { frecuenciaTiempoOptions, tipoPrioridadOptions } from './types'

export function RegistrarPacienteModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (nuevo: Omit<PacienteTriaje, 'id' | 'codigo' | 'arrivalTs' | 'estado' | 'evaluacion'>) => void
}) {
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [buscado, setBuscado] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [esNuevo, setEsNuevo] = useState(false)
  const [hcNueva, setHcNueva] = useState('')
  const [error, setError] = useState('')
  const [esNN, setEsNN] = useState(false)
  const [reporteId, setReporteId] = useState<number | null>(null)

  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [primerNombre, setPrimerNombre] = useState('')
  const [segundoNombre, setSegundoNombre] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [sexo, setSexo] = useState('')
  const [estadoCivil, setEstadoCivil] = useState('')
  const [telefono, setTelefono] = useState('')
  const [seguro, setSeguro] = useState('')
  const [direccion, setDireccion] = useState('')
  const [selDepartamento, setSelDepartamento] = useState<number | string>('')
  const [selProvincia, setSelProvincia] = useState<number | string>('')
  const [selDistrito, setSelDistrito] = useState<number | string>('')
  const [selCentroPoblado, setSelCentroPoblado] = useState<number | string>('')

  const [tiposDocumentos, setTiposDocumentos] = useState<UbicacionItem[]>([])
  const [sexos, setSexos] = useState<UbicacionItem[]>([])
  const [estadosCivil, setEstadosCivil] = useState<UbicacionItem[]>([])
  const [departamentos, setDepartamentos] = useState<UbicacionItem[]>([])
  const [provincias, setProvincias] = useState<UbicacionItem[]>([])
  const [distritos, setDistritos] = useState<UbicacionItem[]>([])
  const [centrosPoblados, setCentrosPoblados] = useState<UbicacionItem[]>([])
  const [fuentesFinanciamiento, setFuentesFinanciamiento] = useState<UbicacionItem[]>([])
  const [estadosLlego, setEstadosLlego] = useState<UbicacionItem[]>([])
  const [paso, setPaso] = useState<'paciente' | 'triaje'>('paciente')
  const [mostrarPaciente, setMostrarPaciente] = useState(true)
  const [accidenteTransito, setAccidenteTransito] = useState(false)
  const [comoLlego, setComoLlego] = useState('')
  const [fc, setFc] = useState('')
  const [temp, setTemp] = useState('')
  const [pa, setPa] = useState('')
  const [spo2, setSpo2] = useState('')
  const [fr, setFr] = useState('')
  const [fio2, setFio2] = useState('')
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')
  const [imc, setImc] = useState('')
  const [sintomasPrincipales, setSintomasPrincipales] = useState('')
  const [tiempoSintomas, setTiempoSintomas] = useState('')
  const [frecuenciaTiempo, setFrecuenciaTiempo] = useState('')
  const [escalaDolor, setEscalaDolor] = useState('')
  const [escalaGlasgow, setEscalaGlasgow] = useState('')
  const [tipoPrioridad, setTipoPrioridad] = useState('')
  const [servicioDerivado, setServicioDerivado] = useState('')
  const [servicios, setServicios] = useState<UbicacionItem[]>([])
  const [sisInfo, setSisInfo] = useState<SisAfiliadoData | null>(null)
  const [sisMsg, setSisMsg] = useState<{ ok: boolean; texto: string } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [resultadoMsg, setResultadoMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/tipos-documentos', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/tipos-sexo', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/estados-civil', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/departamentos', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })),
      cargarCatalogo<{ idFuenteFinanciamiento: number; descripcion: string | null }>('/api/v1/fuentes-financiamiento', i => ({ id: i.idFuenteFinanciamiento, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/estados-llego-paciente', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/servicios/2', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })),
    ]).then(([td, s, ec, dep, ff, el, sv]) => {
      if (cancelled) return
      setTiposDocumentos(td.filter(t => t.nombre === 'DNI').concat(td.filter(t => t.nombre !== 'DNI')))
      setSexos(s)
      setEstadosCivil(ec)
      setDepartamentos(dep)
      setFuentesFinanciamiento(ff)
      setEstadosLlego(el)
      setServicios(sv.sort((a, b) => a.nombre.localeCompare(b.nombre)))
      const dni = td.find(t => t.nombre === 'DNI')
      setTipoDocumento(dni ? String(dni.id) : (td[0] ? String(td[0].id) : ''))
    })
    return () => { cancelled = true }
  }, [])

  async function cargarProvincias(idDepartamento: number) {
    setProvincias([])
    setSelProvincia('')
    setDistritos([])
    setSelDistrito('')
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setProvincias(await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/provincias/${idDepartamento}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })))
  }

  async function cargarDistritos(idProvincia: number) {
    setDistritos([])
    setSelDistrito('')
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setDistritos(await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/distritos/${idProvincia}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })))
  }

  async function cargarCentrosPoblados(idDistrito: number) {
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setCentrosPoblados(await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/centros-poblados/${idDistrito}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })))
  }

  function handleTipoDocumentoChange(v: string) {
    setTipoDocumento(v)
    setBuscado(false)
    setEsNuevo(false)
    setError('')
    setNumeroDocumento('')
  }

  function handleToggleNN(activo: boolean) {
    setEsNN(activo)
    setBuscado(false)
    setEsNuevo(false)
    setError('')
    setSisInfo(null)
    if (activo) {
      const sd = tiposDocumentos.find(t => t.nombre.toUpperCase() === 'SD')
      setTipoDocumento(sd ? String(sd.id) : '')
      setNumeroDocumento('')
      setApellidoPaterno('NN')
      setApellidoMaterno('NN')
      setPrimerNombre('NN')
      setSegundoNombre('')
      setHcNueva(`HC-${210000 + Math.floor(Math.random() * 9000)}`)
      setEsNuevo(true)
      setBuscado(true)
      setSeguro(idFuenteFinanciamiento('PARTICULAR'))
    } else {
      setTipoDocumento('')
      setNumeroDocumento('')
      setApellidoPaterno('')
      setApellidoMaterno('')
      setPrimerNombre('')
      setSegundoNombre('')
    }
  }

  function calcularImc(pesoV: string, tallaV: string): string {
    const p = parseFloat(pesoV)
    const t = parseFloat(tallaV)
    if (!p || !t || p <= 0 || t <= 0) return ''
    const imc = p / Math.pow(t / 100, 2)
    return imc.toFixed(1)
  }

  function idFuenteFinanciamiento(busca: string): string {
    const f = fuentesFinanciamiento.find(x => x.nombre.toUpperCase().includes(busca.toUpperCase()))
    return f ? String(f.id) : ''
  }

  function seguroPorDefecto(afiliadoSis: boolean | null): string {
    if (accidenteTransito) return idFuenteFinanciamiento('SOAT')
    if (afiliadoSis) return idFuenteFinanciamiento('SIS')
    return idFuenteFinanciamiento('PARTICULAR')
  }

  function toggleAccidente() {
    const nuevo = !accidenteTransito
    setAccidenteTransito(nuevo)
    setSeguro(nuevo ? idFuenteFinanciamiento('SOAT') : idFuenteFinanciamiento('PARTICULAR'))
  }

  function limpiarFormulario() {
    setApellidoPaterno('')
    setApellidoMaterno('')
    setPrimerNombre('')
    setSegundoNombre('')
    setFechaNacimiento('')
    setSexo('')
    setEstadoCivil('')
    setTelefono('')
    setSeguro('')
    setDireccion('')
    setSelDepartamento('')
    setSelProvincia('')
    setSelDistrito('')
    setSelCentroPoblado('')
    setProvincias([])
    setDistritos([])
    setCentrosPoblados([])
  }

  async function consultarReniec(dni: string): Promise<boolean> {
    const res = await fetch(`/api/v1/reniec/${encodeURIComponent(dni)}?operacion=completo`, { headers: authHeaders() })
    if (!res.ok) throw new Error('No se pudo consultar a la RENIEC.')
    const env = await res.json()
    const d = (env?.data?.datos ?? {}) as {
      apellidoPaterno?: string
      apellidoMaterno?: string
      nombres?: string
      primerNombre?: string
      segundoNombre?: string
      tercerNombre?: string
      fechaNacimiento?: string
      sexo?: string
    }
    setApellidoPaterno((d.apellidoPaterno ?? '').trim().toUpperCase())
    setApellidoMaterno((d.apellidoMaterno ?? '').trim().toUpperCase())
    setPrimerNombre((d.primerNombre ?? d.nombres ?? '').trim().toUpperCase())
    setSegundoNombre((d.tercerNombre ? `${d.segundoNombre ?? ''} ${d.tercerNombre}` : (d.segundoNombre ?? '')).trim().toUpperCase())
    setFechaNacimiento(d.fechaNacimiento ?? '')
    const sexoNombre = (d.sexo ?? '').trim().toLowerCase()
    setSexo(sexoNombre.startsWith('m') ? sexos.find(s => s.nombre.toLowerCase() === 'masculino') ? (sexos.find(s => s.nombre.toLowerCase() === 'masculino')!.id).toString() : '' : sexoNombre.startsWith('f') ? sexos.find(s => s.nombre.toLowerCase() === 'femenino')?.id?.toString() ?? '' : '')
    return Boolean((d.apellidoPaterno ?? '').trim() || (d.primerNombre ?? d.nombres ?? '').trim())
  }

  async function cargarPoblarUbicacion(homeDistrictId: number | undefined, homeCenterId: number | undefined) {
    if (!homeDistrictId) {
      setSelDepartamento('')
      setSelProvincia('')
      setSelDistrito('')
      setSelCentroPoblado('')
      setProvincias([])
      setDistritos([])
      setCentrosPoblados([])
      return
    }
    const deptoId = Math.floor(homeDistrictId / 10000)
    const provId = Math.floor(homeDistrictId / 100)
    setSelDepartamento(deptoId)
    const provs = await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/provincias/${deptoId}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() }))
    setProvincias(provs)
    setSelProvincia(provId)
    if (provId) {
      const dists = await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/distritos/${provId}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() }))
      setDistritos(dists)
      setSelDistrito(homeDistrictId)
      if (homeDistrictId) {
        const cps = await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/centros-poblados/${homeDistrictId}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() }))
        setCentrosPoblados(cps)
        setSelCentroPoblado(homeCenterId ?? '')
      }
    }
  }

  async function handleBuscar() {
    const num = numeroDocumento.trim()
    if (!num) {
      setError('Ingrese el número de documento.')
      return
    }
    const tipo = tiposDocumentos.find(t => String(t.id) === String(tipoDocumento))
    if (!tipo) {
      setError('Seleccione el tipo de documento.')
      return
    }
    setError('')
    setBuscando(true)
    setBuscado(false)
    limpiarFormulario()
    setHcNueva('')
    setSisInfo(null)
    let enBd = false
    let reniecOk = false
    try {
      const res = await fetch(`/api/v1/pacientes/por-documento?nroDocumento=${encodeURIComponent(num)}&idTipoDocIdentidad=${tipoDocumento}`, { headers: authHeaders() })
      if (res.ok) {
        const env = await res.json()
        const d = env?.data as {
          patientId?: number
          historyNumber?: string
          paternalSurname?: string
          maternalSurname?: string
          firstName?: string
          secondName?: string
          thirdName?: string
          dateOfBirth?: string
          homeDistrictId?: number
          homeCenterId?: number
          sexTypeId?: number
          maritalStatusId?: number
          educationDegreeId?: number
          homeAddress?: string
          phone?: string
        }
        enBd = true
        setEsNuevo(false)
        setHcNueva(d?.historyNumber ? String(d.historyNumber) : `HC-${210000 + Math.floor(Math.random() * 9000)}`)
        setApellidoPaterno((d?.paternalSurname ?? '').trim())
        setApellidoMaterno((d?.maternalSurname ?? '').trim())
        setPrimerNombre((d?.firstName ?? '').trim())
        setSegundoNombre(((d?.secondName ?? '') + ' ' + (d?.thirdName ?? '')).trim())
        setFechaNacimiento(d?.dateOfBirth ? String(d.dateOfBirth).slice(0, 10) : '')
        const sexoId = d?.sexTypeId
        const sexoItem = sexoId != null ? sexos.find(s => s.id === sexoId) : undefined
        setSexo(sexoItem ? String(sexoItem.id) : '')
        const eci = d?.maritalStatusId
        const ecItem = eci != null ? estadosCivil.find(e => e.id === eci) : undefined
        setEstadoCivil(ecItem ? String(ecItem.id) : '')
        setTelefono((d?.phone ?? '').trim())
        setDireccion((d?.homeAddress ?? '').trim())
        await cargarPoblarUbicacion(d?.homeDistrictId ?? undefined, d?.homeCenterId ?? undefined)
      } else {
        setEsNuevo(true)
        setHcNueva(`HC-${210000 + Math.floor(Math.random() * 9000)}`)
        if (tipo.nombre.toUpperCase() === 'DNI') {
          try {
            reniecOk = await consultarReniec(num)
          } catch {
            /* si RENIEC no responde, se completa a mano o desde el SIS */
          }
        }
      }
      try {
        const sres = await consultarSis(num, tipo)
        setSisInfo(sres)
        setSisMsg(null)
        setSeguro(seguroPorDefecto(sres?.afiliado ?? null))
        if (sres) {
          try {
            await guardarFiliacionSis(sres)
            setSisMsg({ ok: true, texto: 'Afiliación SIS guardada correctamente.' })
          } catch (e) {
            setSisMsg({ ok: false, texto: e instanceof Error ? e.message : 'No se pudo guardar la afiliación SIS.' })
          }
        }
        if (!enBd && !reniecOk && sres) {
          const nombres = (sres.nombres ?? '').trim().toUpperCase().split(/\s+/).filter(Boolean)
          setApellidoPaterno((sres.apePaterno ?? '').trim().toUpperCase())
          setApellidoMaterno((sres.apeMaterno ?? '').trim().toUpperCase())
          setPrimerNombre(nombres[0] ?? '')
          setSegundoNombre(nombres.slice(1).join(' '))
          if (sres.fecNacimiento) setFechaNacimiento(sres.fecNacimiento.slice(0, 10))
          const gen = (sres.genero ?? '').trim().toLowerCase()
          setSexo(gen.startsWith('m') ? sexos.find(s => s.nombre.toLowerCase() === 'masculino')?.id?.toString() ?? '' : gen.startsWith('f') ? sexos.find(s => s.nombre.toLowerCase() === 'femenino')?.id?.toString() ?? '' : '')
          if (sres.direccion) setDireccion(sres.direccion.trim())
        }
      } catch {
        setSisInfo(null)
        setSisMsg(null)
        setSeguro(seguroPorDefecto(null))
      }
    } catch {
      setError('No se pudo consultar el paciente.')
    } finally {
      setBuscado(true)
      setBuscando(false)
    }
  }

  function handleContinuar() {
    if (!buscado) {
      setError('Busque el documento del paciente antes de continuar.')
      return
    }
    setError('')
    setPaso('triaje')
    setMostrarPaciente(false)
  }

  async function obtenerUltimoTriajeId(): Promise<number | null> {
    try {
      const hoy = new Date().toISOString().slice(0, 10)
      const params = new URLSearchParams({
        fini: hoy,
        ffin: hoy,
        filtro: numeroDocumento.trim(),
        derivadoAServicio: '-100',
        idEstado: '-100',
      })
      const res = await fetch(`/api/v1/triaje?${params.toString()}`, { headers: authHeaders() })
      const env = await res.json().catch(() => null)
      const lista = (env?.data ?? []) as { idTriaje?: number }[]
      if (!Array.isArray(lista) || lista.length === 0) return null
      return Math.max(...lista.map((i: { idTriaje?: number }) => i.idTriaje ?? 0))
    } catch {
      return null
    }
  }

  async function handleSubmit() {
    const tipo = tiposDocumentos.find(t => String(t.id) === String(tipoDocumento))
    const tipoNombre = tipo?.nombre ?? ''
    setResultadoMsg(null)
    if (enviando) return
    setEnviando(true)
    try {
      const body = {
        idTriaje: null,
        idDocIdentidad: tipoDocumento ? Number(tipoDocumento) : null,
        nroDocumento: numeroDocumento.trim() || null,
        apellidoPaterno: apellidoPaterno.trim() || null,
        apellidoMaterno: apellidoMaterno.trim() || null,
        primerNombre: primerNombre.trim() || null,
        segundoNombre: segundoNombre.trim() || null,
        tercerNombre: null,
        idSexo: sexo ? Number(sexo) : null,
        fechaNacimiento: fechaNacimiento ? `${fechaNacimiento}T00:00:00Z` : null,
        telefono: telefono.trim() || null,
        idDepartamentoDomicilio: selDepartamento === '' ? null : Number(selDepartamento),
        idProvinciaDomicilio: selProvincia === '' ? null : Number(selProvincia),
        idDistritoDomicilio: selDistrito === '' ? null : Number(selDistrito),
        idComunidadDomicilio: selCentroPoblado === '' ? null : Number(selCentroPoblado),
        direccion: direccion.trim() || null,
        idEsAccidenteTransito: accidenteTransito ? 1 : 0,
        idFuenteFinanciamiento: seguro ? Number(seguro) : null,
        email: null,
        idEstadoCivil: estadoCivil ? Number(estadoCivil) : null,
        frecCardiaca: fc ? Number(fc) : null,
        temperatura: temp ? Number(temp) : null,
        presionArterial: pa.trim() || null,
        saturacion: spo2 ? Number(spo2) : null,
        frecRespiratoria: fr ? Number(fr) : null,
        fiO2: fio2 ? Math.round((Number(fio2) <= 1 ? Number(fio2) * 100 : Number(fio2))) : null,
        peso: peso ? Number(peso) : null,
        talla: talla ? Number(talla) : null,
        imc: imc ? Number(imc) : null,
        tiempoEvolucionCantidad: tiempoSintomas ? Number(tiempoSintomas) : null,
        tiempoEvolucionCantidadUnidad: frecuenciaTiempo.trim() || null,
        escalaDolor: escalaDolor ? Number(escalaDolor) : null,
        escalaGlasgow: escalaGlasgow ? Number(escalaGlasgow) : null,
        idTipoPrioridad: tipoPrioridad ? Number(tipoPrioridad) : null,
        idServicio: servicioDerivado ? Number(servicioDerivado) : null,
        motivo: sintomasPrincipales.trim() || null,
        gestante: null,
        idEstadollego: comoLlego ? Number(comoLlego) : null,
        foto: null,
        idEmpleado: null,
      }
      const res = await fetch(`/api/v1/triaje`, { method: 'POST', headers: authHeaders({ 'content-type': 'application/json' }), body: JSON.stringify(body) })
      const env = await res.json().catch(() => null)
      const resultado = env?.data?.resultado ?? ''
      if (res.ok && /^OK/.test(resultado)) {
        onSubmit({
          tipoDocumento: tipoNombre as TipoDocumento,
          documento: tipoNombre.toUpperCase() === 'SD' ? null : numeroDocumento.trim(),
          hcCodigo: hcNueva,
          nombre: `${primerNombre.trim()} ${segundoNombre.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`.trim(),
          seguro: seguro || null,
        })
        setResultadoMsg({ ok: true, texto: 'El triaje se agregó correctamente.' })
        const id = await obtenerUltimoTriajeId()
        if (id) setReporteId(id)
      } else {
        const msg = (env?.error?.message ?? resultado ?? 'No se pudo registrar el triaje.').replace(/^Error[;: ]*/i, '')
        setResultadoMsg({ ok: false, texto: msg })
      }
    } catch {
      setResultadoMsg({ ok: false, texto: 'No se pudo registrar el triaje.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Modal title="Registrar Triaje" subtitle="Identificación por documento para la bandeja de triaje." onClose={onClose} width={1100}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 10, alignItems: 'end' }}>
        <SelectField
          label="Tipo de documento"
          value={tipoDocumento}
          onChange={v => handleTipoDocumentoChange(v)}
          disabled={esNN}
          options={[{ value: '', label: 'Seleccionar...' }, ...tiposDocumentos.map(t => ({ value: String(t.id), label: t.nombre }))]}
        />
        <TextField
          label="Número de documento"
          value={numeroDocumento}
          onChange={v => { setNumeroDocumento(v); setBuscado(false); setEsNuevo(false); setError('') }}
          onEnter={handleBuscar}
          disabled={esNN}
          placeholder="Ej: 45220357"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 12px', border: `1px solid ${esNN ? '#5eead4' : '#d5dceb'}`, borderRadius: 11, background: esNN ? '#f0fdfa' : '#f8fafc' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#263c7a', whiteSpace: 'nowrap' }}>Paciente NN</span>
          <button
            type="button"
            onClick={() => handleToggleNN(!esNN)}
            aria-pressed={esNN}
            style={{
              width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
              background: esNN ? '#0d9488' : '#c3cbd8', transition: 'background .2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: esNN ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s',
            }} />
          </button>
        </div>
        <button
          onClick={handleBuscar}
          disabled={buscando || esNN}
          className="gp-primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 42, padding: '0 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: buscando ? 'wait' : 'pointer', whiteSpace: 'nowrap', opacity: esNN ? 0.5 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          Buscar
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#7a86a1', margin: '10px 0 0', lineHeight: 1.5 }}>
        El sistema verifica automáticamente si el documento corresponde a un paciente ya registrado (SÍ) o a uno nuevo (NO). Si no existe, consulta a la RENIEC.
      </p>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      {sisInfo && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 11, fontSize: 13, fontWeight: 600, background: sisInfo.afiliado ? '#ecfdf5' : '#fefce8', border: `1px solid ${sisInfo.afiliado ? '#6ee7b7' : '#fde047'}`, color: sisInfo.afiliado ? '#047857' : '#a16207' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {sisInfo.afiliado
              ? <path d="M20 6L9 17l-5-5" />
              : <path d="M12 9v4M12 17h.01M12 3l9 16H3z" />}
          </svg>
          <span>
            {sisInfo.afiliado
              ? `Afiliado a SIS (${sisInfo.estado})${sisInfo.descTipoSeguro ? ` · ${sisInfo.descTipoSeguro}` : ''}`
              : `No registra afiliación activa a SIS${sisInfo.estado ? ` (${sisInfo.estado})` : ''}`}
          </span>
        </div>
      )}

      {sisMsg && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 11, fontSize: 13, fontWeight: 600, background: sisMsg.ok ? '#ecfdf5' : '#fee2e2', border: `1px solid ${sisMsg.ok ? '#6ee7b7' : '#fca5a5'}`, color: sisMsg.ok ? '#047857' : '#b91c1c' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {sisMsg.ok
              ? <path d="M20 6L9 17l-5-5" />
              : <path d="M12 9v4M12 17h.01M12 3l9 16H3z" />}
          </svg>
          <span>{sisMsg.texto}</span>
        </div>
      )}

      {buscado && (
        <div className="gp-card-in" style={{ marginTop: 16, borderRadius: 14, border: esNuevo ? '1px solid #fde68a' : '1px solid #bbf7d0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 16px', background: '#f0f4ff', cursor: 'pointer', userSelect: 'none' }} onClick={() => setMostrarPaciente(v => !v)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em' }}>Datos del paciente</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: '#54617f', transform: mostrarPaciente ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {mostrarPaciente && (
            <div style={{ padding: 16 }}>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              <TextField label="Apellido paterno" value={apellidoPaterno} onChange={v => { setApellidoPaterno(v); setError('') }} disabled={esNN} placeholder="Apellido paterno" />
              <TextField label="Apellido materno" value={apellidoMaterno} onChange={v => { setApellidoMaterno(v); setError('') }} disabled={esNN} placeholder="Apellido materno" />
              <TextField label="Primer nombre" value={primerNombre} onChange={v => { setPrimerNombre(v); setError('') }} disabled={esNN} placeholder="Primer nombre" />
              <TextField label="Segundo nombre" value={segundoNombre} onChange={v => { setSegundoNombre(v); setError('') }} disabled={esNN} placeholder="Segundo nombre" />
              <TextField label="Fecha de nacimiento" value={fechaNacimiento} onChange={setFechaNacimiento} type="date" />
              <SelectField
                label="Sexo"
                value={sexo}
                onChange={v => { setSexo(v); setError('') }}
                options={[{ value: '', label: 'Seleccionar...' }, ...sexos.map(s => ({ value: String(s.id), label: s.nombre }))]}
              />
              <SelectField
                label="Estado civil"
                value={estadoCivil}
                onChange={v => { setEstadoCivil(v); setError('') }}
                options={[{ value: '', label: 'Seleccionar...' }, ...estadosCivil.map(e => ({ value: String(e.id), label: e.nombre }))]}
              />
              <TextField label="Teléfono" value={telefono} onChange={setTelefono} placeholder="9xx xxx xxx" />
              <SelectField
                label="Departamento"
                value={selDepartamento}
                onChange={v => { setSelDepartamento(v === '' ? '' : Number(v)); if (v === '') { setProvincias([]); setDistritos([]); setCentrosPoblados([]); setSelProvincia(''); setSelDistrito(''); setSelCentroPoblado('') } else void cargarProvincias(Number(v)) }}
                options={[{ value: '', label: 'Seleccionar...' }, ...departamentos.map(d => ({ value: String(d.id), label: d.nombre }))]}
              />
              <SelectField
                label="Provincia"
                value={selProvincia}
                onChange={v => { setSelProvincia(v === '' ? '' : Number(v)); if (v === '') { setDistritos([]); setCentrosPoblados([]); setSelDistrito(''); setSelCentroPoblado('') } else void cargarDistritos(Number(v)) }}
                options={[{ value: '', label: 'Seleccionar...' }, ...provincias.map(p => ({ value: String(p.id), label: p.nombre }))]}
              />
              <SelectField
                label="Distrito"
                value={selDistrito}
                onChange={v => { setSelDistrito(v === '' ? '' : Number(v)); if (v === '') { setCentrosPoblados([]); setSelCentroPoblado('') } else void cargarCentrosPoblados(Number(v)) }}
                options={[{ value: '', label: 'Seleccionar...' }, ...distritos.map(d => ({ value: String(d.id), label: d.nombre }))]}
              />
              <SelectField
                label="Centro poblado"
                value={selCentroPoblado}
                onChange={v => setSelCentroPoblado(v === '' ? '' : Number(v))}
                options={[{ value: '', label: 'Seleccionar...' }, ...centrosPoblados.map(c => ({ value: String(c.id), label: c.nombre }))]}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <TextField label="Dirección" value={direccion} onChange={setDireccion} placeholder="Dirección completa" />
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      {paso === 'triaje' && (
        <div className="gp-card-in" style={{ marginTop: 16, borderRadius: 14, border: '1px solid #d5dceb', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: '#f0f4ff', fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Datos del triaje
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#263c7a' }}>Accidente de tránsito</span>
                <button
                  type="button"
                  onClick={toggleAccidente}
                  aria-pressed={accidenteTransito}
                  style={{
                    width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
                    background: accidenteTransito ? '#0d9488' : '#d5dceb', transition: 'background .2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: accidenteTransito ? 25 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s',
                  }} />
                </button>
              </div>
              <SelectField
                label="IAFA"
                value={seguro}
                disabled
                onChange={() => {}}
                options={[{ value: '', label: 'Seleccionar...' }, ...fuentesFinanciamiento.map(s => ({ value: String(s.id), label: s.nombre }))]}
              />
              <SelectField
                label="Cómo llegó"
                value={comoLlego}
                onChange={v => setComoLlego(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...estadosLlego.map(o => ({ value: String(o.id), label: o.nombre }))]}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              <TextField label="F. Cardiaca (lpm)" value={fc} onChange={setFc} disabled={tipoPrioridad === '5'} placeholder="82" />
              <TextField label="Temp (°C)" value={temp} onChange={setTemp} disabled={tipoPrioridad === '5'} placeholder="36.8" />
              <TextField label="P.A. (mmHg)" value={pa} onChange={setPa} disabled={tipoPrioridad === '5'} placeholder="120/80" />
              <TextField label="SAT O₂ (%)" value={spo2} onChange={setSpo2} disabled={tipoPrioridad === '5'} placeholder="98" />
              <TextField label="F.R. (rpm)" value={fr} onChange={setFr} disabled={tipoPrioridad === '5'} placeholder="18" />
              <TextField label="FIO₂ (%)" value={fio2} onChange={setFio2} disabled={tipoPrioridad === '5'} placeholder="21" />
              <TextField label="Peso (kg)" value={peso} onChange={v => { setPeso(v); setImc(calcularImc(v, talla)) }} disabled={tipoPrioridad === '5'} placeholder="70" />
              <TextField label="Talla (cm)" value={talla} onChange={v => { setTalla(v); setImc(calcularImc(peso, v)) }} disabled={tipoPrioridad === '5'} placeholder="172" />
              <TextField label="IMC" value={imc} onChange={setImc} disabled placeholder="—" />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Síntomas principales</label>
              <textarea
                value={sintomasPrincipales}
                onChange={e => setSintomasPrincipales(e.target.value)}
                placeholder="Describa los síntomas principales del paciente"
                rows={2}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginTop: 16 }}>
              <TextField label="Tiempo de síntomas" value={tiempoSintomas} onChange={setTiempoSintomas} placeholder="Ej: 3" />
              <SelectField
                label="Frecuencia"
                value={frecuenciaTiempo}
                onChange={v => setFrecuenciaTiempo(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...frecuenciaTiempoOptions.map(o => ({ value: o, label: o }))]}
              />
              <SelectField
                label="Escala del dolor"
                value={escalaDolor}
                onChange={v => setEscalaDolor(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...Array.from({ length: 10 }, (_, i) => i + 1).map(n => ({ value: String(n), label: String(n) }))]}
              />
              <SelectField
                label="Escala de Glasgow"
                value={escalaGlasgow}
                onChange={v => setEscalaGlasgow(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...Array.from({ length: 13 }, (_, i) => i + 3).map(n => ({ value: String(n), label: String(n) }))]}
              />
              <SearchableSelect
                label="Servicio derivado"
                value={servicioDerivado}
                onChange={v => setServicioDerivado(v)}
                options={servicios.map(s => ({ value: String(s.id), label: s.nombre }))}
                placeholder="Buscar y seleccionar servicio..."
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 8 }}>Tipo de prioridad</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
                {tipoPrioridadOptions.map(op => {
                  const activo = tipoPrioridad === op.id
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setTipoPrioridad(op.id)
                        setError('')
                        if (op.id === '5') {
                          setFc(''); setTemp(''); setPa(''); setSpo2(''); setFr('')
                          setFio2(''); setPeso(''); setTalla(''); setImc('')
                        }
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                        border: activo ? `2px solid ${op.color}` : '1px solid #e0e6f1',
                        background: activo ? `${op.color}1a` : '#fff', color: '#07153a', fontSize: 12.5, fontWeight: 600,
                      }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: op.color, flexShrink: 0 }} />
                      {op.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {resultadoMsg && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 11, fontSize: 13, fontWeight: 600, background: resultadoMsg.ok ? '#ecfdf5' : '#fee2e2', border: `1px solid ${resultadoMsg.ok ? '#6ee7b7' : '#fca5a5'}`, color: resultadoMsg.ok ? '#047857' : '#b91c1c' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {resultadoMsg.ok
              ? <path d="M20 6L9 17l-5-5" />
              : <path d="M12 9v4M12 17h.01M12 3l9 16H3z" />}
          </svg>
          <span>{resultadoMsg.texto}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cancelar
        </button>
        {paso === 'paciente' ? (
          <button onClick={handleContinuar} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Continuar con el triaje
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={enviando}
            className="gp-primary-btn"
            style={{ padding: '10px 22px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {enviando && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>}
            {enviando ? 'Registrando...' : 'Registrar Triaje'}
          </button>
        )}
      </div>
    </Modal>

    {reporteId && (
      <ReporteTriajeModal
        idTriaje={reporteId}
        onClose={() => { setReporteId(null); onClose() }}
      />
    )}
    </>
  )
}
export const FIRMA_PERU_PORT = '48596';
export const FIRMA_PERU_LIB_URL =
  'https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js';
export const JQUERY_URL = 'https://code.jquery.com/jquery-3.6.0.min.js';

export interface FirmaPeruInicio {
  documentNameUUID: string;
  paramBase64: string;
}

interface FirmaPeruOpciones {
  motivo?: string;
  rol?: string;
  logoPngBase64?: string;
  positionX?: number;
  positionY?: number;
}

interface FirmaPeruDocumento {
  blob: Blob;
  nombre: string;
}

export interface FirmaPeruResultado {
  uuid: string;
  firmado: Blob;
}

interface FirmaPeruConexion {
  baseUrl: string;
  token: string | null;
}

type StartSignatureFn = (port: string, param: string) => unknown;

interface WindowConFirmaPeru extends Window {
  jqFirmaPeru?: unknown;
  startSignature?: StartSignatureFn;
  signatureInit?: () => void;
  signatureOk?: () => void;
  signatureCancel?: () => void;
}

function windowFirmaPeru(): WindowConFirmaPeru {
  return window as unknown as WindowConFirmaPeru;
}

function authHeaders(
  conexion: FirmaPeruConexion,
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/json',
    ...extra,
  };
  if (conexion.token) headers.authorization = `Bearer ${conexion.token}`;
  return headers;
}

function startSignatureGlobal(): StartSignatureFn | null {
  const fn = windowFirmaPeru().startSignature;
  return typeof fn === 'function' ? fn : null;
}

async function apiRequest<Envelope>(
  conexion: FirmaPeruConexion,
  path: string,
  init: RequestInit = {},
): Promise<Envelope> {
  const res = await fetch(`${conexion.baseUrl}${path}`, init);
  const env = (await res.json().catch(() => null)) as Envelope | null;
  if (!res.ok || !env || !(env as { success?: boolean }).success) {
    const error = (env as { error?: { message?: string } } | null)?.error;
    throw new Error(
      error?.message ?? `La petición a ${path} falló con estado ${res.status}.`,
    );
  }
  return env;
}

/** Carga un script externo una sola vez. */
function cargarScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.type = 'text/javascript';
    s.onload = () => resolve();
    s.onerror = () =>
      reject(new Error(`No se pudo cargar ${src}. Verifique su conexión.`));
    document.body.appendChild(s);
  });
}

/**
 * Firma Perú exige la variable global jqFirmaPeru (instancia de jQuery 3.x)
 * definida ANTES de cargar firmaperu.min.js. Si la web no la expone, el
 * servicio muestra "Variable jqFirmaPeru no definida".
 */
async function asegurarJqFirmaPeru(): Promise<void> {
  const w = windowFirmaPeru();
  if (w.jqFirmaPeru) return;

  await cargarScript(JQUERY_URL);

  const jq = (window as unknown as { jQuery?: unknown }).jQuery;
  if (typeof jq !== 'function') {
    throw new Error('jQuery no está disponible para el servicio Firma Perú.');
  }
  (jq as unknown as { noConflict(removeAll: boolean): unknown }).noConflict(
    true,
  );
  windowFirmaPeru().jqFirmaPeru = jq;
}

/** Carga firmaperu.min.js desde el CDN oficial de Firma Perú. */
export async function cargarLibreriaFirmaPeru(): Promise<void> {
  if (startSignatureGlobal()) return;

  await asegurarJqFirmaPeru();

  if (startSignatureGlobal()) return;

  const existente = document.querySelector<HTMLScriptElement>(
    `script[src="${FIRMA_PERU_LIB_URL}"]`,
  );
  if (existente) {
    await new Promise<void>((resolve) => {
      const check = window.setInterval(() => {
        if (startSignatureGlobal()) {
          window.clearInterval(check);
          resolve();
        }
      }, 200);
    });
    return;
  }

  const s = document.createElement('script');
  s.src = FIRMA_PERU_LIB_URL;
  s.type = 'text/javascript';
  await new Promise<void>((resolve, reject) => {
    s.onload = () => {
      if (startSignatureGlobal()) resolve();
      else
        reject(
          new Error('La librería firmaperu.min.js no expone startSignature.'),
        );
    };
    s.onerror = () =>
      reject(
        new Error(
          'No se pudo cargar firmaperu.min.js desde el servidor de Firma Perú. Verifique su conexión.',
        ),
      );
    document.body.appendChild(s);
  });
}

export interface FirmaPeruBatido {
  cancelado?: () => boolean;
}

/** Invoca startSignature y espera el documento/7z firmado (callbacks + polling). */
function esperarFirmaConFirmador(
  start: StartSignatureFn,
  data: FirmaPeruInicio,
  urlFirmado: string,
  conexion: FirmaPeruConexion,
  batido: FirmaPeruBatido,
): Promise<FirmaPeruResultado> {
  return new Promise((resolve, reject) => {
    let finalizado = false;
    let timerCancel: number | undefined;
    const terminar = (fn: () => void) => () => {
      if (finalizado) return;
      finalizado = true;
      if (timerCancel !== undefined) window.clearTimeout(timerCancel);
      fn();
    };

    const w = windowFirmaPeru();
    w.signatureInit = terminar(() => {});
    w.signatureOk = terminar(() => {});
    w.signatureCancel = () => {
      if (finalizado) return;
      timerCancel = window.setTimeout(() => {
        terminar(() =>
          reject(
            new Error('El proceso de firma fue cancelado por el usuario.'),
          ),
        )();
      }, 10000);
    };

    try {
      void start(FIRMA_PERU_PORT, data.paramBase64);
    } catch (e) {
      terminar(() => reject(e))();
      return;
    }

    void (async () => {
      try {
        const firmado = await esperarDocumentoFirmado(
          data.documentNameUUID,
          urlFirmado,
          conexion,
          batido,
        );
        terminar(() => resolve({ uuid: data.documentNameUUID, firmado }))();
      } catch (e) {
        terminar(() => reject(e))();
      }
    })();
  });
}

interface EsperarOpciones {
  maxIntentos?: number;
  intervalo?: number;
}

async function esperarDocumentoFirmado(
  uuid: string,
  urlFirmado: string,
  conexion: FirmaPeruConexion,
  batido: FirmaPeruBatido,
  opts: EsperarOpciones = {},
): Promise<Blob> {
  const maxIntentos = opts.maxIntentos ?? 200;
  const intervalo = opts.intervalo ?? 1500;
  for (let i = 0; i < maxIntentos; i++) {
    if (batido.cancelado?.()) {
      throw new Error('El proceso de firma fue cancelado por el usuario.');
    }
    const res = await fetch(urlFirmado, {
      headers: authHeaders(conexion, { 'cache-control': 'no-store' }),
      cache: 'no-store',
    });
    if (res.ok) {
      const buf = await res.arrayBuffer();
      return new Blob([buf], { type: tipoContenido(buf) });
    }
    if (i > 0 && i % 20 === 0) {
      console.log(
        `[FirmaPeru] poll uuid=${uuid} pendiente... intento ${i}/${maxIntentos}`,
      );
    }
    await new Promise((r) => setTimeout(r, intervalo));
  }
  throw new Error(
    'No se recibió el documento firmado del Firmador. Verifique que completó la firma en la aplicación Firma Perú.',
  );
}

/** Devuelve el tipo MIME según el contenido (7z o PDF). */
function tipoContenido(bytes: ArrayBuffer): string {
  const head = new Uint8Array(bytes, 0, 6);
  if (
    head[0] === 0x37 &&
    head[1] === 0x7a &&
    head[2] === 0xbc &&
    head[3] === 0xaf &&
    head[4] === 0x27 &&
    head[5] === 0x1c
  ) {
    return 'application/x-7z-compressed';
  }
  return 'application/pdf';
}

/**
 * Inicia una firma por lote (varios documentos con un solo PIN del DNIe):
 * sube todos los PDFs a POST /api/v1/firmaperu/lote, invoca startSignature una
 * sola vez y espera el 7z firmado en
 * GET /api/v1/firmaperu/documentos/{uuid}/lote/firmado. El backend extrae cada
 * PDF firmado y lo guarda en FIRMAPERU_SIGNED_DIR.
 */
export async function iniciarFirmaLote(
  documentos: FirmaPeruDocumento[],
  conexion: FirmaPeruConexion,
  opts: FirmaPeruOpciones = {},
  batido: FirmaPeruBatido = {},
): Promise<FirmaPeruResultado> {
  await cargarLibreriaFirmaPeru();

  const form = new FormData();
  for (const d of documentos) form.append('document', d.blob, d.nombre);
  form.append('signatureFormat', 'PAdES');
  form.append('signatureLevel', 'B');
  if (opts.motivo) form.append('signatureReason', opts.motivo);
  if (opts.rol) form.append('role', opts.rol);
  if (opts.logoPngBase64) form.append('imageEstampado', opts.logoPngBase64);
  if (typeof opts.positionX === 'number')
    form.append('positionx', String(opts.positionX));
  if (typeof opts.positionY === 'number')
    form.append('positiony', String(opts.positionY));

  const env = await apiRequest<{
    success: boolean;
    data: FirmaPeruInicio;
    error?: { message?: string };
  }>(conexion, '/api/v1/firmaperu/lote', {
    method: 'POST',
    headers: authHeaders(conexion),
    body: form,
  });

  const data = env.data;
  const start = startSignatureGlobal();
  if (!start)
    throw new Error('La librería firmaperu.min.js no está disponible.');

  return esperarFirmaConFirmador(
    start,
    data,
    `/api/v1/firmaperu/documentos/${data.documentNameUUID}/lote/firmado`,
    conexion,
    batido,
  );
}

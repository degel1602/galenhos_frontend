interface LogoProps {
  size?: number
}

/** Isotipo + wordmark de GALENOS PRO. Se dibuja en SVG/CSS (sin asset de
 * imagen) para no depender de un logo institucional que aún no existe. */
export function Logo({ size = 24 }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.4 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#07153a" />
        <path d="M12 5v14M5 12h14" stroke="#66b6ff" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: size * 0.18, fontFamily: 'Poppins, sans-serif' }}>
        <span style={{ fontSize: size * 0.72, fontWeight: 700, color: '#07153a', letterSpacing: '.01em' }}>GALENOS</span>
        <span style={{ fontSize: size * 0.72, fontWeight: 700, color: '#263c7a' }}>
          PR<span style={{ color: '#66b6ff' }}>O</span>
        </span>
      </span>
    </div>
  )
}

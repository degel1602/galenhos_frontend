export function imprimirHtml(html: string) {
  if (!html) return
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  let ejecutado = false
  const ejecutar = () => {
    if (ejecutado) return
    ejecutado = true
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => iframe.remove(), 1000)
  }

  iframe.onload = ejecutar
  const doc = iframe.contentDocument
  if (doc) {
    doc.open()
    doc.write(html)
    doc.close()
  }
  setTimeout(() => {
    if (!ejecutado && document.body.contains(iframe) && iframe.contentWindow) ejecutar()
  }, 300)
}
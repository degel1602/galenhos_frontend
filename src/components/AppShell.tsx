import { type Screen, screenTitles } from '../data/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Dashboard } from '../screens/Dashboard'
import { Pacientes } from '../screens/Pacientes'
import { Citas } from '../screens/Citas'
import { Triaje } from '../screens/Triaje'
import { Admisiones } from '../screens/Admisiones'
import { Configuracion } from '../screens/Configuracion'

interface AppShellProps {
  screen: Screen
  setScreen: (s: Screen) => void
  username: string | null
  onLogout: () => void
}

export function AppShell({ screen, setScreen, username, onLogout }: AppShellProps) {
  const title = screenTitles[screen]

  function renderScreen() {
    switch (screen) {
      case 'dashboard': return <Dashboard setScreen={setScreen} />
      case 'pacientes': return <Pacientes />
      case 'citas': return <Citas />
      case 'triaje': return <Triaje />
      case 'admisiones': return <Admisiones />
      case 'config': return <Configuracion username={username} onLogout={onLogout} />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#eef1f6' }}>
      <Sidebar screen={screen} setScreen={setScreen} username={username} onLogout={onLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} username={username} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '26px 30px 40px' }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  )
}

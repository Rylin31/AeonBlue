import { useState } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import IncidentPanel from './components/IncidentPanel'
import styles from './App.module.css'

export default function App() {
  const [activeNav, setActiveNav] = useState('map')
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <div className={styles.shell}>
      {/* Top status bar — full width */}
      <TopBar />

      {/* Main body: sidebar + map + panel */}
      <div className={styles.body}>
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

        {/* Map takes all remaining space */}
        <div className={styles.mapArea}>
          <MapView />
        </div>

        {/* Incident detail panel */}
        {panelOpen && (
          <IncidentPanel onClose={() => setPanelOpen(false)} />
        )}
      </div>
    </div>
  )
}

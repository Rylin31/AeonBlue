import { useState, useCallback } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import NavPillar from './components/NavPillar'
import DetailsSheet from './components/DetailsSheet'
import FloatingControls from './components/FloatingControls'
import styles from './App.module.css'

export default function App() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeLayer, setActiveLayer] = useState('visual')
  const [lockedVessel, setLockedVessel] = useState(null)
  const [mapRef, setMapRef] = useState(null)

  const handleSpillClick = useCallback(() => {
    setSheetOpen(true)
  }, [])

  const handleVesselLock = useCallback((vessel) => {
    setLockedVessel(vessel)
    setSheetOpen(true)
  }, [])

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false)
  }, [])

  return (
    <div className={styles.viewport}>
      {/* Full-bleed map */}
      <MapView
        activeLayer={activeLayer}
        onSpillClick={handleSpillClick}
        onVesselLock={handleVesselLock}
        onMapReady={setMapRef}
      />

      {/* Floating UI layer */}
      <div className={styles.overlay}>
        {/* Top-left: Search bar + status */}
        <SearchBar />

        {/* Left: Navigation pillar */}
        <NavPillar
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />

        {/* Left: Details sheet (slides in like Google Maps) */}
        {sheetOpen && (
          <DetailsSheet
            onClose={handleCloseSheet}
            lockedVessel={lockedVessel}
          />
        )}

        {/* Bottom-right: Zoom + FAB */}
        <FloatingControls mapRef={mapRef} />
      </div>
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
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
  const [selectedAlert, setSelectedAlert] = useState(null)

  const [isScanned, setIsScanned] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [incidentData, setIncidentData] = useState(null)
  const [liveMode, setLiveMode] = useState(false)

  const handleSpillClick = useCallback(async (alertParam = null) => {
    setIsScanned(true)
    setSheetOpen(true)
    setIsAnalyzing(true)

    // Enforce an artificial 6.5s delay for the live presentation to cycle the AI terminal sequence
    const minWait = new Promise(resolve => setTimeout(resolve, 6500));

    // Determine which alert coordinates to use
    const alertToUse = alertParam && alertParam.coords ? alertParam : selectedAlert;
    const coords = alertToUse?.coords || [103.82, 1.22];

    try {
      const fetchPromise = fetch('http://localhost:8000/analyze_spill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: "ZENODO_S1A_IW_GRDH_1SDV_0001",
          gps_coordinates: { lon: coords[0], lat: coords[1] },
          timestamp: new Date().toISOString()
        })
      });

      const [response] = await Promise.all([fetchPromise, minWait]);
      const result = await response.json();
      if (result && result.data) {
        setIncidentData(result.data);
      }
    } catch (e) {
      console.error("Forensic engine error: ", e)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleVesselLock = useCallback((vessel) => {
    setLockedVessel(vessel)
    setSheetOpen(true)
  }, [])

  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false)
  }, [])

  const handleSearch = useCallback((query, destination) => {
    if (destination) {
      setSelectedAlert({ coords: destination.coords, location: destination.name });
      setHasSearched(true);
      setIsScanned(false);
      setSheetOpen(false);
      setIncidentData(null);
    }
  }, []);

  const handleAlertClick = useCallback((alert) => {
    setSelectedAlert(alert);
    setHasSearched(true);
    handleSpillClick(alert);
  }, [handleSpillClick]);

  // Real-Time Polling Loop for True Live Detection
  useEffect(() => {
    if (!liveMode) return;

    console.log("Started true live detection polling...");
    const interval = setInterval(async () => {
      // If currently scanning or analyzing, skip this poll
      if (isScanned || isAnalyzing) return;

      try {
        console.log("Polling /system-status for new Sentinel-1 acquisitions...");
        const res = await fetch('http://localhost:8000/system-status');
        const data = await res.json();

        if (data.new_incident) {
          console.log("LIVE ALERT: New incident detected!", data.incident_data);
          setSelectedAlert(data.incident_data);
          setHasSearched(true);
          handleSpillClick(data.incident_data);

          // Toggle off live mode automatically so presentation doesn't endlessly loop
          setLiveMode(false);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 30000); // Poll every 30 seconds as requested

    return () => clearInterval(interval);
  }, [liveMode, isScanned, isAnalyzing, handleSpillClick]);

  return (
    <div className={styles.viewport}>
      {/* Full-bleed map */}
      <MapView
        activeLayer={activeLayer}
        isScanned={isScanned}
        hasSearched={hasSearched}
        isAnalyzing={isAnalyzing}
        incidentData={incidentData}
        selectedAlert={selectedAlert}
        onVesselLock={handleVesselLock}
        onMapReady={setMapRef}
      />

      {/* Cinematic Scan Trigger & Live Mode Option */}
      {!isScanned && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '12vh',
          pointerEvents: 'none', gap: '16px'
        }}>
          {hasSearched && (
            <button
              onClick={() => handleSpillClick()}
              style={{
                pointerEvents: 'auto', background: 'white', color: '#1a73e8',
                padding: '16px 40px', borderRadius: '40px', fontSize: '15px', fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', gap: '12px', alignItems: 'center',
                letterSpacing: '0.25px'
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34A853', boxShadow: '0 0 8px rgba(52,168,83,0.5)' }} />
              Manual Scan
            </button>
          )}

          {!liveMode && (
            <button
              onClick={() => setLiveMode(true)}
              style={{
                pointerEvents: 'auto', background: '#1a73e8', color: 'white',
                padding: '16px 40px', borderRadius: '40px', fontSize: '15px', fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', gap: '12px', alignItems: 'center',
                letterSpacing: '0.25px'
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3333', boxShadow: '0 0 8px rgba(255,51,51,0.5)', animation: 'pulse 1.5s infinite' }} />
              Enable True "Real-Time" Detection
            </button>
          )}
        </div>
      )}

      {/* Live Mode Polling Badge */}
      {liveMode && !isScanned && (
        <div style={{
          position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 100,
          background: 'rgba(5, 8, 15, 0.9)', color: '#4ADE80', padding: '12px 24px', borderRadius: '24px',
          fontFamily: 'monospace', fontSize: '14px', border: '1px solid #4ADE80',
          boxShadow: '0 0 15px rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4ADE80', borderRadius: '50%', animation: 'blink 1s infinite' }} />
          Polling Sentinel Hub API for new acquisitions every 30s...
          <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } } @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,51,51,0.4); } 70% { box-shadow: 0 0 0 10px rgba(255,51,51,0); } 100% { box-shadow: 0 0 0 0 rgba(255,51,51,0); } }`}</style>
        </div>
      )}

      {/* Floating UI layer */}
      <div className={styles.overlay}>
        {/* Top-left: Search bar + status */}
        <SearchBar onSearchSubmit={handleSearch} />

        {/* Left: Navigation pillar */}
        <NavPillar
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          onAlertClick={handleAlertClick}
        />

        {/* Left: Details sheet (slides in like Google Maps) */}
        {sheetOpen && (
          <DetailsSheet
            onClose={handleCloseSheet}
            lockedVessel={lockedVessel}
            incidentData={incidentData}
            isAnalyzing={isAnalyzing}
            selectedAlert={selectedAlert}
          />
        )}

        {/* Bottom-right: Zoom + FAB */}
        <FloatingControls mapRef={mapRef} />
      </div>
    </div>
  )
}

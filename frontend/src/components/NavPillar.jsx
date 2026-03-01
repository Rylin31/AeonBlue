import { useState, useRef, useEffect } from 'react'
import { Map, Clock, Layers, Eye, Radio, X, MapPin, ArrowRight } from 'lucide-react'
import styles from './NavPillar.module.css'

const LAYER_OPTIONS = [
    { id: 'visual', label: 'Satellite', icon: Eye },
    { id: 'sar', label: 'SAR Radar', icon: Radio },
]

const ALERT_HISTORY = [
    { id: '#892-SGP', location: 'Singapore Strait', area: '4.2 km²', date: '2026-02-22', vessel: 'MV Neptune', coords: [103.82, 1.22] },
    { id: '#847-IDN', location: 'Makassar Strait', area: '1.7 km²', date: '2026-02-19', vessel: 'Unknown', coords: [118.2, -2.1] },
    { id: '#831-MYS', location: 'Malacca Strait', area: '0.4 km²', date: '2026-02-15', vessel: 'MV Oceanic Star', coords: [99.5, 3.8] },
    { id: '#798-VNM', location: 'South China Sea', area: '6.1 km²', date: '2026-02-10', vessel: 'MV Karina', coords: [112.0, 10.0] },
    { id: '#764-IDN', location: 'Java Sea', area: '2.3 km²', date: '2026-02-03', vessel: 'MV Bulk Carrier IV', coords: [110.0, -5.0] },
]

export default function NavPillar({ activeLayer, onLayerChange, onAlertClick }) {
    const [layerPopup, setLayerPopup] = useState(false)
    const [historyOpen, setHistoryOpen] = useState(false)
    const panelRef = useRef(null)

    // Close popups on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setLayerPopup(false)
                setHistoryOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className={styles.pillar} ref={panelRef}>
            {/* Map (home) */}
            <button
                className={`${styles.btn} ${!historyOpen && !layerPopup ? styles.active : ''}`}
                title="Map View"
                onClick={() => { setHistoryOpen(false); setLayerPopup(false) }}
            >
                <Map size={20} strokeWidth={1.6} />
            </button>

            {/* History */}
            <div className={styles.layerWrap}>
                <button
                    className={`${styles.btn} ${historyOpen ? styles.active : ''}`}
                    title="Alert History"
                    onClick={() => { setHistoryOpen(!historyOpen); setLayerPopup(false) }}
                >
                    <Clock size={20} strokeWidth={1.6} />
                    <span className={styles.badge}>5</span>
                </button>

                {historyOpen && (
                    <div className={styles.historyPanel}>
                        <div className={styles.historyHeader}>
                            <h3 className={styles.historyTitle}>Alert History</h3>
                            <button className={styles.historyClose} onClick={() => setHistoryOpen(false)}>
                                <X size={16} strokeWidth={1.8} />
                            </button>
                        </div>
                        <div className={styles.historyList}>
                            {ALERT_HISTORY.map((alert) => (
                                <button key={alert.id} className={styles.alertCard} onClick={() => {
                                    setHistoryOpen(false);
                                    if (onAlertClick) onAlertClick(alert);
                                }}>
                                    <div className={styles.alertTop}>
                                        <span className={styles.alertId}>{alert.id}</span>
                                        <span className={styles.alertDate}>{alert.date}</span>
                                    </div>
                                    <div className={styles.alertBody}>
                                        <div className={styles.alertLocation}>
                                            <MapPin size={12} strokeWidth={1.8} />
                                            <span>{alert.location}</span>
                                        </div>
                                        <div className={styles.alertMeta}>
                                            <span>{alert.vessel}</span>
                                            <span className={styles.alertDot}>·</span>
                                            <span>{alert.area}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className={styles.alertArrow} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Layers with popup */}
            <div className={styles.layerWrap}>
                <button
                    className={`${styles.btn} ${layerPopup ? styles.active : ''}`}
                    title="Map Layers"
                    onClick={() => { setLayerPopup(!layerPopup); setHistoryOpen(false) }}
                >
                    <Layers size={20} strokeWidth={1.6} />
                </button>

                {layerPopup && (
                    <div className={styles.layerPopup}>
                        <p className={styles.layerTitle}>Map type</p>
                        <div className={styles.layerOptions}>
                            {LAYER_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    className={`${styles.layerOption} ${activeLayer === opt.id ? styles.layerActive : ''}`}
                                    onClick={() => {
                                        onLayerChange(opt.id)
                                        setLayerPopup(false)
                                    }}
                                >
                                    <div className={styles.layerThumb}>
                                        <opt.icon size={18} strokeWidth={1.5} />
                                    </div>
                                    <span className={styles.layerLabel}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

import { useState, useRef, useEffect } from 'react'
import styles from './Sidebar.module.css'
import {
    Triangle,
    LayoutGrid,
    Layers,
    Clock,
    Settings,
    User,
    X,
    Eye,
    Radio,
    ChevronRight,
    MapPin,
    AlertTriangle,
} from 'lucide-react'

const COLD_CASES = [
    { id: '#741-Bravo', date: '2026-02-18', location: 'Malacca Strait', severity: 'high', area: '6.1 km²' },
    { id: '#623-Charlie', date: '2026-02-10', location: 'South China Sea', severity: 'medium', area: '2.8 km²' },
    { id: '#582-Delta', date: '2026-01-28', location: 'Java Sea', severity: 'low', area: '0.9 km²' },
    { id: '#519-Echo', date: '2026-01-15', location: 'Celebes Sea', severity: 'high', area: '8.3 km²' },
    { id: '#490-Foxtrot', date: '2025-12-22', location: 'Sulu Sea', severity: 'medium', area: '3.4 km²' },
]

const MAP_LAYERS = [
    { id: 'visual', label: 'Visual Satellite', desc: 'Standard RGB imagery', icon: Eye },
    { id: 'sar', label: 'SAR Grayscale', desc: 'Synthetic Aperture Radar', icon: Radio },
]

export default function Sidebar({ activeNav, onNavChange, onLayerChange, activeLayer = 'visual' }) {
    const [historyOpen, setHistoryOpen] = useState(false)
    const [layersOpen, setLayersOpen] = useState(false)
    const drawerRef = useRef(null)

    // Close drawers on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                setHistoryOpen(false)
                setLayersOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleNavClick = (id) => {
        if (id === 'history') {
            setHistoryOpen(!historyOpen)
            setLayersOpen(false)
        } else if (id === 'layers') {
            setLayersOpen(!layersOpen)
            setHistoryOpen(false)
        } else {
            setHistoryOpen(false)
            setLayersOpen(false)
            onNavChange(id)
        }
    }

    const severityColor = (s) => {
        if (s === 'high') return 'var(--coral)'
        if (s === 'medium') return 'var(--amber)'
        return 'var(--sage)'
    }

    return (
        <aside className={styles.sidebar} ref={drawerRef}>
            {/* Active Anomaly — Top Cyan Triangle */}
            <button
                className={`${styles.anomalyBtn}`}
                onClick={() => onNavChange('anomaly')}
                title="Jump to Active Anomaly"
                aria-label="Active Anomaly"
            >
                <div className={styles.anomalyIcon}>
                    <Triangle size={16} strokeWidth={2} fill="var(--teal)" />
                </div>
                <span className={styles.anomalyPulse} />
            </button>

            {/* Separator */}
            <div className={styles.separator} />

            {/* Main Navigation */}
            <nav className={styles.nav}>
                {/* Dashboard */}
                <button
                    className={`${styles.navBtn} ${activeNav === 'dashboard' ? styles.active : ''}`}
                    onClick={() => handleNavClick('dashboard')}
                    title="Dashboard – Global Monitoring Zones"
                    aria-label="Dashboard"
                >
                    <LayoutGrid size={18} strokeWidth={1.6} />
                    {activeNav === 'dashboard' && <span className={styles.activeBar} />}
                </button>

                {/* Map Layers */}
                <button
                    className={`${styles.navBtn} ${layersOpen ? styles.active : ''}`}
                    onClick={() => handleNavClick('layers')}
                    title="Map Layers – Toggle SAR / Visual"
                    aria-label="Map Layers"
                >
                    <Layers size={18} strokeWidth={1.6} />
                    {layersOpen && <span className={styles.activeBar} />}
                </button>

                {/* Alert History */}
                <button
                    className={`${styles.navBtn} ${historyOpen ? styles.active : ''}`}
                    onClick={() => handleNavClick('history')}
                    title="Alert History – Cold Cases"
                    aria-label="Alert History"
                >
                    <Clock size={18} strokeWidth={1.6} />
                    {historyOpen && <span className={styles.activeBar} />}
                    <span className={styles.badge}>5</span>
                </button>
            </nav>

            {/* Bottom controls */}
            <div className={styles.bottom}>
                <button className={styles.navBtn} title="System Settings & API Configuration" aria-label="Settings">
                    <Settings size={18} strokeWidth={1.6} />
                </button>
                <button className={styles.navBtn} title="User Profile & Permissions" aria-label="Profile">
                    <User size={18} strokeWidth={1.6} />
                    <span className={styles.statusDot} />
                </button>
            </div>

            {/* ── Layers Drawer ── */}
            {layersOpen && (
                <div className={`${styles.drawer} animate-fade-left`}>
                    <div className={styles.drawerHeader}>
                        <span className={styles.drawerTitle}>MAP LAYERS</span>
                        <button className={styles.drawerClose} onClick={() => setLayersOpen(false)}>
                            <X size={12} />
                        </button>
                    </div>
                    <div className={styles.layersList}>
                        {MAP_LAYERS.map((layer) => (
                            <button
                                key={layer.id}
                                className={`${styles.layerItem} ${activeLayer === layer.id ? styles.layerActive : ''}`}
                                onClick={() => onLayerChange?.(layer.id)}
                            >
                                <div className={styles.layerIconWrap}>
                                    <layer.icon size={16} strokeWidth={1.5} />
                                </div>
                                <div className={styles.layerInfo}>
                                    <span className={styles.layerLabel}>{layer.label}</span>
                                    <span className={styles.layerDesc}>{layer.desc}</span>
                                </div>
                                {activeLayer === layer.id && (
                                    <span className={styles.layerCheck}>●</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className={styles.drawerFooter}>
                        <span className={styles.drawerFooterText}>
                            Active: {MAP_LAYERS.find(l => l.id === activeLayer)?.label}
                        </span>
                    </div>
                </div>
            )}

            {/* ── Alert History Drawer ── */}
            {historyOpen && (
                <div className={`${styles.drawer} ${styles.historyDrawer} animate-fade-left`}>
                    <div className={styles.drawerHeader}>
                        <span className={styles.drawerTitle}>ALERT HISTORY</span>
                        <button className={styles.drawerClose} onClick={() => setHistoryOpen(false)}>
                            <X size={12} />
                        </button>
                    </div>
                    <div className={styles.coldCasesList}>
                        {COLD_CASES.map((c) => (
                            <button key={c.id} className={styles.coldCase}>
                                <div className={styles.coldCaseTop}>
                                    <div className={styles.coldCaseId}>
                                        <span
                                            className={styles.severityDot}
                                            style={{ background: severityColor(c.severity) }}
                                        />
                                        {c.id}
                                    </div>
                                    <ChevronRight size={12} className={styles.coldCaseArrow} />
                                </div>
                                <div className={styles.coldCaseMeta}>
                                    <span><MapPin size={9} /> {c.location}</span>
                                    <span>{c.area}</span>
                                </div>
                                <div className={styles.coldCaseDate}>{c.date}</div>
                            </button>
                        ))}
                    </div>
                    <div className={styles.drawerFooter}>
                        <span className={styles.drawerFooterText}>
                            <AlertTriangle size={10} /> {COLD_CASES.filter(c => c.severity === 'high').length} high severity
                        </span>
                    </div>
                </div>
            )}
        </aside>
    )
}

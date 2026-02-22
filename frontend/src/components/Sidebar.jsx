import styles from './Sidebar.module.css'
import {
    LayoutGrid,
    Map,
    AlertTriangle,
    Layers,
    Hexagon,
    Settings,
    User,
} from 'lucide-react'

const navItems = [
    { icon: LayoutGrid, id: 'dashboard', tooltip: 'Dashboard' },
    { icon: Map, id: 'map', tooltip: 'Map View' },
    { icon: AlertTriangle, id: 'alerts', tooltip: 'Alerts' },
    { icon: Layers, id: 'layers', tooltip: 'Layers' },
    { icon: Hexagon, id: 'analysis', tooltip: 'Analysis' },
]

export default function Sidebar({ activeNav, onNavChange }) {
    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoMark}>
                    <span className={styles.logoInner} />
                </div>
            </div>

            {/* Top nav */}
            <nav className={styles.nav}>
                {navItems.map(({ icon: Icon, id, tooltip }) => (
                    <button
                        key={id}
                        className={`${styles.navBtn} ${activeNav === id ? styles.active : ''}`}
                        onClick={() => onNavChange(id)}
                        title={tooltip}
                        aria-label={tooltip}
                    >
                        <Icon size={18} strokeWidth={1.6} />
                        {activeNav === id && <span className={styles.activeBar} />}
                    </button>
                ))}
            </nav>

            {/* Bottom controls */}
            <div className={styles.bottom}>
                <button className={styles.navBtn} title="Settings" aria-label="Settings">
                    <Settings size={18} strokeWidth={1.6} />
                </button>
                <button className={styles.navBtn} title="Profile" aria-label="Profile">
                    <User size={18} strokeWidth={1.6} />
                </button>
            </div>
        </aside>
    )
}

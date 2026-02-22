import styles from './TopBar.module.css'
import { Signal } from 'lucide-react'

export default function TopBar() {
    // Static UTC time display matching the mockup
    const utcTime = 'UTC 14:53:502'

    return (
        <header className={styles.topbar}>
            {/* Status indicator */}
            <div className={styles.statusGroup}>
                <span className={styles.pulseOuter}>
                    <span className={styles.pulseDot} />
                    <span className={styles.pulseRing} />
                </span>
                <span className={styles.statusLabel}>SYSTEM ONLINE</span>
                <span className={styles.divider} />
                <span className={styles.utcLabel}>{utcTime}</span>
            </div>

            {/* Spacer */}
            <div className={styles.spacer} />

            {/* Brand */}
            <div className={styles.brand}>
                <Signal size={14} strokeWidth={2} className={styles.brandIcon} />
                <span className={styles.brandText}>AEONBLUE V3.0</span>
            </div>
        </header>
    )
}

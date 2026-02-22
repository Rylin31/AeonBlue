import { useState, useEffect } from 'react'
import styles from './TopBar.module.css'
import { Signal, Satellite, Activity } from 'lucide-react'

export default function TopBar() {
    const [utcTime, setUtcTime] = useState('')
    const [sentinel1, setSentinel1] = useState(true)

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const h = String(now.getUTCHours()).padStart(2, '0')
            const m = String(now.getUTCMinutes()).padStart(2, '0')
            const s = String(now.getUTCSeconds()).padStart(2, '0')
            const ms = String(now.getUTCMilliseconds()).padStart(3, '0')
            setUtcTime(`UTC ${h}:${m}:${s}.${ms}`)
        }
        updateTime()
        const timer = setInterval(updateTime, 100)
        return () => clearInterval(timer)
    }, [])

    // Simulate Sentinel-1 stream toggle
    useEffect(() => {
        const timer = setInterval(() => {
            setSentinel1(prev => {
                // 95% chance of being connected
                return Math.random() > 0.05
            })
        }, 8000)
        return () => clearInterval(timer)
    }, [])

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

            {/* Center — Active pass info */}
            <div className={styles.centerInfo}>
                <div className={styles.passInfo}>
                    <Satellite size={11} strokeWidth={1.8} />
                    <span className={styles.passText}>Sentinel-1 IW</span>
                    <span className={styles.passOrbit}>ORB 47291</span>
                    <span className={`${styles.connStatus} ${sentinel1 ? styles.connected : styles.disconnected}`}>
                        <span className={styles.connDot} />
                        {sentinel1 ? 'STREAM ACTIVE' : 'RECONNECTING'}
                    </span>
                </div>
            </div>

            {/* Right — Brand + Activity */}
            <div className={styles.brand}>
                <div className={styles.activityPill}>
                    <Activity size={10} strokeWidth={2} />
                    <span>3 ACTIVE</span>
                </div>
                <span className={styles.divider} />
                <Signal size={14} strokeWidth={2} className={styles.brandIcon} />
                <span className={styles.brandText}>AeonBlue</span>
            </div>
        </header>
    )
}

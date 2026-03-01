import { Plus, Minus } from 'lucide-react'
import styles from './FloatingControls.module.css'

export default function FloatingControls({ mapRef }) {
    const handleZoom = (dir) => {
        if (!mapRef) return
        dir === 'in' ? mapRef.zoomIn() : mapRef.zoomOut()
    }

    return (
        <div className={styles.controls}>
            {/* Zoom buttons */}
            <div className={styles.zoomGroup}>
                <button className={styles.zoomBtn} onClick={() => handleZoom('in')} title="Zoom in">
                    <Plus size={18} strokeWidth={1.8} />
                </button>
                <div className={styles.zoomDivider} />
                <button className={styles.zoomBtn} onClick={() => handleZoom('out')} title="Zoom out">
                    <Minus size={18} strokeWidth={1.8} />
                </button>
            </div>
        </div>
    )
}

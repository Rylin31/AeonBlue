import { useState } from 'react'
import { Plus, Minus, FileText, Download, Loader } from 'lucide-react'
import styles from './FloatingControls.module.css'

export default function FloatingControls({ mapRef }) {
    const [reportState, setReportState] = useState('idle') // idle | generating | ready

    const handleZoom = (dir) => {
        if (!mapRef) return
        dir === 'in' ? mapRef.zoomIn() : mapRef.zoomOut()
    }

    const handleFAB = () => {
        if (reportState === 'generating') return
        if (reportState === 'ready') {
            // Download action
            setReportState('idle')
            return
        }
        setReportState('generating')
        setTimeout(() => setReportState('ready'), 2800)
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

            {/* FAB — Generate Forensic Report */}
            <button
                className={`${styles.fab} ${reportState === 'generating' ? styles.fabGenerating : ''} ${reportState === 'ready' ? styles.fabReady : ''}`}
                onClick={handleFAB}
                title="Generate Forensic Report"
            >
                {reportState === 'generating' ? (
                    <Loader size={22} strokeWidth={2} className={styles.spinner} />
                ) : reportState === 'ready' ? (
                    <Download size={22} strokeWidth={2} />
                ) : (
                    <FileText size={22} strokeWidth={2} />
                )}
            </button>
        </div>
    )
}

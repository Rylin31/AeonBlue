import { X, ChevronDown, Download, Share2, AlertCircle } from 'lucide-react'
import styles from './IncidentPanel.module.css'
import ConfidenceRing from './ConfidenceRing'
import SpectralBar from './SpectralBar'

const INCIDENT = {
    id: '#892-Alpha',
    detectedAgo: '12 mins ago',
    location: 'Singapore Strait',
    confidence: 84,
    confidenceLabel: 'High Probability Match',
    vessel: {
        name: 'MV Neptune',
        imo: '9462781',
        flag: 'Panama',
        speed: '12.4 kts',
    },
    analysis: {
        spillArea: '4.2 km²',
        substance: 'Heavy Fuel Oil',
        driftVector: 'NW 316° @ 2kts',
    },
    spectralClass: 'CLASS A',
}

export default function IncidentPanel({ onClose }) {
    return (
        <aside className={`${styles.panel} animate-fade-in`}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.alertDot} />
                    <div>
                        <p className={styles.incidentId}>Incident {INCIDENT.id}</p>
                        <p className={styles.incidentMeta}>
                            Detected {INCIDENT.detectedAgo} &bull; {INCIDENT.location}
                        </p>
                    </div>
                </div>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
                    <X size={14} />
                </button>
            </div>

            {/* ── Confidence Score ── */}
            <div className={styles.section}>
                <div className={styles.confidenceRow}>
                    <ConfidenceRing value={INCIDENT.confidence} />
                    <div className={styles.confidenceText}>
                        <p className="label-xs">CONFIDENCE SCORE</p>
                        <p className={styles.confidenceLabel}>{INCIDENT.confidenceLabel}</p>
                    </div>
                </div>
            </div>

            {/* ── Vessel Identification ── */}
            <div className={styles.section}>
                <p className={`${styles.sectionTitle} label-xs`}>VESSEL IDENTIFICATION</p>
                <div className={styles.dataGrid}>
                    <div className={styles.dataCell}>
                        <span className={styles.cellLabel}>Vessel Name</span>
                        <span className={styles.cellValue}>{INCIDENT.vessel.name}</span>
                    </div>
                    <div className={styles.dataCell}>
                        <span className={styles.cellLabel}>IMO Number</span>
                        <span className={styles.cellValue}>{INCIDENT.vessel.imo}</span>
                    </div>
                    <div className={styles.dataCell}>
                        <span className={styles.cellLabel}>Flag State</span>
                        <span className={styles.cellValueFlag}>
                            <span className={styles.flagIcon}>P</span>
                            {INCIDENT.vessel.flag}
                        </span>
                    </div>
                    <div className={styles.dataCell}>
                        <span className={styles.cellLabel}>Speed</span>
                        <span className={styles.cellValue}>{INCIDENT.vessel.speed}</span>
                    </div>
                </div>
            </div>

            {/* ── Analysis Data ── */}
            <div className={styles.section}>
                <p className={`${styles.sectionTitle} label-xs`}>ANALYSIS DATA</p>
                <div className={styles.analysisList}>
                    <div className={styles.analysisRow}>
                        <span className={styles.analysisLabel}>Est. Spill Area</span>
                        <span className={styles.analysisValue}>{INCIDENT.analysis.spillArea}</span>
                    </div>
                    <div className={styles.analysisRow}>
                        <span className={styles.analysisLabel}>Substance Type</span>
                        <span className={`${styles.analysisValue} ${styles.highlightTeal}`}>
                            {INCIDENT.analysis.substance}
                        </span>
                    </div>
                    <div className={styles.analysisRow}>
                        <span className={styles.analysisLabel}>Drift Vector</span>
                        <span className={styles.analysisValue}>{INCIDENT.analysis.driftVector}</span>
                    </div>
                </div>
            </div>

            {/* ── Spectral Signature ── */}
            <div className={styles.section}>
                <div className={styles.spectralHeader}>
                    <p className={`${styles.sectionTitle} label-xs`}>SPECTRAL SIGNATURE</p>
                    <span className={styles.classTag}>{INCIDENT.spectralClass}</span>
                </div>
                <SpectralBar />
            </div>

            {/* ── Information Board Placeholder ── */}
            <div className={styles.section}>
                <p className={`${styles.sectionTitle} label-xs`}>LIVE INTELLIGENCE FEED</p>
                <div className={styles.placeholder}>
                    <div className={styles.placeholderIcon}>
                        <AlertCircle size={22} strokeWidth={1.4} />
                    </div>
                    <p className={styles.placeholderTitle}>Real-Time Data Pending</p>
                    <p className={styles.placeholderDesc}>
                        This board will display live AIS tracking, satellite feeds, weather data and
                        environmental alerts once backend integration is complete.
                    </p>
                    <div className={styles.placeholderDots}>
                        <span className={styles.dot} style={{ animationDelay: '0s' }} />
                        <span className={styles.dot} style={{ animationDelay: '0.3s' }} />
                        <span className={styles.dot} style={{ animationDelay: '0.6s' }} />
                    </div>
                </div>
            </div>

            {/* ── Actions ── */}
            <div className={styles.actions}>
                <button className={styles.primaryBtn}>
                    <Download size={14} strokeWidth={2} />
                    Generate Forensic Report
                </button>
                <button className={styles.secondaryBtn}>
                    <Share2 size={12} strokeWidth={2} />
                    Share Incident Data
                </button>
            </div>
        </aside>
    )
}

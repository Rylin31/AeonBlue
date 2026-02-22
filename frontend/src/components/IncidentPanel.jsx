import { useState } from 'react'
import { X, Download, Share2, FileText, ExternalLink, ChevronDown, ChevronUp, Anchor } from 'lucide-react'
import styles from './IncidentPanel.module.css'
import ConfidenceRing from './ConfidenceRing'
import SpectralBar from './SpectralBar'

const INCIDENT = {
    id: '#892-Alpha',
    detectedAgo: '12 mins ago',
    location: 'Singapore Strait',
    confidence: 84,
    confidenceLabel: 'High Probability Match',
    modelName: 'Attention U-Net++',
    vessel: {
        name: 'MV Neptune',
        imo: '9462781',
        flag: 'Panama',
        flagCode: 'PA',
        speed: '12.4 kts',
        heading: '067°',
        type: 'Oil Tanker',
    },
    analysis: {
        spillArea: '4.2 km²',
        substance: 'Heavy Fuel Oil',
        driftVector: 'NW 316° @ 2kts',
        volume: '~380 m³',
        thickness: '0.8–2.1 μm',
    },
    spectralClass: 'CLASS A',
}

export default function IncidentPanel({ onClose, lockedVessel }) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportReady, setReportReady] = useState(false)
    const [shareTooltip, setShareTooltip] = useState(false)
    const [forensicExpanded, setForensicExpanded] = useState(false)

    const vessel = lockedVessel || INCIDENT.vessel

    const handleGenerateReport = () => {
        setIsGenerating(true)
        setTimeout(() => {
            setIsGenerating(false)
            setReportReady(true)
        }, 2600)
    }

    const handleShare = () => {
        setShareTooltip(true)
        setTimeout(() => setShareTooltip(false), 2500)
    }

    return (
        <aside className={`${styles.panel} animate-fade-in`}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerDot} />
                    <div>
                        <h2 className={styles.incidentId}>Incident {INCIDENT.id}</h2>
                        <p className={styles.incidentMeta}>
                            Detected {INCIDENT.detectedAgo} &bull; {INCIDENT.location}
                        </p>
                    </div>
                </div>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
                    <X size={14} />
                </button>
            </div>

            {/* ── Primary Summary (Always Visible) ── */}
            <div className={styles.summarySection}>
                {/* Confidence Score */}
                <div className={styles.confidenceRow}>
                    <ConfidenceRing value={INCIDENT.confidence} />
                    <div className={styles.confidenceText}>
                        <p className={styles.confidenceValue}>{INCIDENT.confidence}%</p>
                        <p className={styles.confidenceLabel}>{INCIDENT.confidenceLabel}</p>
                        <p className={styles.modelTag}>{INCIDENT.modelName}</p>
                    </div>
                </div>

                {/* Vessel Name — Key summary */}
                <div className={styles.vesselSummary}>
                    <div className={styles.vesselSummaryLeft}>
                        <div className={styles.flagBadge}>{vessel.flagCode || vessel.flag?.charAt(0)}</div>
                        <div>
                            <p className={styles.vesselPrimary}>{vessel.name || vessel.label}</p>
                            <p className={styles.vesselSecondary}>
                                IMO {vessel.imo || '—'} · {vessel.flag}
                                {lockedVessel && <span className={styles.aisTag}><Anchor size={8} /> AIS</span>}
                            </p>
                        </div>
                    </div>
                    <div className={styles.vesselSpeed}>{vessel.speed}</div>
                </div>
            </div>

            {/* ── Full Forensic Breakdown (Progressive Disclosure) ── */}
            <button
                className={styles.expandToggle}
                onClick={() => setForensicExpanded(!forensicExpanded)}
            >
                <span>{forensicExpanded ? 'Hide' : 'Full'} Forensic Breakdown</span>
                {forensicExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {forensicExpanded && (
                <div className={styles.forensicDetails}>
                    {/* ── Vessel ID Card ── */}
                    <div className={styles.section}>
                        <p className={`${styles.sectionTitle} label-xs`}>VESSEL IDENTIFICATION</p>
                        <div className={styles.dataGrid}>
                            <div className={styles.dataCell}>
                                <span className={styles.cellLabel}>Vessel Name</span>
                                <span className={styles.cellValue}>{vessel.name || vessel.label}</span>
                            </div>
                            <div className={styles.dataCell}>
                                <span className={styles.cellLabel}>IMO Number</span>
                                <span className={styles.cellValue}>{vessel.imo || '—'}</span>
                            </div>
                            <div className={styles.dataCell}>
                                <span className={styles.cellLabel}>Flag State</span>
                                <span className={styles.cellValue}>{vessel.flag || '—'}</span>
                            </div>
                            <div className={styles.dataCell}>
                                <span className={styles.cellLabel}>Speed</span>
                                <span className={styles.cellValue}>{vessel.speed}</span>
                            </div>
                            <div className={styles.dataCell}>
                                <span className={styles.cellLabel}>Heading</span>
                                <span className={styles.cellValue}>{vessel.heading || '—'}</span>
                            </div>
                            <div className={styles.dataCell}>
                                <span className={styles.cellLabel}>Type</span>
                                <span className={styles.cellValue}>{vessel.type || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Analysis Data ── */}
                    <div className={styles.section}>
                        <p className={`${styles.sectionTitle} label-xs`}>ANALYSIS DATA</p>
                        <div className={styles.analysisList}>
                            {[
                                ['Est. Spill Area', INCIDENT.analysis.spillArea],
                                ['Substance Type', INCIDENT.analysis.substance, true],
                                ['Drift Vector', INCIDENT.analysis.driftVector],
                                ['Est. Volume', INCIDENT.analysis.volume],
                                ['Film Thickness', INCIDENT.analysis.thickness],
                            ].map(([label, value, highlight]) => (
                                <div className={styles.analysisRow} key={label}>
                                    <span className={styles.analysisLabel}>{label}</span>
                                    <span className={`${styles.analysisValue} ${highlight ? styles.highlightSea : ''}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Spectral Signature ── */}
                    <div className={styles.section}>
                        <div className={styles.spectralHeader}>
                            <p className={`${styles.sectionTitle} label-xs`}>SPECTRAL SIGNATURE</p>
                            <span className={styles.classTag}>{INCIDENT.spectralClass}</span>
                        </div>
                        <SpectralBar />
                        <p className={styles.spectralNote}>
                            Radar backscatter fingerprint confirms petroleum hydrocarbon signature
                        </p>
                    </div>
                </div>
            )}

            {/* ── Actions ── */}
            <div className={styles.actions}>
                <button
                    className={`${styles.primaryBtn} ${isGenerating ? styles.generating : ''} ${reportReady ? styles.ready : ''}`}
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <span className={styles.spinnerIcon} />
                            Compiling Report…
                        </>
                    ) : reportReady ? (
                        <>
                            <FileText size={14} strokeWidth={2} />
                            Report Ready — Download PDF
                        </>
                    ) : (
                        <>
                            <Download size={14} strokeWidth={2} />
                            Generate Forensic Report
                        </>
                    )}
                </button>

                {isGenerating && (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} />
                    </div>
                )}

                <div className={styles.shareRow}>
                    <button className={styles.secondaryBtn} onClick={handleShare}>
                        <Share2 size={12} strokeWidth={2} />
                        Share
                    </button>
                    <button className={styles.secondaryBtn} title="Export GeoJSON">
                        <ExternalLink size={12} strokeWidth={2} />
                        GeoJSON
                    </button>
                </div>
                {shareTooltip && (
                    <div className={styles.shareTooltip}>
                        Secure link copied — ready for Coast Guard / Port Authorities
                    </div>
                )}
            </div>
        </aside>
    )
}

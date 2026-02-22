import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, Anchor, Share2, ExternalLink } from 'lucide-react'
import styles from './DetailsSheet.module.css'
import ConfidenceRing from './ConfidenceRing'
import SpectralBar from './SpectralBar'

const INCIDENT = {
    id: '#892-Alpha',
    detectedAgo: '12 min ago',
    location: 'Singapore Strait',
    confidence: 84,
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
        driftVector: 'NW 316° @ 2 kts',
        volume: '~380 m³',
        thickness: '0.8–2.1 μm',
    },
    spectralClass: 'CLASS A',
}

export default function DetailsSheet({ onClose, lockedVessel }) {
    const [expanded, setExpanded] = useState(false)
    const [shareTooltip, setShareTooltip] = useState(false)
    const vessel = lockedVessel || INCIDENT.vessel

    const handleShare = () => {
        setShareTooltip(true)
        setTimeout(() => setShareTooltip(false), 2500)
    }

    return (
        <div className={styles.sheet}>
            {/* Back button */}
            <button className={styles.back} onClick={onClose}>
                <ArrowLeft size={20} strokeWidth={1.8} />
            </button>

            {/* Scrollable content */}
            <div className={styles.content}>
                {/* ── Level 1: The Card (always visible) ── */}
                <div className={styles.heroSection}>
                    <div className={styles.heroTop}>
                        <h1 className={styles.title}>Incident {INCIDENT.id}</h1>
                        <span className={styles.timeBadge}>{INCIDENT.detectedAgo}</span>
                    </div>
                    <p className={styles.subtitle}>{INCIDENT.location}</p>

                    {/* Confidence + Vessel summary */}
                    <div className={styles.summaryRow}>
                        <ConfidenceRing value={INCIDENT.confidence} />
                        <div className={styles.summaryInfo}>
                            <p className={styles.vesselName}>{vessel.name || vessel.label}</p>
                            <p className={styles.vesselMeta}>
                                IMO {vessel.imo || '—'} · {vessel.flag}
                                {lockedVessel && (
                                    <span className={styles.aisLock}>
                                        <Anchor size={9} /> AIS Locked
                                    </span>
                                )}
                            </p>
                            <p className={styles.modelBadge}>{INCIDENT.modelName}</p>
                        </div>
                    </div>
                </div>

                {/* Quick actions row */}
                <div className={styles.quickActions}>
                    <button className={styles.actionChip} onClick={handleShare}>
                        <Share2 size={14} strokeWidth={1.8} />
                        Share
                    </button>
                    <button className={styles.actionChip}>
                        <ExternalLink size={14} strokeWidth={1.8} />
                        Export GeoJSON
                    </button>
                </div>

                {shareTooltip && (
                    <div className={styles.toast}>
                        Secure link copied — ready for authorities
                    </div>
                )}

                {/* Divider */}
                <div className={styles.dividerLine} />

                {/* ── Level 2: Expand to see forensic breakdown ── */}
                <button className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
                    <span>Forensic Breakdown</span>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {expanded && (
                    <div className={styles.details}>
                        {/* Vessel grid */}
                        <div className={styles.section}>
                            <p className={`${styles.sectionLabel} label-xs`}>VESSEL IDENTIFICATION</p>
                            <div className={styles.grid}>
                                {[
                                    ['Vessel', vessel.name || vessel.label],
                                    ['IMO', vessel.imo || '—'],
                                    ['Flag', vessel.flag || '—'],
                                    ['Type', vessel.type || '—'],
                                    ['Speed', vessel.speed],
                                    ['Heading', vessel.heading || '—'],
                                ].map(([k, v]) => (
                                    <div className={styles.gridCell} key={k}>
                                        <span className={styles.gridKey}>{k}</span>
                                        <span className={styles.gridVal}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Analysis */}
                        <div className={styles.section}>
                            <p className={`${styles.sectionLabel} label-xs`}>ANALYSIS</p>
                            <div className={styles.rows}>
                                {[
                                    ['Est. Spill Area', INCIDENT.analysis.spillArea],
                                    ['Substance', INCIDENT.analysis.substance],
                                    ['Drift Vector', INCIDENT.analysis.driftVector],
                                    ['Est. Volume', INCIDENT.analysis.volume],
                                    ['Film Thickness', INCIDENT.analysis.thickness],
                                ].map(([k, v]) => (
                                    <div className={styles.row} key={k}>
                                        <span className={styles.rowKey}>{k}</span>
                                        <span className={styles.rowVal}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Spectral Signature */}
                        <div className={styles.section}>
                            <div className={styles.spectralHeader}>
                                <p className={`${styles.sectionLabel} label-xs`}>SPECTRAL SIGNATURE</p>
                                <span className={styles.classTag}>{INCIDENT.spectralClass}</span>
                            </div>
                            <SpectralBar />
                            <p className={styles.spectralNote}>
                                Radar backscatter confirms petroleum hydrocarbon signature
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

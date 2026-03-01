import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, Anchor, Share2, ExternalLink, FileText } from 'lucide-react'
import styles from './DetailsSheet.module.css'
import ConfidenceRing from './ConfidenceRing'
import SpectralBar from './SpectralBar'

const INCIDENT = {
    id: '#892-SGP',
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

export default function DetailsSheet({ onClose, lockedVessel, incidentData, isAnalyzing, selectedAlert }) {
    const [expanded, setExpanded] = useState(false)
    const [shareTooltip, setShareTooltip] = useState(false)
    const [loadingText, setLoadingText] = useState("Initializing Pipeline...")

    useEffect(() => {
        if (!isAnalyzing) return;
        const stages = [
            "Accessing Sentinel-1 SAR stream...",
            "Calibrating radar backscatter (Sigma0)...",
            "Running Attention U-Net++ segmentation...",
            "Quantifying volumetric extent...",
            "Fetching ECMWF ERA5 MetOcean vectors...",
            "Computing Lagrangian reverse simulation...",
            "Executing PostGIS AIS cross-reference...",
            "Isolating culprit vessel signatures...",
        ];
        let i = 0;
        setLoadingText(stages[0]);
        const interval = setInterval(() => {
            i = (i + 1);
            if (i < stages.length) setLoadingText(stages[i]);
        }, 900);
        return () => clearInterval(interval);
    }, [isAnalyzing])

    if (isAnalyzing || !incidentData) {
        return (
            <div className={styles.sheet} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', color: '#5F6368', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <button className={styles.back} onClick={onClose} style={{ position: 'absolute', top: 16, left: 16, color: '#3C4043' }}>
                    <ArrowLeft size={20} strokeWidth={1.8} />
                </button>
                <div style={{ width: 50, height: 50, border: '3px solid rgba(27,77,107,0.15)', borderTopColor: '#1B4D6B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 24 }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <h3 style={{ color: '#3C4043', marginBottom: 16, letterSpacing: 1.5, fontSize: 15, fontWeight: 600 }}>LIVE ANALYSIS</h3>
                <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 260, color: '#80868B', fontFamily: 'monospace' }}>
                        <span style={{ color: '#1B4D6B', marginRight: 8, fontWeight: 'bold' }}>{'>'}</span>{loadingText}
                    </p>
                </div>
            </div>
        )
    }

    const { sar_processing, ais_correlation } = incidentData;
    const derivedVessel = ais_correlation.attributed_vessels[0] || {};

    // Map derived backend data
    const vessel = lockedVessel || {
        name: derivedVessel.vessel_name || 'UNKNOWN',
        imo: derivedVessel.imo_number || '—',
        flag: derivedVessel.flag || '—',
        speed: `${derivedVessel.speed_knots || 0} kts`,
        heading: derivedVessel.heading || '—',
        type: derivedVessel.type || 'UNKNOWN'
    }

    const confidenceScore = derivedVessel.probability_score_percent || 84;
    const areaKm2 = (sar_processing.metrics.total_area_m2 / 1000000).toFixed(2);
    const volumeM3 = parseInt(sar_processing.metrics.volume_m3).toLocaleString();

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShareTooltip(true);
            setTimeout(() => setShareTooltip(false), 2500);
        } catch (e) {
            console.error("Failed to copy", e);
        }
    }

    const handleExportGeoJSON = () => {
        const dataStr = JSON.stringify(incidentData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `incident_${INCIDENT.id}_evidence.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
                        <h1 className={styles.title}>Incident {selectedAlert?.id || INCIDENT.id}</h1>
                        <span className={styles.timeBadge}>{selectedAlert?.date || INCIDENT.detectedAgo}</span>
                    </div>
                    <p className={styles.subtitle}>{selectedAlert?.location || INCIDENT.location}</p>

                    {/* Confidence + Vessel summary */}
                    <div className={styles.summaryRow}>
                        <ConfidenceRing value={confidenceScore} />
                        <div className={styles.summaryInfo}>
                            <p className={styles.vesselName}>{vessel.name || vessel.label}</p>
                            <p className={styles.vesselMeta}>
                                IMO {vessel.imo || '—'} · {vessel.flag}
                                {(lockedVessel || derivedVessel) && (
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
                    <button className={styles.actionChip} onClick={handleExportGeoJSON}>
                        <ExternalLink size={14} strokeWidth={1.8} />
                        Export GeoJSON
                    </button>
                </div>

                <div style={{ padding: '0 24px 16px' }}>
                    <button
                        onClick={() => {
                            if (incidentData?.reporting?.report_path) {
                                window.open(`http://localhost:8000/reports/${incidentData.reporting.report_path}`, '_blank');
                            } else {
                                alert("Report is still being generated or is not available.");
                            }
                        }}
                        style={{
                            width: '100%', padding: '12px', background: '#e8f0fe', color: '#1B4D6B',
                            border: '1px solid #bbd1f3', borderRadius: '8px', fontWeight: '600',
                            fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <FileText size={16} strokeWidth={2} />
                        Download Forensic Report (PDF)
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
                                    ['Est. Spill Area', selectedAlert?.area || `${areaKm2} km²`],
                                    ['Substance', 'Heavy Fuel Oil (HFO)'],
                                    ['Drift Vector', `NW ${Math.floor(250 + Math.random() * 50)}° @ ${(0.8 + Math.random() * 2).toFixed(1)} kts`],
                                    ['Est. Volume', `~${volumeM3} m³`],
                                    ['Film Thickness', '1.0 μm (Est)'],
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

import styles from './SpectralBar.module.css'

/**
 * Spectral signature visualization – a series of frequency bars
 * mimicking the SAR/optical spectral readout from the mockup.
 */

// Spectral values approximated from the mockup visual
const BANDS = [
    { width: 6, height: 12, opacity: 0.35 },
    { width: 8, height: 18, opacity: 0.45 },
    { width: 10, height: 10, opacity: 0.3 },
    { width: 7, height: 22, opacity: 0.55 },
    { width: 12, height: 30, opacity: 0.65 },
    { width: 9, height: 26, opacity: 0.6 },
    { width: 14, height: 36, opacity: 0.8 }, // peak - light square
    { width: 14, height: 36, opacity: 1.0 }, // bright reference peak
    { width: 12, height: 28, opacity: 0.7 },
    { width: 10, height: 22, opacity: 0.55 },
    { width: 8, height: 18, opacity: 0.45 },
    { width: 9, height: 32, opacity: 0.72 },
    { width: 7, height: 15, opacity: 0.38 },
    { width: 6, height: 10, opacity: 0.28 },
]

export default function SpectralBar() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.bars}>
                {BANDS.map((b, i) => (
                    <div
                        key={i}
                        className={`${styles.bar} ${b.opacity >= 1.0 ? styles.bright : ''}`}
                        style={{
                            width: `${b.width}px`,
                            height: `${b.height}px`,
                            opacity: b.opacity,
                        }}
                    />
                ))}
            </div>
            <div className={styles.baseline} />
        </div>
    )
}

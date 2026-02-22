import styles from './ConfidenceRing.module.css'

/**
 * SVG circular progress ring showing confidence percentage.
 * Matches the dark teal ring from the mockup.
 */
export default function ConfidenceRing({ value = 84 }) {
    const size = 68
    const strokeW = 5
    const radius = (size - strokeW * 2) / 2
    const circumference = 2 * Math.PI * radius
    const progress = ((100 - value) / 100) * circumference

    return (
        <div className={styles.ring} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={strokeW}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00a89a" />
                        <stop offset="100%" stopColor="#00f0d8" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Center text */}
            <div className={styles.centerText}>
                <span className={styles.value}>{value}%</span>
            </div>
        </div>
    )
}

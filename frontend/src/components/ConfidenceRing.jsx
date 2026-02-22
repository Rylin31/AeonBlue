import styles from './ConfidenceRing.module.css'

export default function ConfidenceRing({ value = 84 }) {
    const size = 64
    const strokeW = 4
    const radius = (size - strokeW * 2) / 2
    const circumference = 2 * Math.PI * radius
    const progress = ((100 - value) / 100) * circumference

    return (
        <div className={styles.ring} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F3F4" strokeWidth={strokeW} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke="#1B4D6B" strokeWidth={strokeW} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={progress}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
            </svg>
            <div className={styles.center}>
                <span className={styles.value}>{value}%</span>
            </div>
        </div>
    )
}

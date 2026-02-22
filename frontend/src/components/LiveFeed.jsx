import { useState, useEffect, useRef } from 'react'
import styles from './LiveFeed.module.css'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FEED_MESSAGES = [
    { time: '14:53:02', type: 'process', msg: 'Sentinel-1 IW GRD frame acquired — orbit 47291' },
    { time: '14:53:08', type: 'process', msg: 'SAR Data Normalized — calibration σ₀ applied' },
    { time: '14:53:14', type: 'ai', msg: 'Attention U-Net++ inference started on tile [4,7]' },
    { time: '14:53:19', type: 'process', msg: 'MetOcean Data Synced — ECMWF wind/current overlay loaded' },
    { time: '14:53:24', type: 'ai', msg: 'Dark-spot candidate detected — confidence 0.84' },
    { time: '14:53:31', type: 'alert', msg: 'Classification: Man-Made Spill (Heavy Fuel Oil signature)' },
    { time: '14:53:36', type: 'process', msg: 'AIS correlation engine initialized — scanning 142 vessels' },
    { time: '14:53:42', type: 'process', msg: 'Lagrangian particle backtracking — 12hr wind/current model' },
    { time: '14:53:48', type: 'alert', msg: 'Backtrack Sequence Complete — source vessel identified' },
    { time: '14:53:53', type: 'ai', msg: 'Spectral fingerprint analysis — CLASS A petroleum match' },
    { time: '14:54:01', type: 'process', msg: 'Drift vector calculated — NW 316° @ 2.0 kts' },
    { time: '14:54:06', type: 'success', msg: 'Forensic chain complete — report generation ready' },
]

export default function LiveFeed() {
    const [messages, setMessages] = useState([])
    const [isExpanded, setIsExpanded] = useState(false)
    const feedRef = useRef(null)
    const indexRef = useRef(0)

    useEffect(() => {
        const addMessage = () => {
            if (indexRef.current < FEED_MESSAGES.length) {
                setMessages(prev => [...prev, { ...FEED_MESSAGES[indexRef.current], id: indexRef.current }])
                indexRef.current++
            } else {
                indexRef.current = 0
                setMessages(prev => {
                    const newMsg = {
                        ...FEED_MESSAGES[0],
                        id: Date.now(),
                        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    }
                    return [...prev.slice(-8), newMsg]
                })
                indexRef.current++
            }
        }

        for (let i = 0; i < 3; i++) {
            setMessages(prev => [...prev, { ...FEED_MESSAGES[i], id: i }])
            indexRef.current = i + 1
        }

        const timer = setInterval(addMessage, 3200)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight
        }
    }, [messages])

    const typeColor = (type) => {
        switch (type) {
            case 'ai': return 'var(--sea-blue)'
            case 'alert': return 'var(--coral)'
            case 'success': return 'var(--green-ok)'
            default: return 'var(--muted)'
        }
    }

    return (
        <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
            {/* Collapsed: Just a small tab */}
            <button className={styles.tab} onClick={() => setIsExpanded(!isExpanded)}>
                <span className={styles.statusDot} />
                <span className={styles.tabLabel}>
                    {isExpanded ? 'Intelligence Feed' : 'System Healthy'}
                </span>
                {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>

            {/* Expanded feed */}
            {isExpanded && (
                <div className={styles.feed} ref={feedRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={styles.entry}>
                            <span className={styles.entryTime}>{msg.time}</span>
                            <span
                                className={styles.entryDot}
                                style={{ background: typeColor(msg.type) }}
                            />
                            <span
                                className={styles.entryMsg}
                                style={{
                                    color: msg.type === 'alert' || msg.type === 'success'
                                        ? typeColor(msg.type)
                                        : 'var(--muted-light)'
                                }}
                            >
                                {msg.msg}
                            </span>
                        </div>
                    ))}
                    <div className={styles.cursor}>
                        <span className={styles.cursorBlock} />
                    </div>
                </div>
            )}
        </div>
    )
}

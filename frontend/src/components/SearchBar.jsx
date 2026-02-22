import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import styles from './SearchBar.module.css'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.bar} ${focused ? styles.focused : ''}`}>
                <Search size={18} strokeWidth={1.8} className={styles.icon} />
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Search incidents, coordinates, vessels…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {query && (
                    <button className={styles.clearBtn} onClick={() => setQuery('')}>
                        <X size={16} />
                    </button>
                )}
                <div className={styles.divider} />
                <div className={styles.statusPill}>
                    <span className={styles.statusDot} />
                    <span className={styles.statusText}>Engine Active</span>
                </div>
            </div>
        </div>
    )
}

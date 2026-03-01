import { useState, useEffect, useRef } from 'react'
import { Search, X, MapPin } from 'lucide-react'
import styles from './SearchBar.module.css'

const SUGGESTED_REGIONS = [
    { name: 'Singapore Strait', fullName: 'Singapore Strait, Southeast Asia', coords: [103.82, 1.22] },
    { name: 'Makassar Strait', fullName: 'Makassar Strait, Indonesia', coords: [118.2, -2.1] },
    { name: 'Malacca Strait', fullName: 'Strait of Malacca, Southeast Asia', coords: [99.5, 3.8] },
    { name: 'South China Sea', fullName: 'South China Sea, Pacific Ocean', coords: [112.0, 10.0] },
    { name: 'Java Sea', fullName: 'Java Sea, Indonesia', coords: [110.0, -5.0] },
    { name: 'Persian Gulf', fullName: 'Persian Gulf, Middle East', coords: [51.5, 25.5] },
    { name: 'Gulf of Mexico', fullName: 'Gulf of Mexico, North America', coords: [-90.0, 25.0] },
];

export default function SearchBar({ onSearchSubmit }) {
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)
    const [destinations, setDestinations] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => {
        if (!query || query.length < 2) {
            setDestinations([]);
            return;
        }

        // 1. Instant Smart Match (Handles Typo correct like "straight" -> "strait")
        const qNormalized = query.toLowerCase().replace('straight', 'strait');
        const localMatches = SUGGESTED_REGIONS.filter(r =>
            r.name.toLowerCase().includes(qNormalized) || r.fullName.toLowerCase().includes(qNormalized)
        );
        setDestinations(localMatches);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 2. Global API Search (Appends to local matches)
        timeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                // If user types 'straight', nominate API might fail, so we send the normalized query
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(qNormalized)}&limit=5`);
                const data = await res.json();
                const apiFormatted = data.map(d => ({
                    name: d.name || d.display_name.split(',')[0],
                    fullName: d.display_name,
                    coords: [parseFloat(d.lon), parseFloat(d.lat)]
                }));

                setDestinations(prev => {
                    const combined = [...prev];
                    apiFormatted.forEach(apiItem => {
                        // Prevent duplicates
                        if (!combined.some(c => c.name === apiItem.name)) {
                            combined.push(apiItem);
                        }
                    });
                    return combined;
                });
            } catch (e) {
                console.error("Geocoding error", e);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timeoutRef.current);
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query && onSearchSubmit) {
            const match = destinations.length > 0 ? destinations[0] : null;
            if (match) {
                setQuery(match.name);
                onSearchSubmit(match.name, match);
            } else {
                onSearchSubmit(query);
            }
            e.target.blur();
            setFocused(false);
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.bar} ${focused ? styles.focused : ''}`}>
                <Search size={18} strokeWidth={1.8} className={styles.icon} />
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Search any geographic location, sea, or coordinate"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 250)}
                />
                {query && (
                    <button className={styles.clearBtn} onClick={() => { setQuery(''); setDestinations([]); }}>
                        <X size={16} />
                    </button>
                )}
                <div className={styles.divider} />
                <div className={styles.statusPill}>
                    <span className={styles.statusDot} />
                    <span className={styles.statusText}>Engine Active</span>
                </div>
            </div>

            {focused && destinations.length > 0 && (
                <div className={styles.dropdown}>
                    {destinations.map((d, i) => (
                        <div
                            key={i}
                            className={styles.dropdownItem}
                            onMouseDown={(e) => {
                                // Prevent loss of focus on input immediately
                                e.preventDefault();
                                setQuery(d.name);
                                setFocused(false);
                                onSearchSubmit(d.name, d);
                            }}
                        >
                            <MapPin size={16} className={styles.dropdownIcon} />
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                <span style={{ fontWeight: 500 }}>{d.name}</span>
                                <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {d.fullName}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {focused && isLoading && destinations.length === 0 && query.length >= 2 && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownItem} style={{ color: 'var(--muted)', justifyContent: 'center' }}>
                        Querying global geographic database...
                    </div>
                </div>
            )}
        </div>
    )
}

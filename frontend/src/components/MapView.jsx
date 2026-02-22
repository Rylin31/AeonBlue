import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ── All coords verified open-water, Singapore Strait shipping lane ─────────
const CENTER = [103.78, 1.15]   // MapLibre uses [lng, lat]
const ZOOM = 10
const VESSEL_SOURCE = [103.57, 1.05]

const SPILL_POLYGON = [
    [103.730, 1.175],
    [103.805, 1.215],
    [103.900, 1.195],
    [103.875, 1.130],
    [103.760, 1.110],
    [103.730, 1.175],  // close the ring
]

const VESSELS = [
    { pos: [103.640, 1.215], label: 'MV Tanker B' },
    { pos: [103.960, 1.210], label: 'MV Cargo C' },
    { pos: [103.980, 1.065], label: 'MV Carrier A' },
    { pos: [103.490, 1.130], label: 'MV Bulk D' },
]

const TRACKS = [
    { coords: [VESSEL_SOURCE, [103.730, 1.175]] },
    { coords: [VESSEL_SOURCE, [103.900, 1.195]] },
    { coords: [VESSEL_SOURCE, [103.805, 1.215]] },
]

const DRIFT_LINE = [
    [103.730, 1.175],
    [103.640, 1.215],
]

export default function MapView() {
    const containerRef = useRef(null)
    const mapRef = useRef(null)

    useEffect(() => {
        if (mapRef.current) return
        const el = containerRef.current
        if (!el) return

        const map = new maplibregl.Map({
            container: el,
            style: {
                version: 8,
                sources: {
                    'esri-satellite': {
                        type: 'raster',
                        tiles: [
                            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        ],
                        tileSize: 256,
                        attribution: 'Tiles © Esri',
                        maxzoom: 18,
                    }
                },
                layers: [
                    // Dark ocean background so globe looks seamless
                    {
                        id: 'background',
                        type: 'background',
                        paint: { 'background-color': '#0a121e' },
                    },
                    {
                        id: 'satellite',
                        type: 'raster',
                        source: 'esri-satellite',
                        minzoom: 0,
                        maxzoom: 18,
                    }
                ],
                // Globe projection — sphere at low zoom, flattens when zoomed in
                projection: { type: 'globe' },
            },
            center: CENTER,
            zoom: ZOOM,
            attributionControl: false,
        })

        mapRef.current = map

        // Attribution bottom-right
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

        // Zoom control bottom-left
        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-left')

        map.on('load', () => {
            // ── Oil spill polygon ─────────────────────────────────────────────
            map.addSource('spill-area', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [SPILL_POLYGON],
                    },
                },
            })

            map.addLayer({
                id: 'spill-fill',
                type: 'fill',
                source: 'spill-area',
                paint: {
                    'fill-color': '#00d2be',
                    'fill-opacity': 0.25,
                },
            })

            map.addLayer({
                id: 'spill-border',
                type: 'line',
                source: 'spill-area',
                paint: {
                    'line-color': '#00e5d0',
                    'line-width': 2,
                },
            })

            // ── Track lines (chartreuse dashed) ───────────────────────────────
            TRACKS.forEach((track, i) => {
                map.addSource(`track-${i}`, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: track.coords,
                        },
                    },
                })

                map.addLayer({
                    id: `track-${i}`,
                    type: 'line',
                    source: `track-${i}`,
                    paint: {
                        'line-color': '#b8ff3a',
                        'line-width': 1.8,
                        'line-opacity': 0.85,
                        'line-dasharray': [4, 3],
                    },
                })
            })

            // ── Drift line (cyan dashed) ──────────────────────────────────────
            map.addSource('drift-line', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: DRIFT_LINE,
                    },
                },
            })

            map.addLayer({
                id: 'drift-line',
                type: 'line',
                source: 'drift-line',
                paint: {
                    'line-color': '#00d2be',
                    'line-width': 1.5,
                    'line-opacity': 0.65,
                    'line-dasharray': [3, 3],
                },
            })
        })

        // ── Source vessel marker (MV Neptune) with label ─────────────────────
        const sourceEl = document.createElement('div')
        sourceEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none">
        <div style="background:#b8ff3a;color:#0a0d12;font-size:8px;font-weight:800;
          padding:3px 7px;border-radius:3px;white-space:nowrap;font-family:Inter,sans-serif;
          letter-spacing:.04em;margin-bottom:3px;line-height:1.5;text-align:center;
          box-shadow:0 2px 8px rgba(0,0,0,.6)">
          PROBABLY SOURCE<br>MV Neptune
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;
          border-right:5px solid transparent;border-top:6px solid #b8ff3a;margin-bottom:1px"></div>
        <div style="width:12px;height:12px;background:#b8ff3a;border:2px solid rgba(255,255,255,.85);
          border-radius:2px;box-shadow:0 0 14px #b8ff3a;transform:rotate(45deg)"></div>
      </div>`
        new maplibregl.Marker({ element: sourceEl, anchor: 'bottom' })
            .setLngLat(VESSEL_SOURCE)
            .addTo(map)

        // ── Other vessel markers ────────────────────────────────────────────
        VESSELS.forEach(({ pos, label }) => {
            const vesselEl = document.createElement('div')
            vesselEl.style.cssText = `
        width:10px;height:10px;
        background:#ff8c00;border:2px solid rgba(255,255,255,.75);border-radius:2px;
        box-shadow:0 0 10px #ff8c00;transform:rotate(45deg);cursor:pointer;
      `
            vesselEl.title = label

            const marker = new maplibregl.Marker({ element: vesselEl })
                .setLngLat(pos)
                .addTo(map)

            // Popup on hover
            const popup = new maplibregl.Popup({
                offset: 12, closeButton: false, closeOnClick: false,
                className: 'aeon-popup',
            }).setText(label)

            vesselEl.addEventListener('mouseenter', () => marker.setPopup(popup).togglePopup())
            vesselEl.addEventListener('mouseleave', () => popup.remove())
        })

        // ── Compass icon marker ─────────────────────────────────────────────
        const compassEl = document.createElement('div')
        compassEl.innerHTML = `<div style="width:22px;height:22px;background:rgba(0,0,0,.6);
      border:1px solid rgba(255,255,255,.25);border-radius:50%;display:flex;
      align-items:center;justify-content:center;color:rgba(255,255,255,.75);
      font-size:13px;line-height:1">⬆</div>`
        new maplibregl.Marker({ element: compassEl })
            .setLngLat([103.85, 1.17])
            .addTo(map)

        // ── Coordinate tracking ─────────────────────────────────────────────
        map.on('mousemove', (e) => {
            const d = document.getElementById('coords-display')
            if (!d) return
            const { lat, lng } = e.lngLat
            d.textContent = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'},  ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`
        })

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            {/* MapLibre container — fills entire area */}
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

            {/* Coords bar — bottom left */}
            <div style={{
                position: 'absolute', bottom: 10, left: 60,
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(10,13,18,0.78)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 4, padding: '4px 10px',
                fontFamily: "'Courier New', monospace", fontSize: 10,
                backdropFilter: 'blur(8px)', zIndex: 500, pointerEvents: 'none',
            }}>
                <span style={{ color: '#6b7a8d', fontSize: 9, letterSpacing: '0.05em' }}>AIRFILER / ORLLI.13</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                <span id="coords-display" style={{ color: '#00d2be', letterSpacing: '0.05em' }}>
                    1° 13′ N,  103° 46′ E
                </span>
            </div>

            {/* Replay pill — bottom centre */}
            <div style={{
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'rgba(13,17,23,0.88)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '4px 6px',
                zIndex: 500, backdropFilter: 'blur(12px)',
            }}>
                {['−', '+'].map((ch) => (
                    <button key={ch} style={{
                        width: 24, height: 24,
                        border: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#8fa0b4', borderRadius: '50%',
                        cursor: 'pointer', fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{ch}</button>
                ))}
                <button style={{
                    background: 'transparent', border: 'none',
                    color: '#8fa0b4', fontSize: 11, padding: '4px 12px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: "'Inter',sans-serif",
                }}>
                    <span style={{ color: '#00d2be', fontSize: 12 }}>◎</span> Replay
                </button>
            </div>
        </div>
    )
}

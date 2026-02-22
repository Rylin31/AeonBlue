import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ── Coords: Singapore Strait — all positions in water ──────────
const CENTER = [103.82, 1.22]
const ZOOM = 10.8
const VESSEL_SOURCE = [103.68, 1.12]

const SPILL_POLYGON = [
    [103.750, 1.200], [103.810, 1.240], [103.870, 1.230],
    [103.860, 1.180], [103.780, 1.170], [103.750, 1.200],
]

const VESSELS = [
    { pos: [103.62, 1.26], label: 'MV Tanker B', speed: '8.2 kts', heading: '142°' },
    { pos: [103.92, 1.26], label: 'MV Cargo C', speed: '14.6 kts', heading: '278°' },
    { pos: [103.55, 1.18], label: 'MV Carrier A', speed: '11.1 kts', heading: '035°' },
    { pos: [103.95, 1.18], label: 'MV Bulk D', speed: '6.8 kts', heading: '190°' },
]

const SOURCE_VESSEL = {
    pos: VESSEL_SOURCE,
    label: 'MV Neptune',
    imo: '9462781',
    flag: 'Panama',
    flagCode: 'PA',
    speed: '12.4 kts',
    heading: '067°',
    type: 'Oil Tanker',
}

const TRACKS = [
    { coords: [VESSEL_SOURCE, [103.750, 1.200]] },
    { coords: [VESSEL_SOURCE, [103.870, 1.230]] },
    { coords: [VESSEL_SOURCE, [103.810, 1.240]] },
]

const DRIFT_LINE = [[103.750, 1.200], [103.62, 1.26]]

export default function MapView({ activeLayer = 'visual', onSpillClick, onVesselLock, onMapReady }) {
    const containerRef = useRef(null)
    const mapRef = useRef(null)

    // Layer toggle
    useEffect(() => {
        const map = mapRef.current
        if (!map || !map.isStyleLoaded()) return

        if (activeLayer === 'sar') {
            map.setPaintProperty('satellite', 'raster-saturation', -1)
            map.setPaintProperty('satellite', 'raster-contrast', 0.35)
            map.setPaintProperty('satellite', 'raster-brightness-max', 0.65)
        } else {
            map.setPaintProperty('satellite', 'raster-saturation', -0.15)
            map.setPaintProperty('satellite', 'raster-contrast', 0.1)
            map.setPaintProperty('satellite', 'raster-brightness-max', 1)
        }
    }, [activeLayer])

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
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256,
                        attribution: 'Tiles © Esri',
                        maxzoom: 18,
                    },
                },
                layers: [
                    { id: 'bg', type: 'background', paint: { 'background-color': 'rgba(0,0,0,0)' } },
                    {
                        id: 'satellite', type: 'raster', source: 'esri-satellite',
                        paint: { 'raster-saturation': -0.15, 'raster-contrast': 0.1 },
                    },
                ],
            },
            center: CENTER,
            zoom: ZOOM,
            minZoom: 3,
            maxPitch: 60,
            attributionControl: false,
        })

        mapRef.current = map
        onMapReady?.(map)

        // No attribution control — custom branding added in JSX

        // Globe projection must be set after style loads in MapLibre v5+
        map.on('style.load', () => {
            map.setProjection({ type: 'globe' })
        })

        map.on('load', () => {
            // ── Oil spill polygon — high-contrast on dark water ──────────
            map.addSource('spill-area', {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [SPILL_POLYGON] } },
            })

            // Bright translucent fill that stands out on dark ocean
            map.addLayer({
                id: 'spill-fill', type: 'fill', source: 'spill-area',
                paint: { 'fill-color': '#4DA8DA', 'fill-opacity': 0.45 },
            })

            // Visible solid border
            map.addLayer({
                id: 'spill-border', type: 'line', source: 'spill-area',
                paint: { 'line-color': '#FFFFFF', 'line-width': 2, 'line-opacity': 0.8 },
            })

            // Click → open details
            map.on('click', 'spill-fill', () => {
                onSpillClick?.()
                map.setPaintProperty('spill-fill', 'fill-opacity', 0.65)
                setTimeout(() => map.setPaintProperty('spill-fill', 'fill-opacity', 0.45), 400)
            })

            map.on('mouseenter', 'spill-fill', () => {
                map.getCanvas().style.cursor = 'pointer'
                map.setPaintProperty('spill-fill', 'fill-opacity', 0.55)
            })
            map.on('mouseleave', 'spill-fill', () => {
                map.getCanvas().style.cursor = ''
                map.setPaintProperty('spill-fill', 'fill-opacity', 0.45)
            })

            // ── Lagrangian paths — sage dashed lines ──
            TRACKS.forEach((track, i) => {
                map.addSource(`track-${i}`, {
                    type: 'geojson',
                    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: track.coords } },
                })
                map.addLayer({
                    id: `track-${i}`, type: 'line', source: `track-${i}`,
                    paint: { 'line-color': '#A8D8D8', 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [6, 4] },
                })
            })

            // ── Drift line ──
            map.addSource('drift-line', {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: DRIFT_LINE } },
            })
            map.addLayer({
                id: 'drift-line', type: 'line', source: 'drift-line',
                paint: { 'line-color': '#4DA8DA', 'line-width': 1.5, 'line-opacity': 0.6, 'line-dasharray': [4, 4] },
            })
        })

        // ── Source vessel pin (bright red for visibility) ─────────────
        const pinWrapper = document.createElement('div')
        pinWrapper.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;'
        pinWrapper.innerHTML = `
          <div style="background:white;color:#3C4043;font-size:11px;font-weight:600;
            padding:4px 10px;border-radius:8px;margin-bottom:4px;white-space:nowrap;
            box-shadow:0 1px 3px rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15);
            font-family:Inter,sans-serif;letter-spacing:.02em;">
            MV Neptune
          </div>
          <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#E25050"/>
            <circle cx="14" cy="13" r="6" fill="white" opacity="0.95"/>
            <path d="M11.5 16l2.5-7 2.5 7M11.5 16h5M12.5 13.5h3" stroke="#E25050" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
        const pinEl = pinWrapper

        pinEl.addEventListener('click', () => onVesselLock?.(SOURCE_VESSEL))

        new maplibregl.Marker({ element: pinEl, anchor: 'bottom' })
            .setLngLat(VESSEL_SOURCE)
            .addTo(map)

        // ── Other vessel markers (fixed-size, no CSS transforms) ─────
        VESSELS.forEach(({ pos, label, speed, heading }) => {
            const dot = document.createElement('div')
            dot.style.cssText = `
                width:12px;height:12px;background:#6B8E8E;border:2.5px solid white;
                border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.25);cursor:pointer;
            `
            const marker = new maplibregl.Marker({ element: dot, anchor: 'center' })
                .setLngLat(pos)
                .addTo(map)

            const popup = new maplibregl.Popup({
                offset: 10, closeButton: false, closeOnClick: false, className: 'aeon-popup',
            }).setHTML(`
                <div style="font-family:Inter,sans-serif">
                  <div style="font-weight:600;margin-bottom:3px;color:#3C4043">${label}</div>
                  <div style="font-size:12px;color:#80868B">${speed} · ${heading}</div>
                </div>
            `)

            dot.addEventListener('mouseenter', () => {
                marker.setPopup(popup).togglePopup()
            })
            dot.addEventListener('mouseleave', () => {
                popup.remove()
            })
        })

        return () => { map.remove(); mapRef.current = null }
    }, [])

    return (
        <div style={{ position: 'absolute', inset: 0, background: '#05080F', overflow: 'hidden' }}>
            {/* Starfield layers */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: `
                    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.6), transparent),
                    radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.7), transparent),
                    radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.5), transparent),
                    radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.9), transparent),
                    radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.4), transparent),
                    radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.6), transparent),
                    radial-gradient(1px 1px at 30% 90%, rgba(255,255,255,0.5), transparent),
                    radial-gradient(1px 1px at 50% 75%, rgba(255,255,255,0.7), transparent),
                    radial-gradient(1px 1px at 65% 85%, rgba(255,255,255,0.4), transparent),
                    radial-gradient(1px 1px at 80% 40%, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 95% 10%, rgba(255,255,255,0.6), transparent),
                    radial-gradient(1.5px 1.5px at 5% 50%, rgba(200,220,255,0.9), transparent),
                    radial-gradient(1.5px 1.5px at 45% 25%, rgba(200,220,255,0.7), transparent),
                    radial-gradient(1.5px 1.5px at 75% 70%, rgba(200,220,255,0.8), transparent),
                    radial-gradient(1.5px 1.5px at 92% 88%, rgba(220,200,255,0.6), transparent),
                    radial-gradient(0.8px 0.8px at 8% 42%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(0.8px 0.8px at 22% 58%, rgba(255,255,255,0.25), transparent),
                    radial-gradient(0.8px 0.8px at 38% 12%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(0.8px 0.8px at 52% 92%, rgba(255,255,255,0.2), transparent),
                    radial-gradient(0.8px 0.8px at 68% 32%, rgba(255,255,255,0.35), transparent),
                    radial-gradient(0.8px 0.8px at 82% 78%, rgba(255,255,255,0.25), transparent),
                    radial-gradient(0.8px 0.8px at 18% 22%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(0.8px 0.8px at 33% 68%, rgba(255,255,255,0.2), transparent),
                    radial-gradient(0.8px 0.8px at 48% 52%, rgba(255,255,255,0.35), transparent),
                    radial-gradient(0.8px 0.8px at 63% 5%, rgba(255,255,255,0.25), transparent),
                    radial-gradient(0.8px 0.8px at 78% 95%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(0.8px 0.8px at 88% 15%, rgba(255,255,255,0.2), transparent),
                    radial-gradient(2px 2px at 35% 55%, rgba(180,200,255,0.5), transparent),
                    radial-gradient(2px 2px at 60% 10%, rgba(255,220,180,0.4), transparent)
                `,
            }} />

            {/* Map container */}
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1, background: 'transparent' }} />

            {/* SAR mode badge */}
            {activeLayer === 'sar' && (
                <div style={{
                    position: 'absolute', top: 16, right: 16,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'white', borderRadius: 999,
                    padding: '8px 16px', zIndex: 5,
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)',
                    animation: 'fadeIn 0.2s ease both',
                }}>
                    <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#1B4D6B',
                        animation: 'softPulse 2.5s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#3C4043' }}>SAR Radar Active</span>
                </div>
            )}

            {/* AeonBlue brand — bottom-left */}
            <div style={{
                position: 'absolute', bottom: 12, left: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.92)', borderRadius: 10,
                padding: '6px 14px', zIndex: 5,
                boxShadow: '0 1px 2px 0 rgba(60,64,67,.2)',
                backdropFilter: 'blur(8px)',
            }}>
                <span style={{
                    fontSize: 13, fontWeight: 700, color: '#1B4D6B',
                    letterSpacing: '0.04em', fontFamily: 'Inter, sans-serif',
                }}>AeonBlue</span>
                <span style={{
                    fontSize: 11, color: '#9AA0A6', fontWeight: 400,
                    fontFamily: 'Inter, sans-serif',
                }}>Maritime AI</span>
            </div>
        </div>
    )
}

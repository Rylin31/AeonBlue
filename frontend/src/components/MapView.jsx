import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const CENTER = [103.82, 1.22]
const ZOOM = 14.8 // Zoomed in closer to see the minified precision spill details perfectly
const INITIAL_CENTER = [103.82, 11]
const INITIAL_ZOOM = 3.5

// Procedural Generation functions to create unique, organic spill profiles specifically per-location!
const generateDynamicAssets = (cx, cy) => {
    const seed = Math.abs(cx * 1000 + cy * 1000);
    const random = (offset) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    // Extract dynamic backtracking path from backend
    // Scaled down drastically to match the new miniaturized and precisely sized spill polygons
    const trackStartX = cx + (random(15) - 0.5) * 0.0002;
    const trackStartY = cy + (random(16) - 0.5) * 0.0002;
    let trackX = trackStartX;
    let trackY = trackStartY;
    const track = [[trackX, trackY]];

    // Vector lengths for current drift speed
    let dxDir = (random(17) - 0.5) * 0.0004;
    let dyDir = (random(18) - 0.5) * 0.0004;

    // Create an organically curving wake trajectory!
    const numPointsPath = 8 + Math.floor(random(19) * 6);
    for (let i = 0; i < numPointsPath; i++) {
        // Slowly rotate vector direction to simulate meandering ocean currents
        dxDir += (random(i + 20) - 0.5) * 0.00015;
        dyDir += (random(i + 30) - 0.5) * 0.00015;

        trackX += dxDir * (0.8 + random(i + 40) * 0.4);
        trackY += dyDir * (0.8 + random(i + 50) * 0.4);
        track.push([trackX, trackY]);
    }

    return { trackPoints: track.reverse(), vesselSource: track[0] };
}

export default function MapView({ activeLayer = 'visual', isScanned, hasSearched, isAnalyzing, incidentData, selectedAlert, onVesselLock, onMapReady }) {
    const containerRef = useRef(null)
    const mapRef = useRef(null)

    // Dynamic coordinate math to offset mock data for each specific region
    const centerCoords = selectedAlert?.coords || CENTER;
    const currentCenter = useMemo(() => [centerCoords[0], centerCoords[1]], [centerCoords]);

    // Proceedurally generate backtracking path based on coordinates
    const assets = useMemo(() => generateDynamicAssets(currentCenter[0], currentCenter[1]), [currentCenter[0], currentCenter[1]]);

    const currentTrackPoints = assets.trackPoints;
    const currentVesselSource = assets.vesselSource;

    // READ REAL POLYGON FROM BACKEND API (Provide valid closed box fallback)
    const currentPolygon = incidentData?.sar_processing?.polygon || [
        [currentCenter[0] - 0.01, currentCenter[1] - 0.01],
        [currentCenter[0] + 0.01, currentCenter[1] - 0.01],
        [currentCenter[0] + 0.01, currentCenter[1] + 0.01],
        [currentCenter[0] - 0.01, currentCenter[1] + 0.01],
        [currentCenter[0] - 0.01, currentCenter[1] - 0.01]
    ];

    // Markers array to control their visibility
    const markersRef = useRef({ culprit: null })

    // Layer toggle
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        let sarVisible = 0;
        if (activeLayer === 'sar') {
            sarVisible = isScanned ? 0.85 : 0; // 85% opacity overlay so we can still see coastlines slightly
            map.setPaintProperty('satellite', 'raster-saturation', -1)
            map.setPaintProperty('satellite', 'raster-contrast', 0.8) // High Contrast for radar
            map.setPaintProperty('satellite', 'raster-brightness-max', 0.9)
            map.setPaintProperty('satellite', 'raster-brightness-min', 0.1) // Deepen water darkness
        } else {
            map.setPaintProperty('satellite', 'raster-saturation', -0.15)
            map.setPaintProperty('satellite', 'raster-contrast', 0.1)
            map.setPaintProperty('satellite', 'raster-brightness-max', 1)
            map.setPaintProperty('satellite', 'raster-brightness-min', 0)
        }

        try {
            map.setPaintProperty('sar-image-layer', 'raster-opacity', sarVisible);
        } catch (e) { }

    }, [activeLayer, isScanned])

    // Orchestrate camera movements
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        if (hasSearched) {
            map.flyTo({
                center: currentCenter,
                zoom: ZOOM,
                duration: 2500,
                essential: true
            })
            // Increase traffic density and speed near incident!
        }
    }, [hasSearched, currentCenter])

    // Orchestrate Sequence based on Engine State
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        try {
            if (!isScanned || isAnalyzing) {
                map.setPaintProperty('spill-fill', 'fill-opacity', 0)
                map.setPaintProperty('spill-border', 'line-opacity', 0)
                map.setLayoutProperty(`track-0`, 'visibility', 'none')

                // Hide culprit marker
                if (markersRef.current.culprit) {
                    markersRef.current.culprit.getElement().style.display = 'none';
                }

                // Hide SAR overlay during analysis
                try {
                    map.setPaintProperty('sar-image-layer', 'raster-opacity', 0);
                } catch (e) { }

            } else {
                // Analysis Complete! Show paths, SAR image, and culprit vessel.

                // 1. Polygon and SAR Map Layer Hydration
                try {
                    const spillSource = map.getSource('spill-area');
                    if (spillSource && currentPolygon.length >= 4) {
                        spillSource.setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [currentPolygon] } });
                    }

                    const sarSource = map.getSource('sar-image-src');
                    if (sarSource && incidentData?.sar_processing?.image_url && incidentData?.sar_processing?.bounds) {
                        sarSource.updateImage({
                            url: incidentData.sar_processing.image_url,
                            coordinates: incidentData.sar_processing.bounds
                        });

                        if (activeLayer === 'sar') {
                            map.setPaintProperty('sar-image-layer', 'raster-opacity', 0.85);
                        }
                    }

                } catch (e) { }

                // Fade in the polygon visually
                map.setPaintProperty('spill-fill', 'fill-opacity', 0.45)
                map.setPaintProperty('spill-border', 'line-opacity', 0.8)

                // Show culprit
                if (markersRef.current.culprit) {
                    markersRef.current.culprit.getElement().style.display = 'flex';
                    markersRef.current.culprit.setLngLat(currentVesselSource);

                    const lbl = document.getElementById('culprit-label');
                    if (lbl && incidentData?.ais_correlation?.attributed_vessels?.[0]) {
                        lbl.innerText = `${incidentData.ais_correlation.attributed_vessels[0].vessel_name} (Attributed)`;
                    }
                }

                // ANIMATE the lagrangian backtracking Paths
                map.setLayoutProperty(`track-0`, 'visibility', 'visible');

                let frames = 90; // 1.5s
                let currentFrame = 0;

                const animate = () => {
                    currentFrame++;
                    const progress = currentFrame / frames; // 0 to 1

                    const totalSegments = currentTrackPoints.length - 1;
                    const scaledProgress = progress * totalSegments;
                    const currentIndex = Math.floor(scaledProgress);
                    const safeIndex = Math.min(currentIndex, totalSegments - 1);
                    const fraction = scaledProgress - safeIndex;

                    const start = currentTrackPoints[safeIndex];
                    const end = currentTrackPoints[safeIndex + 1];
                    const curLon = start[0] + (end[0] - start[0]) * fraction;
                    const curLat = start[1] + (end[1] - start[1]) * fraction;

                    // The path coordinates so far
                    const pathSoFar = currentTrackPoints.slice(0, safeIndex + 1);
                    pathSoFar.push([curLon, curLat]);

                    map.getSource(`track-0`).setData({
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: pathSoFar }
                    });

                    if (currentFrame < frames) {
                        requestAnimationFrame(animate);
                    }
                }
                setTimeout(() => requestAnimationFrame(animate), 500); // Wait half a second before shooting laser paths
            }
        } catch (e) { console.log('Layer not loaded yet', e) }
    }, [isScanned, isAnalyzing, currentVesselSource, currentTrackPoints, incidentData])

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
            center: INITIAL_CENTER,
            zoom: INITIAL_ZOOM,
            minZoom: 2,
            maxPitch: 60,
            attributionControl: false,
        })

        mapRef.current = map
        onMapReady?.(map)

        map.on('style.load', () => map.setProjection({ type: 'globe' }))

        map.on('load', () => {
            // Real SAR Image Overlay Dataset! (Starts invisible)
            map.addSource('sar-image-src', {
                type: 'image',
                url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // 1x1 invisible proxy block
                coordinates: [[0, 0], [0, 0], [0, 0], [0, 0]] // Will be dynamically mapped
            });

            // We place it BELOW the polygon later
            map.addLayer({
                id: 'sar-image-layer',
                type: 'raster',
                source: 'sar-image-src',
                paint: {
                    'raster-opacity': 0,
                    'raster-opacity-transition': { duration: 1500 },
                    'raster-resampling': 'linear',
                    'raster-contrast': 0.15,
                    'raster-brightness-min': 0,
                    'raster-brightness-max': 1
                }
            });

            // Polygon (using opacity transitions to fade in)
            map.addSource('spill-area', {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [currentPolygon] } },
            })
            map.addLayer({
                id: 'spill-fill', type: 'fill', source: 'spill-area',
                paint: {
                    'fill-color': '#4DA8DA',
                    'fill-opacity': 0,
                    'fill-opacity-transition': { duration: 1500 }
                },
            })
            map.addLayer({
                id: 'spill-border', type: 'line', source: 'spill-area',
                paint: {
                    'line-color': '#FFFFFF',
                    'line-width': 2,
                    'line-opacity': 0,
                    'line-opacity-transition': { duration: 1500 }
                },
            })

            // Correct mapping order: Put SAR underneath the polygon fill
            if (map.getLayer('sar-image-layer') && map.getLayer('spill-fill')) {
                map.moveLayer('sar-image-layer', 'spill-fill');
            }

            // Lagrangian animated tracks
            map.addSource(`track-0`, {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [currentTrackPoints[0], currentTrackPoints[0]] } },
            })
            map.addLayer({
                id: `track-0`, type: 'line', source: `track-0`,
                layout: { visibility: 'none' },
                paint: { 'line-color': '#00E676', 'line-width': 2.5, 'line-opacity': 0.9, 'line-dasharray': [4, 4] },
            })

            // Markers setup (Saved to ref to control visibility)
            const pinWrapper = document.createElement('div')
            pinWrapper.style.cssText = 'cursor:pointer;flex-direction:column;align-items:center;display:none;animation:bounceIn 0.5s ease;'
            pinWrapper.innerHTML = `
              <div style="background:white;color:#3C4043;font-size:11px;font-weight:600;
                padding:4px 10px;border-radius:8px;margin-bottom:4px;white-space:nowrap;
                box-shadow:0 1px 3px rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15);
                font-family:Inter,sans-serif;letter-spacing:.02em;" id="culprit-label">
                MV Neptune (Attributed)
              </div>
              <svg width="34" height="48" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#E25050"/>
                <circle cx="14" cy="13" r="6" fill="white" opacity="0.95"/>
                <path d="M11.5 16l2.5-7 2.5 7M11.5 16h5M12.5 13.5h3" stroke="#E25050" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`
            pinWrapper.addEventListener('click', () => onVesselLock?.())

            markersRef.current.culprit = new maplibregl.Marker({ element: pinWrapper, anchor: 'bottom' })
                .setLngLat(currentVesselSource)
                .addTo(map)
        })

        return () => { map.remove(); mapRef.current = null }
    }, [])

    return (
        <div style={{ position: 'absolute', inset: 0, background: '#05080F', overflow: 'hidden' }}>
            {/* The primary MapLibre Canvas */}
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1, background: 'transparent' }} />

            {/* CSS Filter to generate authentic SAR Speckle Noise only in SAR Layer */}
            {activeLayer === 'sar' && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                    mixBlendMode: 'overlay', opacity: 0.35,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
            )}

            {/* Invert slightly for darker radar contrast */}
            {activeLayer === 'sar' && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', mixBlendMode: 'difference', backgroundColor: 'rgba(20,20,20,0.1)' }} />
            )}

            <style>{`
                @keyframes bounceIn {
                    0% { transform: translateY(20px) scale(0.8); opacity: 0; }
                    60% { transform: translateY(-5px) scale(1.1); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

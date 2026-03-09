import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'
import heroBackground from '../assets/bg-dinsos.png'

const BOYOLALI_CENTER = [-7.5299, 110.5955]

function FlyAndPopup({ desaGeojson, desaTarget, jumlahPPKSByKecamatan, onHighlight }) {
  const map = useMap()

  useEffect(() => {
    if (!desaGeojson || !desaTarget) return
    const feature = desaGeojson.features.find((f) => {
      const nama = f.properties?.NAME_4 || ''
      return nama.toLowerCase() === desaTarget.toLowerCase()
    })
    if (!feature) return
    const layer = L.geoJSON(feature)
    const bounds = layer.getBounds()
    const center = bounds.getCenter()
    map.flyTo(center, 13, { duration: 1.5 })
    setTimeout(() => {
      const namaDesa = feature.properties?.NAME_4 || 'Desa'
      const kecamatan = feature.properties?.NAME_3 || 'Kecamatan'
      const jumlah = jumlahPPKSByKecamatan[kecamatan] ?? 0
      L.popup()
        .setLatLng(center)
        .setContent(`
          <strong>Desa:</strong> ${namaDesa} <br/>
          <strong>Kecamatan:</strong> ${kecamatan} <br/>
          <strong>Jumlah PPKS:</strong> ${jumlah}
        `)
        .openOn(map)
      onHighlight(feature)
    }, 1800)
  }, [desaTarget, desaGeojson, map, jumlahPPKSByKecamatan, onHighlight])

  return null
}

function HighlightLayer({ feature, onLayerReady }) {
  const map = useMap()
  useEffect(() => {
    if (!feature) return
    const layer = L.geoJSON(feature, {
      style: {
        color: '#facc15',
        weight: 3.5,
        fillColor: '#facc15',
        fillOpacity: 0.25,
        dashArray: '6 4',
      },
    }).addTo(map)
    onLayerReady(layer)
    return () => { map.removeLayer(layer) }
  }, [feature, map, onLayerReady])
  return null
}

function FlyToSearch({ data, searchTerm }) {
  const map = useMap()
  useEffect(() => {
    if (!data || !searchTerm) return
    const filtered = data.features.filter((feature) => {
      const nama = feature.properties?.NAME_4 || feature.properties?.NAME_3 || feature.properties?.name || ''
      return nama.toLowerCase().includes(searchTerm.toLowerCase())
    })
    if (filtered.length > 0) {
      const layer = L.geoJSON({ type: 'FeatureCollection', features: filtered })
      map.flyToBounds(layer.getBounds(), { duration: 1.5, padding: [20, 20] })
    }
  }, [data, searchTerm, map])
  return null
}

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)
  const [searchKec, setSearchKec] = useState('')
  const [desaTarget, setDesaTarget] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightFeature, setHighlightFeature] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const highlightLayerRef = useRef(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('search') || '').trim()
  const mapRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadGeojson = async () => {
      try {
        let res = await fetch('/boyolali-desa.geojson')
        if (!res.ok) res = await fetch('/data/boyolali-desa.geojson')
        const data = await res.json()
        setDesaGeojson(data)
      } catch (err) {
        console.error('Gagal memuat GeoJSON:', err)
        setDesaGeojson(null)
      }
    }
    loadGeojson()
  }, [])

  useEffect(() => {
    if (!desaGeojson || !mapRef.current) return
    const geoLayer = L.geoJSON(desaGeojson)
    mapRef.current.fitBounds(geoLayer.getBounds())
  }, [desaGeojson])

  const kecamatanDariGeoJSON = desaGeojson
    ? Array.from(new Set(desaGeojson.features.map(f => f.properties?.NAME_3)))
    : []

  const desaDariGeoJSON = desaGeojson
    ? desaGeojson.features
        .map(f => ({ nama: f.properties?.NAME_4 || '', kecamatan: f.properties?.NAME_3 || '' }))
        .filter(d => d.nama)
    : []

  const jumlahPPKSByKecamatan = {}
  kecamatanDariGeoJSON.forEach(kec => { jumlahPPKSByKecamatan[kec] = 0 })

  const totalPPKS = Object.values(jumlahPPKSByKecamatan).reduce((a, b) => a + b, 0)

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchKec(val)
    setDesaTarget(null)
    setHighlightFeature(null)
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return }
    const matchDesa = desaDariGeoJSON.filter(d => d.nama.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
    setSuggestions(matchDesa)
    setShowSuggestions(matchDesa.length > 0)
  }

  const handleSelectDesa = (desa) => {
    setSearchKec(desa.nama)
    setDesaTarget(desa.nama)
    setHighlightFeature(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleReset = () => {
    setSearchKec('')
    setDesaTarget(null)
    setHighlightFeature(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const filteredKecamatan = kecamatanDariGeoJSON.filter(kec =>
    kec.toLowerCase().includes(searchKec.toLowerCase())
  )

  return (
    <section
      aria-labelledby="ppks-heading"
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '80px 0 40px' : '72px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 0, pointerEvents: 'none' }} />

      <div className="section-inner" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <header className="section-header">
          <h2 id="ppks-heading" className="section-title">
            PETA SEBARAN DAFTAR PPKS KAB. BOYOLALI
          </h2>
        </header>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 20,
          alignItems: 'stretch',
          padding: isMobile ? '0 12px' : '0 24px',
          boxSizing: 'border-box',
          width: '100%',
        }}>

          {/* ── PETA ── */}
          <div style={{
            borderRadius: '16px',
            background: 'radial-gradient(circle at top left, rgba(79,141,253,0.28), transparent 60%), rgba(4,18,37,0.98)',
            border: '1px solid rgba(137,199,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            flex: isMobile ? 'none' : '1 1 0',
            width: '100%',
            minWidth: 0,
          }}>
            <MapContainer
              center={BOYOLALI_CENTER}
              zoom={11}
              scrollWheelZoom={false}
              style={{
                width: '100%',
                height: isMobile ? '60vw' : '530px',
                minHeight: isMobile ? '240px' : '530px',
                display: 'block',
              }}
              whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {desaGeojson && (
                <>
                  <FlyToSearch data={desaGeojson} searchTerm={searchTerm} />
                  <FlyAndPopup
                    desaGeojson={desaGeojson}
                    desaTarget={desaTarget}
                    jumlahPPKSByKecamatan={jumlahPPKSByKecamatan}
                    onHighlight={(feature) => setHighlightFeature(feature)}
                  />
                  {highlightFeature && (
                    <HighlightLayer
                      feature={highlightFeature}
                      onLayerReady={(layer) => { highlightLayerRef.current = layer }}
                    />
                  )}
                  <GeoJSON
                    data={{
                      ...desaGeojson,
                      features: !searchTerm
                        ? desaGeojson.features
                        : desaGeojson.features.filter((f) => {
                            const nama = f.properties?.NAME_4 ?? f.properties?.NAME_3 ?? f.properties?.WADMKC ?? f.properties?.NAMOBJ ?? f.properties?.NAME ?? ''
                            return nama.toLowerCase().includes(searchTerm.toLowerCase())
                          }),
                    }}
                    style={() => ({ color: '#0c6624', weight: 1.5, fillColor: '#25d63f', fillOpacity: 0.6 })}
                    onEachFeature={(_feature, layer) => {
                      const namaDesa = _feature.properties?.NAME_4 || 'Desa'
                      const kecamatan = _feature.properties?.NAME_3 || 'Kecamatan'
                      const jumlah = jumlahPPKSByKecamatan[kecamatan] ?? 0
                      layer.bindPopup(`
                        <strong>Desa:</strong> ${namaDesa} <br/>
                        <strong>Kecamatan:</strong> ${kecamatan} <br/>
                        <strong>Jumlah PPKS:</strong> ${jumlah}
                      `)
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {/* ── TABEL ── */}
          <aside
            aria-label="Tabel data PPKS"
            style={{
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.30)',
              color: '#ffffff',
              padding: '12px 10px 10px',
              width: isMobile ? '100%' : '270px',
              flexShrink: 0,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 'auto' : '530px',  // ← tambah ini
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 8, flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                Data Wilayah per Kecamatan
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
                Total PPKS: <strong>{totalPPKS.toLocaleString('id-ID')}</strong> orang
              </p>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: 10, flexShrink: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(0,0,0,0.42)',
                borderRadius: showSuggestions ? '10px 10px 0 0' : '10px',
                padding: '7px 12px', gap: 8,
                border: showSuggestions ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari kecamatan / desa..."
                  value={searchKec}
                  onChange={handleSearchChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', color: '#fff', fontSize: '0.82rem', width: '100%' }}
                />
                {searchKec && (
                  <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', lineHeight: 1, flexShrink: 0 }}>✕</button>
                )}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {showSuggestions && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'rgba(20,25,38,0.97)',
                  border: '1px solid rgba(255,255,255,0.15)', borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                  zIndex: 999, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  <div style={{ padding: '5px 12px 3px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Desa — klik untuk ke peta
                  </div>
                  {suggestions.map((d, i) => (
                    <div key={i} onMouseDown={() => handleSelectDesa(d)}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,141,253,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500 }}>📍 {d.nama}</span>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>Kec. {d.kecamatan}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabel scroll */}
            <div style={{ flex: '1 1 0', overflowY: 'auto', minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ border: '1px solid rgba(255,255,255,0.12)', padding: '6px 10px', background: 'rgba(30,35,50,0.95)', color: 'rgba(255,255,255,0.6)', textAlign: 'left', fontWeight: 600 }}>Kecamatan</th>
                    <th style={{ border: '1px solid rgba(255,255,255,0.12)', padding: '6px 10px', background: 'rgba(30,35,50,0.95)', color: 'rgba(255,255,255,0.6)', textAlign: 'right', fontWeight: 600 }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKecamatan.length > 0 ? (
                    filteredKecamatan.map((kec, idx) => (
                      <tr key={idx}
                        style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)'}>
                        <td style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '6px 10px', color: 'rgba(255,255,255,0.85)' }}>{kec}</td>
                        <td style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '6px 10px', color: 'rgba(255,255,255,0.85)', textAlign: 'right' }}>{jumlahPPKSByKecamatan[kec]}</td>
                      </tr>
                    ))
                  ) : kecamatanDariGeoJSON.length === 0 ? (
                    <tr><td colSpan="2" style={{ textAlign: 'center', padding: '14px 10px', color: 'rgba(255,255,255,0.4)' }}>Memuat data...</td></tr>
                  ) : (
                    <tr><td colSpan="2" style={{ textAlign: 'center', padding: '14px 10px', color: 'rgba(255,255,255,0.4)' }}>Kecamatan tidak ditemukan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </aside>

        </div>
      </div>
    </section>
  )
}

export default PPKSMapPage
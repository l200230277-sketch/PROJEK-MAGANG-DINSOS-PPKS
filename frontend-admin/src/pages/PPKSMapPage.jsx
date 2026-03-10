import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'
import heroBackground from '../assets/bg-dinsos.jpeg'

const BOYOLALI_CENTER = [-7.5299, 110.5955]

const JENIS_PPKS = [
  'Anak Terlantar',
  'Lansia Terlantar',
  'Disabilitas',
  'Fakir Miskin',
  'Anak Jalanan',
  'Korban NAPZA',
  'Gelandangan',
  'Pengemis',
]

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
    map.flyToBounds(bounds, { duration: 1.5, padding: [40, 40] })
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

function GeoJSONWithClick({ data, jumlahPPKSByKecamatan, onFeatureClick }) {
  const map = useMap()

  return (
    <GeoJSON
      key={data?.features?.length}
      data={data}
      style={() => ({
        color: '#0c6624',
        weight: 1.5,
        fillColor: '#25d63f',
        fillOpacity: 0.6,
      })}
      onEachFeature={(_feature, layer) => {
        const namaDesa = _feature.properties?.NAME_4 || 'Desa'
        const kecamatan = _feature.properties?.NAME_3 || 'Kecamatan'

        layer.bindTooltip(
          `<span style="font-size:0.8rem"><strong>${namaDesa}</strong><br/>Kec. ${kecamatan}</span>`,
          { sticky: true, direction: 'top', offset: [0, -4] }
        )

        layer.on('mouseover', () => { layer.setStyle({ weight: 2.5, fillOpacity: 0.8 }); layer.bringToFront() })
        layer.on('mouseout', () => { layer.setStyle({ weight: 1.5, fillOpacity: 0.6 }) })
        layer.on('click', () => { onFeatureClick(_feature, map, jumlahPPKSByKecamatan) })
      }}
    />
  )
}

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)
  const [searchKec, setSearchKec] = useState('')
  const [desaTarget, setDesaTarget] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightFeature, setHighlightFeature] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const [selectedKecamatan, setSelectedKecamatan] = useState(null)  // ← BARU
  const highlightLayerRef = useRef(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('search') || '').trim()
  const mapRef = useRef(null)
  const inputRef = useRef(null)

  // data detail PPKS per kecamatan — isi sesuai data nyata
  const dataPPKSDetail = {}

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

  const handleFeatureClick = (feature, map, ppksData) => {
    const namaDesa = feature.properties?.NAME_4 || 'Desa'
    const kecamatan = feature.properties?.NAME_3 || 'Kecamatan'
    const jumlah = ppksData[kecamatan] ?? 0

    setHighlightFeature(feature)
    setSearchKec(namaDesa)
    setDesaTarget(null)
    setSuggestions([])
    setShowSuggestions(false)

    const geoLayer = L.geoJSON(feature)
    const bounds = geoLayer.getBounds()
    const center = bounds.getCenter()
    map.flyToBounds(bounds, { duration: 1.2, padding: [40, 40] })

    setTimeout(() => {
      L.popup()
        .setLatLng(center)
        .setContent(`
          <strong>Desa:</strong> ${namaDesa} <br/>
          <strong>Kecamatan:</strong> ${kecamatan} <br/>
          <strong>Jumlah PPKS:</strong>
          <span
            class="jumlah-link"
            style="color:#0c6624;font-weight:bold;cursor:pointer;text-decoration:underline;">
            ${jumlah}
          </span>
        `)
        .openOn(map)

      // klik angka jumlah di popup → buka modal detail kecamatan
      setTimeout(() => {
        const btn = document.querySelector('.jumlah-link')
        if (btn) btn.onclick = () => setSelectedKecamatan(kecamatan)
      }, 100)
    }, 1300)
  }

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
      className={`ppksmap-section${isMobile ? ' is-mobile' : ''}`}
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="ppksmap-overlay" />

      {/* ── MODAL DETAIL KECAMATAN ── */}
      {selectedKecamatan && (
        <div
          className="ppks-detail-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedKecamatan(null) }}
        >
          <div className="ppks-detail-card">
            <div className="ppks-detail-header">
              <h3>Detail PPKS Kecamatan {selectedKecamatan}</h3>
              <button onClick={() => setSelectedKecamatan(null)}>✕</button>
            </div>
            <div className="ppks-table-scroll">
              <table className="ppks-detail-table">
                <thead>
                  <tr>
                    <th>Jenis PPKS</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {JENIS_PPKS.map((jenis, i) => (
                    <tr key={i}>
                      <td>{jenis}</td>
                      <td>{dataPPKSDetail[selectedKecamatan]?.[jenis] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className={`section-inner ppksmap-inner`}>
        <header className="section-header">
          <h2 id="ppks-heading" className="section-title">
            PETA SEBARAN DAFTAR PPKS KAB. BOYOLALI
          </h2>
        </header>

        <div className={`ppksmap-layout${isMobile ? ' is-mobile' : ''}`}>

          {/* ── PETA ── */}
          <div className={`ppksmap-map-card${isMobile ? ' is-mobile' : ''}`}>
            <MapContainer
              center={BOYOLALI_CENTER}
              zoom={11}
              scrollWheelZoom={false}
              className={`ppksmap-leaflet${isMobile ? ' is-mobile' : ''}`}
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
                  <GeoJSONWithClick
                    data={{
                      ...desaGeojson,
                      features: !searchTerm
                        ? desaGeojson.features
                        : desaGeojson.features.filter((f) => {
                            const nama = f.properties?.NAME_4 ?? f.properties?.NAME_3 ?? f.properties?.WADMKC ?? f.properties?.NAMOBJ ?? f.properties?.NAME ?? ''
                            return nama.toLowerCase().includes(searchTerm.toLowerCase())
                          }),
                    }}
                    jumlahPPKSByKecamatan={jumlahPPKSByKecamatan}
                    onFeatureClick={handleFeatureClick}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {/* ── TABEL ── */}
          <aside
            aria-label="Tabel data PPKS"
            className={`ppksmap-aside${isMobile ? ' is-mobile' : ''}`}
          >
            <div className="ppksmap-aside-header">
              <h3 className="ppksmap-aside-title">Data Wilayah per Kecamatan</h3>
              <p className="ppksmap-aside-total">
                Total PPKS: <strong>{totalPPKS.toLocaleString('id-ID')}</strong> orang
              </p>
            </div>

            {/* Search bar */}
            <div className="ppksmap-search-wrap">
              <div className={`ppksmap-search-bar${showSuggestions ? ' has-suggestions' : ''}`}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari kecamatan / desa..."
                  value={searchKec}
                  onChange={handleSearchChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="ppksmap-search-input"
                />
                {searchKec && (
                  <button onClick={handleReset} className="ppksmap-search-clear">✕</button>
                )}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {showSuggestions && (
                <div className="ppksmap-suggestions">
                  <div className="ppksmap-suggestions-label">Desa — klik untuk ke peta</div>
                  {suggestions.map((d, i) => (
                    <div
                      key={i}
                      className="ppksmap-suggestion-item"
                      onMouseDown={() => handleSelectDesa(d)}
                    >
                      <span className="ppksmap-suggestion-name">📍 {d.nama}</span>
                      <span className="ppksmap-suggestion-kec">Kec. {d.kecamatan}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabel scroll */}
            <div className="ppksmap-table-scroll">
              <table className="ppksmap-table">
                <thead>
                  <tr>
                    <th>Kecamatan</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKecamatan.length > 0 ? (
                    filteredKecamatan.map((kec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td
                          style={{ cursor: 'pointer', color: '#0f1117', fontWeight: 600}}
                          onClick={() => setSelectedKecamatan(kec)}
                        >
                          {kec}
                        </td>
                        <td>{jumlahPPKSByKecamatan[kec]}</td>
                      </tr>
                    ))
                  ) : kecamatanDariGeoJSON.length === 0 ? (
                    <tr><td colSpan="2" className="ppksmap-table-empty">Memuat data...</td></tr>
                  ) : (
                    <tr><td colSpan="2" className="ppksmap-table-empty">Kecamatan tidak ditemukan</td></tr>
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
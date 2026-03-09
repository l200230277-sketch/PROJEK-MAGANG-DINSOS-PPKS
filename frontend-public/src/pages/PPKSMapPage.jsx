import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import bgDinsos from '../assets/bg-dinsos.png'

const BOYOLALI_CENTER = [-7.5299, 110.5955]

function FlyToSearch({ data, searchTerm }) {
  const map = useMap()

  useEffect(() => {
    if (!data || !searchTerm) return

    const filtered = data.features.filter((feature) => {
      const desa = feature.properties?.NAME_4 || ''
      return desa.toLowerCase().includes(searchTerm.toLowerCase())
    })

    if (filtered.length > 0) {
      const layer = L.geoJSON({
        type: 'FeatureCollection',
        features: filtered,
      })

      map.flyToBounds(layer.getBounds(), {
        duration: 1.5,
        padding: [40, 40],
      })

      setTimeout(() => {
        map.eachLayer((l) => {
          if (l.feature) {
            const desa = l.feature.properties?.NAME_4 || ''
            if (desa.toLowerCase().includes(searchTerm.toLowerCase())) {
              if (l.openPopup) l.openPopup()
            }
          }
        })
      }, 800)
    }
  }, [data, searchTerm, map])

  return null
}

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)
  const [selectedKecamatan, setSelectedKecamatan] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('search') || '').trim()
  const mapRef = useRef(null)

  useEffect(() => {
  if (searchTerm) {
    setSelectedFeature(null)
  }
}, [searchTerm])

  useEffect(() => {
  if (searchTerm) {
    navigate(location.pathname, { replace: true })
  }
}, [])

  useEffect(() => {
    const loadGeojson = async () => {
      try {
        let res = await fetch('/boyolali-desa.geojson')
        if (!res.ok) {
          res = await fetch('/data/boyolali-desa.geojson')
        }
        const data = await res.json()
        setDesaGeojson(data)
      } catch (err) {
        console.error("Gagal memuat GeoJSON:", err)
        setDesaGeojson(null)
      }
    }
    loadGeojson()
  }, [])

  useEffect(() => {
    if (!desaGeojson || !mapRef.current) return
    const geoLayer = L.geoJSON(desaGeojson)

    mapRef.current.fitBounds(geoLayer.getBounds(), {
      padding: [0,  0] 
    })
  }, [desaGeojson])
  const kecamatanDariGeoJSON = desaGeojson
  ? Array.from(new Set(desaGeojson.features.map(f => f.properties?.NAME_3)))
  : []
  const jumlahPPKSByKecamatan = {}
  kecamatanDariGeoJSON.forEach(kec => {
    jumlahPPKSByKecamatan[kec] = 0
  })

  const jenisPPKS = [
    "Anak Terlantar",
    "Lansia Terlantar",
    "Disabilitas",
    "Fakir Miskin",
    "Anak Jalanan",
    "Korban NAPZA",
    "Gelandangan",
    "Pengemis"
  ]

  const dataPPKSDetail = {}
  kecamatanDariGeoJSON.forEach(kec => {
    jumlahPPKSByKecamatan[kec] = 0 
  })
  return (
    <section
      className="section section-alt"
      aria-labelledby="ppks-heading"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: `url(${bgDinsos})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          transform: "scale(1.1)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
      

      <div className="section-inner" style={{ position: "relative", zIndex: 1 }}>
        <header className="section-header">
          <h2 id="ppks-heading" className="section-title">
            PETA SEBARAN DAFTAR PPKS KAB. BOYOLALI
          </h2>
        </header>

        <div className="map-layout">
          {selectedKecamatan && (
  <div className="ppks-detail-overlay">

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
            {jenisPPKS.map((jenis, i) => {
              const jumlah = dataPPKSDetail[selectedKecamatan]?.[jenis] || 0

              return (
                <tr key={i}>
                  <td>{jenis}</td>
                  <td>{jumlah}</td>
                </tr>
              )
            })}
          </tbody>

        </table>
      </div>

    </div>

  </div>
)}
          <div className="map-card">
            <div className="map-surface map-surface--with-leaflet">
              <MapContainer
                center={BOYOLALI_CENTER}
                zoom={11}
                scrollWheelZoom={false}
                className="leaflet-map"
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {desaGeojson && (
                  <>
                    <FlyToSearch data={desaGeojson} searchTerm={searchTerm} />

                    <GeoJSON
                      data={{
                        ...desaGeojson,
                        features: !searchTerm
                          ? desaGeojson.features
                          : desaGeojson.features.filter((f) => {
                              const nama =
                                f.properties?.NAME_4 ??
                                f.properties?.NAME_3 ??
                                f.properties?.WADMKC ??
                                f.properties?.NAMOBJ ??
                                f.properties?.NAME ??
                                ''
                              return nama.toLowerCase().includes(searchTerm.toLowerCase())
                            }),
                      }}
                      style={(feature) => {
                        const desa = feature.properties?.NAME_4?.toLowerCase() || ''

                        const isClicked =
                          selectedFeature &&
                          selectedFeature.properties?.NAME_4 === feature.properties?.NAME_4

                        const isSearchMatch =
                          !selectedFeature &&   // search hanya aktif jika belum klik
                          searchTerm &&
                          desa.includes(searchTerm.toLowerCase())

                        return {
                          color: '#0c6624',
                          weight: (isClicked || isSearchMatch) ? 4 : 0.8,
                          fillColor: '#25d63f',
                          fillOpacity: 0.6,
                        }
                      }}
                      onEachFeature={(feature, layer) => {
                        const namaDesa = feature.properties?.NAME_4 || 'Desa'
                        const kecamatan = feature.properties?.NAME_3 || 'Kecamatan'
                        const jumlah = jumlahPPKSByKecamatan[kecamatan] ?? 0 // ambil jumlah dari tabel
                        layer.bindPopup(`
                          <strong>Desa:</strong> ${namaDesa} <br/>
                          <strong>Kecamatan:</strong> ${kecamatan} <br/>
                          <strong>Jumlah PPKS:</strong> 
                          <a href="http://localhost:5174/login"
                            style="color:#0c6624;font-weight:bold;text-decoration:underline;">
                            ${jumlah}
                          </a>
                        `)
                        layer.on({
                          click: () => {
                            setSelectedFeature(feature)
                          }
                        })
                      }}
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          <aside className="ppks-table-card" aria-label="Tabel data PPKS">
            <div className="ppks-table-header">
              <h3>Data Wilayah per Kecamatan</h3>
              <p>Total Kecamatan {desaGeojson ? new Set(desaGeojson.features.map(f => f.properties?.NAME_3)).size : 0}</p>
            </div>
            <div className="ppks-table-wrapper">
              <table className="ppks-table">
                <thead>
                  <tr>
                    <th>Kecamatan</th>
                  <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {kecamatanDariGeoJSON.length > 0 ? (
                    kecamatanDariGeoJSON.map((kec, idx) => (
                      <tr key={idx}>
                        <td
                          style={{ cursor: "pointer", color: "#0f1117", fontWeight: "600" }}
                          onClick={() => setSelectedKecamatan(kec)}
                        >
                          {kec}
                        </td>
                        <td>{jumlahPPKSByKecamatan[kec]}</td>
                      </tr>
                    )) 
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center' }}>Memuat data...</td>
                    </tr>
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

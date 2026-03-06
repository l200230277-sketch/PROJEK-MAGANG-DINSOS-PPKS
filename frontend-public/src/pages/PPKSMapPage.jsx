import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'
import bgDinsos from '../assets/bg-dinsos.png'

const BOYOLALI_CENTER = [-7.5299, 110.5955]

function FlyToSearch({ data, searchTerm }) {
  const map = useMap()

  useEffect(() => {
    if (!data || !searchTerm) return

    const filtered = data.features.filter((feature) => {
      const nama =
        feature.properties?.NAME_4 ||
        feature.properties?.NAME_3 ||
        feature.properties?.name ||
        ''
      return nama.toLowerCase().includes(searchTerm.toLowerCase())
    })

    if (filtered.length > 0) {
      const layer = L.geoJSON({
        type: 'FeatureCollection',
        features: filtered,
      })
      map.flyToBounds(layer.getBounds(), {
        duration: 1.5,
        padding: [20, 20],
      })
    }
  }, [data, searchTerm, map])

  return null
}

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('search') || '').trim()
  const mapRef = useRef(null)

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

  // Zoom otomatis ke seluruh desa setelah GeoJSON load
  useEffect(() => {
    if (!desaGeojson || !mapRef.current) return
    const geoLayer = L.geoJSON(desaGeojson)
    mapRef.current.fitBounds(geoLayer.getBounds())
  }, [desaGeojson])
  const kecamatanDariGeoJSON = desaGeojson
  ? Array.from(new Set(desaGeojson.features.map(f => f.properties?.NAME_3)))
  : []
  const jumlahPPKSByKecamatan = {}
  kecamatanDariGeoJSON.forEach(kec => {
    jumlahPPKSByKecamatan[kec] = 0 // sementara kosong, nanti diisi Excel
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
                      style={(feature) => ({
                        color: '#0c6624',
                        weight: 1.5,
                        fillColor: '#25d63f',
                        fillOpacity: 0.6,
                      })}
                      onEachFeature={(feature, layer) => {
                        const namaDesa = feature.properties?.NAME_4 || 'Desa'
                        const kecamatan = feature.properties?.NAME_3 || 'Kecamatan'
                        const jumlah = jumlahPPKSByKecamatan[kecamatan] ?? 0 // ambil jumlah dari tabel
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
                        <td>{kec}</td>
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
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'


const BOYOLALI_CENTER = [-7.5299, 110.5955]

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('search') || '').trim()

useEffect(() => {
  fetch('/boyolali-desa.geojson')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        console.log(data.features[0].properties)
        setDesaGeojson(data)
      }
    })
    .catch(() => {
      setDesaGeojson(null)
    })
}, [])
function FlyToSearch({ data, searchTerm }) {
  const map = useMap()

  useEffect(() => {
    if (!data || !searchTerm) return

    const filtered = data.features.filter((feature) => {
      const nama =
        feature.properties?.WADMKC ??
        feature.properties?.NAMOBJ ??
        feature.properties?.KECAMATAN ??
        feature.properties?.Kecamatan ??
        feature.properties?.NAME ??
        ''

      return nama.toLowerCase().includes(searchTerm.toLowerCase())
    })

    console.log("jumlah cocok (helper):", filtered.length)

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

  return (
    <section className="section section-alt" aria-labelledby="ppks-heading">
      <div className="section-inner">
        <header className="section-header">
          <h2 id="ppks-heading" className="section-title">
            PETA DAFTAR PPKS KAB. BOYOLALI
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
              >
                <TileLayer
                  attribution="&copy; Kontributor OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {desaGeojson && (
                  <FlyToSearch data={desaGeojson} searchTerm={searchTerm} />
                )}
                {desaGeojson && (
                  <GeoJSON
                    data={{
                      ...desaGeojson,
                      features: !searchTerm
                       ? desaGeojson.features
                       : desaGeojson.features.filter((feature) => {
                          const nama =
                            feature.properties?.WADMKC ??
                            feature.properties?.NAMOBJ ??
                            feature.properties?.KECAMATAN ??
                            feature.properties?.Kecamatan ??
                            feature.properties?.NAME ??
                            ''


                          return nama.toLowerCase().includes(searchTerm.toLowerCase())
                         }),
                    }}
                    style={() => ({
                      color: '#0c6624',
                      weight: 0.8,
                      fillColor: '#25d63f',
                      fillOpacity: 0.8,
                    })}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <aside className="ppks-table-card" aria-label="Tabel data PPKS">
            <div className="ppks-table-header">
              <h3>Desa</h3>
              <p>Kecamatan</p>
            </div>
            <div className="ppks-table-wrapper">
              <table className="ppks-table">
                <thead>
                  <tr>
                    <th>Jenis</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 26 }).map((_, index) => (
                    <tr key={index}>
                      <td>Jenis {index + 1}</td>
                      <td>0</td>
                    </tr>
                  ))}
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


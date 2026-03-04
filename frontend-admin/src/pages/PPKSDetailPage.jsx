import { MapContainer, Polygon, Popup, TileLayer } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'

const BOYOLALI_CENTER = [-7.5299, 110.5955]

// Contoh satu desa dengan popup
const DESA_GUWO_POLYGON = [
  [-7.47, 110.7],
  [-7.45, 110.72],
  [-7.46, 110.74],
  [-7.48, 110.72],
]

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function PPKSDetailPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)
  const query = useQuery()
  const searchDesa = query.get('desa')?.toLowerCase() || ''

  useEffect(() => {
    fetch('/boyolali-desa.geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDesaGeojson(data)
      })
      .catch(() => setDesaGeojson(null))
  }, [])
  return (
    <section className="section hero-map-section" aria-labelledby="ppks-detail-heading">
      <div className="hero-map-overlay" />
      <div className="hero-map-content">
        <header className="section-header section-header--light">
          <p className="section-kicker">Detail Sebaran</p>
          <h2 id="ppks-detail-heading" className="section-title">
            PETA DAFTAR PPKS KAB. BOYOLALI
          </h2>
        </header>

        <div className="hero-map-layout">
          <div className="hero-map-panel">
            <div className="hero-map-window">
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
                {desaGeojson &&
                  desaGeojson.features?.map((feature, index) => {
                    const coords = feature.geometry.coordinates
                    const namaDesa =
                      (feature.properties?.desa || feature.properties?.DESA || '').toLowerCase()

                    const rings = coords[0]
                    const latlngs = rings.map(([lng, lat]) => [lat, lng])

                    const isMatch = searchDesa && namaDesa.includes(searchDesa)
                    const options = {
                      color: isMatch ? '#ffffff' : '#0c6624',
                      weight: isMatch ? 2 : 0.8,
                      fillColor: '#25d63f',
                      fillOpacity: 0.85,
                    }

                    /*const bounds = L.latLngBounds(latlngs)
                    if (isMatch) {
                      // center map on first matching desa
                      setTimeout(() => {
                        const map = L.DomUtil.getFeatureGroup
                        // we cannot access map instance directly here, so only style highlight;
                        // for lebih presisi nanti bisa pakai useMap di komponen terpisah.
                      }, 0)
                    }*/

                    return (
                      <Polygon key={index} positions={latlngs} pathOptions={options}>
                        <Popup>
                          <div className="ppks-popup">
                            <p className="ppks-popup-title">
                              {feature.properties?.desa || feature.properties?.DESA || 'Desa'}
                            </p>
                            <p className="ppks-popup-sub">
                              {feature.properties?.kecamatan ||
                                feature.properties?.KECAMATAN ||
                                'Kecamatan'}
                            </p>
                          </div>
                        </Popup>
                      </Polygon>
                    )
                  })}
                <Polygon
                  positions={DESA_GUWO_POLYGON}
                  pathOptions={{ color: '#ffffff', fillColor: '#19b341', fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div className="ppks-popup">
                      <p className="ppks-popup-title">Des. Guwo</p>
                      <p className="ppks-popup-sub">Kec. Wonosamodro</p>
                      <a href="#" className="ppks-popup-link">
                        9 Orang
                      </a>
                    </div>
                  </Popup>
                </Polygon>
              </MapContainer>
            </div>
          </div>

          <aside className="hero-map-sidebar">
            <h3 className="hero-map-sidebar-title">Data</h3>
            <div className="ppks-detail-panel">
              <p className="ppks-detail-location">
                <strong>Des. Guwo</strong>
                <br />
                Kec. Wonosamodro
              </p>
              <table className="ppks-table">
                <thead>
                  <tr>
                    <th>Jenis</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Contoh</td>
                    <td>9</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default PPKSDetailPage


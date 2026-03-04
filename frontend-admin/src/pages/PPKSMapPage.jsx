import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useState } from 'react'

const BOYOLALI_CENTER = [-7.5299, 110.5955]

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)

  useEffect(() => {
    fetch('/boyolali-desa.geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDesaGeojson(data)
      })
      .catch(() => {
        setDesaGeojson(null)
      })
  }, [])
  return (
    <section className="section section-alt" aria-labelledby="ppks-heading">
      <div className="section-inner">
        <header className="section-header">
          <p className="section-kicker">Peta Sebaran</p>
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
                  <GeoJSON
                    data={desaGeojson}
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
              <h3>Data</h3>
              <p>Total 1000 orang</p>
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
                  {Array.from({ length: 22 }).map((_, index) => (
                    <tr key={index}>
                      <td>Kecamatan {index + 1}</td>
                      <td>0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="ppks-table-note">
              Tabel ini nantinya akan terisi otomatis dari file Excel yang diunggah admin
              (import data PPKS per kecamatan).
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default PPKSMapPage


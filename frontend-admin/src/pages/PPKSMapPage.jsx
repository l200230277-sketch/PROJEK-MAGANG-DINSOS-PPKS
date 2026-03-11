import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'
import * as XLSX from 'xlsx'
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

// ── DATA DUMMY (salin dari DataWarga.jsx — nanti ganti fetch API) ─────────────
const ALL_WARGA = [
  { id: 1,  nama: "Budi Santoso menawan rupawan sekali", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Sokawoya rt 06/ rw 03, canden, sambi, boyolali" },
  { id: 2,  nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 3,  nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 4,  nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 5,  nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 6,  nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 7,  nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 8,  nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 9,  nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 10, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 11, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 12, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 13, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 14, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 15, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 16, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 17, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 18, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 19, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 20, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 21, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 22, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
  { id: 23, nama: "Budi Santoso", nik: "3312345678900001", jk: "Laki-laki", kode_pmks: "PMKS01", jenis_pmks: "Fakir Miskin",     kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Mawar No 10" },
  { id: 24, nama: "Siti Aminah",  nik: "3312345678900002", jk: "Perempuan", kode_pmks: "PMKS02", jenis_pmks: "Lansia Terlantar", kecamatan: "Sambi", desa: "Canden", alamat: "Jl. Melati No 5" },
]

// ── MODAL DATA WARGA — style persis DataWarga.jsx ─────────────────────────────
function ModalDataWarga({ desa, onClose }) {
  const [search, setSearch] = useState('')

  const filtered = ALL_WARGA
    .filter(d => !desa || d.desa.toLowerCase() === desa.toLowerCase())
    .filter(d =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.nik.includes(search) ||
      d.alamat.toLowerCase().includes(search.toLowerCase()) ||
      d.jenis_pmks.toLowerCase().includes(search.toLowerCase())
    )

  const downloadExcel = () => {
    const worksheetData = filtered.map((d) => ({
      ID: d.id,
      Nama: d.nama,
      NIK: d.nik,
      'Jenis Kelamin': d.jk,
      'Kode PMKS': d.kode_pmks,
      'Jenis PMKS': d.jenis_pmks,
      Kecamatan: d.kecamatan,
      Desa: d.desa,
      Alamat: d.alamat,
    }))
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Warga')
    XLSX.writeFile(workbook, `data_warga_${desa || 'semua'}.xlsx`)
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5px 40px',
      }}
    >
      {/* Background blur — sama persis DataWarga */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(4px)', transform: 'scale(1.1)', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)', zIndex: 1,
      }} />

      {/* Content wrapper — sama persis DataWarga */}
      <div style={{
        position: 'relative', zIndex: 2,
        color: '#fbfeff', textAlign: 'center',
        width: '100%', maxWidth: '1100px',
      }}>
        {/* Tombol tutup */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#182229', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600,
            }}
          >✕ Tutup</button>
        </div>

        <h2 style={{ position: 'relative', top: '0px', marginBottom: '12px' }}>
          Data Warga Desa {desa}
        </h2>

        {/* Search + Download */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search nama / NIK / alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px', borderRadius: '6px', border: 'none', outline: 'none',
              width: '230px', maxWidth: '100%',
              backgroundColor: '#182229', color: '#fff',
            }}
          />
          <button
            onClick={downloadExcel}
            style={{
              padding: '10px', background: '#182229', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}
          >Download</button>
        </div>

        {/* Tabel scroll */}
        <div style={{
          maxHeight: '500px', overflowY: 'auto', overflowX: 'auto',
          marginTop: '10px', borderRadius: '8px',
        }}>
          <table style={{
            width: '100%', color: 'black', borderCollapse: 'collapse',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: '12px',
          }}>
            <thead style={{
              background: '#6f7578', color: 'white',
              position: 'sticky', top: 0, borderTop: '2px solid #555',
            }}>
              <tr>
                {['ID','Nama','NIK','Jenis Kelamin','Kode PMKS','Jenis PMKS','Kecamatan','Desa','Alamat'].map(h => (
                  <th key={h} style={{ border: '1px solid #555', padding: '8px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: '#acb0b3' }}>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ padding: '1.5rem', textAlign: 'center', color: '#333' }}>Data tidak ditemukan.</td></tr>
              ) : filtered.map((d, i) => (
                <tr
                  key={d.id}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#9aa0a3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#acb0b3'}
                >
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.nama}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.nik}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.jk}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.kode_pmks}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.jenis_pmks}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.kecamatan}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.desa}</td>
                  <td style={{ border: '1px solid #555', padding: '8px' }}>{d.alamat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── KOMPONEN PETA ─────────────────────────────────────────────────────────────

// ✅ FIX: tambah prop onJumlahClick supaya hyperlink di popup bisa buka modal
function FlyAndPopup({ desaGeojson, desaTarget, jumlahPPKSByDesa, onHighlight, onJumlahClick }) {
  const map = useMap()
  useEffect(() => {
    if (!desaGeojson || !desaTarget) return
    const feature = desaGeojson.features.find((f) =>
      (f.properties?.NAME_4 || '').toLowerCase() === desaTarget.toLowerCase()
    )
    if (!feature) return
    const layer = L.geoJSON(feature)
    const bounds = layer.getBounds()
    const center = bounds.getCenter()
    map.flyToBounds(bounds, { duration: 1.5, padding: [40, 40] })
    setTimeout(() => {
      const namaDesa = feature.properties?.NAME_4 || 'Desa'
      const kecamatan = feature.properties?.NAME_3 || 'Kecamatan'
      const jumlah = jumlahPPKSByDesa[namaDesa] ?? 0
      L.popup()
        .setLatLng(center)
        .setContent(`
          <strong>Desa:</strong> ${namaDesa}<br/>
          <strong>Kecamatan:</strong> ${kecamatan}<br/>
          <strong>Jumlah PPKS:</strong>
          <span class="jumlah-link"
            style="color:#0c6624;font-weight:bold;cursor:pointer;text-decoration:underline;">
            ${jumlah} orang
          </span>
        `)
        .openOn(map)
      onHighlight(feature)

      // ✅ FIX: pasang onclick ke hyperlink setelah popup render
      setTimeout(() => {
        const btn = document.querySelector('.jumlah-link')
        if (btn) {
          btn.onclick = () => {
            map.closePopup()
            onJumlahClick(namaDesa)
          }
        }
      }, 300)
    }, 1800)
  }, [desaTarget, desaGeojson, map, jumlahPPKSByDesa, onHighlight, onJumlahClick])
  return null
}

function HighlightLayer({ feature, onLayerReady }) {
  const map = useMap()
  useEffect(() => {
    if (!feature) return
    const layer = L.geoJSON(feature, {
      style: { color: '#facc15', weight: 3.5, fillColor: '#facc15', fillOpacity: 0.25, dashArray: '6 4' },
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
    const filtered = data.features.filter((f) => {
      const nama = f.properties?.NAME_4 || f.properties?.NAME_3 || f.properties?.name || ''
      return nama.toLowerCase().includes(searchTerm.toLowerCase())
    })
    if (filtered.length > 0) {
      const layer = L.geoJSON({ type: 'FeatureCollection', features: filtered })
      map.flyToBounds(layer.getBounds(), { duration: 1.5, padding: [20, 20] })
    }
  }, [data, searchTerm, map])
  return null
}

function GeoJSONWithClick({ data, jumlahPPKSByDesa, onFeatureClick }) {
  const map = useMap()
  return (
    <GeoJSON
      key={data?.features?.length}
      data={data}
      style={() => ({ color: '#0c6624', weight: 1.5, fillColor: '#25d63f', fillOpacity: 0.6 })}
      onEachFeature={(_feature, layer) => {
        const namaDesa = _feature.properties?.NAME_4 || 'Desa'
        const kecamatan = _feature.properties?.NAME_3 || 'Kecamatan'
        layer.bindTooltip(
          `<span style="font-size:0.8rem"><strong>${namaDesa}</strong><br/>Kec. ${kecamatan}</span>`,
          { sticky: true, direction: 'top', offset: [0, -4] }
        )
        layer.on('mouseover', () => { layer.setStyle({ weight: 2.5, fillOpacity: 0.8 }); layer.bringToFront() })
        layer.on('mouseout', () => { layer.setStyle({ weight: 1.5, fillOpacity: 0.6 }) })
        layer.on('click', () => { onFeatureClick(_feature, map, jumlahPPKSByDesa) })
      }}
    />
  )
}

// ── HALAMAN UTAMA ─────────────────────────────────────────────────────────────

function PPKSMapPage() {
  const [desaGeojson, setDesaGeojson] = useState(null)
  const [searchKec, setSearchKec] = useState('')
  const [desaTarget, setDesaTarget] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightFeature, setHighlightFeature] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const [selectedKecamatan, setSelectedKecamatan] = useState(null)
  const [modalDesaWarga, setModalDesaWarga] = useState(null)

  const highlightLayerRef = useRef(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const searchTerm = (queryParams.get('search') || '').trim()
  const mapRef = useRef(null)
  const inputRef = useRef(null)

  const dataPPKSDetail = {}

  // Hitung jumlah PPKS per desa dari data dummy
  const jumlahPPKSByDesa = {}
  ALL_WARGA.forEach(w => {
    jumlahPPKSByDesa[w.desa] = (jumlahPPKSByDesa[w.desa] || 0) + 1
  })

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

  // Jumlah per kecamatan (untuk tabel aside) — aggregate dari data dummy
  const jumlahPPKSByKecamatan = {}
  kecamatanDariGeoJSON.forEach(kec => { jumlahPPKSByKecamatan[kec] = 0 })
  ALL_WARGA.forEach(w => {
    if (jumlahPPKSByKecamatan[w.kecamatan] !== undefined)
      jumlahPPKSByKecamatan[w.kecamatan] += 1
  })
  const totalPPKS = Object.values(jumlahPPKSByKecamatan).reduce((a, b) => a + b, 0)

  // ── Klik desa di peta ──
  const handleFeatureClick = (feature, map, ppksByDesa) => {
    const namaDesa = feature.properties?.NAME_4 || 'Desa'
    const kecamatan = feature.properties?.NAME_3 || 'Kecamatan'
    const jumlah = ppksByDesa[namaDesa] ?? 0

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
          <strong>Desa:</strong> ${namaDesa}<br/>
          <strong>Kecamatan:</strong> ${kecamatan}<br/>
          <strong>Jumlah PPKS:</strong>
          <span class="jumlah-link"
            style="color:#0c6624;font-weight:bold;cursor:pointer;text-decoration:underline;">
            ${jumlah} orang
          </span>
        `)
        .openOn(map)

      // Klik angka jumlah → buka modal data warga desa
      setTimeout(() => {
        const btn = document.querySelector('.jumlah-link')
        if (btn) {
          btn.onclick = () => {
            map.closePopup()
            setModalDesaWarga(namaDesa)
          }
        }
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

      {/* ── MODAL DATA WARGA ── */}
      {modalDesaWarga && (
        <ModalDataWarga
          desa={modalDesaWarga}
          onClose={() => setModalDesaWarga(null)}
        />
      )}

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
                  {/* ✅ FIX: tambah prop onJumlahClick */}
                  <FlyAndPopup
                    desaGeojson={desaGeojson}
                    desaTarget={desaTarget}
                    jumlahPPKSByDesa={jumlahPPKSByDesa}
                    onHighlight={(feature) => setHighlightFeature(feature)}
                    onJumlahClick={(namaDesa) => setModalDesaWarga(namaDesa)}
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
                    jumlahPPKSByDesa={jumlahPPKSByDesa}
                    onFeatureClick={handleFeatureClick}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {/* ── TABEL KECAMATAN ── */}
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
                    <div key={i} className="ppksmap-suggestion-item" onMouseDown={() => handleSelectDesa(d)}>
                      <span className="ppksmap-suggestion-name">📍 {d.nama}</span>
                      <span className="ppksmap-suggestion-kec">Kec. {d.kecamatan}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                          style={{ cursor: 'pointer', color: '#0f1117', fontWeight: 600 }}
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
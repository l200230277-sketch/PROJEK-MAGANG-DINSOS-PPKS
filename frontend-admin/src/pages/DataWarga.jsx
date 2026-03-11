import bgDinsos from '../assets/bg-dinsos.jpeg'
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import axios from "axios"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function DataWarga() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const desa = params.get("desa")

  const [search, setSearch] = useState("")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const queryParams = new URLSearchParams()
        if (desa) queryParams.append("desa", `eq.${desa}`)
        queryParams.append("order", "id.asc")

        const res = await axios.get(
          `${SUPABASE_URL}/rest/v1/warga?${queryParams.toString()}`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json"
            }
          }
        )
        setData(res.data)
      } catch (err) {
        setError("Gagal mengambil data. Coba refresh halaman.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [desa])

  const filtered = data.filter(d =>
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
      "Jenis Kelamin": d.jk,
      "Kode PMKS": d.kode_pmks,
      "Jenis PMKS": d.jenis_pmks,
      Kecamatan: d.kecamatan,
      Desa: d.desa,
      Alamat: d.alamat
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Warga")
    XLSX.writeFile(workbook, `data_warga_${desa || "semua"}.xlsx`)
  }

  return (
    <section className="datawarga-section">

      <div
        className="datawarga-bg"
        style={{ backgroundImage: `url(${bgDinsos})` }}
      />

      <div className="datawarga-overlay" />

      <div className="datawarga-content">
        <h2 className="datawarga-title">Data Warga Desa {desa}</h2>

        <div className="datawarga-toolbar">
          <input
            type="text"
            placeholder="Search nama / NIK / alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="modal-warga-search"
          />
          <button onClick={downloadExcel} className="modal-warga-download-btn">
            Download
          </button>
        </div>

        {loading && (
          <p className="modal-warga-status modal-warga-loading">⏳ Memuat data...</p>
        )}

        {error && (
          <p className="modal-warga-status modal-warga-error">⚠️ {error}</p>
        )}

        {!loading && !error && (
          <div className="modal-warga-table-wrap">
            <table className="modal-warga-table">
              <thead>
                <tr>
                  {['ID','Nama','NIK','Jenis Kelamin','Kode PMKS','Jenis PMKS','Kecamatan','Desa','Alamat'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="modal-warga-empty">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.nama}</td>
                      <td>{d.nik}</td>
                      <td>{d.jk}</td>
                      <td>{d.kode_pmks}</td>
                      <td>{d.jenis_pmks}</td>
                      <td>{d.kecamatan}</td>
                      <td>{d.desa}</td>
                      <td>{d.alamat}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
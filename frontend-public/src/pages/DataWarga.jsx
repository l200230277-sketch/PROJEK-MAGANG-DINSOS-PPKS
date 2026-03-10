import bgDinsos from '../assets/bg-dinsos.jpeg'
import { useLocation } from "react-router-dom"
import { useState } from "react"
import * as XLSX from "xlsx"


export default function DataWarga() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const desa = params.get("desa")
  const [search, setSearch] = useState("")

  console.log("Desa:", desa)

  const data = [
    {
      id: 1,
      nama: "Budi Santoso menawan rupawan sekali",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Sokawoya rt 06/ rw 03, canden, sambi, boyolali"
    },
    {
      id: 2,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
   {
      id: 3,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 4,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 5,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 6,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 7,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 8,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 9,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 10,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 11,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 12,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 13,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 14,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 15,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 16,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 17,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 18,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 19,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 20,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 21,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 22,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
    {
      id: 23,
      nama: "Budi Santoso",
      nik: "3312345678900001",
      jk: "Laki-laki",
      kode_pmks: "PMKS01",
      jenis_pmks: "Fakir Miskin",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Mawar No 10"
    },
    {
      id: 24,
      nama: "Siti Aminah",
      nik: "3312345678900002",
      jk: "Perempuan",
      kode_pmks: "PMKS02",
      jenis_pmks: "Lansia Terlantar",
      kecamatan: "Sambi",
      desa: "Canden",
      alamat: "Jl. Melati No 5"
    },
  ]

  const filtered = data
    .filter(d => !desa || d.desa === desa)
    .filter(d =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.nik.includes(search) ||
      d.alamat.toLowerCase().includes(search.toLowerCase()) ||
      d.jenis_pmks.toLowerCase().includes(search.toLowerCase()) 
    )

  // 🔽 FUNGSI DOWNLOAD EXCEL
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
    <section style={{ position: "relative", minHeight: "100vh", padding: "5px 40px" }}>

      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgDinsos})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px)",
          transform: "scale(1.1)",
          zIndex: 0
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 1
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, color: "#fbfeff", textAlign: "center" }}>
        <h2
          style={{
            position: "relative",
            top: "20px",
            fontSize: "29px",
          }}
        >
          Data Penerima PPKS Desa {desa}
        </h2>

        {/* 🔽 TOMBOL DOWNLOAD */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
            gap: "10px"
          }}
        >

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search nama / NIK / alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              outline: "none",
              width: "230px",
              maxWidth: "100%",
              backgroundColor: "#182229",
              color: "#fff",
            }}
          />

          {/* DOWNLOAD */}
          <button
            onClick={downloadExcel}
            style={{
              padding: "10px 10px",
              background: "#182229",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Download
          </button>

        </div>
      {/* WRAPPER SCROLL */}
      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          overflowX: "auto",
          marginTop: "10px",
          borderRadius: "8px"
        }}
      >
        <table
          style={{
            width: "100%",
            color: "black",
            borderCollapse: "collapse",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: "12px"
          }}
        >
          <thead
            style={{
              background: "#6f7578",
              color: "white",
              position: "sticky",
              top: 0,
              borderTop: "2px solid #555"
            }}
          >
            <tr style={{ borderTop: "2px solid #555"}}></tr>
              <tr>
                <th style={{ border: "1px solid #555", padding: "8px" }}>ID</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Nama</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>NIK</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Jenis Kelamin</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Kode PMKS</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Jenis PMKS</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Kecamatan</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Desa</th>
                <th style={{ border: "1px solid #555", padding: "8px" }}>Alamat</th>
              </tr>
            </thead>

          <tbody style={{ background: "#acb0b3" }}>
            {filtered.map((d) => (
              <tr 
                key={d.id}
                onMouseEnter={(e) => e.currentTarget.style.background = "#9aa0a3"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#acb0b3"}>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.id}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.nama}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.nik}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.jk}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.kode_pmks}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.jenis_pmks}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.kecamatan}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.desa}</td>
                <td style={{ border: "1px solid #555", padding: "8px" }}>{d.alamat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </section>
  )
}
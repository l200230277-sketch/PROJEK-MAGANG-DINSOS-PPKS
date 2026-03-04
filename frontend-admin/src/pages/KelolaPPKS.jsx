import { useRef, useState } from 'react'
import heroBackground from '../assets/bg-dinsos.png'

const DUMMY_DOCS = [
  {
    id: 1,
    nama: 'DataPPKS_012025.xls',
    ukuran: '12 mb',
    terakhir: '01-02-2025',
    uploader: 'Charles Leclerc',
    email: 'admin1@gmail.com',
    avatar: 'CL',
    avatarColor: '#e74c3c',
  },
  {
    id: 2,
    nama: 'DataPPKS_022025.xls',
    ukuran: '30 mb',
    terakhir: '02-01-2025',
    uploader: 'Go Yoonjung',
    email: 'admin2@gmail.com',
    avatar: 'GY',
    avatarColor: '#3498db',
  },
]

export default function KelolaPPKSPage() {
  const fileInputRef = useRef(null)
  const [docs, setDocs] = useState(DUMMY_DOCS)
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    const allowed = ['.xls', '.xlsx']
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      alert('Hanya file .xls atau .xlsx yang diperbolehkan.')
      return
    }
    const now = new Date()
    const tanggal = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
    const ukuran =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} kb`
        : `${(file.size / (1024 * 1024)).toFixed(1)} mb`
    setDocs((prev) => [
      ...prev,
      {
        id: Date.now(),
        nama: file.name,
        ukuran,
        terakhir: tanggal,
        uploader: 'Admin',
        email: 'admin@dinsos.go.id',
        avatar: 'AD',
        avatarColor: '#27ae60',
      },
    ])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDelete = (id) => {
    if (confirm('Hapus dokumen ini?')) {
      setDocs((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const filtered = docs.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
        className="login-page"
        style={{
            minHeight: '100vh',
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4.5rem',
        }}
    >
        <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.24)',
          zIndex: 0,
        }}
      />
      <div style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '54px' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
          Kelola PPKS
        </h1>
      </div>

      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* ── Area Upload ── */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            borderRadius: '16px',
            border: `2px dashed ${dragOver ? '#4f8dfd' : 'rgba(255,255,255,0.25)'}`,
            background: dragOver ? 'rgba(79,141,253,0.08)' : 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 200ms, background 200ms',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(79,141,253,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4f8dfd"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '0.95rem' }}>
            <span style={{ color: '#e74c3c', fontWeight: 600 }}>Klik disini</span>{' '}
            untuk unggah dokumen data PPKS
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
            format Excel .xls/.xlsx
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* ── Tabel Dokumen ── */}
        <div
          style={{
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.09)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header tabel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                Data PPKS
              </span>
              <span
                style={{
                  background: '#4f8dfd',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '2px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {docs.length} Dokumen
              </span>
            </div>
            {/* Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15,30,45,0.8)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '999px',
                padding: '6px 14px',
                gap: 8,
                minWidth: 180,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '0.85rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Tabel */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {['Nama Dokumen', 'Ukuran Dokumen', 'Terakhir Perbarui', 'Diunggah oleh', 'Aksi'].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 20px',
                          textAlign: 'left',
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: 600,
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      Tidak ada dokumen ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((doc, i) => (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? '1px solid rgba(255,255,255,0.07)'
                            : 'none',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <td style={{ padding: '12px 20px', color: '#fff' }}>{doc.nama}</td>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.75)' }}>
                        {doc.ukuran}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.75)' }}>
                        {doc.terakhir}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: doc.avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {doc.avatar}
                          </div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>
                              {doc.uploader}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
                              {doc.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4f8dfd',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              padding: 0,
                            }}
                            onClick={() => alert(`Edit: ${doc.nama}`)}
                          >
                            edit
                          </button>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e74c3c',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              padding: 0,
                            }}
                            onClick={() => handleDelete(doc.id)}
                          >
                            hapus
                          </button>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            onClick={() => alert(`Download: ${doc.nama}`)}
                            aria-label="Download"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
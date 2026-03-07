import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
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
    sheetData: null,
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
    sheetData: null,
  },
]

function generateDummySheet() {
  return [
    ['No', 'NIK', 'Nama', 'Alamat', 'Kelurahan', 'Kecamatan', 'Jenis Bantuan', 'Status'],
    [1, '3309010101010001', 'Siti Rahayu', 'Jl. Merdeka No. 1', 'Siswodipuran', 'Boyolali', 'PKH', 'Aktif'],
    [2, '3309010101010002', 'Budi Santoso', 'Jl. Pemuda No. 5', 'Pulisen', 'Boyolali', 'BPNT', 'Aktif'],
    [3, '3309010101010003', 'Dewi Kusuma', 'Jl. Diponegoro No. 3', 'Banaran', 'Sambi', 'PKH', 'Non-Aktif'],
    [4, '3309010101010004', 'Ahmad Fauzi', 'Jl. Pahlawan No. 7', 'Tumang', 'Cepogo', 'BPNT', 'Aktif'],
    [5, '3309010101010005', 'Rina Wati', 'Jl. Soekarno No. 2', 'Wonosari', 'Musuk', 'PKH', 'Aktif'],
  ]
}

function colLabel(idx) {
  let label = ''
  let n = idx + 1
  while (n > 0) {
    label = String.fromCharCode(65 + ((n - 1) % 26)) + label
    n = Math.floor((n - 1) / 26)
  }
  return label
}

export default function KelolaPPKSPage() {
  const fileInputRef = useRef(null)
  const [docs, setDocs] = useState(DUMMY_DOCS)
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [sheetData, setSheetData] = useState([])
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 })
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [sheetName, setSheetName] = useState('Sheet1')
  const [hasChanges, setHasChanges] = useState(false)
  const cellInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const allowed = ['.xls', '.xlsx']
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      alert('Hanya file .xls atau .xlsx yang diperbolehkan.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const wsName = workbook.SheetNames[0]
      const ws = workbook.Sheets[wsName]
      const parsed = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      const now = new Date()
      const tanggal = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
      const ukuran = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} kb` : `${(file.size / (1024 * 1024)).toFixed(1)} mb`
      setDocs((prev) => [{ id: Date.now(), nama: file.name, ukuran, terakhir: tanggal, uploader: 'Admin', email: 'admin@dinsos.go.id', avatar: 'AD', avatarColor: '#27ae60', fileObj: file, sheetData: parsed, sheetName: wsName }, ...prev])
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDownload = (doc) => {
    if (doc.fileObj) {
      const url = URL.createObjectURL(doc.fileObj)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.nama
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      alert(`File "${doc.nama}" data dummy tidak bisa didownload`)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDelete = (id) => {
    if (confirm('Hapus dokumen ini?')) setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  const handleEdit = (doc) => {
    const data = doc.sheetData || generateDummySheet()
    const maxCols = Math.max(...data.map((r) => r.length), 8)
    const normalized = data.map((row) => { const r = [...row]; while (r.length < maxCols) r.push(''); return r })
    while (normalized.length < 30) normalized.push(Array(maxCols).fill(''))
    setSheetData(normalized)
    setSheetName(doc.sheetName || 'Sheet1')
    setEditingDoc(doc)
    setEditorOpen(true)
    setSelectedCell({ row: 0, col: 0 })
    setEditingCell(null)
    setHasChanges(false)
  }

  const handleCellClick = (row, col) => {
    if (editingCell && (editingCell.row !== row || editingCell.col !== col)) commitCell()
    setSelectedCell({ row, col })
  }

  const handleCellDoubleClick = (row, col) => {
    setEditingCell({ row, col })
    setEditValue(String(sheetData[row]?.[col] ?? ''))
    setTimeout(() => cellInputRef.current?.focus(), 0)
  }

  const commitCell = () => {
    if (!editingCell) return
    const { row, col } = editingCell
    setSheetData((prev) => { const next = prev.map((r) => [...r]); next[row][col] = editValue; return next })
    setHasChanges(true)
    setEditingCell(null)
  }

  const handleCellKeyDown = (e) => {
    if (e.key === 'Enter') { commitCell(); setSelectedCell((prev) => ({ ...prev, row: Math.min(prev.row + 1, sheetData.length - 1) })) }
    else if (e.key === 'Escape') setEditingCell(null)
    else if (e.key === 'Tab') { e.preventDefault(); commitCell(); setSelectedCell((prev) => ({ ...prev, col: Math.min(prev.col + 1, (sheetData[0]?.length ?? 1) - 1) })) }
  }

  const handleSave = () => {
    const now = new Date()
    const tanggal = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    setDocs((prev) => {
      const updated = prev.map((d) => d.id === editingDoc.id ? { ...d, terakhir: tanggal, sheetData, fileObj: new File([blob], d.nama, { type: blob.type }) } : d)
      const idx = updated.findIndex((d) => d.id === editingDoc.id)
      if (idx > 0) { const [moved] = updated.splice(idx, 1); updated.unshift(moved) }
      return updated
    })
    setHasChanges(false)
    setEditorOpen(false)
  }

  const numCols = sheetData[0]?.length ?? 8
  const filtered = docs.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="login-page" style={{ minHeight: '100vh', backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', paddingTop: '80px', paddingBottom: '48px' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', paddingBottom: '28px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.99)' }}>Kelola PPKS</h1>
      </div>

      <div style={{ width: '100%', maxWidth: 1050, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.30)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Upload area */}
          <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            style={{ borderRadius: '16px', border: `2px dashed ${dragOver ? '#4f8dfd' : 'rgba(255,255,255,0.40)'}`, background: dragOver ? 'rgba(79,141,253,0.10)' : 'rgba(255,255,255,0.10)', padding: '16px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 200ms, background 200ms' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(41, 82, 158, 0.46)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#113371" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '0.97rem' }}><span style={{ color: '#173875c3', fontWeight: 600 }}>Klik disini</span>{' '}untuk unggah dokumen data PPKS</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>format Excel .xls/.xlsx</p>
            <input ref={fileInputRef} type="file" accept=".xls,.xlsx" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {/* Table */}
          <div style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Data PPKS</span>
                <span style={{ background: '#3b6fd4', color: '#fff', borderRadius: '999px', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>{docs.length} Dokumen</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.42)', borderRadius: '10px', padding: '7px 14px', gap: 8, minWidth: 180 }}>
                <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ffffff', fontSize: '0.85rem', width: '100%' }} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
            </div>

            {/* Single container: scroll horizontal + vertical, header sticky */}
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '210px' }}>
              <table style={{ minWidth: '600px', width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '220px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '230px' }} />
                  <col style={{ width: '160px' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.12)', borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(20,24,40,0.15)', position: 'sticky', top: 0, zIndex: 2 }}>
                    {['Nama Dokumen', 'Ukuran', 'Terakhir Perbarui', 'Diunggah oleh', 'Aksi'].map((h) => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Tidak ada dokumen ditemukan.</td></tr>
                  ) : filtered.map((doc, i) => (
                    <tr key={doc.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', transition: 'background 150ms' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      {/* Nama Dokumen — rata kiri */}
                      <td style={{ padding: '13px 20px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{doc.nama}</td>
                      {/* Ukuran — center */}
                      <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', textAlign: 'center' }}>{doc.ukuran}</td>
                      {/* Terakhir Perbarui — center */}
                      <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', textAlign: 'center' }}>{doc.terakhir}</td>
                      {/* Diunggah oleh — rata kiri */}
                      <td style={{ padding: '13px 20px', whiteSpace: 'nowrap', overflow: 'hidden', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: doc.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{doc.avatar}</div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.uploader}</div>
                            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* Aksi — center */}
                      <td style={{ padding: '13px 20px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
                          <button onClick={() => handleDelete(doc.id)} style={{ background: 'none', border: 'none', color: '#b83e30', cursor: 'pointer', fontSize: '0.85rem', padding: 0, fontWeight: 500 }}>hapus</button>
                          <button onClick={() => handleEdit(doc)} style={{ background: 'none', border: 'none', color: '#2c65cd', cursor: 'pointer', fontSize: '0.85rem', padding: 0, fontWeight: 500 }}>edit</button>
                          <button onClick={() => handleDownload(doc)} aria-label="Download" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* EXCEL EDITOR MODAL */}
      {editorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget) { if (hasChanges && !confirm('Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?')) return; setEditorOpen(false) } }}>
          <div style={{ width: '100%', maxWidth: '1100px', height: '85vh', background: '#1e2433', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Title bar */}
            <div style={{ background: '#217346', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#217346', fontWeight: 900, fontSize: '0.85rem' }}>X</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{editingDoc?.nama}</span>
                {hasChanges && <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.72rem', borderRadius: 4, padding: '2px 8px' }}>• Belum disimpan</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSave} style={{ background: '#fff', border: 'none', color: '#217346', borderRadius: 6, padding: '6px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>💾 Simpan</button>
                <button onClick={() => { if (hasChanges && !confirm('Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?')) return; setEditorOpen(false) }}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
            </div>

            {/* Formula bar */}
            <div style={{ background: '#252b3b', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '3px 10px', color: '#fff', fontSize: '0.8rem', minWidth: 60, textAlign: 'center' }}>
                {colLabel(selectedCell.col)}{selectedCell.row + 1}
              </div>
              <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)' }} />
              <input
                value={editingCell ? editValue : String(sheetData[selectedCell.row]?.[selectedCell.col] ?? '')}
                onChange={(e) => { if (!editingCell) setEditingCell(selectedCell); setEditValue(e.target.value) }}
                onKeyDown={handleCellKeyDown}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem' }}
                placeholder="Nilai sel..."
              />
            </div>

            {/* Spreadsheet */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '0.8rem', minWidth: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ width: 44, background: '#2d3347', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', fontWeight: 400, padding: '4px 0', textAlign: 'center', position: 'sticky', left: 0, zIndex: 11 }}></th>
                    {Array.from({ length: numCols }).map((_, ci) => (
                      <th key={ci} style={{ width: 120, background: selectedCell.col === ci ? '#3a7d5a' : '#2d3347', border: '1px solid rgba(255,255,255,0.07)', color: selectedCell.col === ci ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 600, padding: '4px 8px', textAlign: 'center', userSelect: 'none' }}>
                        {colLabel(ci)}
                      </th>
                    ))}
                    <th style={{ width: 36, background: '#2d3347', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => { setSheetData((prev) => prev.map((r) => [...r, ''])); setHasChanges(true) }}>+</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ background: selectedCell.row === ri ? '#3a7d5a' : '#252b3b', border: '1px solid rgba(255,255,255,0.07)', color: selectedCell.row === ri ? '#fff' : 'rgba(255,255,255,0.35)', textAlign: 'center', fontWeight: 500, fontSize: '0.75rem', padding: '2px 4px', position: 'sticky', left: 0, zIndex: 1, userSelect: 'none' }}>
                        {ri + 1}
                      </td>
                      {row.map((cell, ci) => {
                        const isSelected = selectedCell.row === ri && selectedCell.col === ci
                        const isEditing = editingCell?.row === ri && editingCell?.col === ci
                        const isHeader = ri === 0
                        return (
                          <td key={ci} onClick={() => handleCellClick(ri, ci)} onDoubleClick={() => handleCellDoubleClick(ri, ci)}
                            style={{ border: isSelected ? '2px solid #217346' : '1px solid rgba(255,255,255,0.07)', background: isSelected ? 'rgba(33,115,70,0.15)' : isHeader ? 'rgba(255,255,255,0.04)' : 'transparent', color: '#fff', padding: 0, verticalAlign: 'middle', cursor: 'cell', position: 'relative' }}>
                            {isEditing ? (
                              <input ref={cellInputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleCellKeyDown} onBlur={commitCell}
                                style={{ width: '100%', height: '100%', background: '#fff', color: '#000', border: 'none', outline: 'none', padding: '3px 8px', fontSize: '0.8rem', boxSizing: 'border-box', minHeight: 26 }} />
                            ) : (
                              <div style={{ padding: '3px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: 26, lineHeight: '20px', fontWeight: isHeader ? 700 : 400, color: isHeader ? '#a3e4b8' : 'rgba(255,255,255,0.85)' }}>
                                {String(cell ?? '')}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.07)' }} />
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={numCols + 2} onClick={() => { setSheetData((prev) => [...prev, Array(numCols).fill('')]); setHasChanges(true) }}
                      style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem' }}>
                      + Tambah Baris
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sheet tab */}
            <div style={{ background: '#1a1f2e', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '4px 12px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ background: '#217346', color: '#fff', borderRadius: '4px 4px 0 0', padding: '4px 16px', fontSize: '0.78rem', fontWeight: 600 }}>{sheetName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

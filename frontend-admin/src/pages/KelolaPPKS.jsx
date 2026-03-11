import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import heroBackground from '../assets/bg-dinsos.jpeg'

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
  const [editorSearch, setEditorSearch] = useState('')
  const [matchIndices, setMatchIndices] = useState([])
  const [matchCursor, setMatchCursor] = useState(0)
  const cellInputRef = useRef(null)
  const editorSearchRef = useRef(null)

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
      setDocs((prev) => [{
        id: Date.now(), nama: file.name, ukuran, terakhir: tanggal,
        uploader: 'Admin', email: 'admin@dinsos.go.id',
        avatar: 'AD', avatarColor: '#27ae60',
        fileObj: file, sheetData: parsed, sheetName: wsName,
      }, ...prev])
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
    setEditorSearch('')
    setMatchIndices([])
    setMatchCursor(0)
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
      const updated = prev.map((d) => d.id === editingDoc.id
        ? { ...d, terakhir: tanggal, sheetData, fileObj: new File([blob], d.nama, { type: blob.type }) }
        : d)
      const idx = updated.findIndex((d) => d.id === editingDoc.id)
      if (idx > 0) { const [moved] = updated.splice(idx, 1); updated.unshift(moved) }
      return updated
    })
    setHasChanges(false)
    setEditorOpen(false)
  }

  const handleEditorSearch = (val) => {
    setEditorSearch(val)
    if (!val.trim()) { setMatchIndices([]); setMatchCursor(0); return }
    const matches = []
    sheetData.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (String(cell ?? '').toLowerCase().includes(val.toLowerCase())) matches.push({ row: ri, col: ci })
      })
    })
    setMatchIndices(matches)
    setMatchCursor(0)
    if (matches.length > 0) { setSelectedCell(matches[0]); scrollCellIntoView(matches[0]) }
  }

  const scrollCellIntoView = ({ row, col }) => {
    setTimeout(() => {
      const el = document.getElementById(`cell-${row}-${col}`)
      if (el) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    }, 50)
  }

  const goToMatch = (dir) => {
    if (matchIndices.length === 0) return
    const next = (matchCursor + dir + matchIndices.length) % matchIndices.length
    setMatchCursor(next)
    setSelectedCell(matchIndices[next])
    scrollCellIntoView(matchIndices[next])
  }

  const isCellMatch = (row, col) =>
    editorSearch.trim() && String(sheetData[row]?.[col] ?? '').toLowerCase().includes(editorSearch.toLowerCase())

  const isCellCurrentMatch = (row, col) => {
    if (matchIndices.length === 0) return false
    const cur = matchIndices[matchCursor]
    return cur?.row === row && cur?.col === col
  }

  const numCols = sheetData[0]?.length ?? 8
  const filtered = docs.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()))

  return (
    <div
      className="kelola-page"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="kelola-overlay" />

      <div className="kelola-heading">
        <h1>Kelola PPKS</h1>
      </div>

      <div className="kelola-container">
        <div className="kelola-glass-card">

          {/* Upload area */}
          <div
            className={`kelola-upload-area${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="kelola-upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#113371" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="kelola-upload-label">
              <strong>Klik disini</strong> untuk unggah dokumen data PPKS
            </p>
            <p className="kelola-upload-hint">format Excel .xls/.xlsx</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* Table */}
          <div className="kelola-table-card">
            <div className="kelola-table-header">
              <div className="kelola-table-title">
                <span>Data PPKS</span>
                <span className="kelola-table-badge">{docs.length} Dokumen</span>
              </div>
              <div className="kelola-search-box">
                <input
                  type="text"
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            <div className="kelola-table-scroll">
              <table className="kelola-table">
                <colgroup>
                  <col style={{ width: '220px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '230px' }} />
                  <col style={{ width: '160px' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['Nama Dokumen', 'Ukuran', 'Terakhir Perbarui', 'Diunggah oleh', 'Aksi'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="kelola-table-empty">Tidak ada dokumen ditemukan.</td>
                    </tr>
                  ) : filtered.map((doc, i) => (
                    <tr key={doc.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                      <td className="col-name">{doc.nama}</td>
                      <td>{doc.ukuran}</td>
                      <td>{doc.terakhir}</td>
                      <td className="col-uploader">
                        <div className="kelola-uploader-cell">
                          <div className="kelola-avatar" style={{ background: doc.avatarColor }}>{doc.avatar}</div>
                          <div>
                            <div className="kelola-uploader-name">{doc.uploader}</div>
                            <div className="kelola-uploader-email">{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="kelola-action-cell">
                          <button className="kelola-btn-delete" onClick={() => handleDelete(doc.id)}>hapus</button>
                          <button className="kelola-btn-edit" onClick={() => handleEdit(doc)}>edit</button>
                          <button className="kelola-btn-download" onClick={() => handleDownload(doc)} aria-label="Download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
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

      {editorOpen && (
        <div
          className="editor-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (hasChanges && !confirm('Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?')) return
              setEditorOpen(false)
            }
          }}
        >
          <div className="editor-modal">

            <div className="editor-titlebar">
              <div className="editor-titlebar-left">
                <div className="editor-excel-icon"><span>X</span></div>
                <span className="editor-filename">{editingDoc?.nama}</span>
                {hasChanges && <span className="editor-unsaved-badge">• Belum disimpan</span>}
              </div>
              <div className="editor-titlebar-right">
                <button className="editor-btn-save" onClick={handleSave}>💾 Simpan</button>
                <button
                  className="editor-btn-close"
                  onClick={() => {
                    if (hasChanges && !confirm('Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?')) return
                    setEditorOpen(false)
                  }}
                >✕</button>
              </div>
            </div>

            <div className="editor-formulabar">
              <div className="editor-cellref">
                {colLabel(selectedCell.col)}{selectedCell.row + 1}
              </div>
              <div className="editor-divider" />
              <input
                className="editor-formula-input"
                value={editingCell ? editValue : String(sheetData[selectedCell.row]?.[selectedCell.col] ?? '')}
                onChange={(e) => { if (!editingCell) setEditingCell(selectedCell); setEditValue(e.target.value) }}
                onKeyDown={handleCellKeyDown}
                placeholder="Nilai sel..."
              />
              <div className="editor-divider" />
              <div className="editor-search-box">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={editorSearchRef}
                  type="text"
                  placeholder="Cari di file..."
                  value={editorSearch}
                  onChange={(e) => handleEditorSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.shiftKey ? goToMatch(-1) : goToMatch(1) }
                    if (e.key === 'Escape') { setEditorSearch(''); setMatchIndices([]); setMatchCursor(0) }
                  }}
                />
                {editorSearch && (
                  <span className="editor-search-count">
                    {matchIndices.length > 0 ? `${matchCursor + 1}/${matchIndices.length}` : '0'}
                  </span>
                )}
                {matchIndices.length > 0 && (
                  <>
                    <button className="editor-search-nav" onClick={() => goToMatch(-1)}>▲</button>
                    <button className="editor-search-nav" onClick={() => goToMatch(1)}>▼</button>
                  </>
                )}
                {editorSearch && (
                  <button className="editor-search-clear" onClick={() => { setEditorSearch(''); setMatchIndices([]); setMatchCursor(0) }}>✕</button>
                )}
              </div>
            </div>

            <div className="editor-sheet-area">
              <table className="editor-sheet-table">
                <thead>
                  <tr>
                    <th className="editor-col-corner" />
                    {Array.from({ length: numCols }).map((_, ci) => (
                      <th
                        key={ci}
                        className={`editor-col-header${selectedCell.col === ci ? ' is-selected' : ''}`}
                      >
                        {colLabel(ci)}
                      </th>
                    ))}
                    <th
                      className="editor-col-add"
                      onClick={() => { setSheetData((prev) => prev.map((r) => [...r, ''])); setHasChanges(true) }}
                    >+</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((row, ri) => (
                    <tr key={ri}>
                      <td className={`editor-row-number${selectedCell.row === ri ? ' is-selected' : ''}`}>
                        {ri + 1}
                      </td>
                      {row.map((cell, ci) => {
                        const isSelected = selectedCell.row === ri && selectedCell.col === ci
                        const isEditing = editingCell?.row === ri && editingCell?.col === ci
                        const isHeader = ri === 0
                        const isMatch = isCellMatch(ri, ci)
                        const isCurrentMatch = isCellCurrentMatch(ri, ci)

                        const cellClass = [
                          'editor-cell',
                          isCurrentMatch ? 'is-current-match' : isMatch ? 'is-match' : '',
                          isSelected ? 'is-selected' : '',
                          !isSelected && !isMatch && !isCurrentMatch && isHeader ? 'is-header' : '',
                        ].filter(Boolean).join(' ')

                        return (
                          <td
                            key={ci}
                            id={`cell-${ri}-${ci}`}
                            className={cellClass}
                            onClick={() => handleCellClick(ri, ci)}
                            onDoubleClick={() => handleCellDoubleClick(ri, ci)}
                          >
                            {isEditing ? (
                              <input
                                ref={cellInputRef}
                                className="editor-cell-input"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                onBlur={commitCell}
                              />
                            ) : (
                              <div className={`editor-cell-display${isHeader ? ' is-header' : ''}`}>
                                {String(cell ?? '')}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td className="editor-cell-empty" />
                    </tr>
                  ))}
                  <tr>
                    <td
                      colSpan={numCols + 2}
                      className="editor-add-row"
                      onClick={() => { setSheetData((prev) => [...prev, Array(numCols).fill('')]); setHasChanges(true) }}
                    >
                      + Tambah Baris
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

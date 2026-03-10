import { useState } from 'react'
import logoBoyolali from '../assets/logo-boyolali.png'
import heroBackground from '../assets/bg-dinsos.jpeg'

const VALID_USER = 'admin'
const VALID_PASS = 'dinsos123'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setError('')
    if (!username || !password) {
      setError('Nama pengguna dan kata sandi wajib diisi.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        onLogin()
      } else {
        setError('Nama pengguna atau kata sandi salah.')
        setLoading(false)
      }
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="login-overlay" />

      {/* Logo + judul */}
      <div className="login-brand">
        <img
          src={logoBoyolali}
          alt="Lambang Kabupaten Boyolali"
          className="login-brand-logo"
        />
        <h1 className="login-brand-title">DINAS SOSIAL</h1>
        <p className="login-brand-subtitle">Kabupaten Boyolali</p>
      </div>

      {/* Card login */}
      <div className="login-card">
        <h2 className="login-card-title">LOGIN</h2>

        {/* Input username */}
        <div className="login-input-wrap">
          <span className="login-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Nama Pengguna"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="login-input"
          />
        </div>

        {/* Input password */}
        <div className="login-input-wrap">
          <span className="login-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="login-input"
          />
        </div>

        {/* Pesan error */}
        {error && <p className="login-error">{error}</p>}

        {/* Tombol submit */}
        <div className="login-submit-wrap">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Memproses...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}
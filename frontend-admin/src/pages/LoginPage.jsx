import { useState } from 'react'
import logoBoyolali from '../assets/logo-boyolali.png'
import heroBackground from '../assets/bg-dinsos.png'

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
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${heroBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2.5rem',
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}>
      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.34)', zIndex: 0 }} />

      {/* Logo + judul */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff' }}>
        <img
          src={logoBoyolali}
          alt="Lambang Kabupaten Boyolali"
          style={{ width: 'clamp(72px, 18vw, 110px)', height: 'auto', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }}
        />
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 'clamp(1.3rem, 5vw, 1.9rem)', letterSpacing: 1 }}>
          DINAS SOSIAL
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 'clamp(0.95rem, 3.5vw, 1.3rem)', fontWeight: 500 }}>
          Kabupaten Boyolali
        </p>
      </div>

      {/* Card login */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(207,212,216,0.25)',
        backdropFilter: 'blur(2px)',
        borderRadius: '0.9rem',
        padding: 'clamp(1.4rem, 5vw, 2rem) clamp(1.2rem, 6vw, 2.5rem)',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        boxSizing: 'border-box',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginTop: 0,
          marginBottom: '1.5rem',
          fontWeight: 700,
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
          letterSpacing: 2.5,
          color: '#fff',
        }}>
          LOGIN
        </h2>

        {/* Input username */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <span style={{
            position: 'absolute', left: '0.85rem', top: '50%',
            transform: 'translateY(-50%)', color: '#aaa', display: 'flex',
          }}>
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
            style={{
              width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.4rem',
              borderRadius: '0.5rem', border: '1px solid #ddd',
              fontSize: 'clamp(0.85rem, 3vw, 0.95rem)', outline: 'none',
              boxSizing: 'border-box', background: '#fff',
            }}
          />
        </div>

        {/* Input password */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <span style={{
            position: 'absolute', left: '0.85rem', top: '50%',
            transform: 'translateY(-50%)', color: '#aaa', display: 'flex',
          }}>
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
            style={{
              width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.4rem',
              borderRadius: '0.5rem', border: '1px solid #ddd',
              fontSize: 'clamp(0.85rem, 3vw, 0.95rem)', outline: 'none',
              boxSizing: 'border-box', background: '#fff',
            }}
          />
        </div>

        {/* Pesan error */}
        {error && (
          <p style={{ color: '#fff', fontSize: '0.85rem', margin: '0 0 0.75rem', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Tombol kirim — full width di mobile, partial di desktop */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: 'clamp(100px, 40%, 160px)',
              padding: '0.65rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: loading ? '#555' : '#222',
              color: '#fff',
              fontWeight: 600,
              fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Memproses...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}
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
    // Simulasi delay network — hapus jika pakai API nyata
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
      {/* Overlay gelap */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.34)',
          zIndex: 0,
        }}
      />

      {/* Logo + judul */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff' }}>
        <img
          src={logoBoyolali}
          alt="Lambang Kabupaten Boyolali"
          style={{ width: 100, height: 'auto', marginBottom: '1rem', marginLeft: '3.5rem' }}
        />
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '1.8rem', letterSpacing: 1 }}>
          DINAS SOSIAL
        </h1>
        <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 500 }}>Kabupaten Boyolali</p>
      </div>

      {/* Card login */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(207, 212, 216, 0.25)',
          backdropFilter: 'blur(2px)',
          borderRadius: '0.9rem',
          padding: '2rem 2.5rem',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: 2.5,
          }}
        >
          LOGIN
        </h2>

        {/* Input username */}
        <div style={{ position: 'relative', marginBottom: '1rem'}}>
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              fontSize: '1rem',
            }}
          >
            👤
          </span>
          <input
            type="text"
            placeholder="Nama Pengguna"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem 0.7rem 2.4rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#fff',
            }}
          />
        </div>

        {/* Input password */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              fontSize: '1rem',
            }}
          >
            🔑
          </span>
          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem 0.7rem 2.4rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#fff',
            }}
          />
        </div>

        {/* Pesan error */}
        {error && (
          <p
            style={{
              color: '#ffffff',
              fontSize: '0.85rem',
              margin: '0 0 0.75rem',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}

        {/* Tombol kirim */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '40%',
            padding: '0.55rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: loading ? '#555' : '#222',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            marginLeft: '15rem',
          }}
        >
          {loading ? 'Memproses...' : 'kirim'}
        </button>
      </div>
    </div>
  )
}

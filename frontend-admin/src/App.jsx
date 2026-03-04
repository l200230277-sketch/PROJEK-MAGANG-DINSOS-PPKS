import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import PPKSMapPage from './pages/PPKSMapPage.jsx'
import PPKSDetailPage from './pages/PPKSDetailPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import logoBoyolali from './assets/logo-boyolali.png'
import heroBackground from './assets/bg-dinsos.png'

// ─── Protected Route wrapper ───────────────────────────────────────────────
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Persist login state across page refresh via sessionStorage
    return sessionStorage.getItem('isLoggedIn') === 'true'
  })
  const location = useLocation()
  const navigate = useNavigate()

  // ─── Scroll tracking ────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || window.pageYOffset || 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  // ─── Auth helpers ────────────────────────────────────────────────────────
  const handleLogin = () => {
    sessionStorage.setItem('isLoggedIn', 'true')
    setIsLoggedIn(true)
    navigate('/')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn')
    setIsLoggedIn(false)
    navigate('/login')
  }

  // ─── Hero animation (only on home) ──────────────────────────────────────
  const isHome = location.pathname === '/'
  const isLogin = location.pathname === '/login'
  const heroProgress = Math.min(scrollY / 260, 1)
  const heroTransform = {
    scale: 1 - heroProgress * 0.25,
    translateY: heroProgress * -40,
    opacity: 1 - heroProgress * 0.35,
  }

  const brandScale = isHome ? 1 - heroProgress * 0.12 : 0.9
  const brandTranslateY = isHome ? heroProgress * -6 : 0

  // Sembunyikan header & footer saat di halaman login
  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="page" style={{ '--hero-bg-image': `url(${heroBackground})` }}>
      <header className={`site-header ${scrollY > 8 ? 'site-header--scrolled' : ''}`}>
        <div className="site-header-inner">
          <button
            className="brand-mini"
            style={{
              transform: `translateY(${brandTranslateY}px) scale(${brandScale})`,
            }}
            onClick={() => navigate('/')}
            aria-label="Kembali ke beranda"
          >
            <div className="brand-mini-logos">
              <img
                src={logoBoyolali}
                alt="Lambang Kabupaten Boyolali"
                className="brand-mini-logo brand-mini-logo--kab"
              />
            </div>
            <div className="brand-mini-text">
              <span className="brand-mini-title">DINAS SOSIAL</span>
              <span className="brand-mini-subtitle">Kabupaten Boyolali</span>
            </div>
          </button>

          <nav className="site-nav" aria-label="Navigasi utama">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              end
            >
              Beranda
            </NavLink>
            <NavLink
              to="/ppks"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              PPKS
            </NavLink>
            <NavLink
              to="/ppks-detail"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              PPKS Detail
            </NavLink>
            <NavLink
              to="/kontak"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Kontak
            </NavLink>
            <div className="nav-search">
              <input
                type="text"
                className="nav-search-input"
                placeholder="Cari..."
                aria-label="Cari data PPKS"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const value = event.currentTarget.value.trim()
                    if (value) {
                      navigate(`/ppks-detail?desa=${encodeURIComponent(value)}`)
                    }
                  }
                }}
              />
              <span className="nav-search-icon" aria-hidden="true">
                🔍
              </span>
            </div>

            {/* Tombol Logout */}
            <button
              className="nav-link nav-logout-btn"
              onClick={handleLogout}
              aria-label="Keluar"
            >
              Keluar
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          {/* Semua route di bawah ini butuh login */}
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Home heroTransform={heroTransform} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ppks"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <PPKSMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ppks-detail"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <PPKSDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kontak"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ContactPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Dinas Sosial Kabupaten Boyolali.</p>
        <p>Sistem informasi Pemerlu Pelayanan Kesejahteraan Sosial (PPKS)</p>
      </footer>
    </div>
  )
}

export default App

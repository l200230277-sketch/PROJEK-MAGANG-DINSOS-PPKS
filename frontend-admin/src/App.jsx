import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import PPKSMapPage from './pages/PPKSMapPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import KelolaPPKSPage from './pages/KelolaPPKS.jsx'
import LoginPage from './pages/LoginPage.jsx'
import logoBoyolali from './assets/logo-boyolali.png'
import heroBackground from './assets/bg-dinsos.png'

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true'
  })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY || window.pageYOffset || 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

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
            style={{ transform: `translateY(${brandTranslateY}px) scale(${brandScale})` }}
            onClick={() => navigate('/')}
            aria-label="Kembali ke beranda"
          >
            <div className="brand-mini-logos">
              <img src={logoBoyolali} alt="Lambang Kabupaten Boyolali" className="brand-mini-logo brand-mini-logo--kab" />
            </div>
            <div className="brand-mini-text">
              <span className="brand-mini-title">DINAS SOSIAL</span>
              <span className="brand-mini-subtitle">Kabupaten Boyolali</span>
            </div>
          </button>

          <nav className="site-nav" aria-label="Navigasi utama">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`} end>
              Beranda
            </NavLink>
            <NavLink to="/ppks" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              PPKS
            </NavLink>
            <NavLink to="/kelola-ppks" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              Kelola PPKS
            </NavLink>
            <button className="nav-logout-btn" onClick={handleLogout} aria-label="Logout">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Home heroTransform={heroTransform} /></ProtectedRoute>} />
          <Route path="/ppks" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PPKSMapPage /></ProtectedRoute>} />
          <Route path="/kelola-ppks" element={<ProtectedRoute isLoggedIn={isLoggedIn}><KelolaPPKSPage /></ProtectedRoute>} />
          <Route path="/kontak" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ContactPage /></ProtectedRoute>} />
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

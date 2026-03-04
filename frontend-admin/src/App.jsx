import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import PPKSMapPage from './pages/PPKSMapPage.jsx'
import PPKSDetailPage from './pages/PPKSDetailPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import logoBoyolali from './assets/logo-boyolali.png'
import heroBackground from './assets/bg-dinsos.png'

function App() {
  const [scrollY, setScrollY] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

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

  const isHome = location.pathname === '/'
  const heroProgress = Math.min(scrollY / 260, 1)
  const heroTransform = {
    scale: 1 - heroProgress * 0.25,
    translateY: heroProgress * -40,
    opacity: 1 - heroProgress * 0.35,
  }

  const brandScale = isHome ? 1 - heroProgress * 0.12 : 0.9
  const brandTranslateY = isHome ? heroProgress * -6 : 0

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
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home heroTransform={heroTransform} />} />
          <Route path="/ppks" element={<PPKSMapPage />} />
          <Route path="/ppks-detail" element={<PPKSDetailPage />} />
          <Route path="/kontak" element={<ContactPage />} />
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

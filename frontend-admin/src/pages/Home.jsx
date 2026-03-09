import PropTypes from 'prop-types'
import logoDinsos from '../assets/logo-dinsos.png'
import logoBoyolali from '../assets/logo-boyolali.png'

function Home({ heroTransform }) {
  const style =
    heroTransform != null
      ? {
          transform: `translateY(${heroTransform.translateY}px) scale(${heroTransform.scale})`,
          opacity: heroTransform.opacity,
        }
      : undefined

  return (
    <section className="section hero-section" aria-labelledby="hero-heading">
      <div className="hero-overlay" />
      <div className="hero-content hero-content--home">
        <div className="hero-logos-block" style={style}>
          <div className="hero-logo-left">
            <img src={logoBoyolali} alt="Lambang Kabupaten Boyolali" />
          </div>
          <div className="hero-logo-center">
            <img src={logoDinsos} alt="Logo Dinas Sosial" />
          </div>
        </div>

        <div className="hero-divider" />

        <div className="hero-title-block">
          <h1 id="hero-heading" className="hero-main-title">
            Boyolali Sehat, Tangguh,
            <br />
            Cerdas, Berkarakter, dan
            <br />
            Berbudaya
          </h1>
        </div>
      </div>
    </section>
  )
}

Home.propTypes = {
  heroTransform: PropTypes.shape({
    scale: PropTypes.number,
    translateY: PropTypes.number,
    opacity: PropTypes.number,
  }),
}

export default Home
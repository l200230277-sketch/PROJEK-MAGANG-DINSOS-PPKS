import bgDinsos from '../assets/bg-dinsos.jpeg'

function ContactPage() {
  return (
    <section
      className="section section-alt"
      aria-labelledby="contact-heading"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Background Blur */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${bgDinsos})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px)",
          transform: "scale(1.1)",
          zIndex: 0
        }}
      />

      {/* Overlay supaya teks lebih jelas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 1
        }}
      />

      {/* Konten */}
      <div className="section-inner" style={{ position: "relative", zIndex: 2, color: "white" }}>
        <header className="section-header">
          <h2 id="contact-heading" className="section-title">
            Kontak Dinas Sosial Kabupaten Boyolali
          </h2>
        </header>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon contact-icon--phone">
              <span>☎</span>
            </div>
            <h3>Nomor Telepon</h3>
            <p className="contact-main">(0276) 321047</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon contact-icon--address">
              <span>📍</span>
            </div>
            <h3>Alamat</h3>
            <p className="contact-main">
              Tegalarum, Kemiri, Kec. Mojosongo, Kabupaten Boyolali, Jawa Tengah 57311, Indonesia
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon contact-icon--email">
              <span>✉</span>
            </div>
            <h3>Email Resmi</h3>
            <p className="contact-main">dinsos@boyolali.go.id</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactPage

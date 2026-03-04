function ContactPage() {
  return (
    <section className="section section-alt" aria-labelledby="contact-heading">
      <div className="section-inner">
        <header className="section-header">
          <p className="section-kicker">Hubungi Kami</p>
          <h2 id="contact-heading" className="section-title">
            Kontak Dinas Sosial Kabupaten Boyolali
          </h2>
        </header>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon contact-icon--phone" aria-hidden="true">
              <span>☎</span>
            </div>
            <h3>Nomor Telepon</h3>
            <p className="contact-main">(0276) 321047</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon contact-icon--address" aria-hidden="true">
              <span>📍</span>
            </div>
            <h3>Alamat</h3>
            <p className="contact-main">
              Tegalarum, Kemiri, Kec. Mojosongo, Kabupaten Boyolali, Jawa Tengah 57311,
              Indonesia
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon contact-icon--email" aria-hidden="true">
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


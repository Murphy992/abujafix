
"use client";

import type { FormEvent } from "react";

export default function Home() {
  const services = [
    { icon: "⚡", name: "Electrical Services", desc: "Repairs, wiring and installations", number: "01" },
    { icon: "☀️", name: "Solar & Inverters", desc: "Solar systems and reliable backup power", number: "02" },
    { icon: "📹", name: "CCTV & Security", desc: "Security cameras and installation", number: "03" },
    { icon: "🌐", name: "Networking & Fibre", desc: "Internet, routers and fibre cabling", number: "04" },
    { icon: "🚰", name: "Plumbing", desc: "Leaks, pipes and water systems", number: "05" },
    { icon: "❄️", name: "AC Services", desc: "Air conditioning and maintenance", number: "06" },
  ];

  function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "");
    const phone = String(data.get("phone") || "");
    const service = String(data.get("service") || "");
    const location = String(data.get("location") || "");
    const message = String(data.get("message") || "");

    const bookingMessage = `Hello AbujaFix! I would like to request a service.
Customer name: ${name}
Phone number: ${phone}
Service needed: ${service}
Location: ${location}
Problem description: ${message}`;

    const whatsappUrl = `https://wa.me/2347064522351?text=${encodeURIComponent(bookingMessage)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="homepage">
      <nav className="navbar">
        <a href="/" className="logo">
          <span className="logoMark">A</span>
          <span>Abuja<span className="logoAccent">Fix</span></span>
        </a>

        <div className="navLinks">
          <a href="#services">Services</a>
          <a href="#how">How It Works</a>
          <a href="/technicians">Find a Technician</a>
          <a href="/track-job">Track My Job</a>
          <a href="/customer-login">Customer Login</a>
        </div>

        <a href="/request-service" className="navButton">
          Request Service <span>→</span>
        </a>
      </nav>

      <section className="hero">
        <div className="heroContent">
          <div className="trustLabel">
            <span className="trustDot" />
            YOUR LOCAL SERVICE MARKETPLACE
          </div>

          <h1>
            Find Trusted Technicians.
            <span> Fix It Fast.</span>
          </h1>

          <p className="heroText">
            From electrical repairs to solar installations, CCTV,
            plumbing and more. Connect with skilled service
            professionals for your home and business across Abuja, FCT.
          </p>

          <div className="heroActions">
            <a href="/request-service" className="primaryButton">
              Request a Technician <span>→</span>
            </a>
            <a href="/technicians" className="secondaryButton">
              Find a Technician
            </a>
          </div>

          <div className="heroFeatures">
            <span><b>✓</b> Easy service requests</span>
            <span><b>✓</b> Local technicians</span>
            <span><b>✓</b> Direct communication</span>
          </div>
        </div>

        <div className="heroVisual">
          <div className="visualCircle circleOne" />
          <div className="visualCircle circleTwo" />

          <div className="visualCard">
            <div className="visualTop">
              <div className="visualLogo">A</div>
              <div>
                <strong>AbujaFix</strong>
                <small>Professional services</small>
              </div>
              <span className="visualOnline">● Online</span>
            </div>

            <div className="visualMainIcon">🔧</div>
            <h3>Your problem. Our solution.</h3>
            <p>Find the right professional for the job.</p>

            <div className="visualService">
              <span>⚡</span>
              <div><strong>Electrical Services</strong><small>Repairs and installations</small></div>
              <b>✓</b>
            </div>

            <div className="visualService">
              <span>☀️</span>
              <div><strong>Solar & Inverters</strong><small>Reliable backup power</small></div>
              <b>✓</b>
            </div>

            <div className="visualService">
              <span>📹</span>
              <div><strong>CCTV & Security</strong><small>Safety and protection</small></div>
              <b>✓</b>
            </div>
          </div>

          <div className="floatingBadge">
            <span>✓</span>
            <div><strong>Need a technician?</strong><small>Start with AbujaFix</small></div>
          </div>
        </div>
      </section>

      <section className="serviceIntro" id="services">
        <div className="sectionHeader">
          <div>
            <span className="sectionEyebrow">OUR SERVICES</span>
            <h2>What Do You Need Fixed?</h2>
            <p>Professional help for everyday technical problems.</p>
          </div>
          <a href="/request-service" className="textLink">
            Request a service →
          </a>
        </div>

        <div className="serviceGrid">
          {services.map((service) => (
            <a
              href="/request-service"
              className="serviceCard"
              key={service.name}
            >
              <div className="serviceCardTop">
                <span className="serviceIcon">{service.icon}</span>
                <span className="serviceNumber">{service.number}</span>
              </div>
              <h3>{service.name}</h3>
              <p>{service.desc}</p>
              <span className="serviceLink">Request service <b>→</b></span>
            </a>
          ))}
        </div>
      </section>

      <section className="howSection" id="how">
        <div className="howIntro">
          <span className="sectionEyebrow">SIMPLE AND CONVENIENT</span>
          <h2>Getting Help Should Be Easy.</h2>
          <p>
            AbujaFix makes it easier to request technical services
            and connect with professionals.
          </p>
          <a href="/request-service" className="primaryButton">
            Get Started <span>→</span>
          </a>
        </div>

        <div className="steps">
          <article className="stepCard">
            <span className="stepNumber">01</span>
            <div className="stepIcon">⌕</div>
            <h3>Choose a Service</h3>
            <p>Choose the service you need, from electrical work to plumbing.</p>
          </article>

          <article className="stepCard">
            <span className="stepNumber">02</span>
            <div className="stepIcon">✎</div>
            <h3>Send Your Request</h3>
            <p>Tell us about the problem and provide your location and contact details.</p>
          </article>

          <article className="stepCard">
            <span className="stepNumber">03</span>
            <div className="stepIcon">✓</div>
            <h3>Connect With a Technician</h3>
            <p>Follow your request and arrange the service with a technician.</p>
          </article>
        </div>
      </section>

      <section className="whySection">
        <div className="whyVisual">
          <div className="whyIcon">🏠</div>
          <div className="whySmallCard">
            <span>YOUR HOME & BUSINESS</span>
            <strong>Technical services made easier.</strong>
          </div>
        </div>

        <div className="whyContent">
          <span className="sectionEyebrow">WHY ABUJAFIX?</span>
          <h2>One Place for Your Technical Service Needs.</h2>
          <p>
            Whether you need an urgent repair or a new installation,
            AbujaFix helps you find the right service category and
            connect with technicians in Abuja.
          </p>

          <div className="whyItem">
            <span>✓</span>
            <div><strong>Convenient service requests</strong><small>Submit your service details in a few simple steps.</small></div>
          </div>
          <div className="whyItem">
            <span>✓</span>
            <div><strong>Multiple service categories</strong><small>Find electrical, solar, CCTV, plumbing and other services.</small></div>
          </div>
          <div className="whyItem">
            <span>✓</span>
            <div><strong>Track your requests</strong><small>Check the progress of your submitted service requests.</small></div>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <span className="sectionEyebrow">LET'S GET IT FIXED</span>
        <h2>Ready to Solve That Problem?</h2>
        <p>Start your service request with AbujaFix today.</p>
        <a href="/request-service" className="ctaButton">
          Request a Technician <span>→</span>
        </a>
      </section>

      <section className="bookingSection" id="booking">
        <div className="bookingIntro">
          <span className="sectionEyebrow">DIRECT BOOKING</span>
          <h2>Tell Us What Needs Fixing.</h2>
          <p>
            Complete the form and your booking details will open
            in WhatsApp for you to send.
          </p>
          <div className="bookingNote">
            <span>✓</span>
            Your details are prepared for WhatsApp.
          </div>
        </div>

        <form className="bookingForm" onSubmit={handleBooking}>
          <div className="formHeading">
            <h3>Request a Service</h3>
            <p>Complete the details below.</p>
          </div>

          <label htmlFor="booking-name">Your name</label>
          <input id="booking-name" name="name" placeholder="Enter your name" required />

          <label htmlFor="booking-phone">Phone number</label>
          <input id="booking-phone" name="phone" placeholder="Your WhatsApp number" required />

          <label htmlFor="booking-service">Service needed</label>
          <select id="booking-service" name="service" required>
            <option value="">Choose a service</option>
            {services.map((service) => (
              <option key={service.name} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>

          <label htmlFor="booking-location">Your area in Abuja</label>
          <input
            id="booking-location"
            name="location"
            placeholder="e.g. Gwarinpa, Wuse, Lugbe"
            required
          />

          <label htmlFor="booking-message">Describe the problem</label>
          <textarea
            id="booking-message"
            name="message"
            placeholder="Tell us what needs fixing..."
            rows={4}
          />

          <button type="submit">Send Booking via WhatsApp →</button>
          <small>Your booking details will open in WhatsApp for you to send.</small>
        </form>
      </section>

      <footer className="footer">
        <div className="footerMain">
          <div className="footerBrand">
            <a href="/" className="logo">
              <span className="logoMark">A</span>
              <span>Abuja<span className="logoAccent">Fix</span></span>
            </a>
            <p>Find Trusted Technicians. Fix It Fast.</p>
            <small>Serving homes and businesses across Abuja, FCT.</small>
          </div>

          <div className="footerLinks">
            <strong>Explore</strong>
            <a href="#services">Our Services</a>
            <a href="#how">How It Works</a>
            <a href="/technicians">Find a Technician</a>
          </div>

          <div className="footerLinks">
            <strong>Customer</strong>
            <a href="/request-service">Request Service</a>
            <a href="/track-job">Track My Job</a>
            <a href="/customer-login">Customer Login</a>
          </div>

          <div className="footerLinks">
            <strong>Technicians</strong>
            <a href="/technician-login">Technician Login</a>
            <a href="/technician-register">Become a Technician</a>
          </div>
        </div>

        <div className="footerBottom">
          <span>© 2026 AbujaFix. All rights reserved.</span>
          <span>Find Trusted Technicians. Fix It Fast.</span>
        </div>
      </footer>

      <style jsx>{`
        .homepage {
          color: #172b46;
          background: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          overflow: hidden;
        }

        .navbar {
          min-height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 0 6.5%;
          background: #fff;
          border-bottom: 1px solid #edf1f6;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #143c6a;
          font-size: 23px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .logoMark {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          background: #f28c28;
          border-radius: 10px;
          color: white;
          font-size: 21px;
        }

        .logoAccent {
          color: #f28c28;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 23px;
        }

        .navLinks a {
          color: #56677e;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .navLinks a:hover {
          color: #1d64aa;
        }

        .navButton,
        .primaryButton,
        .ctaButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #f28c28;
          color: white;
          border-radius: 7px;
          padding: 13px 18px;
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .navButton:hover,
        .primaryButton:hover,
        .ctaButton:hover {
          background: #df7816;
          transform: translateY(-2px);
        }

        .hero {
          min-height: 570px;
          padding: 80px 8%;
          background: linear-gradient(120deg, #f5f8fd 0%, #ffffff 65%, #edf4fc 100%);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 55px;
        }

        .heroContent {
          max-width: 650px;
        }

        .trustLabel,
        .sectionEyebrow {
          color: #2868a9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .trustLabel {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .trustDot {
          width: 8px;
          height: 8px;
          background: #f28c28;
          border-radius: 50%;
        }

        .hero h1 {
          color: #14375f;
          font-size: clamp(39px, 5vw, 62px);
          line-height: 1.13;
          letter-spacing: -2px;
          margin: 22px 0;
        }

        .hero h1 span {
          color: #e78324;
          display: block;
        }

        .heroText {
          max-width: 570px;
          color: #718097;
          font-size: 15px;
          line-height: 1.9;
          margin-bottom: 28px;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .heroActions .primaryButton {
          padding: 15px 21px;
        }

        .secondaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 21px;
          border: 1px solid #cdd9e8;
          border-radius: 7px;
          color: #1c4d80;
          background: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
        }

        .secondaryButton:hover {
          background: #edf4fc;
        }

        .heroFeatures {
          display: flex;
          flex-wrap: wrap;
          gap: 19px;
          margin-top: 34px;
        }

        .heroFeatures span {
          color: #748399;
          font-size: 10px;
          font-weight: 600;
        }

        .heroFeatures b {
          color: #299767;
          margin-right: 5px;
        }

        .heroVisual {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visualCircle {
          position: absolute;
          border-radius: 50%;
          background: #dceafb;
        }

        .circleOne {
          width: 360px;
          height: 360px;
        }

        .circleTwo {
          width: 270px;
          height: 270px;
          background: #cbdff5;
        }

        .visualCard {
          position: relative;
          z-index: 1;
          width: min(370px, 90%);
          background: white;
          border-radius: 17px;
          padding: 22px;
          box-shadow: 0 25px 70px rgba(24, 58, 99, 0.15);
        }

        .visualTop {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #edf1f6;
          padding-bottom: 16px;
        }

        .visualLogo {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          background: #f28c28;
          color: white;
          border-radius: 9px;
          font-weight: bold;
        }

        .visualTop strong,
        .visualTop small {
          display: block;
        }

        .visualTop strong {
          color: #173c65;
          font-size: 13px;
        }

        .visualTop small {
          color: #98a4b3;
          font-size: 9px;
          margin-top: 3px;
        }

        .visualOnline {
          margin-left: auto;
          color: #279568;
          font-size: 9px;
        }

        .visualMainIcon {
          text-align: center;
          font-size: 43px;
          margin-top: 20px;
        }

        .visualCard h3 {
          text-align: center;
          color: #173c65;
          font-size: 17px;
          margin: 10px 0 5px;
        }

        .visualCard > p {
          text-align: center;
          color: #8b98aa;
          font-size: 11px;
          margin-bottom: 19px;
        }

        .visualService {
          display: flex;
          align-items: center;
          gap: 10px;
          border-top: 1px solid #edf1f6;
          padding: 11px 0;
        }

        .visualService > span {
          font-size: 20px;
        }

        .visualService strong,
        .visualService small {
          display: block;
        }

        .visualService strong {
          font-size: 10px;
          color: #314b69;
        }

        .visualService small {
          font-size: 9px;
          color: #9aa6b4;
          margin-top: 3px;
        }

        .visualService > b {
          margin-left: auto;
          color: #299767;
          font-size: 14px;
        }

        .floatingBadge {
          position: absolute;
          right: -14px;
          bottom: 25px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 13px 16px;
          border-radius: 10px;
          box-shadow: 0 12px 35px rgba(24, 58, 99, 0.13);
        }

        .floatingBadge > span {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e8f7ef;
          color: #299767;
        }

        .floatingBadge strong,
        .floatingBadge small {
          display: block;
        }

        .floatingBadge strong {
          font-size: 10px;
          color: #294564;
        }

        .floatingBadge small {
          color: #96a2b1;
          font-size: 9px;
          margin-top: 4px;
        }

        .serviceIntro {
          padding: 82px 8%;
        }

        .sectionHeader {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
        }

        .sectionHeader h2,
        .howIntro h2,
        .whyContent h2 {
          color: #173b64;
          font-size: 32px;
          letter-spacing: -0.8px;
          margin: 12px 0;
        }

        .sectionHeader p,
        .howIntro p,
        .whyContent > p {
          color: #8491a2;
          font-size: 12px;
          line-height: 1.8;
        }

        .textLink {
          color: #2366a8;
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          white-space: nowrap;
        }

        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 17px;
        }

        .serviceCard {
          display: block;
          padding: 23px;
          border: 1px solid #e8eef5;
          border-radius: 12px;
          background: white;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .serviceCard:hover {
          transform: translateY(-4px);
          border-color: #b8cee6;
          box-shadow: 0 13px 30px rgba(23, 59, 100, 0.07);
        }

        .serviceCardTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .serviceIcon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #eff5fc;
          font-size: 24px;
        }

        .serviceNumber {
          color: #d0dae6;
          font-size: 13px;
          font-weight: bold;
        }

        .serviceCard h3 {
          color: #254362;
          font-size: 15px;
          margin: 19px 0 8px;
        }

        .serviceCard p {
          color: #8c99a9;
          font-size: 11px;
          margin: 0;
          line-height: 1.6;
        }

        .serviceLink {
          display: inline-block;
          color: #2868a9;
          font-size: 10px;
          font-weight: bold;
          margin-top: 20px;
        }

        .serviceLink b {
          margin-left: 5px;
        }

        .howSection {
          padding: 75px 8%;
          background: #f3f7fc;
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          align-items: center;
          gap: 45px;
        }

        .howIntro h2 {
          max-width: 370px;
          line-height: 1.25;
        }

        .howIntro p {
          max-width: 370px;
          margin-bottom: 24px;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .stepCard {
          position: relative;
          min-height: 220px;
          background: white;
          border: 1px solid #e8eef5;
          border-radius: 11px;
          padding: 18px;
        }

        .stepNumber {
          color: #c7d6e7;
          font-size: 12px;
          font-weight: bold;
        }

        .stepIcon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          background: #edf4fc;
          color: #2868a9;
          border-radius: 10px;
          font-size: 20px;
          margin: 19px 0;
        }

        .stepCard h3 {
          color: #244464;
          font-size: 12px;
          margin: 0 0 8px;
        }

        .stepCard p {
          color: #8997a8;
          font-size: 10px;
          line-height: 1.7;
          margin: 0;
        }

        .whySection {
          padding: 85px 8%;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 80px;
          align-items: center;
        }

        .whyVisual {
          min-height: 330px;
          position: relative;
          border-radius: 18px;
          background: linear-gradient(140deg, #dceafa, #f1f6fc);
          display: grid;
          place-items: center;
        }

        .whyIcon {
          font-size: 120px;
        }

        .whySmallCard {
          position: absolute;
          left: 25px;
          right: 25px;
          bottom: 22px;
          padding: 17px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(23, 59, 100, 0.08);
        }

        .whySmallCard span,
        .whySmallCard strong {
          display: block;
        }

        .whySmallCard span {
          color: #8b98a8;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .whySmallCard strong {
          color: #1d426b;
          font-size: 14px;
          margin-top: 7px;
        }

        .whyContent h2 {
          max-width: 490px;
          line-height: 1.25;
        }

        .whyContent > p {
          max-width: 510px;
          margin-bottom: 24px;
        }

        .whyItem {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin: 18px 0;
        }

        .whyItem > span {
          flex-shrink: 0;
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #27875b;
          background: #e8f7ef;
          font-size: 12px;
        }

        .whyItem strong,
        .whyItem small {
          display: block;
        }

        .whyItem strong {
          color: #304b69;
          font-size: 12px;
        }

        .whyItem small {
          color: #8c99a9;
          font-size: 10px;
          margin-top: 5px;
        }

        .ctaSection {
          padding: 65px 20px;
          text-align: center;
          background: #153e6b;
          color: white;
        }

        .ctaSection .sectionEyebrow {
          color: #f5b36e;
        }

        .ctaSection h2 {
          font-size: 31px;
          margin: 14px 0 10px;
        }

        .ctaSection p {
          color: #d1deec;
          font-size: 12px;
          margin-bottom: 24px;
        }

        .ctaButton {
          background: #f28c28;
        }

        .bookingSection {
          padding: 85px 8%;
          background: #f4f7fb;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 75px;
          align-items: start;
        }

        .bookingIntro h2 {
          color: #173b64;
          font-size: 35px;
          line-height: 1.25;
          margin: 15px 0;
        }

        .bookingIntro > p {
          color: #8491a2;
          font-size: 13px;
          line-height: 1.8;
          max-width: 370px;
        }

        .bookingNote {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 25px;
          color: #53708e;
          font-size: 11px;
        }

        .bookingNote span {
          color: #279767;
          font-weight: bold;
        }

        .bookingForm {
          background: white;
          padding: 30px;
          border: 1px solid #e7edf4;
          border-radius: 13px;
          box-shadow: 0 10px 35px rgba(25, 58, 96, 0.05);
        }

        .formHeading {
          margin-bottom: 22px;
        }

        .formHeading h3 {
          color: #1c416a;
          font-size: 19px;
          margin: 0 0 7px;
        }

        .formHeading p {
          color: #94a0ae;
          font-size: 11px;
          margin: 0;
        }

        .bookingForm label {
          display: block;
          color: #405872;
          font-size: 11px;
          font-weight: bold;
          margin: 15px 0 7px;
        }

        .bookingForm input,
        .bookingForm select,
        .bookingForm textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #dce5ef;
          border-radius: 7px;
          background: #fff;
          color: #263e5b;
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }

        .bookingForm input:focus,
        .bookingForm select:focus,
        .bookingForm textarea:focus {
          border-color: #397cc1;
          box-shadow: 0 0 0 3px rgba(57, 124, 193, 0.08);
        }

        .bookingForm textarea {
          resize: vertical;
        }

        .bookingForm button {
          width: 100%;
          border: 0;
          background: #f28c28;
          color: white;
          border-radius: 7px;
          padding: 14px;
          margin-top: 20px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
        }

        .bookingForm button:hover {
          background: #df7816;
        }

        .bookingForm > small {
          display: block;
          text-align: center;
          color: #9ba7b5;
          font-size: 9px;
          margin-top: 12px;
        }

        .footer {
          background: #102d50;
          color: white;
          padding: 55px 8% 20px;
        }

        .footerMain {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 35px;
          padding-bottom: 40px;
        }

        .footer .logo {
          color: white;
        }

        .footerBrand > p {
          color: #d3dfed;
          font-size: 12px;
          margin-top: 18px;
        }

        .footerBrand > small {
          color: #92a9c4;
          font-size: 10px;
          line-height: 1.7;
        }

        .footerLinks {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .footerLinks strong {
          color: white;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .footerLinks a {
          color: #afc1d6;
          font-size: 10px;
          text-decoration: none;
        }

        .footerLinks a:hover {
          color: #ffb15d;
        }

        .footerBottom {
          border-top: 1px solid #2a4667;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #92a9c4;
          font-size: 10px;
        }

        @media (max-width: 1050px) {
          .navbar {
            padding: 0 4%;
          }

          .navLinks {
            gap: 12px;
          }

          .navLinks a {
            font-size: 10px;
          }

          .hero,
          .serviceIntro,
          .howSection,
          .whySection,
          .bookingSection {
            padding-left: 5%;
            padding-right: 5%;
          }

          .howSection {
            grid-template-columns: 1fr;
          }

          .whySection {
            gap: 40px;
          }
        }

        @media (max-width: 760px) {
          .navbar {
            min-height: auto;
            padding: 16px 5%;
            flex-wrap: wrap;
            gap: 15px;
          }

          .navLinks {
            order: 3;
            width: 100%;
            overflow-x: auto;
            padding: 8px 0 2px;
          }

          .navLinks a {
            font-size: 10px;
          }

          .navButton {
            padding: 11px 13px;
            font-size: 10px;
          }

          .hero {
            padding-top: 55px;
            padding-bottom: 55px;
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .hero h1 {
            font-size: 43px;
          }

          .heroVisual {
            min-height: 390px;
          }

          .serviceGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .stepCard {
            min-height: auto;
          }

          .whySection {
            grid-template-columns: 1fr;
          }

          .whyVisual {
            min-height: 280px;
          }

          .bookingSection {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .footerMain {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 37px;
            letter-spacing: -1.3px;
          }

          .heroText {
            font-size: 13px;
          }

          .heroFeatures {
            gap: 12px;
          }

          .heroFeatures span {
            font-size: 9px;
          }

          .heroVisual {
            min-height: 350px;
          }

          .circleOne {
            width: 300px;
            height: 300px;
          }

          .circleTwo {
            width: 230px;
            height: 230px;
          }

          .visualCard {
            padding: 17px;
          }

          .floatingBadge {
            right: 0;
            bottom: 5px;
          }

          .serviceIntro,
          .howSection,
          .whySection,
          .bookingSection {
            padding-top: 60px;
            padding-bottom: 60px;
          }

          .sectionHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .sectionHeader h2,
          .howIntro h2,
          .whyContent h2 {
            font-size: 27px;
          }

          .serviceGrid {
            grid-template-columns: 1fr;
          }

          .bookingIntro h2 {
            font-size: 29px;
          }

          .bookingForm {
            padding: 20px;
          }

          .footerMain {
            grid-template-columns: 1fr 1fr;
            gap: 28px 15px;
          }

          .footerBottom {
            flex-direction: column;
            line-height: 1.6;
          }

          .ctaSection h2 {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}

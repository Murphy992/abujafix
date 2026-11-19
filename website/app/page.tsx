"use client";

export default function Home() {
const services = [
{ icon: "⚡️", name: "Electrical Services", desc: "Repairs, wiring and installations" },
{ icon: "☀️", name: "Solar & Inverters", desc: "Solar systems and backup power" },
{ icon: "📹", name: "CCTV & Security", desc: "Security cameras and installation" },
{ icon: "🌐", name: "Networking & Fibre", desc: "Internet, routers and fibre cabling" },
{ icon: "🚰", name: "Plumbing", desc: "Leaks, pipes and water systems" },
{ icon: "❄️", name: "AC Services", desc: "Air conditioning and maintenance" },
];

function handleBooking(event: React.FormEvent<HTMLFormElement>) {
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
<main>
<nav className="nav">
  <a href="#" className="logo">
    Abuja<span>Fix</span>
  </a>

  <div className="navLinks">
  <a href="#services">Services</a>
  <a href="#how">How it works</a>
  <a href="/technicians">Find a Technician</a>
  <a href="/request-service">Request a Technician</a>
  <a href="/track-job">Track My Job</a>
  <a href="/technician-register">Become a Technician</a>
</div>  

  <a className="navButton" href="#booking">
    Get Help
  </a>
</nav>

  <section className="hero">
    <div className="heroContent">
      <p className="eyebrow">YOUR LOCAL SERVICE MARKETPLACE</p>
      <h1>Find Trusted Technicians. <span>Fix It Fast.</span></h1>
      <p className="heroText">
        Connect with skilled service professionals for your home
        and business across Abuja, FCT.
      </p>
      <a className="primaryButton" href="/request-service">
  Request a Technician →
</a>

<a className="primaryButton" href="/track-job">
  Track My Job →
</a>
      <p className="smallText">Electrical · Solar · CCTV · Plumbing · AC</p>
    </div>

    <div className="heroCard">
      <div className="heroIcon">🔧</div>
      <h3>Your problem. Our solution.</h3>
      <p>Find the right technician for the job.</p>
      <div className="heroCheck">✓ Easy service requests</div>
      <div className="heroCheck">✓ Local technicians</div>
      <div className="heroCheck">✓ Direct communication</div>
    </div>
  </section>

  <section id="services" className="section">
    <p className="eyebrow">WHAT DO YOU NEED FIXED?</p>
    <h2>Explore Our Services</h2>
    <p className="sectionText">
      Professional help for everyday technical problems.
    </p>

    <div className="serviceGrid">
      {services.map((service) => (
        <a href="#booking" className="serviceCard" key={service.name}>
          <span className="serviceIcon">{service.icon}</span>
          <h3>{service.name}</h3>
          <p>{service.desc}</p>
          <span className="learnMore">Request service →</span>
        </a>
      ))}
    </div>
  </section>

  <section id="how" className="howSection">
    <p className="eyebrow">SIMPLE AND CONVENIENT</p>
    <h2>How AbujaFix Works</h2>

    <div className="steps">
      <div>
        <b>01</b>
        <h3>Choose a service</h3>
        <p>Tell us what needs fixing.</p>
      </div>
      <div>
        <b>02</b>
        <h3>Send your request</h3>
        <p>Share your location and contact details.</p>
      </div>
      <div>
        <b>03</b>
        <h3>Connect with a technician</h3>
        <p>Arrange the job directly.</p>
      </div>
    </div>
  </section>

  <section id="booking" className="bookingSection">
    <p className="eyebrow">LET'S GET IT FIXED</p>
    <h2>Request a Service</h2>
    <p>Complete this form to contact our AbujaFix team.</p>

    <form className="bookingForm" onSubmit={handleBooking}>
      <label>Your name</label>
      <input name="name" placeholder="Enter your name" required />

      <label>Phone number</label> <input name="phone" placeholder="Your WhatsApp number" required />

      <label>Service needed</label>
      <select name="service" required>
        <option value="">Choose a service</option>
        {services.map((service) => (
          <option key={service.name} value={service.name}>
            {service.name}
          </option>
        ))}
      </select>

      <label>Your area in Abuja</label>
      <input
        name="location"
        placeholder="e.g. Gwarinpa, Wuse, Lugbe"
        required
      />

      <label>Describe the problem</label>
      <textarea
        name="message"
        placeholder="Tell us what needs fixing..."
        rows={4}
      />

      <button type="submit">Send Booking via WhatsApp</button>
    </form>

    <p className="smallText">
      Your booking details will open in WhatsApp for you to send.
    </p>
  </section>

  <footer>
    <a href="#" className="logo">Abuja<span>Fix</span></a>
    <p>Find Trusted Technicians. Fix It Fast.</p>
    <p>Serving Abuja, FCT · © 2026 AbujaFix</p>
  </footer>
</main>
);
}

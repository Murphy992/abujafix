"use client";

import { useState } from "react";
import { supabase } from "../../supabase";

const services = [
"Electrical Services",
"Solar & Inverters",
"CCTV & Security",
"Networking & Fibre",
"Plumbing",
"AC Services",
"Other",
];

export default function TechnicianRegister() {
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState("");
const [error, setError] = useState("");

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();

setLoading(true);
setSuccess("");
setError("");

const form = event.currentTarget;
const data = new FormData(form);

const { error: submitError } = await supabase
  .from("technicians")
  .insert({
    full_name: String(data.get("full_name") || ""),
    phone: String(data.get("phone") || ""),
    email: String(data.get("email") || ""),
    service_category: String(data.get("service") || ""),
    other_skills: String(data.get("skills") || ""),
    location: String(data.get("location") || ""),
    experience_years: Number(data.get("experience") || 0),
    description: String(data.get("description") || ""),
    status: "pending",
  });

setLoading(false);

if (submitError) {
  setError(submitError.message);
  return;
}

setSuccess(
  "Your application has been submitted successfully! AbujaFix will review your details."
);

form.reset();
}

return (
<main className="registerPage">
<div className="registerCard">
<a href="/" className="homeLink">
← AbujaFix Home
</a>

    <h1>Join AbujaFix as a Technician</h1>

    <p className="intro">
      Register your professional services and connect with customers
      looking for skilled technicians in Abuja.
    </p>

    <form onSubmit={handleSubmit}>
      <label>Full name *</label>
      <input
        name="full_name"
        required
        placeholder="Enter your full name"
      />

      <label>Phone / WhatsApp number *</label>
      <input
        name="phone"
        required
        placeholder="e.g. 08012345678"
      />

      <label>Email address</label>
      <input
        name="email"
        type="email"
        placeholder="Your email address"
      />

      <label>Professional service *</label>
      <select name="service" required defaultValue="">
        <option value="" disabled>
          Select your main service
        </option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>

      <label>Other skills</label>
      <input
        name="skills"
        placeholder="List additional skills"
      />

      <label>Your location in Abuja *</label>
      <input
        name="location"
        required
        placeholder="e.g. Kubwa, Wuse, Lugbe"
      />

      <label>Years of experience</label>
      <input
        name="experience"
        type="number"
        min="0"
        max="60"
        defaultValue="0"
      />

      <label>Describe your experience</label>
      <textarea
        name="description"
        rows={4}
        placeholder="Describe your skills and previous work..."
      />

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Registration"}
      </button>
    </form>

    {success && <p className="success">{success}</p>}
    {error && <p className="error">{error}</p>}

    <p className="note">
      All applications are reviewed by AbujaFix before technicians
      are approved for public listing.
    </p>
  </div>

  <style jsx>{`
    .registerPage {
      min-height: 100vh;
      background: #f4f7fb;
      padding: 40px 16px;
    }

    .registerCard {
      max-width: 650px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.06);
    }

    .homeLink {
      color: #1264c0;
      text-decoration: none;
      font-weight: bold;
    }

    h1 {
      color: #12345a;
      margin-top: 25px;
      font-size: 30px;
    }

    .intro, .note {
      color: #64748b;
      line-height: 1.6;
    } 
    label {
      display: block;
      margin-top: 18px;
      margin-bottom: 7px;
      color: #12345a;
      font-weight: 600;
    }

    input, select, textarea {
      width: 100%;
      padding: 13px;
      border: 1px solid #d5deea;
      border-radius: 8px;
      font-size: 15px;
      background: white;
      color: #172b45;
    }

    button {
      width: 100%;
      margin-top: 25px;
      padding: 15px;
      background: #1264c0;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success {
      color: green;
      margin-top: 20px;
    }

    .error {
      color: red;
      margin-top: 20px;
    }

    .note {
      font-size: 13px;
      margin-top: 20px;
    }
  `}</style>
</main>
);
}
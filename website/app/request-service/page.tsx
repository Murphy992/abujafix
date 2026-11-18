"use client";

import { useState } from "react";
import { supabase } from "../../supabase";

export default function RequestServicePage() {
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState("");
const [error, setError] = useState("");

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

setLoading(true);
setSuccess("");
setError("");

const form = event.currentTarget;
const data = new FormData(form);

const job = {
  customer_name: String(data.get("customer_name") || "").trim(),
  phone: String(data.get("phone") || "").trim(),
  service_category: String(data.get("service_category") || ""),
  location: String(data.get("location") || "").trim(),
  description: String(data.get("description") || "").trim(),
  status: "pending",
};

const { error } = await supabase.from("jobs").insert(job);

setLoading(false);

if (error) {
  setError("We could not submit your request. Please try again.");
  return;
}

setSuccess("Your job request has been submitted successfully!");
form.reset();
}

return (
<main className="page">
<section className="formCard">
<a href="/" className="back">← AbujaFix Home</a>

    <p className="eyebrow">ABUJAFIX CUSTOMER SERVICES</p>
    <h1>Request a Technician</h1>
    <p className="intro">
      Tell us what needs fixing. Our team will review your request.
    </p>

    <form onSubmit={handleSubmit}>
      <label>Your full name</label>
      <input
        name="customer_name"
        placeholder="Enter your full name"
        required
      />

      <label>Phone number</label>
      <input
        name="phone"
        type="tel"
        placeholder="e.g. 08012345678"
        required
      />

      <label>Service required</label>
      <select name="service_category" required defaultValue="">
        <option value="" disabled>Choose a service</option>
        <option>Electrical Services</option>
        <option>Solar & Inverters</option>
        <option>CCTV & Security</option>
        <option>Networking & Fibre</option>
        <option>Plumbing</option>
        <option>AC Services</option>
        <option>Other</option>
      </select>

      <label>Your location in Abuja</label>
      <input
        name="location"
        placeholder="e.g. Gwarinpa, Wuse, Lugbe"
        required
      />

      <label>Describe the problem</label>
      <textarea
        name="description"
        placeholder="Explain what needs fixing..."
        rows={5}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Job Request"}
      </button>
    </form>

    {success && <p className="success">{success}</p>}
    {error && <p className="error">{error}</p>}

    <p className="note">
      Your request is sent securely to AbujaFix for review.
    </p>
  </section>

  <style jsx>{`
    .page {
      min-height: 100vh;
      background: #f4f7fb;
      padding: 35px 16px;
      color: #12345a;
    }

    .formCard {
      max-width: 620px;
      margin: auto;
      padding: 30px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 5px 25px rgba(0,0,0,.06);
    }

    .back {
      color: #1264c0;
      text-decoration: none;
    }

    .eyebrow {
      color: #1264c0;
      font-weight: bold;
      margin-top: 30px;
    }

    h1 {
      font-size: 30px;
      margin: 10px 0;
    }

    .intro, .note {
      color: #64748b;
      line-height: 1.6;
    }

    form {
      display: grid;
      gap: 10px;
      margin-top: 25px;
    }

    label {
      font-weight: 600;
      margin-top: 8px;
    }

    input, select, textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 13px;
      border: 1px solid #d5deea;
      border-radius: 8px;
      font-size: 15px;
      background: white;
      color: #12345a;
    }

    button {
      margin-top: 15px;
      padding: 15px;
      border: none;
      border-radius: 8px;
      background: #1264c0;
      color: white;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
    }

    button:disabled {
    opacity: .6;
      cursor: wait;
    }

    .success {
      color: #15803d;
      font-weight: bold;
      margin-top: 20px;
    }

    .error {
      color: #dc2626;
      font-weight: bold;
      margin-top: 20px;
    }

    .note {
      margin-top: 20px;
      font-size: 13px;
    }
  `}</style>
</main>
);
}
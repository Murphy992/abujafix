"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase";

type Technician = {
id: string;
full_name: string;
phone: string;
service_category: string;
other_skills: string | null;
location: string;
experience_years: number;
description: string | null;
};

const categories = [
"All Services",
"Electrical Services",
"Solar & Inverters",
"CCTV & Security",
"Networking & Fibre",
"Plumbing",
"AC Services",
"Other",
];

function whatsappNumber(phone: string) {
let number = phone.replace(/\D/g, "");

if (number.startsWith("0")) {
number = "234" + number.slice(1);
} else if (number.startsWith("234")) {
// Already has Nigeria country code.
}

return number;
}

export default function TechniciansPage() {
const [technicians, setTechnicians] = useState<Technician[]>([]);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All Services");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
async function loadTechnicians() {
const { data, error } = await supabase
.from("approved_technicians")
.select("*")
.order("created_at", { ascending: false });

  if (error) {
    setError("Unable to load technicians. Please try again later.");
  } else {
    setTechnicians(data || []);
  }

  setLoading(false);
}

loadTechnicians();
}, []);

const filteredTechnicians = useMemo(() => {
const term = search.toLowerCase().trim();

return technicians.filter((tech) => {
  const matchesCategory =
    category === "All Services" ||
    tech.service_category === category;

  const searchableText = [
    tech.full_name,
    tech.service_category,
    tech.location,
    tech.other_skills || "",
    tech.description || "",
  ].join(" ").toLowerCase();

  return matchesCategory && searchableText.includes(term);
});
}, [technicians, search, category]);

return (
<main className="directory">
<header className="hero">
<a href="/" className="homeLink">← AbujaFix Home</a>
<h1>Find Trusted Technicians</h1>
<p>
Connect with approved skilled professionals across Abuja, FCT.
</p>
<a href="/technician-register" className="joinLink">
Are you a technician? Join AbujaFix
</a>
</header>

  <section className="content">
    <h2>Browse Technicians</h2>

    <input
      className="search"
      type="search"
      placeholder="Search by name, service or location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <select
      className="filter"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      {categories.map((item) => (
        <option key={item} value={item}>{item}</option>
      ))}
    </select>

    {loading && <p>Loading approved technicians...</p>}

    {error && <p className="error">{error}</p>}

    {!loading && !error && (
      <>
        <p className="count">
          {filteredTechnicians.length} technician(s) found
        </p>

        {filteredTechnicians.length === 0 ? (
          <div className="empty">
            <h3>No technicians found yet</h3>
            <p>
              Try another service or search term. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid">
            {filteredTechnicians.map((tech) => (
              <article className="card" key={tech.id}>
                <div className="verified">✓ AbujaFix Approved</div>

                <h3>{tech.full_name}</h3>

                <p className="service">
                  {tech.service_category}
                </p>

                <p>
                  <strong>Location:</strong> {tech.location}
                </p>

                <p>
                  <strong>Experience:</strong>{" "}
                  {tech.experience_years} years
                </p>

                {tech.other_skills && (
                  <p>
                    <strong>Other skills:</strong> {tech.other_skills}
                  </p>
                )}

                {tech.description && (
                  <p className="description">{tech.description}</p>
                  )}

                <a
                  className="whatsapp"
                  href={`https://wa.me/${whatsappNumber(tech.phone)}?text=${encodeURIComponent(
                    `Hello ${tech.full_name}, I found your profile on AbujaFix and would like to discuss your ${tech.service_category}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact on WhatsApp
                </a>
              </article>
            ))}
          </div>
        )}
      </>
    )}
  </section>

  <style jsx>{`
    .directory {
      min-height: 100vh;
      background: #f4f7fb;
      color: #12345a;
    }

    .hero {
      background: #12345a;
      color: white;
      padding: 45px 20px;
      text-align: center;
    }

    .homeLink {
      color: white;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 25px;
    }

    .hero h1 {
      font-size: 34px;
      margin: 10px 0;
    }

    .hero p {
      line-height: 1.6;
    }

    .joinLink {
      display: inline-block;
      margin-top: 15px;
      background: #f59e0b;
      color: #12345a;
      padding: 12px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }

    .content {
      max-width: 1100px;
      margin: auto;
      padding: 35px 18px;
    }

    .search, .filter {
      width: 100%;
      padding: 14px;
      margin: 10px 0;
      border: 1px solid #d5deea;
      border-radius: 8px;
      background: white;
      color: #12345a;
      font-size: 15px;
    }

    .count {
      color: #64748b;
      margin: 20px 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      padding: 22px;
      border-radius: 12px;
      border: 1px solid #e1e8f0;
      box-shadow: 0 4px 15px rgba(0,0,0,.04);
      overflow-wrap: anywhere;
    }

    .verified {
      color: #15803d;
      font-weight: bold;
      font-size: 13px;
    }

    .card h3 {
      margin: 15px 0 5px;
      font-size: 21px;
    }

    .service {
      color: #1264c0;
      font-weight: bold;
    }

    .description {
      color: #64748b;
      line-height: 1.6;
    }

    .whatsapp {
      display: block;
      margin-top: 20px;
      padding: 13px;
      background: #15803d;
      color: white;
      text-align: center;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }

    .empty {
      background: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
    }

    .error {
      color: #dc2626;
    }
  `}</style>
</main>
);
}
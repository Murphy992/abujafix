"use client";

import { useState } from "react";
import { supabase } from "../../supabase";

type JobTracking = {
service_category: string;
status: string;
created_at: string;
};

export default function TrackJobPage() {
const [reference, setReference] = useState("");
const [job, setJob] = useState<JobTracking | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function trackJob(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

setLoading(true);
setError("");
setJob(null);

const { data, error } = await supabase.rpc("track_customer_job", {
  p_job_id: reference.trim(),
});

setLoading(false);

if (error || !data || data.length === 0) {
  setError("Job not found. Please check your tracking reference.");
  return;
}

setJob(data[0] as JobTracking);
}

const statusLabels: Record<string, string> = {
pending: "Request Received",
assigned: "Technician Assigned",
in_progress: "Work In Progress",
completed: "Job Completed",
};

return (
<main className="page">
<section className="card">
<a href="/" className="back">← AbujaFix Home</a>

    <p className="eyebrow">ABUJAFIX CUSTOMER SERVICES</p>
    <h1>Track Your Job</h1>

    <p className="intro">
      Enter the tracking reference you received after submitting
      your service request.
    </p>

    <form onSubmit={trackJob}>
      <label>Tracking Reference</label>
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Enter your job reference"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Checking..." : "Track My Job"}
      </button>
    </form>

    {error && <p className="error">{error}</p>}

    {job && (
      <div className="result">
        <h2>Job Status</h2>
        <p className="service">{job.service_category}</p>

        <p className="status">
          {statusLabels[job.status.toLowerCase()] || job.status}
        </p>

        <p className="date">
          Submitted: {new Date(job.created_at).toLocaleString()}
        </p>
      </div>
    )}

    <p className="note">
      Keep your tracking reference private. You will need it
      to check your job progress.
    </p>
  </section>

  <style jsx>{`
    .page {
      min-height: 100vh;
      background: #f4f7fb;
      padding: 35px 16px;
      color: #12345a;
    }

    .card {
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

    .intro, .note, .date {
      color: #64748b;
      line-height: 1.6;
    }

    form {
      display: grid;
      gap: 12px;
      margin-top: 25px;
    }

    label {
      font-weight: 600;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 14px;
      border: 1px solid #d5deea;
      border-radius: 8px;
      font-size: 15px;
    }

    button {
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

    .error {
      color: #dc2626;
      font-weight: bold;
      margin-top: 20px;
    }

    .result {
      margin-top: 25px;
      padding: 20px;
      background: #f0f7ff;
      border-radius: 10px;
    }

    .service {
      font-weight: 600;
    }

    .status {
      color: #1264c0;
      font-size: 20px;
      font-weight: bold;
    }

    .note {
      margin-top: 25px;
      font-size: 13px;
    }
  `}</style>
</main>
);
}
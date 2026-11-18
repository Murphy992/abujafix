"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

type Technician = {
id: string;
full_name: string;
phone: string;
email: string | null;
service_category: string;
location: string;
experience_years: number;
description: string | null;
status: string;
};

 type Job = {
  id: string;
  customer_name: string;
  phone: string;
  service_category: string;
  location: string;
  description: string | null;
  status: string;
  assigned_technician_id: string | null;
  created_at: string;
};

export default function AdminPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loggedIn, setLoggedIn] = useState(false);
const [checking, setChecking] = useState(true);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [technicians, setTechnicians] = useState<Technician[]>([]);
const [jobs, setJobs] = useState<Job[]>([]);

async function loadTechnicians() {
const { data, error } = await supabase
.from("technicians")
.select("*")
.order("created_at", { ascending: false });

if (error) {
  setMessage(error.message);
  return;
}

setTechnicians(data ?? []);
}

async function loadJobs() {
const { data, error } = await supabase
.from("jobs")
.select("*")
.order("created_at", { ascending: false });

if (error) {
  setMessage(error.message);
  return;
}

setJobs(data ?? []);
}

async function loadDashboard() {
await Promise.all([loadTechnicians(), loadJobs()]);
}

async function verifyAdmin() {
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  setChecking(false);
  return;
}

const { data, error } = await supabase.rpc(
  "is_abujafix_admin"
);

if (error || data !== true) {
  setMessage(
    "This account is not authorised as an AbujaFix administrator."
  );
  setChecking(false);
  return;
}

setLoggedIn(true);
await loadDashboard();
setChecking(false);
}

useEffect(() => {
verifyAdmin();
}, []);

async function handleLogin(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();
setLoading(true);
setMessage("");

const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  setMessage(error.message);
  setLoading(false);
  return;
}

await verifyAdmin();
setLoading(false);
}

async function updateTechnicianStatus(
id: string,
status: string
) {
setMessage("");

const { error } = await supabase
  .from("technicians")
  .update({ status })
  .eq("id", id);

if (error) {
  setMessage(error.message);
  return;
}

setMessage("Technician application updated successfully.");
await loadTechnicians();
}

async function updateJobStatus(
id: string,
status: string
) {
setMessage("");

const { error } = await supabase
  .from("jobs")
  .update({ status })
  .eq("id", id);

if (error) {
  setMessage(error.message);
  return;
}

setMessage("Customer job status updated successfully.");
await loadJobs();
}async function assignTechnician(
  jobId: string,
  technicianId: string
) {
  setMessage("");

  const { error } = await supabase
    .from("jobs")
    .update({
      assigned_technician_id: technicianId || null,
      status: technicianId ? "assigned" : "pending",
    })
    .eq("id", jobId);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Technician assignment saved successfully.");
  await loadJobs();
}

async function handleLogout() {
await supabase.auth.signOut();
setLoggedIn(false);
setTechnicians([]);
setJobs([]);
setMessage("");
}

if (checking) {
return (
<main className="adminPage">
Checking administrator access...
</main>
);
}

return (
<main className="adminPage">
<div className="adminCard">
<a href="/" className="homeLink">
← AbujaFix Home
</a>

    {!loggedIn ? (
      <>
        <h1>AbujaFix Admin Login</h1>
        <p>Sign in with your authorised administrator account.</p>

        <form onSubmit={handleLogin}>
          <label>Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </>
    ) : (
      <>
      <div className="dashboardHeader">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage AbujaFix operations.</p>
          </div>

          <button className="logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        <h2>Technician Overview</h2>

        <div className="stats">
          <div>
            <strong>{technicians.length}</strong>
            <span>Total Applications</span>
          </div>

          <div>
            <strong>
              {technicians.filter(t => t.status === "pending").length}
            </strong>
            <span>Pending</span>
          </div>

          <div>
            <strong>
              {technicians.filter(t => t.status === "approved").length}
            </strong>
            <span>Approved</span>
          </div>
        </div>

        <h2>Technician Applications</h2>

        {technicians.length === 0 ? (
          <p>No technician applications yet.</p>
        ) : (
          technicians.map((tech) => (
            <div className="item" key={tech.id}>
              <h3>{tech.full_name}</h3>
              <p><strong>Phone:</strong> {tech.phone}</p>
              <p><strong>Email:</strong> {tech.email ?? "Not provided"}</p>
              <p><strong>Service:</strong> {tech.service_category}</p>
              <p><strong>Location:</strong> {tech.location}</p>
              <p><strong>Experience:</strong> {tech.experience_years} years</p>
              <p><strong>Description:</strong> {tech.description ?? "Not provided"}</p>
              <p><strong>Status:</strong> {tech.status}</p>

              {tech.status === "pending" && (
                <div className="actions">
                  <button
                    onClick={() =>
                      updateTechnicianStatus(tech.id, "approved")
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="reject"
                    onClick={() =>
                      updateTechnicianStatus(tech.id, "rejected")
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        <h2>Customer Jobs Overview</h2>

        <div className="stats jobStats">
          <div>
            <strong>{jobs.length}</strong>
            <span>Total Jobs</span>
          </div>

          <div>
            <strong>
              {jobs.filter(j => j.status === "pending").length}
            </strong>
            <span>Pending</span>
          </div>

          <div>
            <strong>
              {jobs.filter(j => j.status === "assigned").length}
            </strong>
            <span>Assigned</span>
          </div>

          <div>
            <strong>
              {jobs.filter(j => j.status === "in_progress").length}
            </strong>
            <span>In Progress</span>
          </div>

          <div>
            <strong>
              {jobs.filter(j => j.status === "completed").length}
            </strong>
            <span>Completed</span>
          </div>

          <div>
            <strong>
              {jobs.filter(j => j.status === "cancelled").length}
            </strong>
            <span>Cancelled</span>
          </div>
        </div>

        <h2>Customer Job Requests</h2>

        {jobs.length === 0 ? (
          <p>No customer job requests yet.</p>
        ) : (
          jobs.map((job) => (
            <div className="item" key={job.id}>
              <h3>{job.customer_name}</h3>
              <p><strong>Phone:</strong> {job.phone}</p>
              <p><strong>Service:</strong> {job.service_category}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Problem:</strong> {job.description || "Not provided"}</p>
              <p><strong>Status:</strong> {job.status.replace("_", " ")}</p>
              <p> <label>Assign an approved technician</label>

<select
  value={job.assigned_technician_id ?? ""}
  onChange={(e) =>
    assignTechnician(job.id, e.target.value)
  }
>
  <option value="">No technician assigned</option>

  {technicians
    .filter((tech) => tech.status === "approved")
    .map((tech) => (
      <option key={tech.id} value={tech.id}>
        {tech.full_name} - {tech.service_category}
      </option>
    ))}
</select>
                <strong>Submitted:</strong>{" "}
                {new Date(job.created_at).
                toLocaleString()}
              </p>

              <label>Update job status</label>

              <select
                value={job.status}
                onChange={(e) =>
                  updateJobStatus(job.id, e.target.value)
                }
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))
        )}
      </>
    )}

    {message && <p className="message">{message}</p>}
  </div>

  <style jsx>{`
    .adminPage {
      min-height: 100vh;
      background: #f4f7fb;
      padding: 40px 16px;
      color: #12345a;
    }

    .adminCard {
      max-width: 900px;
      margin: auto;
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 5px 25px rgba(0,0,0,.06);
    }

    .homeLink {
      color: #1264c0;
      text-decoration: none;
      font-weight: bold;
    }

    h1 { margin-top: 25px; font-size: 28px; }
    h2 { margin-top: 32px; }

    label {
      display: block;
      margin-top: 18px;
      margin-bottom: 7px;
      font-weight: 600;
    }

    input, select {
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
      padding: 12px 18px;
      background: #1264c0;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }

    form button { width: 100%; margin-top: 24px; }

    .dashboardHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .dashboardHeader h1 { margin-bottom: 5px; }
    .logout { background: #64748b; }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 20px;
    }

    .stats div {
      background: #edf4fc;
      padding: 18px;
      border-radius: 10px;
    }

    .stats strong, .stats span { display: block; }
    .stats strong { font-size: 25px; }
    .stats span { font-size: 13px; margin-top: 5px; }

    .jobStats {
      grid-template-columns: repeat(3, 1fr);
    }

    .item {
      border: 1px solid #dce5ef;
      border-radius: 10px;
      padding: 18px;
      margin-top: 16px;
      overflow-wrap: anywhere;
    }

    .item h3 { margin-top: 0; }
    .item p { line-height: 1.5; }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }

    .reject { background: #dc3545; }
    .message { margin-top: 20px; color: #1264c0; }

    @media (max-width: 500px) {
      .adminCard { padding: 20px; }
      .stats, .jobStats { grid-template-columns: repeat(2, 1fr); }
    }
  `}</style>
</main>
);
}
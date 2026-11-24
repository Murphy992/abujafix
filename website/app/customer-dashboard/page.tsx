"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";

type Job = {
id: string;
service_category: string;
status: string;
location: string;
description: string | null;
created_at: string;
};

type CustomerProfile = {
full_name: string;
email: string;
phone: string | null;
};

export default function CustomerDashboardPage() {
const router = useRouter();

const [loading, setLoading] = useState(true);
const [profile, setProfile] = useState<CustomerProfile | null>(null);
const [jobs, setJobs] = useState<Job[]>([]);
const [error, setError] = useState("");

useEffect(() => {
loadDashboard();
}, []);

async function loadDashboard() {
setLoading(true);
setError("");

try {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    router.replace("/customer-login");
    return;
  }

  const user = authData.user;

  const { data: customerProfile, error: profileError } =
    await supabase
      .from("customer_profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) throw profileError;

  let customer = customerProfile;

  if (!customer) {
    const fullName =
      String(user.user_metadata?.full_name || "").trim() ||
      "AbujaFix Customer";

    const phone =
      String(user.user_metadata?.phone || "").trim();

    const { data: newProfile, error: createProfileError } =
      await supabase
        .from("customer_profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          email: user.email || "",
          phone: phone || null,
        })
        .select("full_name, email, phone")
        .single();

    if (createProfileError) throw createProfileError;

    customer = newProfile;
  }

  setProfile(customer);

  const { data: customerJobs, error: jobsError } =
    await supabase
      .from("jobs")
      .select("id, service_category, status, location, description, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

  if (jobsError) throw jobsError;

  setJobs(customerJobs || []);
} catch (err) {
  console.error("Customer dashboard error:", err);
  setError(
    err instanceof Error
      ? err.message
      : "Unable to load your dashboard."
  );
} finally {
  setLoading(false);
}
}

async function handleLogout() {
const { error: logoutError } = await supabase.auth.signOut();

if (logoutError) {
  setError(logoutError.message);
  return;
}

router.replace("/customer-login");
}

function getStatus(status: string) {
const value = status.toLowerCase();

const labels: Record<string, string> = {
  pending: "Request Received",
  assigned: "Technician Assigned",
  in_progress: "Work in Progress",
  completed: "Job Completed",
};

return labels[value] || status;
}

function getStatusColor(status: string) {
const value = status.toLowerCase();

if (value === "completed") return "#22c55e";
if (value === "in_progress") return "#38bdf8";
if (value === "assigned") return "#f59e0b";

return "#94a3b8";
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.loading}>Loading your dashboard...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.container}>

    <header style={styles.header}>
      <a href="/" style={styles.logo}>
        Abuja<span style={{ color: "#38bdf8" }}>Fix</span>
      </a>

      <button onClick={handleLogout} style={styles.logout}>
        Sign Out
      </button>
    </header>

    <section style={styles.welcome}>
      <p style={styles.eyebrow}>CUSTOMER DASHBOARD</p>

      <h1 style={styles.heading}>
        Welcome, {profile?.full_name || "Customer"}
      </h1>

      <p style={styles.subtitle}>
        Manage your service requests and track your repairs.
      </p>

      <a href="/request-service" style={styles.newRequest}>
        + Request a Technician
      </a>
    </section>

    <section style={styles.stats}>
      <div style={styles.statCard}>
        <span style={styles.statNumber}>{jobs.length}</span>
        <span style={styles.statLabel}>Total Requests</span>
      </div>

      <div style={styles.statCard}>
        <span style={styles.statNumber}>
          {jobs.filter((job) =>
            ["pending", "assigned", "in_progress"].includes(
              job.status.toLowerCase()
            )
          ).length}
        </span>
        <span style={styles.statLabel}>Active Jobs</span>
      </div>

      <div style={styles.statCard}>
        <span style={styles.statNumber}>
          {jobs.filter(
            (job) => job.status.toLowerCase() === "completed"
          ).length}
        </span>
        <span style={styles.statLabel}>Completed</span>
      </div>
    </section>

    <section style={styles.jobsSection}>
      <h2 style={styles.sectionTitle}>My Service Requests</h2>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div style={styles.empty}>
          <h3>No service requests yet</h3>
          <p>
            When you request a technician, your jobs will appear here.
          </p>
          <a href="/request-service" style={styles.newRequest}>
            Request Your First Technician
          </a>
        </div>
      ) : (
        <div style={styles.jobList}>
          {jobs.map((job) => (
            <article key={job.id} style={styles.jobCard}>
              <div style={styles.jobTop}>
                <div>
                  <h3 style={styles.jobTitle}>
                    {job.service_category}
                  </h3>

                  <p style={styles.location}>
                    📍 {job.location}
                  </p>
                </div>

                <span
                  style={{
                    ...styles.status,
                    color: getStatusColor(job.status),
                    borderColor: getStatusColor(job.status),
                  }}
                >
                  {getStatus(job.status)}
                </span>
              </div>

              {job.description && (
                <p style={styles.description}>
                  {job.description}
                </p>
              )}

              <p style={styles.date}>
                Requested: {new Date(job.created_at).toLocaleDateString()}
              </p>

              <div style={styles.jobActions}>
                <a
                  href={`/track-job?reference=${job.id}`}
                  style={styles.trackButton}
                >
                  Track Job
                </a>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(job.id)
                  }
                  style={styles.copyButton}
                >
                  Copy Reference
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <footer style={styles.footer}>
      <p>AbujaFix — Find Trusted Technicians. Fix It Fast.</p>
    </footer>
  </div>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background: "radial-gradient(circle at top, #172554 0%, #080f20 45%, #050914 100%)",
color: "#f8fafc",
padding: "25px 16px",
fontFamily: "Arial, sans-serif",
},

container: {
maxWidth: "1000px",
margin: "auto",
},

loading: {
textAlign: "center",
padding: "100px 20px",
color: "#94a3b8",
},

header: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
paddingBottom: "22px",
borderBottom: "1px solid #263449",
},

logo: {
fontSize: "26px",
fontWeight: 800,
color: "#ffffff",
textDecoration: "none",
},

logout: {
padding: "10px 16px",
background: "#1e293b",
color: "#e2e8f0",
border: "1px solid #334155",
borderRadius: "9px",
cursor: "pointer",
},

welcome: {
padding: "35px 0 25px",
},

eyebrow: {
color: "#38bdf8",
fontWeight: 700,
fontSize: "12px",
letterSpacing: "2px",
},

heading: {
fontSize: "32px",
margin: "12px 0",
},

subtitle: {
color: "#94a3b8",
lineHeight: 1.6,
},

newRequest: {
    display: "inline-block",
marginTop: "15px",
padding: "13px 18px",
background: "linear-gradient(90deg, #0284c7, #2563eb)",
color: "#ffffff",
textDecoration: "none",
borderRadius: "10px",
fontWeight: 700,
},

stats: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
gap: "15px",
marginBottom: "35px",
},

statCard: {
padding: "22px",
background: "#0f172a",
border: "1px solid #263449",
borderRadius: "15px",
display: "flex",
flexDirection: "column",
gap: "8px",
},

statNumber: {
fontSize: "30px",
fontWeight: 800,
color: "#38bdf8",
},

statLabel: {
color: "#94a3b8",
fontSize: "14px",
},

jobsSection: {
marginTop: "20px",
},

sectionTitle: {
fontSize: "22px",
marginBottom: "20px",
},

jobList: {
display: "grid",
gap: "16px",
},

jobCard: {
background: "#0f172a",
border: "1px solid #263449",
borderRadius: "15px",
padding: "22px",
},

jobTop: {
display: "flex",
justifyContent: "space-between",
gap: "15px",
flexWrap: "wrap",
},

jobTitle: {
margin: "0 0 8px",
fontSize: "19px",
},

location: {
color: "#94a3b8",
fontSize: "14px",
},

status: {
alignSelf: "flex-start",
border: "1px solid",
borderRadius: "20px",
padding: "7px 11px",
fontSize: "12px",
fontWeight: 700,
},

description: {
color: "#cbd5e1",
lineHeight: 1.6,
marginTop: "15px",
},

date: {
color: "#64748b",
fontSize: "13px",
marginTop: "15px",
},

jobActions: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "18px",
},

trackButton: {
padding: "11px 15px",
background: "#0369a1",
color: "white",
borderRadius: "8px",
textDecoration: "none",
fontWeight: 700,
fontSize: "14px",
},

copyButton: {
padding: "11px 15px",
background: "#1e293b",
color: "#cbd5e1",
border: "1px solid #334155",
borderRadius: "8px",
cursor: "pointer",
fontSize: "14px",
},

empty: {
background: "#0f172a",
border: "1px solid #263449",
borderRadius: "15px",
padding: "35px 20px",
textAlign: "center",
color: "#94a3b8",
},

error: {
padding: "15px",
background: "#451a1a",
color: "#fca5a5",
borderRadius: "10px",
marginBottom: "20px",
},

footer: {
textAlign: "center",
color: "#64748b",
fontSize: "13px",
padding: "35px 0 15px",
},
};
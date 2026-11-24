"use client";

import { useEffect, useRef, useState } from "react";
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
avatar_path: string | null;
};

export default function CustomerDashboardPage() {
const router = useRouter();
const fileRef = useRef<HTMLInputElement>(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState(false);
const [profile, setProfile] = useState<CustomerProfile | null>(null);
const [jobs, setJobs] = useState<Job[]>([]);
const [avatarUrl, setAvatarUrl] = useState("");
const [editOpen, setEditOpen] = useState(false);
const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

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
      .select("full_name, email, phone, avatar_path")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) throw profileError;

  let customer = customerProfile;

  if (!customer) {
    const name =
      String(user.user_metadata?.full_name || "").trim() ||
      "AbujaFix Customer";

    const customerPhone =
      String(user.user_metadata?.phone || "").trim();

    const { data: newProfile, error: createError } =
      await supabase
        .from("customer_profiles")
        .upsert({
          id: user.id,
          full_name: name,
          email: user.email || "",
          phone: customerPhone || null,
        })
        .select("full_name, email, phone, avatar_path")
        .single();

    if (createError) throw createError;
    customer = newProfile;
  }

  setProfile(customer);
  setFullName(customer.full_name);
  setPhone(customer.phone || "");

  if (customer.avatar_path) {
    const { data: signedData, error: signedError } =
      await supabase.storage
        .from("customer-avatars")
        .createSignedUrl(customer.avatar_path, 3600);

    if (!signedError && signedData?.signedUrl) {
      setAvatarUrl(signedData.signedUrl);
    }
  }

  const { data: customerJobs, error: jobsError } =
    await supabase
      .from("jobs")
      .select(
        "id, service_category, status, location, description, created_at"
      )
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

function getInitials(name: string) {
return name
.trim()
.split(/\s+/)
.slice(0, 2)
.map((part) => part[0]?.toUpperCase() || "")
.join("") || "C";
}

async function handleSaveProfile() {
if (!profile) return;

if (!fullName.trim()) {
  setError("Please enter your full name.");
  return;
}

setSaving(true);
setError("");
setSuccess("");

try {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please log in again.");
  }

  const { error: updateError } = await supabase
    .from("customer_profiles")
    .update({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
    })
    .eq("id", authData.user.id);

  if (updateError) throw updateError;

  setProfile({
    ...profile,
    full_name: fullName.trim(),
    phone: phone.trim() || null,
  });
  setEditOpen(false);
  setSuccess("Your profile has been updated.");
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Profile update failed."
  );
} finally {
  setSaving(false);
}
}

async function handleAvatarUpload(
event: React.ChangeEvent<HTMLInputElement>
) {
const file = event.target.files?.[0];
if (!file) return;

setError("");
setSuccess("");

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

if (!allowedTypes.includes(file.type)) {
  setError("Please select a JPG, PNG or WebP image.");
  event.target.value = "";
  return;
}

if (file.size > 2 * 1024 * 1024) {
  setError("Your image must be smaller than 2 MB.");
  event.target.value = "";
  return;
}

setUploading(true);

try {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please log in again.");
  }

  const user = authData.user;
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("customer-avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("customer_profiles")
    .update({ avatar_path: filePath })
    .eq("id", user.id);

  if (updateError) {
    await supabase.storage
      .from("customer-avatars")
      .remove([filePath]);
    throw updateError;
  }

  if (profile?.avatar_path) {
    await supabase.storage
      .from("customer-avatars")
      .remove([profile.avatar_path]);
  }

  const { data: signedData, error: signedError } =
    await supabase.storage
      .from("customer-avatars")
      .createSignedUrl(filePath, 3600);

  if (signedError) throw signedError;

  setAvatarUrl(signedData.signedUrl);
  setProfile((current) =>
  current ? { ...current, avatar_path: filePath } : current
);
  setSuccess("Profile photo updated successfully.");
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Photo upload failed."
  );
} finally {
  setUploading(false);
  event.target.value = "";
}
}

async function handleRemoveAvatar() {
if (!profile?.avatar_path) return;

setUploading(true);
setError("");
setSuccess("");

try {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Please log in again.");
  }

  const { error: updateError } = await supabase
    .from("customer_profiles")
    .update({ avatar_path: null })
    .eq("id", authData.user.id);

  if (updateError) throw updateError;

  const { error: removeError } = await supabase.storage
    .from("customer-avatars")
    .remove([profile.avatar_path]);

  if (removeError) {
    console.error("Old avatar cleanup failed:", removeError);
  }

  setAvatarUrl("");
  setProfile({ ...profile, avatar_path: null });
  setSuccess("Profile photo removed.");
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Could not remove photo."
  );
} finally {
  setUploading(false);
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

async function copyReference(id: string) {
try {
await navigator.clipboard.writeText(id);
setSuccess("Tracking reference copied.");
} catch {
setError("Could not copy the tracking reference.");
}
}

function getStatus(status: string) {
const labels: Record<string, string> = {
pending: "Request Received",
assigned: "Technician Assigned",
in_progress: "Work in Progress",
completed: "Job Completed",
};

return labels[status.toLowerCase()] || status;
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

const activeJobs = jobs.filter((job) =>
["pending", "assigned", "in_progress"].includes(
job.status.toLowerCase()
)
).length;

const completedJobs = jobs.filter(
(job) => job.status.toLowerCase() === "completed"
).length;

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

    <section style={styles.profileBanner}>
      <div style={styles.profileInfo}>
        <div style={styles.avatar}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Customer profile"
              style={styles.avatarImage}
            />
          ) : (
            getInitials(profile?.full_name || "Customer")
          )}
        </div>

        <div style={styles.profileText}>
          <p style={styles.eyebrow}>CUSTOMER ACCOUNT</p>
          <h1 style={styles.heading}>
            {profile?.full_name || "Customer"}
          </h1>
          <p style={styles.profileEmail}>{profile?.email}</p>
        </div>
      </div>

      <div style={styles.avatarActions}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarUpload}
          style={{ display: "none" }}
        />

        <button
          style={styles.photoButton}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading
            ? "Please wait..."
            : avatarUrl
              ? "Change Photo"
              : "Upload Photo"}
        </button>

        {avatarUrl && (
          <button
            style={styles.removeButton}
            disabled={uploading}
            onClick={handleRemoveAvatar}
          >
            Remove
          </button>
        )}

        <button
          style={styles.editButton}
          onClick={() => {
            setFullName(profile?.full_name || "");
            setPhone(profile?.phone || "");
            setEditOpen(!editOpen);
          }}
        >
          Edit Profile
        </button>
      </div>
    </section>

    {editOpen && (
      <section style={styles.editPanel}>
        <h2 style={styles.sectionTitle}>Edit Your Profile</h2>

        <label style={styles.fieldLabel}>Full Name</label>
        <input
          style={styles.input}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your full name"
        />

        <label style={styles.fieldLabel}>Email Address</label>
        <input
          style={{ ...styles.input, opacity: 0.65 }}
          value={profile?.email || ""}
          disabled
        />

        <label style={styles.fieldLabel}>Phone Number</label>
        <input
          style={styles.input}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Your phone number"
        />

        <div style={styles.jobActions}>
          <button
            style={styles.photoButton}
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            style={styles.removeButton}
            onClick={() => setEditOpen(false)}
          >
            Cancel
          </button>
        </div>
      </section>
    )}

    {error && <div style={styles.error}>{error}</div>}
    {success && <div style={styles.success}>{success}</div>}

    <section style={styles.welcome}>
      <p style={styles.eyebrow}>YOUR SERVICE OVERVIEW</p>

      <h2 style={styles.welcomeHeading}>
        Welcome back, {profile?.full_name?.split(" ")[0] || "Customer"}!
      </h2>

      <p style={styles.subtitle}>
        Manage your service requests and keep track of your repairs.
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
        <span style={styles.statNumber}>{activeJobs}</span>
        <span style={styles.statLabel}>Active Jobs</span>
      </div>

      <div style={styles.statCard}>
        <span style={styles.statNumber}>{completedJobs}</span>
        <span style={styles.statLabel}>Completed Jobs</span>
      </div>
    </section>

    <section style={styles.jobsSection}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>My Service Requests</h2>
        <span style={styles.requestCount}>
          {jobs.length} total
        </span>
      </div>

      {jobs.length === 0 ? (
        <div style={styles.empty}>
          <h3>No service requests yet</h3>
          <p>
            Your service requests will appear here after you book a
            technician.
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
                  <p style={styles.cardEyebrow}>SERVICE REQUEST</p>
                  <h3 style={styles.jobTitle}>
                    {job.service_category}
                  </h3>
                  <p style={styles.location}>📍 {job.location}</p>
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
                <p style={styles.description}>{job.description}</p>
              )}

              <p style={styles.date}>
                Requested:{" "}
                {new Date(job.created_at).toLocaleDateString()}
              </p>

              <div style={styles.jobActions}>
                <a
                  href={`/track-job?reference=${encodeURIComponent(job.id)}`}
                  style={styles.trackButton}
                >
                  Track Job
                </a>

                <button
                  onClick={() => copyReference(job.id)}
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
      <p>Professional service, right when you need it.</p>
    </footer>
  </div>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top, #172554 0%, #080f20 45%, #050914 100%)",
color: "#f8fafc",
padding: "25px 16px",
fontFamily: "Arial, sans-serif",
},
container: {
maxWidth: "1050px",
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
fontSize: "27px",
fontWeight: 800,
color: "#ffffff",
textDecoration: "none",
},
logout: {
padding: "10px 17px",
background: "#1e293b",
color: "#e2e8f0",
border: "1px solid #334155",
borderRadius: "9px",
cursor: "pointer",
},
profileBanner: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
flexWrap: "wrap",
gap: "22px",
marginTop: "30px",
padding: "25px",
background: "linear-gradient(120deg, #111f3b, #0f172a)",
border: "1px solid #263449",
borderRadius: "20px",
},
profileInfo: {
display: "flex",
alignItems: "center",
gap: "18px",
minWidth: 0,
},
avatar: {
width: "88px",
height: "88px",
minWidth: "88px",
borderRadius: "50%",
background: "linear-gradient(135deg, #0284c7, #4f46e5)",
border: "3px solid #38bdf8",
display: "flex",
alignItems: "center",
justifyContent: "center",
color: "#ffffff",
fontSize: "28px",
fontWeight: 800,
overflow: "hidden",
},
avatarImage: {
width: "100%",
height: "100%",
objectFit: "cover",
},
profileText: {
minWidth: 0,
},
profileEmail: {
color: "#94a3b8",
fontSize: "14px",
overflowWrap: "anywhere",
},
avatarActions: {
display: "flex",
gap: "9px",
flexWrap: "wrap",
},
photoButton: {
padding: "11px 15px",
background: "#0369a1",
color: "#ffffff",
border: "1px solid #0284c7",
borderRadius: "9px",
cursor: "pointer",
fontWeight: 700,
},
editButton: {
padding: "11px 15px",
background: "#1e293b",
color: "#e2e8f0",
border: "1px solid #334155",
borderRadius: "9px",
cursor: "pointer",
},
removeButton: {
padding: "11px 15px",
background: "#3f1d2a",
color: "#fecdd3",
border: "1px solid #7f1d1d",
borderRadius: "9px",
cursor: "pointer",
},
eyebrow: {
color: "#38bdf8",
fontWeight: 700,
fontSize: "11px",
letterSpacing: "2px",
margin: "0 0 8px",
},
heading: {
fontSize: "25px",
margin: "0 0 7px",
overflowWrap: "anywhere",
},
welcome: {
padding: "35px 0 25px",
},
welcomeHeading: {
fontSize: "27px",
margin: "10px 0",
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
gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
gap: "15px",
marginBottom: "35px",
},
statCard: {
padding: "23px",
background: "#0f172a",
border: "1px solid #263449",
borderRadius: "15px",
display: "flex",
flexDirection: "column",
gap: "8px",
},
statNumber: {
fontSize: "32px",
fontWeight: 800,
color: "#38bdf8",
},
statLabel: {
color: "#94a3b8",
fontSize: "14px",
},
editPanel: {
marginTop: "20px",
padding: "25px",
background: "#0f172a",
border: "1px solid #263449",
borderRadius: "15px",
},
fieldLabel: {
display: "block",
color: "#cbd5e1",
fontSize: "13px",
fontWeight: 700,
margin: "15px 0 7px",
},
input: {
width: "100%",
boxSizing: "border-box",
padding: "13px",
background: "#080f20",
border: "1px solid #334155",
borderRadius: "9px",
color: "#f8fafc",
fontSize: "15px",
},
jobsSection: {
marginTop: "25px",
},
sectionHeader: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
flexWrap: "wrap",
gap: "10px",
},
sectionTitle: {
fontSize: "21px",
marginBottom: "18px",
},
requestCount: {
color: "#94a3b8",
fontSize: "13px",
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
alignItems: "flex-start",
gap: "15px",
flexWrap: "wrap",
},
cardEyebrow: {
color: "#38bdf8",
fontSize: "10px",
letterSpacing: "1.5px",
fontWeight: 700,
},
jobTitle: {
margin: "5px 0 8px",
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
padding: "14px",
background: "#451a1a",
color: "#fca5a5",
borderRadius: "10px",
marginTop: "18px",
},
success: {
padding: "14px",
background: "#123524",
color: "#86efac",
borderRadius: "10px",
marginTop: "18px",
},
footer: {
textAlign: "center",
color: "#64748b",
fontSize: "13px",
padding: "35px 0 15px",
lineHeight: 1.8,
},
};
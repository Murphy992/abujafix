"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";

type Technician = {
id: string;
full_name: string;
service_category: string;
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
created_at: string;
};

export default function TechnicianDashboardPage() {
const router = useRouter();

const [technician, setTechnician] = useState<Technician | null>(null);
const [jobs, setJobs] = useState<Job[]>([]); 
const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
const [acceptingJob, setAcceptingJob] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(true);
const [updatingJob, setUpdatingJob] = useState("");

useEffect(() => {
let active = true;

async function loadDashboard() {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    router.replace("/technician-login");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("technicians")
    .select("id, full_name, service_category, status")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "approved") {
    await supabase.auth.signOut();
    router.replace("/technician-login");
    return;
  }

  const { data: assignedJobs, error: jobsError } = await supabase
    .from("jobs")
    .select(
      "id, customer_name, phone, service_category, location, description, status, created_at"
    )
    .eq("assigned_technician_id", profile.id)
    .order("created_at", { ascending: false });
const { data: availableJobsData, error: availableJobsError } =
  await supabase.rpc("get_available_jobs"); console.log("AVAILABLE JOBS DATA:", availableJobsData);
console.log("AVAILABLE JOBS ERROR:", availableJobsError);

  if (!active) return;

  setTechnician(profile);

  if (jobsError) {
  setMessage(jobsError.message);
} else {
  setJobs(assignedJobs || []);
}

if (availableJobsError) {
  setMessage(availableJobsError.message);
} else {
  setAvailableJobs(availableJobsData || []);
}

  setLoading(false);
}

loadDashboard();

return () => {
  active = false;
};
}, [router]);

async function updateJobStatus(jobId: string, status: string) {
setMessage("");
setUpdatingJob(jobId);

const { error } = await supabase
  .from("jobs")
  .update({ status })
  .eq("id", jobId);

if (error) {
  setMessage(error.message);
  setUpdatingJob("");
  return;
}

setJobs((currentJobs) =>
  currentJobs.map((job) =>
    job.id === jobId ? { ...job, status } : job
  )
);

setMessage("Job status updated successfully.");
setUpdatingJob("");
}
async function acceptJob(jobId: string) {
  setMessage("");
  setAcceptingJob(jobId);

  const { error } = await supabase.rpc("accept_available_job", {
    p_job_id: jobId,
  });

  if (error) {
    setMessage(error.message);
    setAcceptingJob("");
    return;
  }

  setAvailableJobs((currentJobs) =>
    currentJobs.filter((job) => job.id !== jobId)
  );

  const { data: refreshedJobs, error: refreshError } = await supabase
    .from("jobs")
    .select(
      "id, customer_name, phone, service_category, location, description, status, created_at"
    )
    .eq("assigned_technician_id", technician?.id)
    .order("created_at", { ascending: false });

  if (refreshError) {
    setMessage(refreshError.message);
  } else {
    setJobs(refreshedJobs || []);
    setMessage("Job accepted successfully.");
  }

  setAcceptingJob("");
}
async function handleSignOut() {
await supabase.auth.signOut();
router.replace("/technician-login");
}

if (loading) {
return <main style={{ padding: "30px" }}>Loading technician dashboard...</main>;
}

if (!technician) {
return <main style={{ padding: "30px" }}>Unable to load technician profile.</main>;
}

return (
<main style={{
maxWidth: "900px",
margin: "30px auto",
padding: "20px",
fontFamily: "Arial, sans-serif"
}}>
<header style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
flexWrap: "wrap",
gap: "15px"
}}>
<div>
<h1>AbujaFix Technician</h1>
<p>Welcome, {technician.full_name}</p>
<p>{technician.service_category}</p>
</div>

    <button
      onClick={handleSignOut}
      style={{
        padding: "10px 16px",
        background: "#DC2626",
        color: "white",
        border: "none",
        borderRadius: "6px"
      }}
    >
      Sign Out
    </button>
  </header>

  <hr style={{ margin: "25px 0" }} />

<h2></h2>{availableJobs.length === 0 ? (
<p>No available jobs match your service category right now.</p>
) : (
<section style={{
display: "grid",
gap: "18px",
marginTop: "20px"
}}>
{availableJobs.map((job) => (
<article
key={job.id}
style={{
border: "1px solid #ddd",
borderRadius: "10px",
padding: "18px"
}}
>
<h3>{job.service_category}</h3>
<p><strong>Customer:</strong> {job.customer_name}</p>
<p><strong>Phone:</strong> {job.phone}</p>
<p><strong>Location:</strong> {job.location}</p>
<p>
<strong>Description:</strong>{" "}
{job.description || "No description provided"}
</p>

      <button
        disabled={acceptingJob === job.id}
        onClick={() => acceptJob(job.id)}
        style={{
          padding: "11px 16px",
          background: "#15803D",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        {acceptingJob === job.id ? "Accepting..." : "Accept Job"}
      </button>
    </article>
  ))}
</section>
)}

{message && (
<p role="status" style={{ margin: "15px 0" }}>
{message}
</p>
)}

{jobs.length === 0 ? (
<p>You don't have any assigned jobs yet.</p>
) : (
<section style={{
display: "grid",
gap: "18px",
marginTop: "20px"
}}>
{jobs.map((job) => (
<article
key={job.id}
style={{
border: "1px solid #ddd",
borderRadius: "10px",
padding: "18px"
}}
>
<h3>{job.service_category}</h3>

      <p><strong>Customer:</strong> {job.customer_name}</p>
      <p><strong>Phone:</strong> {job.phone}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p>
        <strong>Description:</strong>{" "}
        {job.description || "No description provided"}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {job.status.replace("_", " ")}
      </p>

      {job.status === "assigned" && (
        <button
          disabled={updatingJob === job.id}
          onClick={() => updateJobStatus(job.id, "in_progress")}
          style={{
            padding: "11px 16px",
            background: "#155EEF",
            color: "white",
            border: "none",
            borderRadius: "6px",
            marginRight: "8px"
          }}
        >
          {updatingJob === job.id ? "Updating..." : "Start Job"}
        </button>
      )}

      {job.status === "in_progress" && (
        <button
          disabled={updatingJob === job.id}
          onClick={() => updateJobStatus(job.id, "completed")}
          style={{
            padding: "11px 16px",
            background: "#15803D",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          {updatingJob === job.id ? "Updating..." : "Mark Completed"}
        </button>
      )}

      {job.status === "completed" && (
        <p>Job completed successfully.</p>
      )}
    </article>
  ))}
</section>
)}
</main> 
);
}
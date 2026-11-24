
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";

type Job = {
  id: string;
  customer_name: string;
  service_category: string;
  location: string;
  description: string | null;
  status: string;
  created_at: string;
};

type CustomerProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_path: string | null;
};

export default function CustomerDashboard() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

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
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/customer-login");
        return;
      }

      const user = authData.user;

      let { data: profileData, error: profileError } = await supabase
        .from("customer_profiles")
        .select("id, full_name, email, phone, avatar_path")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileData && !profileError) {
        const newProfile = {
          id: user.id,
          full_name: String(
            user.user_metadata?.full_name || "AbujaFix Customer"
          ),
          email: user.email || "",
          phone: String(user.user_metadata?.phone || ""),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("customer_profiles")
          .upsert(newProfile)
          .select("id, full_name, email, phone, avatar_path")
          .single();

        profileData = createdProfile;
        profileError = createError;
      }

      if (profileError) {
        if (active) setError("Unable to load your profile. Please refresh.");
      } else if (profileData && active) {
        const customerProfile = profileData as CustomerProfile;
        setProfile(customerProfile);
        setFullName(customerProfile.full_name || "");
        setPhone(customerProfile.phone || "");

        if (customerProfile.avatar_path) {
          const { data: signedData } = await supabase.storage
            .from("customer-avatars")
            .createSignedUrl(customerProfile.avatar_path, 3600);

          if (active) setAvatarUrl(signedData?.signedUrl || "");
        }
      }

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select(
          "id, customer_name, service_category, location, description, status, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (active) {
        if (jobError) {
          setError("Your profile loaded, but your requests could not be loaded.");
        } else {
          setJobs((jobData || []) as Job[]);
        }

        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSaveProfile() {
    if (!profile) return;

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { data, error: updateError } = await supabase
      .from("customer_profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
      })
      .eq("id", profile.id)
      .select("id, full_name, email, phone, avatar_path")
      .single();

    if (updateError) {
      setError("Could not update your profile. Please try again.");
    } else {
      setProfile(data as CustomerProfile);
      setEditOpen(false);
      setSuccess("Your profile has been updated.");
    }

    setSaving(false);
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Your photo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${profile.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("customer-avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setError("Photo upload failed. Please try again.");
      setUploading(false);
      event.target.value = "";
      return;
    }

    const oldPath = profile.avatar_path;

    const { error: updateError } = await supabase
      .from("customer_profiles")
      .update({ avatar_path: filePath })
      .eq("id", profile.id);

    if (updateError) {
      await supabase.storage.from("customer-avatars").remove([filePath]);
      setError("Your photo uploaded, but your profile could not be updated.");
      setUploading(false);
      event.target.value = "";
      return;
    }

    if (oldPath) {
      await supabase.storage.from("customer-avatars").remove([oldPath]);
    }

    const { data: signedData } = await supabase.storage
      .from("customer-avatars")
      .createSignedUrl(filePath, 3600);

    setAvatarUrl(signedData?.signedUrl || "");
    setProfile((current) =>
      current ? { ...current, avatar_path: filePath } : current
    );
    setSuccess("Your profile photo has been updated.");
    setUploading(false);
    event.target.value = "";
  }

  async function handleRemoveAvatar() {
    if (!profile?.avatar_path) return;

    setError("");
    setSuccess("");

    const oldPath = profile.avatar_path;

    const { error: updateError } = await supabase
      .from("customer_profiles")
      .update({ avatar_path: null })
      .eq("id", profile.id);

    if (updateError) {
      setError("Could not remove your profile photo.");
      return;
    }

    await supabase.storage.from("customer-avatars").remove([oldPath]);

    setAvatarUrl("");
    setProfile((current) =>
      current ? { ...current, avatar_path: null } : current
    );
    setSuccess("Your profile photo has been removed.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/customer-login");
  }

  async function copyReference(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      setSuccess("Tracking reference copied.");
    } catch {
      setError("Unable to copy. Please select the reference manually.");
    }
  }

  function getStatus(status: string) {
    const value = status.toLowerCase();

    if (value === "completed") return "Completed";
    if (value === "in_progress") return "In Progress";
    if (value === "assigned") return "Technician Assigned";

    return "Request Received";
  }

  function getStatusClass(status: string) {
    const value = status.toLowerCase();

    if (value === "completed") return "completed";
    if (value === "in_progress") return "progress";
    if (value === "assigned") return "assigned";

    return "pending";
  }

  const activeJobs = jobs.filter(
    (job) => !["completed"].includes(job.status.toLowerCase())
  ).length;

  const completedJobs = jobs.filter(
    (job) => job.status.toLowerCase() === "completed"
  ).length;

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <p>Loading your AbujaFix dashboard...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: #f4f7fc;
            color: #52627a;
            font-family: Arial, sans-serif;
          }
          .loader {
            width: 38px;
            height: 38px;
            border: 4px solid #dce6f3;
            border-top-color: #1762bd;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-mark">A</span>
          <span>
            <strong>AbujaFix</strong>
            <small>Customer Portal</small>
          </span>
        </a>

        <div className="side-label">MENU</div>

        <a href="/customer-dashboard" className="side-link selected">
          <span>▦</span> Overview
        </a>
        <a href="/request-service" className="side-link">
          <span>＋</span> Request a Service
        </a>
        <a href="/track-job" className="side-link">
          <span>◎</span> Track a Request
        </a>
        <a href="/technicians" className="side-link">
          <span>♙</span> Find Technicians
        </a>

        <div className="sidebar-bottom">
          <div className="help-card">
            <strong>Need assistance?</strong>
            <p>We're here to help you get things fixed.</p>
            <a href="https://wa.me/" target="_blank" rel="noreferrer">
              Contact Support
            </a>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            ↪ <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Customer Portal</span>
            <span className="breadcrumb-divider"> / </span>
            <strong>Overview</strong>
          </div>

          <div className="top-user">
            <div className="top-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Your profile" />
              ) : (
                (profile?.full_name || "C").charAt(0).toUpperCase()
              )}
            </div>
            <div className="top-user-info">
              <strong>{profile?.full_name || "Customer"}</strong>
              <small>Customer Account</small>
            </div>
          </div>
        </header>

        <div className="content">
          <section className="welcome-banner">
            <div>
              <span className="eyebrow">YOUR ABUJAFIX ACCOUNT</span>
              <h1>
                Welcome back,{" "}
                {(profile?.full_name || "Customer").split(" ")[0]}!
              </h1>
              <p>
                Manage your service requests and keep track of your repairs
                from one place.
              </p>
              <a href="/request-service" className="primary-button">
                + Request a Technician
              </a>
            </div>
            <div className="banner-decoration">⌂</div>
          </section>

          {error && <div className="message error-message">{error}</div>}
          {success && (
            <div className="message success-message">{success}</div>
          )}

          <section className="section-heading">
            <div>
              <h2>Account Overview</h2>
              <p>Here is a summary of your service activity.</p>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon blue-icon">▤</div>
              <div>
                <span>Total Requests</span>
                <strong>{jobs.length}</strong>
                <small>All service requests</small>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon orange-icon">◷</div>
              <div>
                <span>Active Requests</span>
                <strong>{activeJobs}</strong>
                <small>Awaiting completion</small>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon green-icon">✓</div>
              <div>
                <span>Completed Jobs</span>
                <strong>{completedJobs}</strong>
                <small>Successfully completed</small>
              </div>
            </article>
          </section>

          <section className="profile-card">
            <div className="profile-heading">
              <div>
                <h2>My Profile</h2>
                <p>Manage your personal account information.</p>
              </div>
              <button
                className="outline-button"
                onClick={() => {
                  setEditOpen(!editOpen);
                  setError("");
                  setSuccess("");
                }}
              >
                {editOpen ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="profile-body">
              <div className="avatar-section">
                <div className="large-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Customer profile" />
                  ) : (
                    (profile?.full_name || "C").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="avatar-actions">
                  <button
                    className="photo-button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Change Photo"}
                  </button>
                  {profile?.avatar_path && (
                    <button
                      className="remove-photo"
                      onClick={handleRemoveAvatar}
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                  <small>JPG, PNG or WebP. Maximum 2 MB.</small>
                </div>
              </div>

              {editOpen ? (
                <div className="profile-fields edit-fields">
                  <label>
                    Full Name
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter your full name"
                    />
                  </label>
                  <label>
                    Phone Number
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </label>
                  <div className="save-row">
                    <button
                      className="primary-button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-fields">
                  <div>
                    <span>Full Name</span>
                    <strong>{profile?.full_name || "Not provided"}</strong>
                  </div>
                  <div>
                    <span>Email Address</span>
                    <strong>{profile?.email || "Not provided"}</strong>
                  </div>
                  <div>
                    <span>Phone Number</span>
                    <strong>{profile?.phone || "Not provided"}</strong>
                  </div>
                  <div>
                    <span>Account Type</span>
                    <strong>Customer</strong>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="requests-section">
            <div className="section-heading request-heading">
              <div>
                <h2>My Service Requests</h2>
                <p>View and follow the progress of your requests.</p>
              </div>
              <a href="/request-service" className="outline-button">
                + New Request
              </a>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▤</div>
                <h3>No service requests yet</h3>
                <p>
                  When you request a technician, your service history will
                  appear here.
                </p>
                <a href="/request-service" className="primary-button">
                  Request Your First Service
                </a>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <div className="job-main">
                      <div className="job-icon">⌂</div>
                      <div className="job-details">
                        <h3>{job.service_category}</h3>
                        <p>Location: {job.location}</p>
                        <small>
                          Submitted{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>

                    <div className="job-status-area">
                      <span className={`status ${getStatusClass(job.status)}`}>
                        {getStatus(job.status)}
                      </span>
                      <div className="reference">
                        <span>Reference: {job.id.slice(0, 8)}...</span>
                        <button onClick={() => copyReference(job.id)}>
                          Copy
                        </button>
                      </div>
                    </div>

                    <a
                      className="track-button"
                      href={`/track-job?reference=${encodeURIComponent(job.id)}`}
                    >
                      Track Request →
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="footer">
            <span>© 2026 AbujaFix. All rights reserved.</span>
            <span>Find Trusted Technicians. Fix It Fast.</span>
          </footer>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          display: flex;
          background: #f4f7fc;
          color: #172b46;
          font-family: Arial, Helvetica, sans-serif;
        }

        .sidebar {
          width: 250px;
          min-height: 100vh;
          background: #102b50;
          color: white;
          padding: 30px 18px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: white;
          padding: 0 8px 38px;
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          background: #f28c28;
          color: white;
          border-radius: 12px;
          font-size: 23px;
          font-weight: 800;
        }

        .brand strong {
          display: block;
          font-size: 21px;
        }

        .brand small {
          display: block;
          color: #b9c9df;
          font-size: 11px;
          margin-top: 4px;
        }

        .side-label {
          color: #91a8c5;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: bold;
          padding: 0 12px;
          margin-bottom: 13px;
        }

        .side-link {
          color: #d5e0ee;
          text-decoration: none;
          padding: 14px 13px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .side-link span {
          font-size: 19px;
          width: 20px;
          text-align: center;
        }

        .side-link:hover,
        .side-link.selected {
          background: #1d4778;
          color: white;
        }

        .sidebar-bottom {
          margin-top: auto;
        }

        .help-card {
          background: #1b416d;
          border: 1px solid #31577f;
          border-radius: 12px;
          padding: 16px;
          margin: 25px 0 20px;
        }

        .help-card strong {
          font-size: 13px;
        }

        .help-card p {
          font-size: 11px;
          line-height: 1.6;
          color: #c4d3e5;
        }

        .help-card a {
          display: inline-block;
          color: #ffb15d;
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          margin-top: 4px;
        }

        .logout-button {
          border: 0;
          border-top: 1px solid #31506f;
          padding: 18px 10px 0;
          background: transparent;
          color: #e0e9f5;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
        }

        .logout-button span {
          margin-left: 10px;
        }

        .main-area {
          min-width: 0;
          flex: 1;
        }

        .topbar {
          height: 76px;
          background: white;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 38px;
        }

        .breadcrumb {
          color: #8a98aa;
          font-size: 12px;
        }

        .breadcrumb-divider {
          color: #b6c0cd;
        }

        .topbar strong {
          font-size: 13px;
        }

        .top-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .top-avatar {
          width: 39px;
          height: 39px;
          border-radius: 50%;
          background: #e7effa;
          color: #1757a0;
          display: grid;
          place-items: center;
          font-weight: bold;
          overflow: hidden;
        }

        .top-avatar img,
        .large-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .top-user-info strong,
        .top-user-info small {
          display: block;
        }

        .top-user-info strong {
          font-size: 12px;
        }

        .top-user-info small {
          color: #8996a8;
          font-size: 10px;
          margin-top: 4px;
        }

        .content {
          max-width: 1450px;
          margin: auto;
          padding: 30px 38px;
        }

        .welcome-banner {
          min-height: 190px;
          background: linear-gradient(110deg, #123d70, #1e5c9e);
          border-radius: 15px;
          padding: 30px 34px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .eyebrow {
          color: #c6d9ef;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 1.5px;
        }

        .welcome-banner h1 {
          font-size: 27px;
          margin: 12px 0 9px;
        }

        .welcome-banner p {
          color: #d5e3f3;
          font-size: 13px;
          margin: 0 0 20px;
          max-width: 510px;
          line-height: 1.6;
        }

        .banner-decoration {
          font-size: 150px;
          line-height: 1;
          color: rgba(255, 255, 255, 0.09);
          padding-right: 35px;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 7px;
          background: #f28c28;
          color: white;
          padding: 12px 17px;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
        }

        .primary-button:hover {
          background: #df7816;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .message {
          margin-top: 18px;
          padding: 12px 15px;
          border-radius: 8px;
          font-size: 12px;
        }

        .error-message {
          background: #fff0ef;
          color: #b42318;
        }

        .success-message {
          background: #eaf8ef;
          color: #207443;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 30px 0 16px;
        }

        .section-heading h2,
        .profile-heading h2 {
          font-size: 17px;
          margin: 0;
        }

        .section-heading p,
        .profile-heading p {
          color: #8a98aa;
          font-size: 11px;
          margin: 6px 0 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 17px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e9eef5;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-size: 21px;
        }

        .blue-icon {
          background: #eaf2ff;
          color: #2865b0;
        }

        .orange-icon {
          background: #fff3e5;
          color: #e58a26;
        }

        .green-icon {
          background: #e9f8ef;
          color: #2b9860;
        }

        .stat-card span,
        .stat-card strong,
        .stat-card small {
          display: block;
        }

        .stat-card span {
          color: #7d8ba0;
          font-size: 11px;
        }

        .stat-card strong {
          font-size: 25px;
          margin: 5px 0;
        }

        .stat-card small {
          color: #a1acba;
          font-size: 10px;
        }

        .profile-card {
          background: white;
          border: 1px solid #e9eef5;
          border-radius: 12px;
          margin-top: 24px;
          padding: 23px;
        }

        .profile-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf1f6;
        }

        .outline-button {
          border: 1px solid #d8e2ee;
          background: white;
          color: #245b96;
          border-radius: 7px;
          padding: 10px 13px;
          text-decoration: none;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
        }

        .outline-button:hover {
          background: #f4f8fd;
        }

        .profile-body {
          display: flex;
          gap: 32px;
          padding-top: 22px;
        }

        .avatar-section {
          width: 185px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .large-avatar {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          background: #e8f0fb;
          color: #1d5c9e;
          display: grid;
          place-items: center;
          font-size: 34px;
          font-weight: bold;
          overflow: hidden;
          border: 4px solid #f2f6fc;
        }

        .avatar-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 9px;
          margin-top: 13px;
        }

        .photo-button,
        .remove-photo {
          border: 0;
          background: transparent;
          color: #2465aa;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
        }

        .remove-photo {
          color: #bd4b4b;
        }

        .avatar-actions small {
          flex-basis: 100%;
          color: #9aa6b5;
          font-size: 9px;
        }

        .profile-fields {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px 28px;
          align-content: start;
        }

        .profile-fields span,
        .profile-fields strong {
          display: block;
        }

        .profile-fields span,
        .profile-fields label {
          color: #8b98a9;
          font-size: 10px;
        }

        .profile-fields strong {
          color: #263b56;
          font-size: 12px;
          margin-top: 7px;
          overflow-wrap: anywhere;
        }

        .edit-fields label {
          display: block;
          color: #52647a;
          font-weight: bold;
        }

        .edit-fields input {
          display: block;
          width: 100%;
          margin-top: 8px;
          border: 1px solid #dce4ee;
          border-radius: 7px;
          padding: 11px;
          font-size: 12px;
          color: #172b46;
          outline: none;
        }

        .edit-fields input:focus {
          border-color: #397cc1;
        }

        .save-row {
          grid-column: 1 / -1;
        }

        .requests-section {
          margin-top: 31px;
        }

        .request-heading {
          margin-top: 0;
        }

        .jobs-list {
          display: grid;
          gap: 12px;
        }

        .job-card {
          background: white;
          border: 1px solid #e9eef5;
          border-radius: 11px;
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .job-main {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .job-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #edf4fd;
          color: #2866a9;
          display: grid;
          place-items: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .job-details h3 {
          font-size: 13px;
          margin: 0 0 6px;
        }

        .job-details p {
          font-size: 10px;
          color: #7f8da0;
          margin: 0 0 5px;
        }

        .job-details small {
          color: #a0abba;
          font-size: 10px;
        }

        .job-status-area {
          text-align: center;
        }

        .status {
          display: inline-block;
          padding: 7px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
        }

        .pending {
          background: #fff4e5;
          color: #b9781e;
        }

        .assigned {
          background: #eaf2ff;
          color: #2865b0;
        }

        .progress {
          background: #e9f3ff;
          color: #2769b0;
        }

        .completed {
          background: #e8f7ee;
          color: #25834f;
        }

        .reference {
          margin-top: 7px;
          font-size: 9px;
          color: #9aa6b5;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .reference button {
          background: none;
          border: 0;
          color: #2866a9;
          cursor: pointer;
          font-size: 9px;
          font-weight: bold;
        }

        .track-button {
          color: #2465aa;
          font-size: 11px;
          font-weight: bold;
          text-decoration: none;
          white-space: nowrap;
        }

        .empty-state {
          background: white;
          border: 1px solid #e9eef5;
          border-radius: 12px;
          text-align: center;
          padding: 42px 20px;
        }

        .empty-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #edf4fd;
          color: #2866a9;
          display: grid;
          place-items: center;
          font-size: 24px;
          margin: 0 auto 15px;
        }

        .empty-state h3 {
          font-size: 15px;
          margin: 0 0 8px;
        }

        .empty-state p {
          color: #8a98aa;
          font-size: 11px;
          line-height: 1.6;
          margin: 0 auto 18px;
          max-width: 380px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #9aa6b5;
          font-size: 10px;
          padding: 28px 0 5px;
        }

        @media (max-width: 950px) {
          .sidebar {
            width: 210px;
          }

          .content {
            padding: 25px 22px;
          }

          .topbar {
            padding: 0 22px;
          }

          .job-card {
            flex-wrap: wrap;
          }

          .job-status-area {
            text-align: left;
          }
        }

        @media (max-width: 680px) {
          .dashboard {
            display: block;
          }

          .sidebar {
            width: 100%;
            min-height: auto;
            padding: 15px;
          }

          .brand {
            padding: 0 5px 15px;
          }

          .side-label,
          .sidebar-bottom {
            display: none;
          }

          .sidebar {
            display: block;
          }

          .side-link {
            display: inline-flex;
            padding: 9px 10px;
            margin: 3px 2px;
            font-size: 10px;
          }

          .side-link span {
            font-size: 14px;
          }

          .topbar {
            height: 65px;
            padding: 0 15px;
          }

          .top-user-info {
            display: none;
          }

          .content {
            padding: 18px 13px;
          }

          .welcome-banner {
            min-height: 180px;
            padding: 23px 19px;
          }

          .welcome-banner h1 {
            font-size: 22px;
          }

          .welcome-banner p {
            font-size: 11px;
            max-width: 260px;
          }

          .banner-decoration {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 14px;
          }

          .profile-card {
            padding: 17px;
          }

          .profile-body {
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }

          .avatar-section {
            width: 100%;
          }

          .profile-fields {
            width: 100%;
            gap: 18px 12px;
          }

          .job-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .job-status-area {
            text-align: left;
          }

          .footer {
            flex-direction: column;
            line-height: 1.6;
          }
        }

        @media (max-width: 390px) {
          .side-link {
            font-size: 9px;
            padding: 8px 7px;
            gap: 5px;
          }

          .profile-fields {
            grid-template-columns: 1fr;
          }

          .request-heading {
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </main>
  );
}

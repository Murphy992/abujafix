"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";

export default function TechnicianLoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setMessage("");
setLoading(true);

const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error || !data.user) {
  setMessage(error?.message || "Unable to sign in.");
  setLoading(false);
  return;
}

const { data: technician, error: profileError } = await supabase
  .from("technicians")
  .select("id, status")
  .eq("user_id", data.user.id)
  .maybeSingle();console.log("Technician profile result:", technician);
console.log("Technician profile error:", profileError);
console.log("Logged-in user ID:", data.user.id);

if (profileError || !technician || technician.status?.toLowerCase() !== "approved") {
  let diagnosticMessage = "Technician profile verification failed.";

  if (profileError) {
    diagnosticMessage = "Profile lookup error: " + profileError.message;
  } else if (!technician) {
  diagnosticMessage =
    "No technician profile was returned. Logged-in user ID: " +
    data.user.id;
} else {
    diagnosticMessage = "Profile status: " + technician.status;
  }

  await supabase.auth.signOut();
  setMessage(diagnosticMessage);
  setLoading(false);
  return;
}

router.push("/technician-dashboard");
router.refresh();
}

return (
<main
style={{
maxWidth: "440px",
margin: "70px auto",
padding: "25px",
fontFamily: "Arial, sans-serif",
}}
>
<h1>AbujaFix</h1>
<h2>Technician Login</h2>
<p>Sign in to view and manage your assigned jobs.</p>

  <form onSubmit={handleLogin}>
    <label>Email address</label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your registered email"
      required
      autoComplete="email"
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        margin: "8px 0 18px",
        boxSizing: "border-box",
      }}
    />

    <label>Password</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      required
      autoComplete="current-password"
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        margin: "8px 0 18px",
        boxSizing: "border-box",
      }}
    />

    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%",
        padding: "13px",
        background: "#155EEF",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      {loading ? "Signing in..." : "Sign In"}
    </button>
  </form>

  {message && (
    <p role="alert" style={{ marginTop: "18px" }}>
      {message}
    </p>
  )}

  <p style={{ marginTop: "20px" }}>
    Forgot your password? Contact AbujaFix support for assistance.
  </p>
</main>
);
}
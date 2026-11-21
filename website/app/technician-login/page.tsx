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
const [resetMode, setResetMode] = useState(false);

async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setMessage("");
setLoading(true);

try {
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
    .maybeSingle();

  if (
    profileError ||
    !technician ||
    technician.status?.toLowerCase() !== "approved"
  ) {
    let diagnosticMessage = "Technician profile verification failed.";

    if (profileError) {
      diagnosticMessage = "Profile lookup error: " + profileError.message;
    } else if (!technician) {
      diagnosticMessage = "No technician profile found.";
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
} catch (err) {
  console.error(err);
  setMessage("Something went wrong. Please try again.");
  setLoading(false);
}
}

async function handlePasswordReset(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setMessage("");
setLoading(true);

try {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
     redirectTo: "https://abujafix-rho.vercel.app/reset-password",
    }
  );

  if (error) {
    setMessage(error.message);
  } else {
    setMessage(
      "If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder."
    );
  }
} catch (err) {
  console.error(err);
  setMessage("Unable to send reset email. Please try again.");
}

setLoading(false);
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

  <h2>{resetMode ? "Reset Your Password" : "Technician Login"}</h2>

  <p>
    {resetMode
      ? "Enter your registered email address to receive a password reset link."
      : "Sign in to view and manage your assigned jobs."}
  </p>

  <form onSubmit={resetMode ? handlePasswordReset : handleLogin}>
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

    {!resetMode && (
      <>
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
      </>
    )}

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
      {loading
        ? "Please wait..."
        : resetMode
        ? "Send Reset Link"
        : "Sign In"}
    </button>
  </form> 
  {message && (
    <p role="alert" style={{ marginTop: "18px" }}>
      {message}
    </p>
  )}

  <p style={{ marginTop: "20px" }}>
    <button
      type="button"
      onClick={() => {
        setResetMode(!resetMode);
        setMessage("");
      }}
      style={{
        background: "none",
        border: "none",
        color: "#155EEF",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
      }}
    >
      {resetMode
        ? "Back to Login"
        : "Forgot Your Password?"}
    </button>
  </p>
</main>
);
}
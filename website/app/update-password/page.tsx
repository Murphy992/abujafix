"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function UpdatePasswordPage() {
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [message, setMessage] = useState("");
const [ready, setReady] = useState(false);
const [loading, setLoading] = useState(false);

useEffect(() => {
let active = true;

async function checkSession() {
  const { data, error } = await supabase.auth.getSession();

  if (!active) return;

  if (error || !data.session) {
    setMessage(
      "Your invitation link may be invalid or expired. Please request a new invitation."
    );
  } else {
    setReady(true);
  }
}

checkSession();

const { data: listener } =
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!active) return;

    if (session) {
      setReady(true);
      setMessage("");
    }
  });

return () => {
  active = false;
  listener.subscription.unsubscribe();
};
}, []);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setMessage("");

if (password.length < 8) {
  setMessage("Your password must contain at least 8 characters.");
  return;
}

if (password !== confirmPassword) {
  setMessage("The passwords do not match.");
  return;
}

setLoading(true);

const { error } = await supabase.auth.updateUser({
  password,
});

setLoading(false);

if (error) {
  setMessage(error.message);
  return;
}

setMessage(
  "Your password has been created successfully. You can now sign in."
);
setPassword("");
setConfirmPassword("");
}

return (
<main style={{
maxWidth: "440px",
margin: "70px auto",
padding: "25px",
fontFamily: "Arial, sans-serif"
}}>
<h1>AbujaFix Technician</h1>
<h2>Create Your Password</h2>

  <p>
    Welcome to AbujaFix. Create a password to access your
    technician account.
  </p>

  {ready ? (
    <form onSubmit={handleSubmit}>
      <label>New password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
        style={{
          display: "block",
          width: "100%",
          padding: "12px",
          margin: "8px 0 18px"
        }}
      />

      <label>Confirm password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        minLength={8}
        required
        style={{
          display: "block",
          width: "100%",
          padding: "12px",
          margin: "8px 0 18px"
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
          cursor: "pointer"
        }}
      >
        {loading ? "Saving..." : "Create Password"}
      </button>
    </form>
  ) : (
    <p>Checking your invitation...</p>
  )}

  {message && (
    <p style={{ marginTop: "18px" }}>{message}</p>
  )}
</main>
);
}
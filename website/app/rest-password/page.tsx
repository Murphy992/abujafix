"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";

export default function ResetPasswordPage() {
const router = useRouter();

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

async function handleUpdatePassword(
e: React.FormEvent<HTMLFormElement>
) {
e.preventDefault();
setMessage("");

if (password.length < 8) {
  setMessage("Password must be at least 8 characters long.");
  return;
}

if (password !== confirmPassword) {
  setMessage("Passwords do not match.");
  return;
}

setLoading(true);

const { error } = await supabase.auth.updateUser({
  password: password,
});

if (error) {
  setMessage(error.message);
  setLoading(false);
  return;
}

setMessage("Password updated successfully!");

setTimeout(() => {
  router.push("/technician-login");
}, 2000);

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
<h2>Create a New Password</h2>

  <p>Enter and confirm your new password below.</p>

  <form onSubmit={handleUpdatePassword}>
    <label>New Password</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter new password"
      minLength={8}
      required
      autoComplete="new-password"
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        margin: "8px 0 18px",
        boxSizing: "border-box",
      }}
    />

    <label>Confirm New Password</label>
    <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm new password"
      required
      autoComplete="new-password"
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
      {loading ? "Updating..." : "Update Password"}
    </button>
  </form>

  {message && (
    <p role="alert" style={{ marginTop: "18px" }}>
      {message}
    </p>
  )}
</main>
);
}
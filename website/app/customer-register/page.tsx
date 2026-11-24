"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";

export default function CustomerRegisterPage() {
const router = useRouter();
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [showPassword, setShowPassword] = useState(false);

async function handleRegister(event: FormEvent<HTMLFormElement>) {
event.preventDefault();
setError("");
setSuccess("");
setLoading(true);

const form = new FormData(event.currentTarget);
const fullName = String(form.get("full_name") || "").trim();
const email = String(form.get("email") || "").trim().toLowerCase();
const phone = String(form.get("phone") || "").trim();
const password = String(form.get("password") || "");

if (!fullName || !email || !phone || password.length < 8) {
  setError(
    "Complete all fields. Password must be at least 8 characters."
  );
  setLoading(false);
  return;
}

try {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
     emailRedirectTo: `${window.location.origin}/customer-login`,

    },
  });

  if (signUpError) throw signUpError;
  if (!data.user) {
    throw new Error("Account creation could not be confirmed.");
  }

  if (data.session) {
    const { error: profileError } = await supabase
      .from("customer_profiles")
      .upsert({
        id: data.user.id,
        full_name: fullName,
        email,
        phone,
      });

    if (profileError) throw profileError;

    setSuccess("Account created successfully. Redirecting...");
    setTimeout(() => router.push("/customer-login"), 1500);
  } else {
    setSuccess(
      "Account created! Check your email to confirm your account, then log in."
    );
  }
} catch (err) {
  setError(
    err instanceof Error ? err.message : "Registration failed."
  );
} finally {
  setLoading(false);
}
}

const inputStyle = {
width: "100%",
padding: "14px 15px",
borderRadius: "10px",
border: "1px solid #334155",
background: "#111827",
color: "#ffffff",
fontSize: "15px",
outline: "none",
boxSizing: "border-box" as const,
};

return (
<main
style={{
minHeight: "100vh",
background:
"radial-gradient(circle at top, #172554 0%, #080f20 48%, #050914 100%)",
color: "#f8fafc",
padding: "35px 18px",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontFamily: "Arial, sans-serif",
}}
>
<div style={{ width: "100%", maxWidth: "470px" }}>
<div style={{ textAlign: "center", marginBottom: "27px" }}>
<a
href="/"
style={{
color: "#ffffff",
textDecoration: "none",
fontSize: "30px",
fontWeight: 800,
letterSpacing: "-1px",
}}
>
Abuja<span style={{ color: "#38bdf8" }}>Fix</span>
</a>
<p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "9px" }}>
Find Trusted Technicians. Fix It Fast.
</p>
</div>

    <section
      style={{
        background: "rgba(15, 23, 42, 0.96)",
        border: "1px solid #263449",
        borderRadius: "20px",
        padding: "32px 26px",
        boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "27px" }}>
        <div
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "16px",
            background: "#0c4a6e",
            color: "#7dd3fc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "27px",
            margin: "0 auto 16px",
          }}
        >
          ✦
        </div>

        <h1 style={{ fontSize: "26px", margin: "0 0 9px", fontWeight: 750 }}>
          Create Your Account
        </h1>

        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          Join AbujaFix and manage your service requests.
        </p>
      </div>

      <form
        onSubmit={handleRegister}
        style={{ display: "grid", gap: "17px" }}
      >
        <div>
          <label
          style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Full Name
          </label>
          <input
            name="full_name"
            required
            autoComplete="name"
            placeholder="Enter your full name"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Phone Number
          </label>
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="Enter your phone number"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Password
          </label>

          <div style={{ position: "relative" }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              style={{ ...inputStyle, paddingRight: "85px" }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: 0,
                color: "#38bdf8",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            border: 0,
            borderRadius: "11px",
            background: loading
              ? "#475569"
              : "linear-gradient(90deg, #0284c7, #2563eb)",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "5px",
          }}
        >
          {loading ? "Creating Account..." : "Create Account →"}
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "#fca5a5",
            background: "#451a1a",
            padding: "12px",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        >
          {error}
        </p>
      )}

      {success && (
        <p
          style={{
            color: "#86efac",
            background: "#052e20",
            padding: "12px",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        >
          {success}
        </p>
      )}

      <div
        style={{
          textAlign: "center",
          marginTop: "25px",
          borderTop: "1px solid #263449",
          paddingTop: "20px",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
          Already have an account?{" "}
          <a
            href="/customer-login"
            style={{
              color: "#38bdf8",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Log in
          </a>
        </p>
      </div>
    </section>

    <p
      style={{
        textAlign: "center",
        color: "#64748b",
        fontSize: "12px",
        marginTop: "22px",
      }}
    >
    {"© 2026 AbujaFix. All rights reserved."}
    </p>
  </div>
</main>
);
}
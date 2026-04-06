"use client";
import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    full_name: "", phone: "", role: "buyer",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user, data.token);
      router.push("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-brand">Estate<span>Hub</span></div>
        <h2>Join <em>EstateHub</em> Today</h2>
        <p>Create a free account to start browsing, saving listings, and connecting with agents.</p>
        <div className="auth-features">
          {[
            ["👤", "Register as a Buyer to browse & save listings"],
            ["🏡", "Register as an Agent to post your own listings"],
            ["🔒", "Secure login with JWT authentication"],
            ["💾", "Your data stored safely in MySQL database"],
            ["📩", "Contact agents directly from any listing"],
          ].map(([ico, txt]) => (
            <div className="auth-feat" key={txt}>
              <div className="auth-feat-ico">{ico}</div>
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">Create Account</h2>
          <p className="auth-box-sub">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">Sign in here</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-input" name="username" value={form.username}
                  onChange={set} placeholder="e.g. john123" autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="full_name" value={form.full_name}
                  onChange={set} placeholder="John Smith" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" name="email" type="email" value={form.email}
                onChange={set} placeholder="john@example.com" autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={form.phone}
                onChange={set} placeholder="e.g. 081-234-5678" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" name="password" type="password" value={form.password}
                  onChange={set} placeholder="Min 6 characters" autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" name="confirmPassword" type="password"
                  value={form.confirmPassword} onChange={set} placeholder="Repeat password" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Register As *</label>
              <select className="form-select" name="role" value={form.role} onChange={set}>
                <option value="buyer">👤 Buyer — Browse & save listings</option>
                <option value="agent">🏡 Agent — Post & manage listings</option>
              </select>
            </div>

            {error && <div className="form-err">{error}</div>}

            <button type="submit" className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: "1.25rem" }} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

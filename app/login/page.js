"use client";
import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user, data.token);
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (username, password) => {
    setForm({ username, password });
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user, data.token);
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-brand">Estate<span>Hub</span></div>
        <h2>Welcome <em>Back</em> to<br />Your Property Hub</h2>
        <p>Manage listings, save favourites, and connect with agents — all in one place.</p>
        <div className="auth-features">
          {[
            ["🏠", "Browse hundreds of verified listings"],
            ["🔍", "Advanced search & filter by type, price"],
            ["❤️", "Save and manage your favourite properties"],
            ["📊", "Real-time status updates from agents"],
            ["📩", "Contact agents directly from any listing"],
          ].map(([ico, txt]) => (
            <div className="auth-feat" key={txt}>
              <div className="auth-feat-ico">{ico}</div>
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-box-title">Sign In</h2>
          <p className="auth-box-sub">
            Don't have an account?{" "}
            <Link href="/register" className="auth-link">Register here</Link>
          </p>

          {/* Demo Accounts */}
          <div className="demo-box">
            <div className="demo-box-title">🚀 Quick Login — Demo Accounts</div>
            <div className="demo-btns">
              {[
                { label: "👑 Admin",  u: "admin",  p: "admin123" },
                { label: "🏡 Agent",  u: "agent1", p: "agent123" },
                { label: "👤 Buyer",  u: "buyer1", p: "buyer123" },
              ].map((a) => (
                <button key={a.u} className="demo-btn"
                  onClick={() => quickLogin(a.u, a.p)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input className="form-input" name="username" value={form.username}
                onChange={set} placeholder="Enter username or email" autoComplete="username" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" value={form.password}
                onChange={set} placeholder="Enter password" autoComplete="current-password" />
            </div>

            {error && <div className="form-err">{error}</div>}

            <button type="submit" className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: "1.25rem" }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  const guestLinks = [
    { href: "/",         label: "🏠 Listings" },
    { href: "/login",    label: "Sign In"     },
    { href: "/register", label: "Register"    },
  ];

  const userLinks = [
    { href: "/",            label: "🏠 Listings"  },
    { href: "/favourites",  label: "❤️ Saved"     },
    ...(user?.role !== "buyer"
      ? [{ href: "/manage", label: "📋 Manage" }]
      : []),
  ];

  const links = user ? userLinks : guestLinks;

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">Estate<span>Hub</span></Link>

      <div className="nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`nav-link ${path === l.href ? "active" : ""}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <div className="nav-user">
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>Hi,</span>
              <strong style={{ color: "#fff", fontSize: "0.875rem" }}>{user.username}</strong>
              <span className="nav-role">{user.role}</span>
            </div>
            <button className="nav-btn" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link href="/login"    className="nav-btn">Sign In</Link>
            <Link href="/register" className="nav-btn nav-btn-gold">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

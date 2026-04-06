"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import Navbar from "../../components/Navbar";
import { useParams, useRouter } from "next/navigation";

const fmt = (p, forRent) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p)
  + (forRent ? "/mo" : "");

export default function ListingDetailPage() {
  const { id }   = useParams();
  const { user, authFetch } = useAuth();
  const router   = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav,   setIsFav]   = useState(false);
  const [sent,    setSent]     = useState(false);
  const [sending, setSending]  = useState(false);
  const [contactErr, setContactErr] = useState("");
  const [form, setForm] = useState({ sender_name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setListing(d.listing);
        if (d.listing) {
          setForm((p) => ({
            ...p,
            sender_name: user?.username || "",
            email: user?.email || "",
            message: `Hi, I'm interested in "${d.listing.title}". Please contact me.`,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/favourites")
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set((d.favourites || []).map((f) => f.id));
        setIsFav(ids.has(Number(id)));
      });
  }, [user]);

  const handleFav = async () => {
    if (!user) { router.push("/login"); return; }
    if (isFav) {
      await authFetch(`/api/favourites/${id}`, { method: "DELETE" });
      setIsFav(false);
    } else {
      await authFetch("/api/favourites", { method: "POST", body: JSON.stringify({ listing_id: Number(id) }) });
      setIsFav(true);
    }
  };

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true); setContactErr("");
    try {
      const res  = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, listing_id: Number(id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setContactErr(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="loader-wrap" style={{ paddingTop: "8rem" }}><div className="spinner" /></div>
    </>
  );

  if (!listing) return (
    <>
      <Navbar />
      <div className="empty-state" style={{ paddingTop: "8rem" }}>
        <div className="empty-icon">🏠</div>
        <h3>Listing not found</h3>
        <a href="/" className="btn btn-gold" style={{ marginTop: "1.25rem", display: "inline-flex" }}>← Back to Listings</a>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: "2.5rem 1.75rem" }}>

        {/* Back link */}
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: "1.5rem" }} onClick={() => router.back()}>
          ← Back
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "2.5rem", alignItems: "start" }}>

          {/* LEFT */}
          <div>
            {listing.image_url
              ? <img src={listing.image_url} alt={listing.title}
                  style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: "var(--radius-lg)", marginBottom: "1.75rem" }} />
              : <div style={{ width: "100%", height: 320, background: "linear-gradient(135deg,var(--cream),var(--border))", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", marginBottom: "1.75rem" }}>🏠</div>
            }

            {/* Specs */}
            <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "1.5rem", boxShadow: "var(--shadow-sm)", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "1.1rem" }}>Property Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "1rem" }}>
                {listing.bedrooms  > 0 && <div className="detail-specs-grid" style={{ background: "var(--off-white)", borderRadius: 10, padding: "0.9rem", textAlign: "center" }}><div className="dspec-val">🛏 {listing.bedrooms}</div><div className="dspec-label">Bedrooms</div></div>}
                {listing.bathrooms > 0 && <div style={{ background: "var(--off-white)", borderRadius: 10, padding: "0.9rem", textAlign: "center" }}><div className="dspec-val">🚿 {listing.bathrooms}</div><div className="dspec-label">Bathrooms</div></div>}
                {listing.area      > 0 && <div style={{ background: "var(--off-white)", borderRadius: 10, padding: "0.9rem", textAlign: "center" }}><div className="dspec-val">📐 {listing.area}</div><div className="dspec-label">m² Area</div></div>}
                {listing.floor        && <div style={{ background: "var(--off-white)", borderRadius: 10, padding: "0.9rem", textAlign: "center" }}><div className="dspec-val">🏢 {listing.floor}</div><div className="dspec-label">Floor</div></div>}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--muted)" }}>
                {listing.parking   && <span>🚗 Parking included</span>}
                {listing.furnished && <span>🛋 Fully furnished</span>}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: "1.5rem", boxShadow: "var(--shadow-sm)", marginBottom: "1.5rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>Description</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>{listing.description}</p>
              </div>
            )}

            {/* Map */}
            <div className="map-box" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: "2rem" }}>🗺️</span>
              <strong>Location Map</strong>
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{listing.address || listing.location}</span>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ position: "sticky", top: "88px" }}>
            <div style={{ background: "var(--white)", borderRadius: "var(--radius-lg)", padding: "1.75rem", boxShadow: "var(--shadow)" }}>

              <div className="detail-badges" style={{ marginBottom: "0.9rem" }}>
                <span className={`badge badge-${listing.status}`}>{listing.status}</span>
                <span className={`badge badge-${listing.listing_for}`}>{listing.listing_for === "sale" ? "For Sale" : "For Rent"}</span>
                <span className="badge badge-type">{listing.type}</span>
              </div>

              <div className="detail-price">{fmt(listing.price, listing.listing_for === "rent")}</div>
              <div className="detail-title">{listing.title}</div>
              <div className="detail-loc" style={{ marginBottom: "1.5rem" }}>📍 {listing.address || listing.location}</div>

              {/* Agent */}
              <div className="agent-box">
                <div className="agent-name">👤 {listing.agent_name || listing.agent_username || "Agent"}</div>
                <div className="agent-info">
                  {listing.agent_phone && <span>📞 {listing.agent_phone}<br /></span>}
                  {listing.agent_email && <span>✉️ {listing.agent_email}</span>}
                </div>
              </div>

              {/* Save Button */}
              {user && (
                <button
                  className={`btn btn-full btn-lg ${isFav ? "btn-danger" : "btn-gold"}`}
                  style={{ marginBottom: "0.75rem" }}
                  onClick={handleFav}
                >
                  {isFav ? "💔 Remove from Saved" : "❤️ Save Property"}
                </button>
              )}

              {/* Contact Form */}
              {!sent ? (
                <form onSubmit={handleContact}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.85rem", color: "var(--text)" }}>
                    📩 Contact Agent
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" name="sender_name" value={form.sender_name} onChange={set} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" name="email" type="email" value={form.email} onChange={set} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={set} placeholder="Optional" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" name="message" value={form.message} onChange={set} required style={{ minHeight: 90 }} />
                  </div>
                  {contactErr && <div className="form-err">{contactErr}</div>}
                  <button type="submit" className="btn btn-green btn-full" disabled={sending}>
                    {sending ? "Sending..." : "📨 Send Message"}
                  </button>
                </form>
              ) : (
                <div className="sent-box">
                  <div className="sent-icon">✅</div>
                  <h3>Message Sent!</h3>
                  <p>The agent will contact you shortly.</p>
                </div>
              )}

              {listing.created_at && (
                <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "1.1rem", textAlign: "right" }}>
                  Listed: {new Date(listing.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          .container > div:last-child > div[style] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

"use client";
import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";

const fmt = (p, forRent) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p)
  + (forRent ? "/mo" : "");

export default function PropertyDetail({ listing, isFav, onClose, onFav }) {
  const { user } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [sent, setSent]  = useState(false);
  const [sending, setSending] = useState(false);
  const [contactErr, setContactErr] = useState("");
  const [form, setForm]  = useState({
    sender_name: user?.username || "",
    email: user?.email || "",
    phone: "",
    message: `Hi, I'm interested in "${listing.title}". Please contact me.`,
  });

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true); setContactErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, listing_id: listing.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setContactErr(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg">
        <div className="modal-hdr">
          <h2 className="modal-title">Property Details</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {/* LEFT */}
            <div>
              {listing.image_url
                ? <img src={listing.image_url} alt={listing.title} className="detail-img" />
                : <div className="detail-no-img">🏠</div>}

              <div className="detail-specs-grid">
                {listing.bedrooms  > 0 && <div><div className="dspec-val">{listing.bedrooms}</div><div className="dspec-label">Bedrooms</div></div>}
                {listing.bathrooms > 0 && <div><div className="dspec-val">{listing.bathrooms}</div><div className="dspec-label">Bathrooms</div></div>}
                {listing.area      > 0 && <div><div className="dspec-val">{listing.area}</div><div className="dspec-label">m² Area</div></div>}
                {listing.floor        && <div><div className="dspec-val">{listing.floor}</div><div className="dspec-label">Floor</div></div>}
              </div>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                {listing.parking   && <span>🚗 Parking included</span>}
                {listing.furnished && <span>🛋 Fully furnished</span>}
              </div>

              <div className="map-box">
                <span style={{ fontSize: "1.75rem" }}>🗺️</span>
                <strong>Location</strong>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{listing.address || listing.location}</span>
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <div className="detail-badges">
                <span className={`badge badge-${listing.status}`}>{listing.status}</span>
                <span className={`badge badge-${listing.listing_for}`}>
                  {listing.listing_for === "sale" ? "For Sale" : "For Rent"}
                </span>
                <span className="badge badge-type">{listing.type}</span>
              </div>

              <div className="detail-price">{fmt(listing.price, listing.listing_for === "rent")}</div>
              <div className="detail-title">{listing.title}</div>
              <div className="detail-loc">📍 {listing.address || listing.location}</div>

              {listing.description && (
                <p className="detail-desc">{listing.description}</p>
              )}

              {/* Agent Box */}
              <div className="agent-box">
                <div className="agent-name">👤 {listing.agent_name || listing.agent_username || "Agent"}</div>
                <div className="agent-info">
                  {listing.agent_phone && <span>📞 {listing.agent_phone}<br /></span>}
                  {listing.agent_email && <span>✉️ {listing.agent_email}</span>}
                </div>
              </div>

              {/* Save / Fav */}
              {user && (
                <button
                  className={`btn btn-full ${isFav ? "btn-danger" : "btn-gold"} btn-lg`}
                  style={{ marginBottom: "0.75rem" }}
                  onClick={() => onFav(listing.id)}
                >
                  {isFav ? "💔 Remove from Saved" : "❤️ Save Property"}
                </button>
              )}

              {/* Contact Agent */}
              {!showContact && !sent && (
                <button className="btn btn-outline btn-full" onClick={() => setShowContact(true)}>
                  📩 Contact Agent
                </button>
              )}

              {showContact && !sent && (
                <form onSubmit={handleContact} style={{ background: "var(--off-white)", borderRadius: "var(--radius)", padding: "1.1rem", marginTop: "0.75rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.8rem" }}>Send a Message</div>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" name="sender_name" value={form.sender_name} onChange={set} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" name="email" type="email" value={form.email} onChange={set} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" name="phone" value={form.phone} onChange={set} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" name="message" value={form.message} onChange={set} required />
                  </div>
                  {contactErr && <div className="form-err">{contactErr}</div>}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className="btn btn-green btn-full" disabled={sending}>
                      {sending ? "Sending..." : "📨 Send Message"}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowContact(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {sent && (
                <div className="sent-box" style={{ background: "var(--off-white)", borderRadius: "var(--radius)", marginTop: "0.75rem" }}>
                  <div className="sent-icon">✅</div>
                  <h3>Message Sent!</h3>
                  <p>The agent will get back to you soon.</p>
                </div>
              )}

              {listing.created_at && (
                <p style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: "1.1rem", textAlign: "right" }}>
                  Listed: {new Date(listing.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:700px){ .detail-grid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";

const EMPTY = {
  title: "", description: "", type: "Apartment", listing_for: "sale",
  price: "", location: "", address: "",
  bedrooms: "", bathrooms: "", area: "",
  floor: "", parking: false, furnished: false,
  image_url: "", status: "available",
};

export default function ListingForm({ onClose, onSaved, initial = null }) {
  const { authFetch } = useAuth();
  const [form, setForm]     = useState(initial || EMPTY);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setForm(initial || EMPTY); }, [initial]);

  const set = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((p) => ({ ...p, [name]: t === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.location) {
      setError("Title, price, and location are required."); return;
    }
    setLoading(true); setError("");
    try {
      const url    = initial ? `/api/listings/${initial.id}` : "/api/listings";
      const method = initial ? "PUT" : "POST";
      const res    = await authFetch(url, { method, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <h2 className="modal-title">{initial ? "✏️ Edit Listing" : "➕ New Listing"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={set} placeholder="e.g. Modern 3BR House with Garden" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={set}>
                  {["House","Apartment","Condo","Villa","Land","Commercial","Townhouse"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">For Sale / Rent *</label>
                <select className="form-select" name="listing_for" value={form.listing_for} onChange={set}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={set}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (USD) *</label>
                <input className="form-input" name="price" type="number" value={form.price} onChange={set} placeholder="e.g. 350000" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input className="form-input" name="location" value={form.location} onChange={set} placeholder="e.g. Bangkok" />
            </div>

            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input className="form-input" name="address" value={form.address} onChange={set} placeholder="e.g. 123 Sukhumvit Rd, Watthana, Bangkok" />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <input className="form-input" name="bedrooms" type="number" value={form.bedrooms} onChange={set} placeholder="3" />
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <input className="form-input" name="bathrooms" type="number" value={form.bathrooms} onChange={set} placeholder="2" />
              </div>
              <div className="form-group">
                <label className="form-label">Area (m²)</label>
                <input className="form-input" name="area" type="number" value={form.area} onChange={set} placeholder="120" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input className="form-input" name="floor" type="number" value={form.floor} onChange={set} placeholder="Optional" />
              </div>
              <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "0.6rem", paddingBottom: "0.1rem" }}>
                <label className="check-group">
                  <input type="checkbox" name="parking" checked={!!form.parking} onChange={set} />
                  🚗 Parking Included
                </label>
                <label className="check-group">
                  <input type="checkbox" name="furnished" checked={!!form.furnished} onChange={set} />
                  🛋 Fully Furnished
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" name="image_url" value={form.image_url} onChange={set} placeholder="https://example.com/photo.jpg" />
              <p className="form-hint">Paste a direct image URL (jpg/png). Use Unsplash for free photos.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={form.description} onChange={set} placeholder="Describe the property — features, surroundings, highlights..." />
            </div>

            {error && <div className="form-err">{error}</div>}

            <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.4rem" }}>
              <button type="submit" className="btn btn-gold" style={{ flex: 1 }} disabled={loading}>
                {loading ? "Saving..." : initial ? "Update Listing" : "Add Listing"}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

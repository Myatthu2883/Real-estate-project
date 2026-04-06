"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar";
import ListingForm from "../components/ListingForm";
import PropertyDetail from "../components/PropertyDetail";
import { useRouter } from "next/navigation";

const fmt = (p) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);

export default function ManagePage() {
  const { user, authFetch } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detail,   setDetail]   = useState(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role === "buyer") { router.push("/"); return; }
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/listings");
      const data = await res.json();
      const all  = data.listings || [];
      // Agent sees only own listings; admin sees all
      setListings(
        user?.role === "admin"
          ? all
          : all.filter((l) => l.agent_id === user?.id)
      );
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await authFetch(`/api/listings/${id}`, { method: "DELETE" });
      fetchListings();
    } catch { alert("Failed to delete."); }
  };

  const handleStatusChange = async (id, status) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    try {
      await authFetch(`/api/listings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...listing, status }),
      });
      fetchListings();
    } catch { /* ignore */ }
  };

  const myTotal     = listings.length;
  const myAvailable = listings.filter((l) => l.status === "available").length;
  const mySold      = listings.filter((l) => l.status === "sold").length;
  const myRented    = listings.filter((l) => l.status === "rented").length;

  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <h1>📋 {user?.role === "admin" ? "All" : "My"} <em>Listings</em></h1>
            <p>
              {user?.role === "admin"
                ? `Full admin control — managing all ${myTotal} listings`
                : `Managing your ${myTotal} listing${myTotal !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="btn btn-gold btn-lg" onClick={() => setShowForm(true)}>
            + Add New Listing
          </button>
        </div>
      </div>

      <div className="container page-wrap">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card"><div className="stat-num">{myTotal}</div><div className="stat-label">Total</div></div>
          <div className="stat-card c-green"><div className="stat-num">{myAvailable}</div><div className="stat-label">Available</div></div>
          <div className="stat-card c-red"><div className="stat-num">{mySold}</div><div className="stat-label">Sold</div></div>
          <div className="stat-card c-blue"><div className="stat-num">{myRented}</div><div className="stat-label">Rented</div></div>
          <div className="stat-card" style={{ borderTopColor: "#7c3aed" }}>
            <div className="stat-num">{listings.filter((l) => l.listing_for === "rent").length}</div>
            <div className="stat-label">For Rent</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loader-wrap"><div className="spinner" /></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏡</div>
            <h3>No listings yet</h3>
            <p>Add your first property to get started.</p>
            <button className="btn btn-gold" style={{ marginTop: "1.25rem" }} onClick={() => setShowForm(true)}>
              + Add First Listing
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>For</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const canEdit = user?.role === "admin" || l.agent_id === user?.id;
                  return (
                    <tr key={l.id}>
                      <td>
                        {l.image_url
                          ? <img src={l.image_url} alt={l.title} className="t-img"
                              onError={(e) => { e.target.style.display = "none"; }} />
                          : <div style={{ width: 50, height: 36, background: "var(--cream)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🏠</div>
                        }
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.35 }}>{l.title}</div>
                      </td>
                      <td>
                        <span className="badge badge-type" style={{ position: "static", display: "inline-block" }}>{l.type}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${l.listing_for}`} style={{ position: "static", display: "inline-block" }}>
                          {l.listing_for === "sale" ? "Sale" : "Rent"}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>📍 {l.location}</td>
                      <td className="t-price">{fmt(l.price)}</td>
                      <td>
                        {canEdit ? (
                          <select
                            className="filter-select"
                            style={{ padding: "0.3rem 0.55rem", fontSize: "0.76rem", minWidth: "unset" }}
                            value={l.status}
                            onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          >
                            <option value="available">✅ Available</option>
                            <option value="sold">🔴 Sold</option>
                            <option value="rented">🔵 Rented</option>
                          </select>
                        ) : (
                          <span className={`badge badge-${l.status}`} style={{ position: "static", display: "inline-block" }}>{l.status}</span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{l.agent_username || "—"}</td>
                      <td>
                        <div className="t-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => setDetail(l)} title="View">👁</button>
                          {canEdit && (
                            <button className="btn btn-outline btn-sm" onClick={() => setEditItem(l)} title="Edit">✏️</button>
                          )}
                          {user?.role === "admin" && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)} title="Delete">🗑</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <ListingForm onClose={() => setShowForm(false)} onSaved={fetchListings} />}
      {editItem && <ListingForm initial={editItem} onClose={() => setEditItem(null)} onSaved={fetchListings} />}
      {detail   && <PropertyDetail listing={detail} isFav={false} onClose={() => setDetail(null)} onFav={() => {}} />}
    </>
  );
}

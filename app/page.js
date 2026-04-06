"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import PropertyCard from "./components/PropertyCard";
import PropertyDetail from "./components/PropertyDetail";
import ListingForm from "./components/ListingForm";
import { useAuth } from "./lib/AuthContext";

export default function Home() {
  const { user, authFetch } = useAuth();
  const [listings,  setListings]  = useState([]);
  const [favIds,    setFavIds]    = useState(new Set());
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [detail,    setDetail]    = useState(null);
  const [editItem,  setEditItem]  = useState(null);
  const [showForm,  setShowForm]  = useState(false);

  // Filters
  const [search,      setSearch]      = useState("");
  const [heroSearch,  setHeroSearch]  = useState("");
  const [listingFor,  setListingFor]  = useState(""); // "" = all, "sale", "rent"
  const [filterType,  setFilterType]  = useState("");
  const [filterStatus,setFilterStatus]= useState("");
  const [sortBy,      setSortBy]      = useState("newest");

  // Fetch listings from our API
  const fetchListings = async (params = {}) => {
    setLoading(true); setError("");
    try {
      const q = new URLSearchParams({
        ...(params.search      || search      ? { search:      params.search      ?? search      } : {}),
        ...(params.listingFor  || listingFor  ? { listing_for: params.listingFor  ?? listingFor  } : {}),
        ...(params.filterType  || filterType  ? { type:        params.filterType  ?? filterType  } : {}),
        ...(params.filterStatus|| filterStatus? { status:      params.filterStatus?? filterStatus} : {}),
        sort: params.sortBy ?? sortBy,
      });
      const res  = await fetch(`/api/listings?${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setListings(data.listings);
    } catch (err) {
      setError("Could not load listings. Make sure MySQL is running and configured.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user favourites
  const fetchFavs = async () => {
    if (!user) { setFavIds(new Set()); return; }
    try {
      const res  = await authFetch("/api/favourites");
      const data = await res.json();
      setFavIds(new Set(data.favourites?.map((f) => f.id)));
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchListings(); }, []);
  useEffect(() => { fetchFavs(); }, [user]);

  // ── Handlers ──────────────────────────────────────────
  const handleFav = async (listingId) => {
    if (!user) { alert("Please sign in to save listings."); return; }
    const isFav = favIds.has(listingId);
    try {
      if (isFav) {
        await authFetch(`/api/favourites/${listingId}`, { method: "DELETE" });
        setFavIds((prev) => { const s = new Set(prev); s.delete(listingId); return s; });
      } else {
        await authFetch("/api/favourites", { method: "POST", body: JSON.stringify({ listing_id: listingId }) });
        setFavIds((prev) => new Set(prev).add(listingId));
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await authFetch(`/api/listings/${id}`, { method: "DELETE" });
      fetchListings();
    } catch (err) { alert("Failed to delete."); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const listing = listings.find((l) => l.id === id);
      await authFetch(`/api/listings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...listing, status }),
      });
      fetchListings();
    } catch { /* ignore */ }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    setSearch(heroSearch);
    fetchListings({ search: heroSearch });
    document.getElementById("listings-anchor")?.scrollIntoView({ behavior: "smooth" });
  };

  const applyFilter = (updates = {}) => {
    const next = { search, listingFor, filterType, filterStatus, sortBy, ...updates };
    if (updates.listingFor  !== undefined) setListingFor(updates.listingFor);
    if (updates.filterType  !== undefined) setFilterType(updates.filterType);
    if (updates.filterStatus!== undefined) setFilterStatus(updates.filterStatus);
    if (updates.sortBy      !== undefined) setSortBy(updates.sortBy);
    if (updates.search      !== undefined) setSearch(updates.search);
    fetchListings(next);
  };

  const canAdd = user?.role === "admin" || user?.role === "agent";

  // Stats
  const total     = listings.length;
  const forSale   = listings.filter((l) => l.listing_for === "sale").length;
  const forRent   = listings.filter((l) => l.listing_for === "rent").length;
  const available = listings.filter((l) => l.status === "available").length;

  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-eyebrow">🏆 Thailand's Premier Property Platform</div>
        <h1>Find Your <em>Perfect</em> Property<br />Buy or Rent with Confidence</h1>
        <p>Browse hundreds of verified listings across Bangkok, Phuket, Chiang Mai and beyond.</p>

        {/* Buy / Rent tabs */}
        <div className="hero-tabs">
          {[["", "All Properties"], ["sale", "🏠 Buy"], ["rent", "🔑 Rent"]].map(([v, l]) => (
            <button key={v}
              className={`hero-tab ${listingFor === v ? "active" : ""}`}
              onClick={() => applyFilter({ listingFor: v })}
            >{l}</button>
          ))}
        </div>

        <form className="hero-search" onSubmit={handleHeroSearch}>
          <span style={{ color: "var(--muted)" }}>🔍</span>
          <input className="hs-input" placeholder="Search by city, area, or property name..."
            value={heroSearch} onChange={(e) => setHeroSearch(e.target.value)} />
          <div className="hs-divider" />
          <select className="hs-select" value={filterType} onChange={(e) => applyFilter({ filterType: e.target.value })}>
            <option value="">All Types</option>
            {["House","Apartment","Condo","Villa","Land","Commercial","Townhouse"].map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="hs-divider" />
          <select className="hs-select" value={filterStatus} onChange={(e) => applyFilter({ filterStatus: e.target.value })}>
            <option value="">Any Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <button type="submit" className="hs-btn">Search Properties</button>
        </form>

        <div className="hero-stats">
          {[
            [total,     "Total Listings"],
            [forSale,   "For Sale"],
            [forRent,   "For Rent"],
            [available, "Available Now"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="hero-stat-num">{n}</div>
              <div className="hero-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────── */}
      <div id="listings-anchor" />
      <div className="container page-wrap">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card"><div className="stat-num">{total}</div><div className="stat-label">All Properties</div></div>
          <div className="stat-card c-blue"><div className="stat-num">{forSale}</div><div className="stat-label">For Sale</div></div>
          <div className="stat-card" style={{ borderTopColor: "#7c3aed" }}><div className="stat-num">{forRent}</div><div className="stat-label">For Rent</div></div>
          <div className="stat-card c-green"><div className="stat-num">{available}</div><div className="stat-label">Available</div></div>
          <div className="stat-card c-red"><div className="stat-num">{listings.filter((l) => l.status === "sold").length}</div><div className="stat-label">Sold</div></div>
        </div>

        {/* Section Header */}
        <div className="section-head">
          <div>
            <h2 className="section-title">All <em>Properties</em></h2>
            <p className="section-sub">{listings.length} {listings.length === 1 ? "property" : "properties"} found</p>
          </div>
          {canAdd && (
            <button className="btn btn-gold btn-lg" onClick={() => setShowForm(true)}>+ Add Listing</button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <span className="filter-lbl">Filter:</span>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Title, city, area..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); applyFilter({ search: e.target.value }); }} />
          </div>
          <div className="filter-divider" />
          <select className="filter-select" value={listingFor} onChange={(e) => applyFilter({ listingFor: e.target.value })}>
            <option value="">Buy & Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <select className="filter-select" value={filterType} onChange={(e) => applyFilter({ filterType: e.target.value })}>
            <option value="">All Types</option>
            {["House","Apartment","Condo","Villa","Land","Commercial","Townhouse"].map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => applyFilter({ filterStatus: e.target.value })}>
            <option value="">Any Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <div className="filter-divider" />
          <select className="filter-select" value={sortBy} onChange={(e) => applyFilter({ sortBy: e.target.value })}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
          {(search || listingFor || filterType || filterStatus) && (
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setSearch(""); setListingFor(""); setFilterType(""); setFilterStatus("");
              fetchListings({ search: "", listingFor: "", filterType: "", filterStatus: "" });
            }}>✕ Clear</button>
          )}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="loader-wrap"><div className="spinner" /><p style={{ color: "var(--muted)" }}>Loading properties...</p></div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Database Connection Error</h3>
            <p style={{ maxWidth: 460, margin: "0 auto" }}>{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No properties found</h3>
            <p>Try changing your search or filters.</p>
            {canAdd && <button className="btn btn-gold" style={{ marginTop: "1.25rem" }} onClick={() => setShowForm(true)}>+ Add First Listing</button>}
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((l) => (
              <PropertyCard key={l.id} listing={l}
                isFav={favIds.has(l.id)}
                onFav={handleFav}
                onView={setDetail}
                onEdit={(item) => setEditItem(item)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {detail   && <PropertyDetail listing={detail} isFav={favIds.has(detail.id)} onClose={() => setDetail(null)} onFav={handleFav} />}
      {showForm && <ListingForm onClose={() => setShowForm(false)} onSaved={fetchListings} />}
      {editItem && <ListingForm initial={editItem} onClose={() => setEditItem(null)} onSaved={fetchListings} />}
    </>
  );
}

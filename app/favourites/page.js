"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import PropertyDetail from "../components/PropertyDetail";
import { useRouter } from "next/navigation";

export default function FavouritesPage() {
  const { user, authFetch } = useAuth();
  const router = useRouter();
  const [favs,    setFavs]    = useState([]);
  const [favIds,  setFavIds]  = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [detail,  setDetail]  = useState(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchFavs();
  }, [user]);

  const fetchFavs = async () => {
    setLoading(true);
    try {
      const res  = await authFetch("/api/favourites");
      const data = await res.json();
      setFavs(data.favourites || []);
      setFavIds(new Set((data.favourites || []).map((f) => f.id)));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleFav = async (listingId) => {
    try {
      await authFetch(`/api/favourites/${listingId}`, { method: "DELETE" });
      setFavs((prev) => prev.filter((f) => f.id !== listingId));
      setFavIds((prev) => { const s = new Set(prev); s.delete(listingId); return s; });
      if (detail?.id === listingId) setDetail(null);
    } catch { /* ignore */ }
  };

  return (
    <>
      <Navbar />

      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <h1>❤️ Saved <em>Properties</em></h1>
            <p>{favs.length} {favs.length === 1 ? "property" : "properties"} saved to your list</p>
          </div>
        </div>
      </div>

      <div className="container page-wrap">
        {loading ? (
          <div className="loader-wrap"><div className="spinner" /></div>
        ) : favs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤍</div>
            <h3>No saved properties yet</h3>
            <p>Click the ❤️ heart icon on any listing to save it here.</p>
            <a href="/" className="btn btn-gold" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
              Browse All Properties →
            </a>
          </div>
        ) : (
          <div className="listings-grid">
            {favs.map((l) => (
              <PropertyCard
                key={l.id}
                listing={l}
                isFav={favIds.has(l.id)}
                onFav={handleFav}
                onView={setDetail}
                onEdit={() => {}}
                onDelete={() => {}}
                onStatusChange={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {detail && (
        <PropertyDetail
          listing={detail}
          isFav={favIds.has(detail.id)}
          onClose={() => setDetail(null)}
          onFav={handleFav}
        />
      )}
    </>
  );
}

"use client";
import React from "react";
import { useAuth } from "../lib/AuthContext";

const fmt = (p, forRent) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p)
  + (forRent ? "/mo" : "");

export default function PropertyCard({
  listing, isFav, onFav, onView, onEdit, onDelete, onStatusChange,
}) {
  const { user } = useAuth();
  const canEdit =
    user?.role === "admin" ||
    (user?.role === "agent" && listing.agent_id === user?.id);
  const canDelete = user?.role === "admin";

  return (
    <div className="prop-card">
      {/* Image */}
      <div className="card-img-wrap" onClick={() => onView(listing)}>
        {listing.image_url
          ? <img src={listing.image_url} alt={listing.title} onError={(e) => e.target.style.display = "none"} />
          : <div className="card-no-img">🏠</div>}

        <div className="card-top-badges">
          <span className={`badge badge-${listing.status}`}>{listing.status}</span>
          <span className={`badge badge-${listing.listing_for}`}>
            {listing.listing_for === "sale" ? "For Sale" : "For Rent"}
          </span>
          <span className="badge badge-type">{listing.type}</span>
        </div>

        {user && (
          <button
            className={`fav-btn ${isFav ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onFav(listing.id); }}
            title={isFav ? "Remove from favourites" : "Save to favourites"}
          >
            {isFav ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-price">
          {fmt(listing.price, listing.listing_for === "rent")}
          {listing.listing_for === "rent" && <sub>/mo</sub>}
        </div>
        <div className="card-title">{listing.title}</div>
        <div className="card-loc">📍 {listing.location}</div>

        <div className="card-specs">
          {listing.bedrooms  > 0 && <span className="card-spec">🛏 {listing.bedrooms} Bed</span>}
          {listing.bathrooms > 0 && <span className="card-spec">🚿 {listing.bathrooms} Bath</span>}
          {listing.area      > 0 && <span className="card-spec">📐 {listing.area} m²</span>}
          {listing.parking       && <span className="card-spec">🚗 Parking</span>}
          {listing.furnished     && <span className="card-spec">🛋 Furnished</span>}
        </div>

        <div className="card-agent">
          By <strong>{listing.agent_name || listing.agent_username || "Agent"}</strong>
        </div>

        <div className="card-actions">
          <button className="btn btn-navy btn-sm" onClick={() => onView(listing)}>
            🔍 View Details
          </button>

          {canEdit && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(listing)}>✏️ Edit</button>
              <select
                className="filter-select"
                style={{ padding: "0.35rem 0.55rem", fontSize: "0.76rem", minWidth: "unset" }}
                value={listing.status}
                onChange={(e) => onStatusChange(listing.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="available">✅ Available</option>
                <option value="sold">🔴 Sold</option>
                <option value="rented">🔵 Rented</option>
              </select>
            </>
          )}

          {canDelete && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(listing.id)}>🗑</button>
          )}
        </div>
      </div>
    </div>
  );
}

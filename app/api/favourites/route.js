// app/api/favourites/route.js
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { getUserFromRequest } from "@/app/lib/auth";

// ── GET /api/favourites ───────────────────────────────────
// Get current user's favourites
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const [rows] = await pool.query(
      `SELECT l.*, f.id AS fav_id, f.created_at AS saved_at,
        u.username AS agent_username,
        u.full_name AS agent_name
       FROM favourites f
       JOIN listings l ON f.listing_id = l.id
       LEFT JOIN users u ON l.agent_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [user.id]
    );
    return NextResponse.json({ favourites: rows }, { status: 200 });
  } catch (error) {
    console.error("GET favourites error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// ── POST /api/favourites ──────────────────────────────────
// Add a listing to favourites
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { listing_id } = await request.json();
    if (!listing_id) {
      return NextResponse.json({ error: "listing_id is required." }, { status: 400 });
    }

    // Check if listing exists
    const [listing] = await pool.query(
      "SELECT id FROM listings WHERE id = ?", [listing_id]
    );
    if (listing.length === 0) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    // Insert (ignore duplicate)
    await pool.query(
      "INSERT IGNORE INTO favourites (user_id, listing_id) VALUES (?, ?)",
      [user.id, listing_id]
    );

    return NextResponse.json({ message: "Added to favourites." }, { status: 201 });
  } catch (error) {
    console.error("POST favourites error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// app/api/listings/route.js
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { getUserFromRequest } from "@/app/lib/auth";

// ── GET /api/listings ─────────────────────────────────────
// Public - anyone can view listings
// Query params: search, type, listing_for, status, min_price, max_price, sort
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search      = searchParams.get("search")      || "";
    const type        = searchParams.get("type")        || "";
    const listing_for = searchParams.get("listing_for") || "";
    const status      = searchParams.get("status")      || "";
    const min_price   = searchParams.get("min_price")   || "";
    const max_price   = searchParams.get("max_price")   || "";
    const sort        = searchParams.get("sort")        || "newest";

    let query = `
      SELECT 
        l.*,
        u.username    AS agent_username,
        u.full_name   AS agent_name,
        u.phone       AS agent_phone,
        u.email       AS agent_email
      FROM listings l
      LEFT JOIN users u ON l.agent_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (l.title LIKE ? OR l.location LIKE ? OR l.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (type)        { query += ` AND l.type = ?`;        params.push(type); }
    if (listing_for) { query += ` AND l.listing_for = ?`; params.push(listing_for); }
    if (status)      { query += ` AND l.status = ?`;      params.push(status); }
    if (min_price)   { query += ` AND l.price >= ?`;      params.push(Number(min_price)); }
    if (max_price)   { query += ` AND l.price <= ?`;      params.push(Number(max_price)); }

    // Sorting
    const sortMap = {
      newest:     "l.created_at DESC",
      oldest:     "l.created_at ASC",
      price_asc:  "l.price ASC",
      price_desc: "l.price DESC",
    };
    query += ` ORDER BY ${sortMap[sort] || "l.created_at DESC"}`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ listings: rows }, { status: 200 });
  } catch (error) {
    console.error("GET listings error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// ── POST /api/listings ────────────────────────────────────
// Protected - admin or agent only
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (user.role !== "admin" && user.role !== "agent") {
      return NextResponse.json({ error: "Forbidden. Agents and admins only." }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, description, type, listing_for, price,
      location, address, bedrooms, bathrooms, area,
      floor, parking, furnished, image_url, status,
    } = body;

    if (!title || !price || !location || !listing_for) {
      return NextResponse.json(
        { error: "Title, price, location, and listing type are required." },
        { status: 400 }
      );
    }

    const agentId = user.role === "admin" && body.agent_id
      ? body.agent_id
      : user.id;

    const [result] = await pool.query(
      `INSERT INTO listings
        (title, description, type, listing_for, price, location, address,
         bedrooms, bathrooms, area, floor, parking, furnished, image_url, status, agent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description || "", type || "Apartment", listing_for,
        price, location, address || "",
        bedrooms || 0, bathrooms || 0, area || 0,
        floor || null, parking ? 1 : 0, furnished ? 1 : 0,
        image_url || "", status || "available", agentId,
      ]
    );

    return NextResponse.json(
      { message: "Listing created.", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST listing error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

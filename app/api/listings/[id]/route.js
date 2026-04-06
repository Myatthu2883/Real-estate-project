// app/api/listings/[id]/route.js
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { getUserFromRequest } from "@/app/lib/auth";

// ── GET /api/listings/[id] ────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [rows] = await pool.query(
      `SELECT l.*, 
        u.username  AS agent_username,
        u.full_name AS agent_name,
        u.phone     AS agent_phone,
        u.email     AS agent_email
       FROM listings l
       LEFT JOIN users u ON l.agent_id = u.id
       WHERE l.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    return NextResponse.json({ listing: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("GET listing error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// ── PUT /api/listings/[id] ────────────────────────────────
// Admin can edit all. Agent can edit own listings only.
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (user.role !== "admin" && user.role !== "agent") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = params;

    // Check listing exists and ownership
    const [existing] = await pool.query(
      "SELECT agent_id FROM listings WHERE id = ?", [id]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    if (user.role === "agent" && existing[0].agent_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own listings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title, description, type, listing_for, price,
      location, address, bedrooms, bathrooms, area,
      floor, parking, furnished, image_url, status,
    } = body;

    await pool.query(
      `UPDATE listings SET
        title=?, description=?, type=?, listing_for=?, price=?,
        location=?, address=?, bedrooms=?, bathrooms=?, area=?,
        floor=?, parking=?, furnished=?, image_url=?, status=?
       WHERE id=?`,
      [
        title, description || "", type, listing_for, price,
        location, address || "",
        bedrooms || 0, bathrooms || 0, area || 0,
        floor || null, parking ? 1 : 0, furnished ? 1 : 0,
        image_url || "", status || "available",
        id,
      ]
    );

    return NextResponse.json({ message: "Listing updated." }, { status: 200 });
  } catch (error) {
    console.error("PUT listing error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// ── DELETE /api/listings/[id] ─────────────────────────────
// Admin only
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admins only." }, { status: 403 });
    }

    const { id } = params;
    const [result] = await pool.query("DELETE FROM listings WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Listing deleted." }, { status: 200 });
  } catch (error) {
    console.error("DELETE listing error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

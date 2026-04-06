// app/api/contact/route.js
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

// ── POST /api/contact ─────────────────────────────────────
// Submit a contact message for a listing — public
export async function POST(request) {
  try {
    const { listing_id, sender_name, email, phone, message } = await request.json();

    if (!listing_id || !sender_name || !email || !message) {
      return NextResponse.json(
        { error: "listing_id, sender_name, email, and message are required." },
        { status: 400 }
      );
    }

    // Validate listing exists
    const [listing] = await pool.query(
      "SELECT id FROM listings WHERE id = ?", [listing_id]
    );
    if (listing.length === 0) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO contact_messages (listing_id, sender_name, email, phone, message)
       VALUES (?, ?, ?, ?, ?)`,
      [listing_id, sender_name, email, phone || "", message]
    );

    return NextResponse.json(
      { message: "Message sent successfully! The agent will contact you soon." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST contact error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// ── GET /api/contact ──────────────────────────────────────
// Admin only — view all contact messages
import { getUserFromRequest } from "@/app/lib/auth";

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const [rows] = await pool.query(
      `SELECT cm.*, l.title AS listing_title
       FROM contact_messages cm
       JOIN listings l ON cm.listing_id = l.id
       ORDER BY cm.created_at DESC`
    );

    return NextResponse.json({ messages: rows }, { status: 200 });
  } catch (error) {
    console.error("GET contact error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

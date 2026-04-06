// app/api/favourites/[id]/route.js
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { getUserFromRequest } from "@/app/lib/auth";

// ── DELETE /api/favourites/[id] ───────────────────────────
// Remove a listing from favourites (id = listing_id)
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = params; // listing_id

    const [result] = await pool.query(
      "DELETE FROM favourites WHERE user_id = ? AND listing_id = ?",
      [user.id, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Favourite not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed from favourites." }, { status: 200 });
  } catch (error) {
    console.error("DELETE favourite error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

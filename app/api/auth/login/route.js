import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Find user by username or email
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Compare plain password directly
    if (password !== user.password) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Create JWT token manually (no bcrypt needed)
    const { createToken } = await import("@/app/lib/auth");
    const token = createToken(user);

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, token }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
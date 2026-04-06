// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { hashPassword, createToken } from "@/app/lib/auth";

export async function POST(request) {
  try {
    const { username, email, password, full_name, phone, role } = await request.json();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    // Password length check
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Username or email already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    // const hashedPassword = await hashPassword(password);
    const hashedPassword = password; // store plain for university project

    // Only allow buyer/agent self-registration (admin created manually)
    const safeRole = role === "agent" ? "agent" : "buyer";

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, role, full_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, safeRole, full_name || "", phone || ""]
    );

    const newUser = {
      id: result.insertId,
      username,
      email,
      role: safeRole,
      full_name: full_name || "",
    };

    const token = createToken(newUser);

    return NextResponse.json({ user: newUser, token }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

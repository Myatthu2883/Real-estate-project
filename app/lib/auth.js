// app/lib/auth.js
// JWT authentication helpers
// Run: npm install jsonwebtoken bcryptjs

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "realestate_secret_key_2024";
const JWT_EXPIRES = "7d";

// Hash a plain password
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compare plain password with hash
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Create a JWT token from user object
export function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// Verify and decode a JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Extract user from request Authorization header
export function getUserFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

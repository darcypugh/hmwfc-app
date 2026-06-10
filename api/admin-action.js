// api/admin-action.js
// Vercel serverless function — place at /api/admin-action.js in your repo root
// Handles admin writes to user data, verified server-side

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

// ── Initialise Firebase Admin (once) ────────────────────────────────────────
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://wells-app-6d7c6-default-rtdb.firebaseio.com",
  });
}

const db = getDatabase();
const adminAuth = getAuth();

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idToken, action, payload } = req.body;

  if (!idToken || !action || !payload) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ── Verify the caller is the admin ────────────────────────────────────────
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (decoded.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: "Not authorised" });
  }

  // ── Perform the requested action ─────────────────────────────────────────
  try {
    switch (action) {

      case "grantTrophy": {
        const { uid, trophyId } = payload;
        if (!uid || !trophyId) return res.status(400).json({ error: "Missing uid or trophyId" });
        await db.ref(`users/${uid}/trophies/${trophyId}`).set(true);
        return res.status(200).json({ success: true });
      }

      case "revokeTrophy": {
        const { uid, trophyId } = payload;
        if (!uid || !trophyId) return res.status(400).json({ error: "Missing uid or trophyId" });
        await db.ref(`users/${uid}/trophies/${trophyId}`).remove();
        return res.status(200).json({ success: true });
      }

      case "setSubmissionCount": {
        const { uid, trophyId, count } = payload;
        if (!uid || !trophyId || count === undefined) return res.status(400).json({ error: "Missing fields" });
        await db.ref(`users/${uid}/submissions/${trophyId}/count`).set(count);
        return res.status(200).json({ success: true });
      }

      case "reviewPhoto": {
        const { uid, trophyId, photos } = payload;
        if (!uid || !trophyId || !photos) return res.status(400).json({ error: "Missing fields" });
        await db.ref(`users/${uid}/submissions/${trophyId}/photos`).set(photos);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error("Admin action error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

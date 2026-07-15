// api/admin-action.js

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://wells-app-6d7c6-default-rtdb.firebaseio.com",
  });
}

const db = getDatabase();
const adminAuth = getAuth();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { idToken, action, payload } = req.body;
  if (!idToken || !action || !payload) return res.status(400).json({ error: "Missing fields" });

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(decoded.email.toLowerCase())) {
    return res.status(403).json({ error: "Not authorised" });
  }

  try {
    switch (action) {

      case "grantTrophy": {
        const { uid, trophyId } = payload;
        await db.ref(`users/${uid}/trophies/${trophyId}`).set(true);
        return res.status(200).json({ success: true });
      }

      case "revokeTrophy": {
        const { uid, trophyId } = payload;
        await db.ref(`users/${uid}/trophies/${trophyId}`).remove();
        return res.status(200).json({ success: true });
      }

      case "setSubmissionCount": {
        const { uid, trophyId, count } = payload;
        await db.ref(`users/${uid}/submissions/${trophyId}/count`).set(count);
        return res.status(200).json({ success: true });
      }

      case "reviewPhoto": {
        const { uid, trophyId, photos } = payload;
        await db.ref(`users/${uid}/submissions/${trophyId}/photos`).set(photos);
        return res.status(200).json({ success: true });
      }

      case "setSeasonTicket": {
        const { uid, value } = payload;
        await db.ref(`users/${uid}/seasonTicket`).set(value || null);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error("Admin action error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

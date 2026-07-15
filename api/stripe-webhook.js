// api/stripe-webhook.js

import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { Resend } from "resend";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://wells-app-6d7c6-default-rtdb.firebaseio.com",
  });
}

const db = getDatabase();
const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function reservePassCode(buyerEmail) {
  const codesRef = db.ref("hmwfc/passCodes");
  const snapshot = await codesRef.once("value");
  const codes = snapshot.val() || {};
  const unused = Object.entries(codes).find(([, v]) => !v.used && !v.reserved);
  if (!unused) return null;
  const [code] = unused;
  await codesRef.child(code).update({
    reserved: true,
    reservedFor: buyerEmail,
    reservedAt: new Date().toISOString(),
  });
  return code;
}

async function sendPassEmail(buyerEmail, buyerName, code) {
  const appUrl = "https://hemsworthmwfc.co.uk";
  await resend.emails.send({
    from: "Hemsworth Miners Welfare FC <noreply@hemsworthmwfc.co.uk>",
    to: buyerEmail,
    bcc: process.env.ADMIN_EMAIL,
    subject: "Your Wells Season Pass Code 🎟️",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0d0c22;color:#ffffff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#191740,#0d0c22);padding:32px 32px 24px;text-align:center;">
          <img src="https://hemsworthmwfc.co.uk/logo.png" alt="HMWFC" style="height:80px;width:auto;margin-bottom:16px;" />
          <h1 style="font-size:28px;font-weight:900;margin:0;letter-spacing:2px;">WELLS SEASON PASS</h1>
          <p style="color:#8899bb;font-size:13px;margin:6px 0 0;letter-spacing:2px;">HEMSWORTH MINERS WELFARE FC</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;margin:0 0 8px;">Hi ${buyerName || "there"},</p>
          <p style="font-size:14px;color:#aabbcc;line-height:1.7;margin:0 0 24px;">Thanks for purchasing your Wells Season Pass! Your unique activation code is below. Keep it safe — it can only be used once.</p>
          <div style="background:#191740;border:2px solid #347ebf44;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="font-size:12px;color:#8899bb;letter-spacing:2px;margin:0 0 10px;text-transform:uppercase;">Your Activation Code</p>
            <div style="font-family:monospace;font-size:32px;font-weight:900;letter-spacing:6px;color:#347ebf;">${code}</div>
          </div>
          <ol style="font-size:14px;color:#aabbcc;line-height:2;margin:0 0 28px;padding-left:20px;">
            <li>Open <a href="${appUrl}" style="color:#347ebf;">${appUrl}</a></li>
            <li>Go to <strong style="color:#fff;">Fan Zone → Wells Season Pass</strong></li>
            <li>Sign in with Google if you haven't already</li>
            <li>Tap <strong style="color:#fff;">Already have a code?</strong> and enter the code above</li>
          </ol>
          <a href="${appUrl}" style="display:block;background:linear-gradient(135deg,#347ebf,#1a5f9e);color:#fff;font-weight:700;font-size:16px;padding:14px 0;border-radius:10px;text-align:center;text-decoration:none;margin-bottom:28px;">Open The Wells App →</a>
          <p style="font-size:12px;color:#8899bb;line-height:1.7;margin:0;border-top:1px solid #ffffff0f;padding-top:20px;">Any problems? Reply to this email and we'll sort it out.<br/>The Wells · Hemsworth Miners Welfare FC · Est. 1981</p>
        </div>
      </div>
    `,
  });
}

async function sendSeasonTicketEmail(buyerEmail, buyerName) {
  const appUrl = "https://hemsworthmwfc.co.uk";
  await resend.emails.send({
    from: "Hemsworth Miners Welfare FC <noreply@hemsworthmwfc.co.uk>",
    to: buyerEmail,
    bcc: process.env.ADMIN_EMAIL,
    subject: "Your Wells Season Ticket 🎫",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0d0c22;color:#ffffff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#191740,#0d0c22);padding:32px 32px 24px;text-align:center;">
          <img src="https://hemsworthmwfc.co.uk/logo.png" alt="HMWFC" style="height:80px;width:auto;margin-bottom:16px;" />
          <h1 style="font-size:28px;font-weight:900;margin:0;letter-spacing:2px;">SEASON TICKET</h1>
          <p style="color:#8899bb;font-size:13px;margin:6px 0 0;letter-spacing:2px;">HEMSWORTH MINERS WELFARE FC</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;margin:0 0 8px;">Hi ${buyerName || "there"},</p>
          <p style="font-size:14px;color:#aabbcc;line-height:1.7;margin:0 0 24px;">Thanks for purchasing your Season Ticket — you're all set for the season! Sign in to the Wells app with the same email address you used to purchase and you'll automatically be recognised as a season ticket holder.</p>
          <a href="${appUrl}" style="display:block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-weight:700;font-size:16px;padding:14px 0;border-radius:10px;text-align:center;text-decoration:none;margin-bottom:28px;">Open The Wells App →</a>
          <p style="font-size:12px;color:#8899bb;line-height:1.7;margin:0;border-top:1px solid #ffffff0f;padding-top:20px;">Any problems? Reply to this email and we'll sort it out.<br/>The Wells · Hemsworth Miners Welfare FC · Est. 1981</p>
        </div>
      </div>
    `,
  });
}

// ── Encode email as safe Firebase key ────────────────────────────────────────
function encodeEmail(email) {
  return email.toLowerCase().replace(/[.@]/g, "_");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  const product = session.metadata?.product;
  const buyerEmail = session.customer_details?.email || session.customer_email;
  const buyerName  = session.customer_details?.name  || "";

  if (!buyerEmail) {
    console.error("No buyer email in session");
    return res.status(200).json({ received: true });
  }

  // ── Season Pass ───────────────────────────────────────────────────────────
  if (product === "season_pass") {
    try {
      const code = await reservePassCode(buyerEmail);
      if (!code) {
        await resend.emails.send({
          from: "Hemsworth Miners Welfare FC <noreply@hemsworthmwfc.co.uk>",
          to: process.env.ADMIN_EMAIL,
          subject: "⚠️ Season Pass — No codes left!",
          html: `<p><strong>${buyerEmail}</strong> just purchased a Season Pass but there are no unused codes left. Please generate more in the admin panel and send one manually to ${buyerEmail}.</p>`,
        });
        return res.status(200).json({ received: true, warning: "no_codes" });
      }
      await sendPassEmail(buyerEmail, buyerName, code);
      console.log(`Season Pass: code ${code} sent to ${buyerEmail}`);
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Season pass error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  // ── Season Ticket ─────────────────────────────────────────────────────────
  if (product === "season_ticket") {
    try {
      // Store email in hmwfc/seasonTickets so app auto-recognises them on sign-in
      const emailKey = encodeEmail(buyerEmail);
      await db.ref(`hmwfc/seasonTickets/${emailKey}`).set(true);

      // Also try to find and update their user profile directly if they exist
      const usersSnap = await db.ref("users").once("value");
      if (usersSnap.exists()) {
        const users = usersSnap.val();
        const matchingUid = Object.keys(users).find(uid => users[uid].email?.toLowerCase() === buyerEmail.toLowerCase());
        if (matchingUid) {
          await db.ref(`users/${matchingUid}/seasonTicket`).set(true);
          console.log(`Season Ticket: updated existing user ${matchingUid}`);
        }
      }

      await sendSeasonTicketEmail(buyerEmail, buyerName);
      console.log(`Season Ticket: registered ${buyerEmail}`);
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Season ticket error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  // Unknown product — skip
  console.log("Skipping unknown product:", product);
  return res.status(200).json({ received: true, skipped: true });
}

export const config = { api: { bodyParser: false } };

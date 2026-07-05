// api/stripe-webhook.js
// Vercel serverless function — place at /api/stripe-webhook.js in your repo root

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
          <p style="font-size:14px;color:#aabbcc;line-height:1.7;margin:0 0 24px;">
            Thanks for purchasing your Wells Season Pass! Your unique activation code is below.
            Keep it safe — it can only be used once.
          </p>
          <div style="background:#191740;border:2px solid #347ebf44;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="font-size:12px;color:#8899bb;letter-spacing:2px;margin:0 0 10px;text-transform:uppercase;">Your Activation Code</p>
            <div style="font-family:monospace;font-size:32px;font-weight:900;letter-spacing:6px;color:#347ebf;">${code}</div>
          </div>
          <p style="font-size:14px;color:#aabbcc;line-height:1.7;margin:0 0 12px;">To activate your pass:</p>
          <ol style="font-size:14px;color:#aabbcc;line-height:2;margin:0 0 28px;padding-left:20px;">
            <li>Open <a href="${appUrl}" style="color:#347ebf;">${appUrl}</a></li>
            <li>Go to <strong style="color:#fff;">Fan Zone → Wells Season Pass</strong></li>
            <li>Sign in with Google if you haven't already</li>
            <li>Tap <strong style="color:#fff;">Already have a code?</strong> and enter the code above</li>
          </ol>
          <a href="${appUrl}" style="display:block;background:linear-gradient(135deg,#347ebf,#1a5f9e);color:#fff;font-weight:700;font-size:16px;padding:14px 0;border-radius:10px;text-align:center;text-decoration:none;margin-bottom:28px;">
            Open The Wells App →
          </a>
          <p style="font-size:12px;color:#8899bb;line-height:1.7;margin:0;border-top:1px solid #ffffff0f;padding-top:20px;">
            Any problems? Reply to this email and we'll sort it out.<br/>
            The Wells · Hemsworth Miners Welfare FC · Est. 1981
          </p>
        </div>
      </div>
    `,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const session = event.data.object;

  // ── Only process Season Pass purchases ───────────────────────────────────
  // Add metadata key "product" = "season_pass" to your Stripe Season Pass payment link
  const isSeasonPass = session.metadata?.product === "season_pass";
  if (!isSeasonPass) {
    console.log("Skipping non-season-pass purchase:", session.metadata);
    return res.status(200).json({ received: true, skipped: true });
  }

  const buyerEmail = session.customer_details?.email || session.customer_email;
  const buyerName  = session.customer_details?.name  || "";

  if (!buyerEmail) {
    console.error("No buyer email in session");
    return res.status(200).json({ received: true });
  }

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
    console.log(`Code ${code} reserved and sent to ${buyerEmail}`);
    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

export const config = { api: { bodyParser: false } };

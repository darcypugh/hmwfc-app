import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, runTransaction } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5f5io1ilDXxaZhFlIuslA4gq8CCMur7w",
  authDomain: "wells-app-6d7c6.firebaseapp.com",
  databaseURL: "https://wells-app-6d7c6-default-rtdb.firebaseio.com",
  projectId: "wells-app-6d7c6",
  storageBucket: "wells-app-6d7c6.firebasestorage.app",
  messagingSenderId: "1044214212411",
  appId: "1:1044214212411:web:a4e028785239928fa5b91e"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(firebaseApp);

const hasLiked = (id) => localStorage.getItem(`liked_${id}`) === "true";
const markLiked = (id) => localStorage.setItem(`liked_${id}`, "true");
const hasViewed = (id) => localStorage.getItem(`viewed_${id}`) === "true";
const markViewed = (id) => localStorage.setItem(`viewed_${id}`, "true");



// LOGO removed - use /logo.png

const DEFAULT_DATA = {
  news: [
    { id: 1, date: "16 May 2026", tag: "Match Report", title: "Victory at Riverside -- 3-1", body: "A commanding performance saw us take all three points. Goals from Williams, Okafor, and a late Hadley strike sealed the win.", emoji: "⚽" },
    { id: 2, date: "12 May 2026", tag: "Transfer News", title: "Club Signs Midfielder Jack Brennan", body: "We're delighted to announce the signing of Jack Brennan on a two-year deal.", emoji: "📢" },
    { id: 3, date: "8 May 2026", tag: "Community", title: "Junior Academy Open Day -- June 14th", body: "Opening our doors to young players aged 6–16. Come along and bring your boots!", emoji: "🏆" },
  ],
  table: [
    { pos: 1, team: "Hemsworth Miners Welfare FC", p: 32, w: 22, d: 6, l: 4, gd: "+38", pts: 72, highlight: true, badge: "" },
    { pos: 2, team: "Riverside Athletic", p: 32, w: 21, d: 5, l: 6, gd: "+31", pts: 68, highlight: false },
    { pos: 3, team: "Northgate United", p: 32, w: 18, d: 8, l: 6, gd: "+22", pts: 62, highlight: false },
    { pos: 4, team: "Brackley Town", p: 32, w: 16, d: 7, l: 9, gd: "+14", pts: 55, highlight: false },
    { pos: 5, team: "Moorfield City", p: 32, w: 14, d: 9, l: 9, gd: "+8", pts: 51, highlight: false },
    { pos: 6, team: "Ashton Vale", p: 32, w: 13, d: 6, l: 13, gd: "-3", pts: 45, highlight: false },
    { pos: 7, team: "Thornton FC", p: 32, w: 11, d: 8, l: 13, gd: "-9", pts: 41, highlight: false },
    { pos: 8, team: "Crestwood Rangers", p: 32, w: 9, d: 6, l: 17, gd: "-17", pts: 33, highlight: false },
    { pos: 9, team: "Dalton Wanderers", p: 32, w: 7, d: 5, l: 20, gd: "-24", pts: 26, highlight: false },
    { pos: 10, team: "Penwick Town", p: 32, w: 5, d: 4, l: 23, gd: "-38", pts: 19, highlight: false },
  ],
  fixtures: [
    { id: 1, date: "18 May", home: "Hemsworth Miners Welfare FC", away: "Brackley Town", time: "15:00", venue: "Welfare Ground", result: "", halftime: "", scorers: "", type: "upcoming" },
    { id: 2, date: "25 May", home: "Moorfield City", away: "Hemsworth Miners Welfare FC", time: "14:00", venue: "City Ground", result: "", halftime: "", scorers: "", type: "upcoming" },
    { id: 3, date: "11 May", home: "Riverside Athletic", away: "Hemsworth Miners Welfare FC", time: "", venue: "Riverside", result: "1 – 3", halftime: "0 – 1", homeScorers: "Rowe 61", awayScorers: "Williams 34, Okafor 58, Hadley 82", scorers: "", friendly: false, homeBadge: "", awayBadge: "", type: "result" },
    { id: 4, date: "4 May", home: "Hemsworth Miners Welfare FC", away: "Thornton FC", time: "", venue: "Welfare Ground", result: "2 – 0", halftime: "1 – 0", homeScorers: "Williams 12, Okafor 71", awayScorers: "", scorers: "", friendly: false, homeBadge: "", awayBadge: "", type: "result" },
  ],
  squad: [
    { id: 1, name: "Marcus Trent", pos: "GK", no: 1, apps: 30, goals: 0, cleanSheets: 12, yellowCards: 0, redCards: 0, motm: 3, playing: true, photo: "", about: "", baseApps: 30, baseGoals: 0, baseCleanSheets: 12, baseYellowCards: 0, baseRedCards: 0, baseMotm: 3, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 },
    { id: 2, name: "Carlos Mendes", pos: "CB", no: 5, apps: 31, goals: 2, cleanSheets: 10, yellowCards: 4, redCards: 0, motm: 2, playing: true, photo: "", about: "", baseApps: 31, baseGoals: 2, baseCleanSheets: 10, baseYellowCards: 4, baseRedCards: 0, baseMotm: 2, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 },
    { id: 3, name: "Rafi Hadley", pos: "CM", no: 8, apps: 32, goals: 11, cleanSheets: 0, yellowCards: 5, redCards: 1, motm: 4, playing: true, photo: "", about: "", baseApps: 32, baseGoals: 11, baseCleanSheets: 0, baseYellowCards: 5, baseRedCards: 1, baseMotm: 4, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 },
    { id: 4, name: "Sam Okafor", pos: "AM", no: 10, apps: 31, goals: 14, cleanSheets: 0, yellowCards: 2, redCards: 0, motm: 6, playing: true, photo: "", about: "", baseApps: 31, baseGoals: 14, baseCleanSheets: 0, baseYellowCards: 2, baseRedCards: 0, baseMotm: 6, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 },
    { id: 5, name: "Luca Williams", pos: "FW", no: 9, apps: 32, goals: 18, cleanSheets: 0, yellowCards: 3, redCards: 0, motm: 8, playing: true, photo: "", about: "", baseApps: 32, baseGoals: 18, baseCleanSheets: 0, baseYellowCards: 3, baseRedCards: 0, baseMotm: 8, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 },
    { id: 6, name: "Dion Taylor", pos: "FW", no: 11, apps: 26, goals: 9, cleanSheets: 0, yellowCards: 1, redCards: 0, motm: 1, playing: false, photo: "", about: "", baseApps: 26, baseGoals: 9, baseCleanSheets: 0, baseYellowCards: 1, baseRedCards: 0, baseMotm: 1, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 },
  ],
  merch: [
    { id: 1, name: "Home Kit 26/27", price: "£55", emoji: "👕", tag: "NEW", image: "", isClothing: true, stripeLink: "", sizes: { XS: "available", S: "available", M: "available", L: "available", XL: "available", XXL: "low", "3XL": "sold_out" } },
    { id: 2, name: "Club Scarf", price: "£15", emoji: "🧣", tag: "", image: "", isClothing: false, stripeLink: "", sizes: {} },
    { id: 3, name: "Matchday Programme", price: "£4", emoji: "📰", tag: "", image: "", isClothing: false, stripeLink: "", sizes: {} },
    { id: 4, name: "Training Top", price: "£35", emoji: "🧥", tag: "", image: "", isClothing: true, stripeLink: "", sizes: { XS: "available", S: "available", M: "available", L: "low", XL: "sold_out", XXL: "sold_out", "3XL": "sold_out" } },
  ],
  gallery: [],
  draw: {
    description: "<p>Join our <strong>Monthly Draw</strong> for just <strong>£10/month</strong>. The prize pot is half the total entry money. 59 numbers available -- enter now for your chance to win!</p>",
    winnerMonth: "June",
    winnerNumber: 0,
    stripeLink: "",
    nextDrawDate: "Last Sunday of each month",
    members: Array.from({ length: 59 }, (_, i) => ({ number: i + 1, name: "" })),
  },
};

const NAV_ITEMS = ["Home", "Fan Zone", "News", "First Team", "Help The Wells", "Gallery", "Download"];
const FAN_ZONE_ITEMS = ["Wells Season Pass", "The Clubhouse"];
const FIRST_TEAM_ITEMS = ["Table", "Fixtures", "Squad"];
const HELP_WELLS_ITEMS = ["Fundraising", "Merch"];
const POS_COLOR = { GK: "#f59e0b", RB: "#347ebf", LB: "#347ebf", CB: "#10b981", CM: "#8b5cf6", AM: "#ef4444", FW: "#ef4444", WB: "#347ebf", DM: "#8b5cf6" };
const POS_OPTIONS = ["GK","RB","LB","CB","WB","DM","CM","AM","FW"];

const S = {
  input: { background: "#0d0c22", border: "1px solid #347ebf44", borderRadius: 6, color: "#fff", padding: "7px 10px", fontSize: 13, width: "100%", fontFamily: "Barlow, sans-serif", outline: "none" },
  label: { fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 4 },
  btn: { border: "none", borderRadius: 7, padding: "8px 16px", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, cursor: "pointer", transition: "opacity 0.2s" },
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" },
};

// ── Rich Text Editor ─────────────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !initialized) {
      editorRef.current.innerHTML = value || "";
      setInitialized(true);
    }
  }, [initialized, value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editorRef.current && initialized) {
      const current = editorRef.current.innerHTML;
      if (current !== value) {
        const sel = window.getSelection();
        const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        editorRef.current.innerHTML = value || "";
        if (range) {
          try { sel.removeAllRanges(); sel.addRange(range); } catch(e) {}
        }
      }
    }
  }, [value, initialized]);

  const exec = (cmd, val) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val || null);
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => onChange(editorRef.current.innerHTML);

  const toolBtn = (label, cmd, val) => (
    <button key={label} onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      style={{ background: "#191740", border: "1px solid #ffffff15", borderRadius: 5, color: "#aabbcc", fontWeight: 700, fontSize: 12, padding: "4px 9px", cursor: "pointer", fontFamily: "serif", lineHeight: 1 }}>
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid #347ebf44", borderRadius: 8, overflow: "hidden", background: "#0d0c22" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "8px 10px", borderBottom: "1px solid #ffffff0f", background: "#191740" }}>
        {toolBtn("B", "bold")}
        {toolBtn("I", "italic")}
        {toolBtn("U", "underline")}
        <div style={{ width: 1, background: "#ffffff15", margin: "0 4px" }} />
        {toolBtn("P", "formatBlock", "p")}
        {toolBtn("H2", "formatBlock", "h2")}
        {toolBtn("H3", "formatBlock", "h3")}
        <div style={{ width: 1, background: "#ffffff15", margin: "0 4px" }} />
        {toolBtn("• List", "insertUnorderedList")}
        {toolBtn("1. List", "insertOrderedList")}
        <div style={{ width: 1, background: "#ffffff15", margin: "0 4px" }} />
        {/* Font family */}
        <select onMouseDown={e => e.stopPropagation()} onChange={e => { editorRef.current && editorRef.current.focus(); document.execCommand("fontName", false, e.target.value); e.target.value = ""; }} defaultValue="" style={{ background: "#0d0c22", border: "1px solid #347ebf44", borderRadius: 4, color: "#aabbcc", fontSize: 11, padding: "3px 6px", cursor: "pointer" }}>
          <option value="" disabled>Font</option>
          <option value="Barlow, sans-serif">Barlow</option>
          <option value="Barlow Condensed, sans-serif">Condensed</option>
          <option value="Georgia, serif">Serif</option>
          <option value="monospace">Mono</option>
        </select>
        {/* Font size */}
        <select onMouseDown={e => e.stopPropagation()} onChange={e => { editorRef.current && editorRef.current.focus(); document.execCommand("fontSize", false, e.target.value); e.target.value = ""; }} defaultValue="" style={{ background: "#0d0c22", border: "1px solid #347ebf44", borderRadius: 4, color: "#aabbcc", fontSize: 11, padding: "3px 6px", cursor: "pointer" }}>
          <option value="" disabled>Size</option>
          <option value="1">XS</option>
          <option value="2">S</option>
          <option value="3">M</option>
          <option value="4">L</option>
          <option value="5">XL</option>
          <option value="6">2XL</option>
          <option value="7">3XL</option>
        </select>
        {/* Text colour */}
        <label title="Text colour" style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", background: "#0d0c22", border: "1px solid #347ebf44", borderRadius: 4, padding: "3px 8px", fontSize: 11, color: "#aabbcc" }}>
          A <input type="color" defaultValue="#ffffff" onChange={e => { editorRef.current && editorRef.current.focus(); document.execCommand("foreColor", false, e.target.value); }} style={{ width: 16, height: 16, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
        </label>
      </div>
      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight: 140, padding: "12px 14px", color: "#aabbcc", fontSize: 14, lineHeight: 1.7, outline: "none", fontFamily: "Barlow, sans-serif" }}
      />
      <style>{`
        [contenteditable] p { margin: 0 0 10px; }
        [contenteditable] h2 { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 900; color: #fff; margin: 12px 0 6px; }
        [contenteditable] h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin: 10px 0 4px; }
        [contenteditable] ul, [contenteditable] ol { margin: 0 0 10px 20px; }
        [contenteditable] b, [contenteditable] strong { color: #fff; }
      `}</style>
    </div>
  );
}

function AdminNews({ items, onSave }) {
  const [list, setList] = useState(items);
  useEffect(() => { setList(items); }, [items]);
  const [editing, setEditing] = useState(null);

  const update = (idx, field, val) => setList(list.map((x, i) => i === idx ? { ...x, [field]: val } : x));
  const del = (idx) => { const l = list.filter((_, i) => i !== idx); setList(l); onSave(l); };
  const addNew = () => { const l = [...list, { id: Date.now(), date: "", tag: "Club News", title: "", body: "", emoji: "⚽", image: "" }]; setList(l); setEditing(l.length - 1); };
  const save = () => { onSave(list); setEditing(null); };
  const uploadImage = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => update(idx, "image", e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>News Articles</div>
        <button style={{ ...S.btn, background: "#347ebf", color: "#fff" }} onClick={addNew}>+ Add Article</button>
      </div>
      {list.map((n, idx) => (
        <div key={n.id} style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: editing === idx ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {n.image && <div style={{ width: 32, height: 32, borderRadius: 4, overflow: "hidden", flexShrink: 0 }}><img src={n.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
              <span style={{ fontSize: 11, color: "#347ebf", fontWeight: 700 }}>{n.tag}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{n.title || "(untitled)"}</span>
              <span style={{ color: "#8899bb", fontSize: 12 }}>{n.date}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf", padding: "5px 12px" }} onClick={() => setEditing(editing === idx ? null : idx)}>{editing === idx ? "Close" : "Edit"}</button>
              <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "5px 12px" }} onClick={() => del(idx)}>Delete</button>
            </div>
          </div>
          {editing === idx && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={S.row}>
                <div style={{ flex: 1, minWidth: 120 }}><label style={S.label}>Date</label><input style={S.input} value={n.date} onChange={e => update(idx, "date", e.target.value)} /></div>
                <div style={{ flex: 1, minWidth: 120 }}><label style={S.label}>Tag</label><input style={S.input} value={n.tag} onChange={e => update(idx, "tag", e.target.value)} /></div>
                <div style={{ flex: 0.3, minWidth: 60 }}><label style={S.label}>Icon</label><input style={S.input} value={n.emoji} onChange={e => update(idx, "emoji", e.target.value)} /></div>
              </div>
              <div><label style={S.label}>Headline</label><input style={S.input} value={n.title} onChange={e => update(idx, "title", e.target.value)} /></div>
              <div><label style={S.label}>Body</label><RichEditor value={n.body} onChange={val => update(idx, "body", val)} /></div>
              <div>
                <label style={S.label}>Article Image</label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "#0d0c22", border: "1px dashed #347ebf44", borderRadius: 8, padding: 12 }}>
                  {n.image
                    ? <img src={n.image} alt="" style={{ height: 80, borderRadius: 6, objectFit: "cover", maxWidth: 140 }} />
                    : <div style={{ fontSize: 28 }}>📷</div>}
                  <div>
                    <div style={{ fontSize: 13, color: "#aabbcc", marginBottom: 2 }}>{n.image ? "Tap to change image" : "Tap to upload image"}</div>
                    <div style={{ fontSize: 11, color: "#8899bb" }}>JPG or PNG recommended</div>
                  </div>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadImage(idx, e.target.files[0])} />
                </label>
                {n.image && <button onClick={() => update(idx, "image", "")} style={{ ...S.btn, background: "#ef444411", color: "#ef4444", padding: "4px 10px", fontSize: 11, marginTop: 6 }}>Remove image</button>}
              </div>
              <button style={{ ...S.btn, background: "#10b981", color: "#fff", alignSelf: "flex-end" }} onClick={save}>Save</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminTable({ items, onSave }) {
  const [list, setList] = useState(items);
  useEffect(() => { setList(items); }, [items]);
  const update = (idx, field, val) => setList(list.map((x, i) => i === idx ? { ...x, [field]: val } : x));
  const del = (idx) => { const l = list.filter((_, i) => i !== idx); setList(l); onSave(l); };
  const addRow = () => setList([...list, { pos: list.length + 1, team: "", stadium: "", p: 0, w: 0, d: 0, l: 0, gd: "0", pts: 0, highlight: false, badge: "" }]);
  const save = () => onSave(list);
  const uploadBadge = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result.split(",")[1];
      update(idx, "badge", b64);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>League Table</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.btn, background: "#ffffff11", color: "#fff" }} onClick={addRow}>+ Row</button>
          <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save All</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 14 }}>Upload each club's badge here -- it will appear on the homepage result card and anywhere else badges are shown.</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr>{["Badge","Pos","Team","Stadium","P","W","D","L","GD","Pts","Us",""].map(h => <th key={h} style={{ color: "#8899bb", padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #ffffff0f", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>
            {list.map((r, idx) => (
              <tr key={idx} style={{ background: r.highlight ? "#347ebf11" : "transparent" }}>
                <td style={{ padding: "4px 6px" }}>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "#0d0c22", border: "1px dashed #347ebf44", borderRadius: 6, overflow: "hidden" }}>
                    {r.badge
                      ? <img src={`data:image/png;base64,${r.badge}`} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
                      : <span style={{ fontSize: 18 }}>🛡</span>}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadBadge(idx, e.target.files[0])} />
                  </label>
                </td>
                <td style={{ padding: "4px 6px" }}><input style={{ ...S.input, width: 58 }} type="number" value={r.pos} onChange={e => update(idx, "pos", +e.target.value)} /></td>
                <td style={{ padding: "4px 6px" }}><input style={{ ...S.input, width: 160 }} value={r.team} onChange={e => update(idx, "team", e.target.value)} /></td>
                <td style={{ padding: "4px 6px" }}><input style={{ ...S.input, width: 140 }} value={r.stadium || ""} placeholder="Stadium name" onChange={e => update(idx, "stadium", e.target.value)} /></td>
                {["p","w","d","l"].map(f => <td key={f} style={{ padding: "4px 6px" }}><input style={{ ...S.input, width: 44 }} type="number" value={r[f]} onChange={e => update(idx, f, +e.target.value)} /></td>)}
                <td style={{ padding: "4px 6px" }}><input style={{ ...S.input, width: 54 }} value={r.gd} onChange={e => update(idx, "gd", e.target.value)} /></td>
                <td style={{ padding: "4px 6px" }}><input style={{ ...S.input, width: 44 }} type="number" value={r.pts} onChange={e => update(idx, "pts", +e.target.value)} /></td>
                <td style={{ padding: "4px 6px", textAlign: "center" }}><input type="checkbox" checked={!!r.highlight} onChange={e => update(idx, "highlight", e.target.checked)} /></td>
                <td style={{ padding: "4px 6px" }}><button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "4px 10px" }} onClick={() => del(idx)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminFixtures({ items, tableData, onSave }) {
  const [list, setList] = useState(items || []);
  useEffect(() => { setList(items || []); }, [items]);
  const [editing, setEditing] = useState(null);
  const update = (idx, field, val) => {
    const updated = list.map((x, i) => i === idx ? { ...x, [field]: val } : x);
    if (field === "home") {
      const match = (tableData || []).find(t => t.team === val);
      if (match && match.stadium) updated[idx] = { ...updated[idx], venue: match.stadium };
    }
    setList(updated);
  };
  const del = (idx) => { const l = list.filter((_, i) => i !== idx); setList(l); onSave(l); };
  const getStadium = (teamName) => { const t = (tableData||[]).find(r => r.team === teamName); return t && t.stadium ? t.stadium : ""; };
  const addNew = () => {
    const defaultVenue = getStadium("Hemsworth Miners Welfare FC") || "Welfare Ground";
    const l = [...list, { id: Date.now(), date: "", home: "Hemsworth Miners Welfare FC", away: "", time: "15:00", venue: defaultVenue, result: "", halftime: "", homeScorers: "", awayScorers: "", friendly: false, cup: false, cupType: "", homeBadge: "", awayBadge: "", type: "upcoming" }];
    setList(l); setEditing(l.length - 1);
  };
  const save = () => { onSave(list); setEditing(null); };
  const uploadFixtureBadge = (idx, side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => update(idx, side === "home" ? "homeBadge" : "awayBadge", e.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>Fixtures & Results</div>
        <button style={{ ...S.btn, background: "#347ebf", color: "#fff" }} onClick={addNew}>+ Add Fixture</button>
      </div>
      <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 14 }}>Tick Friendly or Cup to tag the match type. Upload opponent badges directly on the fixture for games against teams not in the league table.</div>
      {list.length === 0 && <div style={{ color: "#8899bb", fontSize: 13, padding: "16px 0" }}>No fixtures yet -- tap "+ Add Fixture" to get started.</div>}
      {list.map((f, idx) => (
        <div key={f.id} style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: editing === idx ? 12 : 0 }}>
            <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {f.friendly && <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, background: "#f59e0b18", padding: "2px 6px", borderRadius: 3 }}>FRIENDLY</span>}
              {f.cup && <span style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 700, background: "#8b5cf622", padding: "2px 6px", borderRadius: 3 }}>{f.cupType ? f.cupType.toUpperCase() : "CUP"}</span>}
              <span style={{ color: "#8899bb" }}>{f.date}</span>
              <span style={{ fontWeight: 600 }}>{f.home} vs {f.away}</span>
              {f.result && <span style={{ color: "#347ebf", fontWeight: 700 }}>{f.result}</span>}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf", padding: "5px 12px" }} onClick={() => setEditing(editing === idx ? null : idx)}>{editing === idx ? "Close" : "Edit"}</button>
              <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "5px 12px" }} onClick={() => del(idx)}>Delete</button>
            </div>
          </div>
          {editing === idx && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={S.row}>
                <div style={{ flex: 1 }}><label style={S.label}>Date</label><input style={S.input} value={f.date} onChange={e => update(idx, "date", e.target.value)} placeholder="18 May" /></div>
                <div style={{ flex: 1 }}><label style={S.label}>Kick-off</label><input style={S.input} value={f.time} onChange={e => update(idx, "time", e.target.value)} placeholder="15:00" /></div>
                <div style={{ flex: 1 }}><label style={S.label}>Type</label><select style={S.input} value={f.type} onChange={e => update(idx, "type", e.target.value)}><option value="upcoming">Upcoming</option><option value="result">Result</option></select></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#191740", borderRadius: 8, padding: "10px 14px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id={`friendly-${idx}`} checked={!!f.friendly} onChange={e => update(idx, "friendly", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#f59e0b" }} />
                  <label htmlFor={`friendly-${idx}`} style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, cursor: "pointer" }}>⭐ Friendly</label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id={`cup-${idx}`} checked={!!f.cup} onChange={e => update(idx, "cup", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#8b5cf6" }} />
                  <label htmlFor={`cup-${idx}`} style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 700, cursor: "pointer" }}>🏆 Cup Game</label>
                </div>
                {f.cup && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <select value={f.cupType || ""} onChange={e => update(idx, "cupType", e.target.value)} style={{ ...S.input, width: "auto", color: "#8b5cf6", borderColor: "#8b5cf644" }}>
                      <option value="">Select cup...</option>
                      <option value="FA Cup">FA Cup</option>
                      <option value="FA Vase">FA Vase</option>
                      <option value="League Cup">League Cup</option>
                      <option value="S&H Senior">S&amp;H Senior</option>
                    </select>
                  </div>
                )}
              </div>
              <div style={S.row}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Home Team</label>
                  <input style={S.input} value={f.home} onChange={e => update(idx, "home", e.target.value)} />
                  {(f.friendly || f.cup) && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, cursor: "pointer", background: "#0d0c22", border: "1px dashed #ffffff22", borderRadius: 6, padding: "6px 10px" }}>
                      {f.homeBadge ? <img src={f.homeBadge} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ fontSize: 20 }}>🛡</span>}
                      <span style={{ fontSize: 11, color: "#8899bb" }}>Home badge</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadFixtureBadge(idx, "home", e.target.files[0])} />
                    </label>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Away Team</label>
                  <input style={S.input} value={f.away} onChange={e => update(idx, "away", e.target.value)} />
                  {(f.friendly || f.cup) && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, cursor: "pointer", background: "#0d0c22", border: "1px dashed #ffffff22", borderRadius: 6, padding: "6px 10px" }}>
                      {f.awayBadge ? <img src={f.awayBadge} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ fontSize: 20 }}>🛡</span>}
                      <span style={{ fontSize: 11, color: "#8899bb" }}>Away badge</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadFixtureBadge(idx, "away", e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>
              <div style={S.row}>
                <div style={{ flex: 1 }}><label style={S.label}>Venue</label><input style={S.input} value={f.venue} onChange={e => update(idx, "venue", e.target.value)} /></div>
                <div style={{ flex: 1 }}><label style={S.label}>Full time score (e.g. 2 – 1)</label><input style={S.input} value={f.result || ""} onChange={e => update(idx, "result", e.target.value)} placeholder="e.g. 2 – 1" /></div>
              </div>
              <div style={S.row}>
                <div style={{ flex: 1 }}><label style={S.label}>Half time score</label><input style={S.input} value={f.halftime || ""} onChange={e => update(idx, "halftime", e.target.value)} placeholder="e.g. 1 – 0" /></div>
              </div>
              <div style={S.row}>
                <div style={{ flex: 1 }}><label style={S.label}>Home goalscorers</label><input style={S.input} value={f.homeScorers || ""} onChange={e => update(idx, "homeScorers", e.target.value)} placeholder="Smith 23, Jones 45" /></div>
                <div style={{ flex: 1 }}><label style={S.label}>Away goalscorers</label><input style={S.input} value={f.awayScorers || ""} onChange={e => update(idx, "awayScorers", e.target.value)} placeholder="Brown 67" /></div>
              </div>
              <button style={{ ...S.btn, background: "#10b981", color: "#fff", alignSelf: "flex-end" }} onClick={save}>Save</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const STAT_FIELDS = ["Apps","Goals","CS","Yellow","Red","MotM"];
const STAT_KEYS   = ["Apps","Goals","CleanSheets","YellowCards","RedCards","Motm"];

function StatRow({ prefix, p, onChange, label, color }) {
  return (
    <div style={{ background: "#191740", borderRadius: 8, padding: "10px 12px", marginTop: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {STAT_FIELDS.map((f, i) => {
          const key = prefix + STAT_KEYS[i];
          return (
            <div key={key} style={{ flex: 1, minWidth: 50 }}>
              <label style={{ ...S.label, fontSize: 9 }}>{f}</label>
              <input style={{ ...S.input, padding: "5px 6px", fontSize: 12 }} type="number" value={p[key] || 0} onChange={e => onChange(key, +e.target.value)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminSquad({ items, onSave, scrollRef }) {
  const [list, setList] = useState(items);
  const [adminSquadSearch, setAdminSquadSearch] = useState("");
  useEffect(() => { setList(items); }, [items]);
  const update = (idx, field, val) => {
    const updated = list.map((x, i) => {
      if (i !== idx) return x;
      const next = { ...x, [field]: val };
      // If a season stat changed, recalculate the career total
      if (field.startsWith("season")) {
        const statKey = field.replace("season", "").charAt(0).toLowerCase() + field.replace("season", "").slice(1);
        const baseKey = "base" + field.replace("season", "");
        next[statKey] = (next[baseKey] || 0) + val;
      }
      return next;
    });
    setList(updated);
  };
  const del = (idx) => { const l = list.filter((_, i) => i !== idx); setList(l); onSave(l); };

  const [photoUploading, setPhotoUploading] = useState({});

  const uploadPhoto = (player, file) => {
    if (!file) return;
    const idx = list.indexOf(player);
    setPhotoUploading(u => ({ ...u, [player.id]: true }));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(url);
      update(idx, "photo", compressed);
      setPhotoUploading(u => { const n = { ...u }; delete n[player.id]; return n; });
    };
    img.onerror = () => {
      alert('Failed to load image');
      URL.revokeObjectURL(url);
      setPhotoUploading(u => { const n = { ...u }; delete n[player.id]; return n; });
    };
    img.src = url;
  };
  const save = () => onSave(list);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>Squad</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.btn, background: "#ffffff11", color: "#fff" }} onClick={() => { setList(l => { const next = [...l, { id: Date.now(), name: "", pos: "CM", no: 0, playing: true, photo: "", about: "", apps: 0, goals: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, motm: 0, baseApps: 0, baseGoals: 0, baseCleanSheets: 0, baseYellowCards: 0, baseRedCards: 0, baseMotm: 0, seasonApps: 0, seasonGoals: 0, seasonCleanSheets: 0, seasonYellowCards: 0, seasonRedCards: 0, seasonMotm: 0 }]; return next; }); setTimeout(() => { const el = scrollRef && scrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, 50); }}>+ Player</button>
          <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf" }} onClick={() => { const el = scrollRef && scrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }} title="Jump to bottom">↓ Bottom</button>
          <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save All</button>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input value={adminSquadSearch} onChange={e => setAdminSquadSearch(e.target.value)} placeholder="🔍 Search players..." style={{ width: "100%", background: "#191740", border: "1px solid #ffffff15", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 13, fontFamily: "Barlow, sans-serif", outline: "none" }} />
      </div>
      <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 14 }}>
        Update <span style={{ color: "#347ebf", fontWeight: 700 }}>This Season</span> stats as the season progresses -- career totals update automatically.
        Tick <span style={{ color: "#10b981", fontWeight: 700 }}>Playing?</span> so the player appears in the Current Season view.
      </div>
      {list.filter(p => !adminSquadSearch.trim() || p.name.toLowerCase().includes(adminSquadSearch.toLowerCase())).map((p) => {
        const idx = list.indexOf(p);
        return (
        <div key={p.id} style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, padding: 12, marginBottom: 8 }}>
          {/* Name / pos / playing / delete */}
          <div style={S.row}>
            <div style={{ flex: 2, minWidth: 140 }}><label style={S.label}>Name</label><input style={S.input} value={p.name} onChange={e => update(idx, "name", e.target.value)} /></div>
            <div style={{ flex: 1, minWidth: 90 }}><label style={S.label}>Position</label><select style={S.input} value={p.pos} onChange={e => update(idx, "pos", e.target.value)}>{POS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <span style={{ fontSize: 10, color: p.playing ? "#10b981" : "#8899bb", fontWeight: 700, letterSpacing: 0.5 }}>PLAYING?</span>
                <input type="checkbox" checked={!!p.playing} onChange={e => update(idx, "playing", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#10b981" }} />
              </label>
              <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "7px 12px" }} onClick={() => del(idx)}>✕</button>
            </div>
          </div>
          {/* Photo */}
          <div style={{ marginTop: 8 }}>
            <label style={S.label}>Photo</label>
            <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: "#191740", border: "1px dashed #347ebf44", borderRadius: 8, cursor: photoUploading[p.id] ? "default" : "pointer", overflow: "hidden", position: "relative" }}>
              {photoUploading[p.id]
                ? <div style={{ fontSize: 11, color: "#347ebf", fontWeight: 700, textAlign: "center", padding: 4 }}>⏳</div>
                : p.photo
                  ? <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 22 }}>📷</span>}
              <input type="file" accept="image/*" style={{ display: "none" }} disabled={!!photoUploading[p.id]} onChange={e => uploadPhoto(p, e.target.files[0])} />
            </label>
            {p.photo && !photoUploading[p.id] && <button onClick={() => update(idx, "photo", "")} style={{ ...S.btn, background: "#ef444411", color: "#ef4444", padding: "2px 8px", fontSize: 10, marginLeft: 6 }}>Remove</button>}
          </div>
          {/* Season stats -- these drive the career totals */}
          <StatRow prefix="season" p={p} label="This Season (updates career totals automatically)" color="#347ebf"
            onChange={(key, val) => update(idx, key, val)} />
          {/* Career totals -- read only display + manual override */}
          <div style={{ background: "#191740", borderRadius: 8, padding: "10px 12px", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Career Totals (auto-calculated · edit to override)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Apps", key: "apps" },
                { label: "Goals", key: "goals" },
                { label: "CS", key: "cleanSheets" },
                { label: "Yellow", key: "yellowCards" },
                { label: "Red", key: "redCards" },
                { label: "MotM", key: "motm" },
              ].map(({ label, key }) => (
                <div key={key} style={{ flex: 1, minWidth: 50 }}>
                  <label style={{ ...S.label, fontSize: 9 }}>{label}</label>
                  <input style={{ ...S.input, padding: "5px 6px", fontSize: 12, borderColor: "#f59e0b33" }} type="number" value={p[key] || 0}
                    onChange={e => {
                      const val = +e.target.value;
                      const baseKey = "base" + key.charAt(0).toUpperCase() + key.slice(1);
                      const seasonKey = "season" + key.charAt(0).toUpperCase() + key.slice(1);
                      // Update career total and recalculate base (base = career - season)
                      setList(list.map((x, i) => i === idx ? {
                        ...x, [key]: val,
                        [baseKey]: Math.max(0, val - (x[seasonKey] || 0))
                      } : x));
                    }} />
                </div>
              ))}
            </div>
          </div>
          {/* About */}
          <div style={{ marginTop: 8 }}>
            <label style={S.label}>About this player</label>
            <textarea style={{ ...S.input, height: 60, resize: "vertical" }} value={p.about || ""} onChange={e => update(idx, "about", e.target.value)} placeholder="Previous clubs, strengths, background..." />
          </div>
        </div>
        );
      })}
    </div>
  );
}

const SIZES = ["XXS","XS","S","M","L","XL","XXL","3XL"];
const SIZE_STATUS = ["available","low","sold_out"];
const SIZE_LABELS = { available: "In Stock", low: "Low Stock", sold_out: "Sold Out" };
const SIZE_COLORS = { available: "#10b981", low: "#f59e0b", sold_out: "#ef4444" };

function AdminMerch({ items, onSave }) {
  const [list, setList] = useState(items);
  const [expanded, setExpanded] = useState(null);
  useEffect(() => { setList(items); }, [items]);
  const update = (idx, field, val) => setList(list.map((x, i) => i === idx ? { ...x, [field]: val } : x));
  const updateSize = (idx, size, status) => {
    const sizes = { ...(list[idx].sizes || {}), [size]: status };
    update(idx, "sizes", sizes);
  };
  const del = (idx) => { const l = list.filter((_, i) => i !== idx); setList(l); onSave(l); };
  const moveItem = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    const l = [...list];
    [l[idx], l[newIdx]] = [l[newIdx], l[idx]];
    setList(l);
    onSave(l);
  };
  const addItem = () => { const l = [...list, { id: Date.now(), name: "", price: "£", emoji: "👕", tag: "", image: "", isClothing: false, soldOut: false, stripeLink: "", sizes: {}, sizeLinks: {} }]; setList(l); setExpanded(l.length - 1); };
  const save = () => onSave(list);
  const uploadImage = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = list.map((x, i) => i === idx ? { ...x, image: e.target.result } : x);
      setList(updated);
      onSave(updated);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>Merch / Shop Items</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.btn, background: "#ffffff11", color: "#fff" }} onClick={addItem}>+ Item</button>
          <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save All</button>
        </div>
      </div>
      {list.map((m, idx) => (
        <div key={m.id} style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
          {/* Summary row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
            {m.image ? <img src={m.image} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} /> : <div style={{ width: 44, height: 44, background: "#191740", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{m.emoji}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name || "(unnamed)"}</div>
              <div style={{ fontSize: 12, color: "#8899bb" }}>{m.price}{m.isClothing ? " · Clothing" : ""}{m.isClothing ? (Object.values(m.sizeLinks || {}).some(l => l) ? " · ✓ Size links" : " · No size links") : (m.stripeLink ? " · ✓ Payment link" : " · No payment link")}</div>
            </div>
            <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf", padding: "5px 12px" }} onClick={() => setExpanded(expanded === idx ? null : idx)}>{expanded === idx ? "Close" : "Edit"}</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button style={{ ...S.btn, background: "#ffffff0a", color: "#aabbcc", padding: "2px 7px", fontSize: 10, lineHeight: 1 }} onClick={() => moveItem(idx, -1)} disabled={idx === 0} title="Move up">▲</button>
              <button style={{ ...S.btn, background: "#ffffff0a", color: "#aabbcc", padding: "2px 7px", fontSize: 10, lineHeight: 1 }} onClick={() => moveItem(idx, 1)} disabled={idx === list.length - 1} title="Move down">▼</button>
            </div>
            <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "5px 10px" }} onClick={() => del(idx)}>✕</button>
          </div>
          {/* Expanded edit */}
          {expanded === idx && (
            <div style={{ borderTop: "1px solid #ffffff0f", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={S.row}>
                <div style={{ flex: 0.3, minWidth: 55 }}><label style={S.label}>Icon</label><input style={S.input} value={m.emoji} onChange={e => update(idx, "emoji", e.target.value)} /></div>
                <div style={{ flex: 2, minWidth: 130 }}><label style={S.label}>Item Name</label><input style={S.input} value={m.name} onChange={e => update(idx, "name", e.target.value)} /></div>
                <div style={{ flex: 0.7, minWidth: 70 }}><label style={S.label}>Price</label><input style={S.input} value={m.price} onChange={e => update(idx, "price", e.target.value)} /></div>
                <div style={{ flex: 0.7, minWidth: 80 }}><label style={S.label}>Badge</label><select style={S.input} value={m.tag} onChange={e => update(idx, "tag", e.target.value)}>{["","NEW","SALE","LIMITED"].map(o => <option key={o} value={o}>{o||"None"}</option>)}</select></div>
              </div>
              {/* Image upload */}
              <div>
                <label style={S.label}>Product Image</label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "#191740", border: "1px dashed #347ebf44", borderRadius: 8, padding: 12 }}>
                  {m.image ? <img src={m.image} alt="" style={{ height: 70, borderRadius: 6, objectFit: "cover", maxWidth: 120 }} /> : <div style={{ fontSize: 28 }}>📷</div>}
                  <div><div style={{ fontSize: 13, color: "#aabbcc", marginBottom: 2 }}>{m.image ? "Tap to change" : "Tap to upload image"}</div><div style={{ fontSize: 11, color: "#8899bb" }}>JPG or PNG</div></div>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadImage(idx, e.target.files[0])} />
                </label>
                {m.image && <button onClick={() => update(idx, "image", "")} style={{ ...S.btn, background: "#ef444411", color: "#ef4444", padding: "4px 10px", fontSize: 11, marginTop: 6 }}>Remove image</button>}
              </div>
              {/* Stripe link — for non-clothing items */}
              {!m.isClothing && <div><label style={S.label}>Stripe Payment Link</label><input style={S.input} value={m.stripeLink || ""} onChange={e => update(idx, "stripeLink", e.target.value)} placeholder="https://buy.stripe.com/..." /></div>}
              {/* Clothing toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#191740", borderRadius: 8, padding: "10px 14px" }}>
                <input type="checkbox" id={`clothing-${idx}`} checked={!!m.isClothing} onChange={e => update(idx, "isClothing", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#347ebf" }} />
                <label htmlFor={`clothing-${idx}`} style={{ fontSize: 13, color: "#347ebf", fontWeight: 700, cursor: "pointer" }}>👕 This item has sizes (XS–3XL)</label>
              </div>
              {/* Sold out toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#191740", borderRadius: 8, padding: "10px 14px" }}>
                <input type="checkbox" id={`soldout-${idx}`} checked={!!m.soldOut} onChange={e => update(idx, "soldOut", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#ef4444" }} />
                <label htmlFor={`soldout-${idx}`} style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, cursor: "pointer" }}>🚫 Mark as sold out</label>
              </div>
              {/* Size stock manager */}
              {m.isClothing && (
                <div>
                  <label style={S.label}>Sizes — Stock &amp; Stripe Links</label>
                  <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 10 }}>Set stock status and a separate Stripe payment link for each size.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SIZES.map(sz => {
                      const status = (m.sizes || {})[sz] || "available";
                      const sizeLink = (m.sizeLinks || {})[sz] || "";
                      return (
                        <div key={sz} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d0c22", borderRadius: 8, padding: "8px 10px", flexWrap: "wrap" }}>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, color: SIZE_COLORS[status], width: 32, flexShrink: 0 }}>{sz}</div>
                          <select value={status} onChange={e => updateSize(idx, sz, e.target.value)} style={{ ...S.input, width: 100, fontSize: 11, padding: "4px 6px", color: SIZE_COLORS[status], borderColor: SIZE_COLORS[status] + "44", flexShrink: 0 }}>
                            {SIZE_STATUS.map(s => <option key={s} value={s}>{SIZE_LABELS[s]}</option>)}
                          </select>
                          <input
                            value={sizeLink}
                            onChange={e => {
                              const sizeLinks = { ...(list[idx].sizeLinks || {}), [sz]: e.target.value };
                              update(idx, "sizeLinks", sizeLinks);
                            }}
                            placeholder="https://buy.stripe.com/..."
                            style={{ ...S.input, flex: 1, minWidth: 160, fontSize: 11, padding: "4px 8px", opacity: status === "sold_out" ? 0.4 : 1 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <button style={{ ...S.btn, background: "#10b981", color: "#fff", alignSelf: "flex-end" }} onClick={save}>Save All</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminGallery({ items, onSave }) {
  const [albums, setAlbums] = useState(items || []);
  useEffect(() => { setAlbums(items || []); }, [items]);
  const [expanded, setExpanded] = useState(null);
  const [uploading, setUploading] = useState({}); // { [albumIdx]: { done, total } }

  const addAlbum = () => {
    const a = [...albums, { id: Date.now(), name: "New Album", date: "", cover: "", photos: [] }];
    setAlbums(a); setExpanded(a.length - 1);
  };
  const updateAlbum = (idx, field, val) => setAlbums(albums.map((a, i) => i === idx ? { ...a, [field]: val } : a));

  const delAlbum = (idx) => {
    const album = albums[idx];
    // Delete all photos from Storage
    (album.photos || []).forEach(p => {
      if (p.storagePath) {
        try { deleteObject(storageRef(storage, p.storagePath)); } catch (e) {}
      }
    });
    const a = albums.filter((_, i) => i !== idx);
    setAlbums(a);
    onSave(a);
  };

  const uploadPhotos = (idx, files) => {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;
    setUploading(u => ({ ...u, [idx]: { done: 0, total: fileArr.length } }));
    const newPhotos = [];
    let completed = 0;

    fileArr.forEach(file => {
      const photoId = Date.now() + Math.random();
      const path = `gallery/${albums[idx].id}/${photoId}_${file.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file);

      task.on("state_changed", null, (err) => {
        console.error("Upload error:", err);
        completed++;
        setUploading(u => ({ ...u, [idx]: { done: completed, total: fileArr.length } }));
        if (completed === fileArr.length) {
          setUploading(u => { const n = { ...u }; delete n[idx]; return n; });
        }
      }, () => {
        getDownloadURL(task.snapshot.ref).then(url => {
          newPhotos.push({ id: photoId, src: url, storagePath: path });
          completed++;
          setUploading(u => ({ ...u, [idx]: { done: completed, total: fileArr.length } }));
          if (completed === fileArr.length) {
            setUploading(u => { const n = { ...u }; delete n[idx]; return n; });
            setAlbums(prev => {
              const updated = prev.map((a, i) => {
                if (i !== idx) return a;
                const allPhotos = [...(a.photos || []), ...newPhotos];
                return { ...a, photos: allPhotos, cover: a.cover || newPhotos[0].src };
              });
              onSave(updated);
              return updated;
            });
          }
        });
      });
    });
  };

  const removePhoto = (albumIdx, photoId) => {
    const album = albums[albumIdx];
    const photo = (album.photos || []).find(p => p.id === photoId);
    // Delete from Storage
    if (photo && photo.storagePath) {
      try { deleteObject(storageRef(storage, photo.storagePath)); } catch (e) {}
    }
    const updated = albums.map((a, i) => {
      if (i !== albumIdx) return a;
      const photos = (a.photos || []).filter(p => p.id !== photoId);
      const newCover = a.cover === photo?.src ? (photos[0]?.src || "") : a.cover;
      return { ...a, photos, cover: newCover };
    });
    setAlbums(updated);
    onSave(updated);
  };

  const save = () => onSave(albums);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>Photo Albums</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.btn, background: "#347ebf", color: "#fff" }} onClick={addAlbum}>+ New Album</button>
          <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save All</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 14 }}>Create albums for matchdays, events, pre-season etc. Upload multiple photos at once -- they go straight to cloud storage.</div>
      {albums.length === 0 && <div style={{ color: "#8899bb", fontSize: 13, padding: "16px 0" }}>No albums yet -- tap "+ New Album" to get started.</div>}
      {albums.map((a, idx) => (
        <div key={a.id} style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
          {/* Album header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
            {a.cover
              ? <img src={a.cover} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              : <div style={{ width: 52, height: 52, background: "#191740", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📸</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name || "(unnamed)"}</div>
              <div style={{ fontSize: 12, color: "#8899bb" }}>{a.date || "No date"} · {(a.photos || []).length} photo{(a.photos||[]).length !== 1 ? "s" : ""}</div>
            </div>
            <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf", padding: "5px 12px" }} onClick={() => setExpanded(expanded === idx ? null : idx)}>{expanded === idx ? "Close" : "Edit"}</button>
            <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "5px 10px" }} onClick={() => delAlbum(idx)}>✕</button>
          </div>
          {/* Expanded editor */}
          {expanded === idx && (
            <div style={{ borderTop: "1px solid #ffffff0f", padding: 14 }}>
              <div style={S.row}>
                <div style={{ flex: 2 }}><label style={S.label}>Album Name</label><input style={S.input} value={a.name} onChange={e => updateAlbum(idx, "name", e.target.value)} placeholder="e.g. vs Frickley Athletic -- 3 Aug" /></div>
                <div style={{ flex: 1 }}><label style={S.label}>Date</label><input style={S.input} value={a.date} onChange={e => updateAlbum(idx, "date", e.target.value)} placeholder="3 Aug 2026" /></div>
              </div>
              {/* Upload */}
              <div style={{ marginTop: 10 }}>
                <label style={S.label}>Add Photos</label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: uploading[idx] ? "default" : "pointer", background: "#191740", border: "1px dashed #347ebf44", borderRadius: 8, padding: 12, opacity: uploading[idx] ? 0.7 : 1 }}>
                  <div style={{ fontSize: 28 }}>{uploading[idx] ? "⏳" : "📷"}</div>
                  <div>
                    {uploading[idx]
                      ? <><div style={{ fontSize: 13, color: "#aabbcc" }}>Uploading {uploading[idx].done} of {uploading[idx].total}...</div><div style={{ fontSize: 11, color: "#8899bb" }}>Please wait</div></>
                      : <><div style={{ fontSize: 13, color: "#aabbcc" }}>Tap to upload photos</div><div style={{ fontSize: 11, color: "#8899bb" }}>Select multiple at once · stored in cloud</div></>
                    }
                  </div>
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} disabled={!!uploading[idx]} onChange={e => uploadPhotos(idx, e.target.files)} />
                </label>
              </div>
              {/* Photo grid */}
              {(a.photos || []).length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginTop: 12 }}>
                  {a.photos.map(p => (
                    <div key={p.id} style={{ position: "relative", paddingTop: "100%" }}>
                      <img src={p.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                      <button onClick={() => removePhoto(idx, p.id)} style={{ position: "absolute", top: 3, right: 3, background: "#ef4444cc", border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>✕</button>
                      <button onClick={() => { updateAlbum(idx, "cover", p.src); }} style={{ position: "absolute", bottom: 3, left: 3, background: a.cover === p.src ? "#10b981cc" : "#000000aa", border: "none", borderRadius: 4, color: "#fff", fontSize: 9, fontWeight: 700, cursor: "pointer", padding: "2px 5px" }}>{a.cover === p.src ? "COVER" : "Set cover"}</button>
                    </div>
                  ))}
                </div>
              )}
              <button style={{ ...S.btn, background: "#10b981", color: "#fff", marginTop: 12 }} onClick={save}>Save Album</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


function AdminDraw({ drawData, onSave }) {
  const [desc, setDesc] = useState(drawData.description || "");
  const [winnerMonth, setWinnerMonth] = useState(drawData.winnerMonth || "");
  const [winnerNumber, setWinnerNumber] = useState(drawData.winnerNumber || 0);
  const [stripeLink, setStripeLink] = useState(drawData.stripeLink || "");
  const [nextDrawDate, setNextDrawDate] = useState(drawData.nextDrawDate || "");
  const [members, setMembers] = useState(drawData.members || Array.from({ length: 59 }, (_, i) => ({ number: i + 1, name: "" })));
  useEffect(() => {
    setDesc(drawData.description || "");
    setWinnerMonth(drawData.winnerMonth || "");
    setWinnerNumber(drawData.winnerNumber || 0);
    setStripeLink(drawData.stripeLink || "");
    setNextDrawDate(drawData.nextDrawDate || "");
    setMembers(drawData.members || Array.from({ length: 59 }, (_, i) => ({ number: i + 1, name: "" })));
  }, [drawData]);

  const updateMember = (idx, name) => setMembers(members.map((m, i) => i === idx ? { ...m, name } : m));
  const save = () => onSave({ description: desc, winnerMonth, winnerNumber: +winnerNumber, stripeLink, nextDrawDate, members });
  const editorRef = useRef(null);
  const execCmd = (cmd, val = null) => { editorRef.current && editorRef.current.focus(); document.execCommand(cmd, false, val); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>Monthly Draw</div>
        <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save All</button>
      </div>

      {/* Description editor */}
      <div style={{ marginBottom: 16 }}>
        <label style={S.label}>Page Description (supports bold, italic etc)</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          {[["Bold","bold"],["Italic","italic"],["Underline","underline"]].map(([l,c]) => (
            <button key={c} style={{ ...S.btn, background: "#347ebf22", color: "#347ebf", padding: "4px 10px", fontSize: 12 }} onMouseDown={e => { e.preventDefault(); execCmd(c); }}>{l}</button>
          ))}
          <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf", padding: "4px 10px", fontSize: 12 }} onMouseDown={e => { e.preventDefault(); execCmd("insertUnorderedList"); }}>• List</button>
          <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", padding: "4px 10px", fontSize: 12 }} onMouseDown={e => { e.preventDefault(); execCmd("removeFormat"); }}>Clear</button>
        </div>
        <div ref={editorRef} contentEditable suppressContentEditableWarning
          onInput={e => setDesc(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: desc }}
          style={{ ...S.input, minHeight: 80, height: "auto", padding: 10, lineHeight: 1.7 }} />
      </div>

      {/* Winner section */}
      <div style={{ background: "#191740", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, color: "#f59e0b", marginBottom: 10 }}>🏆 Winner Settings</div>
        <div style={S.row}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Winner Month (e.g. July, December)</label>
            <input style={S.input} value={winnerMonth} onChange={e => setWinnerMonth(e.target.value)} placeholder="June" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Winning Number (0 = no winner)</label>
            <input style={S.input} type="number" min="0" max="59" value={winnerNumber} onChange={e => setWinnerNumber(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Next draw date */}
      <div style={{ marginBottom: 16 }}>
        <label style={S.label}>Next Draw Date (e.g. Sunday 29th June 2026)</label>
        <input style={S.input} value={nextDrawDate} onChange={e => setNextDrawDate(e.target.value)} placeholder="Sunday 29th June 2026" />
      </div>

      {/* Stripe link */}
      <div style={{ marginBottom: 16 }}>
        <label style={S.label}>Join The Draw -- Stripe Payment Link</label>
        <input style={S.input} value={stripeLink} onChange={e => setStripeLink(e.target.value)} placeholder="https://buy.stripe.com/..." />
      </div>      {/* Members grid */}
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Draw Members (1–59)</div>
      <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 12 }}>Leave blank for vacant numbers.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
        {members.map((m, idx) => (
          <div key={m.number} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d0c22", borderRadius: 8, padding: "6px 10px", border: `1px solid ${winnerNumber === m.number ? "#f59e0b44" : "#ffffff0f"}` }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: winnerNumber === m.number ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#347ebf22", border: `1px solid ${winnerNumber === m.number ? "#f59e0b" : "#347ebf44"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: winnerNumber === m.number ? "#fff" : "#347ebf", flexShrink: 0 }}>{m.number}</div>
            <input style={{ ...S.input, padding: "4px 6px", fontSize: 12, flex: 1 }} value={m.name} onChange={e => updateMember(idx, e.target.value)} placeholder="Vacant" />
          </div>
        ))}
      </div>
      <button style={{ ...S.btn, background: "#10b981", color: "#fff", marginTop: 16 }} onClick={save}>Save All</button>
    </div>
  );
}


const TROPHY_CATEGORIES = [
  { key: "bronze", label: "Bronze", color: "#cd7f32", points: 10 },
  { key: "silver", label: "Silver", color: "#aaaaaa", points: 30 },
  { key: "gold",   label: "Gold",   color: "#f59e0b", points: 50 },
  { key: "hidden", label: "Hidden", color: "#8b5cf6", points: 30 },
];
const CATEGORY_POINTS = { bronze: 10, silver: 30, gold: 50, hidden: 30 };

function AdminSeasonPass({ spData, onSave }) {
  const defaultTrophies = [];
  const [season, setSeason] = useState(spData?.season || "2026/27");
  const [description, setDescription] = useState(spData?.description || "");
  const [spStripeLink, setSpStripeLink] = useState(spData?.stripeLink || "");
  const [seasonLocked, setSeasonLocked] = useState(spData?.locked !== false);
  const [trophies, setTrophies] = useState(spData?.trophies || defaultTrophies);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("settings");
  const [userSearch, setUserSearch] = useState("");
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [passCodes, setPassCodes] = useState({});

  useEffect(() => {
    if (spData) {
      setSeason(spData.season || "2026/27");
      setDescription(spData.description || "");
      setSpStripeLink(spData.stripeLink || "");
      setSeasonLocked(spData.locked !== false);
      setTrophies(spData.trophies || defaultTrophies);
    }
  }, [spData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsub = onValue(ref(db, "users"), (snap) => {
      if (snap.exists()) setUsers(Object.entries(snap.val()).map(([uid, data]) => ({ uid, ...data })));
      else setUsers([]);
    });
    const unsub2 = onValue(ref(db, "hmwfc/passCodes"), (snap) => {
      if (snap.exists()) setPassCodes(snap.val());
      else setPassCodes({});
    });
    return () => { unsub(); unsub2(); };
  }, []);

  const saveTrophy = (idx, field, val) => setTrophies(trophies.map((t, i) => i === idx ? { ...t, [field]: val } : t));

  const uploadTrophyImage = (idx, file) => {
    if (!file) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 300;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveTrophy(idx, "image", canvas.toDataURL('image/png', 0.85));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const save = () => onSave({ ...(spData || {}), season, description, stripeLink: spStripeLink, locked: seasonLocked, trophies });

  const generateCodes = (count) => {
    setGeneratingCodes(true);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const newCodes = {};
    for (let i = 0; i < count; i++) {
      let code = "";
      for (let j = 0; j < 8; j++) code += chars[Math.floor(Math.random() * chars.length)];
      newCodes[code] = { used: false, createdAt: new Date().toISOString() };
    }
    update(ref(db), Object.fromEntries(Object.entries(newCodes).map(([k, v]) => [`hmwfc/passCodes/${k}`, v]))).then(() => setGeneratingCodes(false));
  };

  const grantTrophy = (uid, trophyId) => {
    // Write to a grants queue that server rules allow admin to write
    // and fan's profile listener picks up
    update(ref(db, `hmwfc/adminGrants`), { [`${uid}_${trophyId}`]: { uid, trophyId, granted: true, at: new Date().toISOString() } });
    // Also write directly — works if Firebase rules allow auth != null on users
    update(ref(db, `users/${uid}/trophies`), { [trophyId]: true });
    // Force local state update so UI reflects immediately
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, trophies: { ...(u.trophies || {}), [trophyId]: true } } : u));
  };

  const revokeTrophy = (uid, trophyId) => {
    update(ref(db, `hmwfc/adminGrants`), { [`${uid}_${trophyId}`]: null });
    set(ref(db, `users/${uid}/trophies/${trophyId}`), null);
    setUsers(prev => prev.map(u => {
      if (u.uid !== uid) return u;
      const trophies = { ...(u.trophies || {}) };
      delete trophies[trophyId];
      return { ...u, trophies };
    }));
  };

  const unusedCodes = Object.entries(passCodes).filter(([, v]) => !v.used);
  const usedCodes = Object.entries(passCodes).filter(([, v]) => v.used);
  const filteredUsers = users.filter(u => !userSearch.trim() || u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900 }}>Wells Season Pass</div>
        <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save Settings</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #ffffff0f" }}>
        {[["settings", "⚙️ Settings"], ["trophies", "🏆 Trophies"], ["codes", "🎟️ Pass Codes"], ["users", "👥 Users"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...S.btn, borderRadius: 0, borderBottom: tab === k ? "2px solid #347ebf" : "2px solid transparent", color: tab === k ? "#347ebf" : "#8899bb", background: "none", padding: "10px 14px", fontSize: 12 }}>{label}</button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={S.label}>Banner Image (full width at top of Season Pass page)</label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "#191740", border: "1px dashed #347ebf44", borderRadius: 8, padding: 12 }}>
              {spData?.bannerImage
                ? <img src={spData.bannerImage} alt="" style={{ height: 80, borderRadius: 6, objectFit: "cover", maxWidth: 200 }} />
                : <div style={{ fontSize: 28 }}>🖼️</div>}
              <div><div style={{ fontSize: 13, color: "#aabbcc", marginBottom: 2 }}>{spData?.bannerImage ? "Tap to change banner" : "Upload a banner image"}</div><div style={{ fontSize: 11, color: "#8899bb" }}>Recommended: wide image, e.g. 1280×400px</div></div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const img = new Image();
                const url = URL.createObjectURL(file);
                img.onload = () => {
                  const MAX_W = 1280;
                  const ratio = Math.min(MAX_W / img.width, 1);
                  canvas.width = img.width * ratio;
                  canvas.height = img.height * ratio;
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const bannerImage = canvas.toDataURL("image/jpeg", 0.8);
                  URL.revokeObjectURL(url);
                  update(ref(db), { "hmwfc/seasonPass/bannerImage": bannerImage });
                };
                img.src = url;
              }} />
            </label>
            {spData?.bannerImage && <button onClick={() => update(ref(db), { "hmwfc/seasonPass/bannerImage": "" })} style={{ ...S.btn, background: "#ef444411", color: "#ef4444", padding: "4px 10px", fontSize: 11, marginTop: 6 }}>Remove banner</button>}
          </div>
          <div><label style={S.label}>Public Description (shown on the Season Pass page)</label><textarea style={{ ...S.input, height: 80, resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the season pass and what fans can unlock..." /></div>
          <div><label style={S.label}>Purchase Link (Stripe or other payment link)</label><input style={S.input} value={spStripeLink} onChange={e => setSpStripeLink(e.target.value)} placeholder="https://buy.stripe.com/..." /></div>
          <div style={{ background: "#191740", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, color: seasonLocked ? "#ef4444" : "#10b981", marginBottom: 4 }}>{seasonLocked ? "🔒 Season Locked" : "🟢 Season Active"}</div>
              <div style={{ fontSize: 12, color: "#8899bb" }}>{seasonLocked ? "Fans can see trophies but cannot unlock any yet. Toggle to open the season." : "Fans can unlock trophies. Toggle to lock the season."}</div>
            </div>
            <button onClick={() => setSeasonLocked(l => !l)} style={{ ...S.btn, background: seasonLocked ? "#ef444422" : "#10b98122", color: seasonLocked ? "#ef4444" : "#10b981", border: `1px solid ${seasonLocked ? "#ef444444" : "#10b98144"}`, flexShrink: 0 }}>{seasonLocked ? "Unlock Season" : "Lock Season"}</button>
          </div>
          <button style={{ ...S.btn, background: "#10b981", color: "#fff", alignSelf: "flex-start" }} onClick={save}>Save</button>
        </div>
      )}

      {/* Trophies tab */}
      {tab === "trophies" && (
        <div>
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 14 }}>Set up to 10 trophies. Each has a unique check-in code fans enter to unlock. Upload your own trophy artwork.</div>
          {trophies.map((t, idx) => (
            <div key={t.id} style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                {t.image
                  ? <img src={t.image} alt="" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, background: "#191740", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{t.emoji || "🏆"}</div>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Trophy {idx + 1}{t.name ? ` -- ${t.name}` : ""}</div>
                  <div style={{ fontSize: 11, color: t.active ? "#10b981" : "#8899bb" }}>{t.active ? "Active" : "Hidden"}</div>
                </div>
                <input type="checkbox" checked={!!t.active} onChange={e => saveTrophy(idx, "active", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#10b981" }} title="Active" />
              </div>
              <div style={S.row}>
                <div style={{ flex: 0.3, minWidth: 50 }}><label style={S.label}>Icon</label><input style={S.input} value={t.emoji} onChange={e => saveTrophy(idx, "emoji", e.target.value)} /></div>
                <div style={{ flex: 2 }}><label style={S.label}>Trophy Name</label><input style={S.input} value={t.name} onChange={e => saveTrophy(idx, "name", e.target.value)} placeholder="Away Day Hero" /></div>
                <div style={{ flex: 1 }}><label style={S.label}>Category</label>
                  <select style={{ ...S.input, color: TROPHY_CATEGORIES.find(c => c.key === (t.category || "bronze"))?.color || "#cd7f32" }} value={t.category || "bronze"} onChange={e => saveTrophy(idx, "category", e.target.value)}>
                    {TROPHY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label} ({c.points}pts)</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={S.label}>Check-In Code</label><input style={{ ...S.input, fontFamily: "monospace", letterSpacing: 2 }} value={t.checkInCode} onChange={e => saveTrophy(idx, "checkInCode", e.target.value.toUpperCase())} placeholder="Enter check-in code" /></div>
              </div>
              <div style={{ marginTop: 8 }}><label style={S.label}>Description</label><input style={S.input} value={t.description} onChange={e => saveTrophy(idx, "description", e.target.value)} placeholder="Attended an away game at Frickley Athletic" /></div>
              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><label style={S.label}>Type</label>
                  <select style={S.input} value={t.type || "code"} onChange={e => saveTrophy(idx, "type", e.target.value)}>
                    <option value="code">Code — fan enters a check-in code</option>
                    <option value="evidence">Evidence — fan submits photo proof</option>
                  </select>
                </div>
                {(t.type || "code") === "evidence" && (
                  <div style={{ flex: 0.5, minWidth: 80 }}><label style={S.label}>Required (times)</label>
                    <input style={S.input} type="number" min="1" value={t.threshold || 1} onChange={e => saveTrophy(idx, "threshold", +e.target.value)} />
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={S.label}>Trophy Image</label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", background: "#191740", border: "1px dashed #347ebf44", borderRadius: 8, padding: "8px 12px" }}>
                  {t.image ? <img src={t.image} alt="" style={{ height: 40, borderRadius: 4 }} /> : <span style={{ fontSize: 20 }}>🖼️</span>}
                  <span style={{ fontSize: 12, color: "#aabbcc" }}>{t.image ? "Change image" : "Upload trophy art"}</span>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadTrophyImage(idx, e.target.files[0])} />
                </label>
                {t.image && <button onClick={() => saveTrophy(idx, "image", "")} style={{ ...S.btn, background: "#ef444411", color: "#ef4444", padding: "4px 10px", fontSize: 11, marginLeft: 8 }}>Remove</button>}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf" }} onClick={() => setTrophies(prev => [...prev, { id: Date.now(), name: "", emoji: "🏆", description: "", checkInCode: "", image: "", active: true, category: "bronze", type: "code", threshold: 1 }])}>+ Add Trophy</button>
            <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={save}>Save All Trophies</button>
          </div>
        </div>
      )}

      {/* Pass Codes tab */}
      {tab === "codes" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ background: "#191740", borderRadius: 10, padding: "12px 18px", flex: 1, minWidth: 100 }}>
              <div style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1 }}>UNUSED</div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, color: "#10b981" }}>{unusedCodes.length}</div>
            </div>
            <div style={{ background: "#191740", borderRadius: 10, padding: "12px 18px", flex: 1, minWidth: 100 }}>
              <div style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1 }}>USED</div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, color: "#347ebf" }}>{usedCodes.length}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[10, 25, 50].map(n => (
              <button key={n} style={{ ...S.btn, background: "#347ebf22", color: "#347ebf" }} disabled={generatingCodes} onClick={() => generateCodes(n)}>
                {generatingCodes ? "Generating..." : `+ Generate ${n} codes`}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 10 }}>Unused codes (give these to fans when they purchase):</div>
          <div style={{ background: "#0d0c22", borderRadius: 10, padding: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 2, maxHeight: 300, overflowY: "auto", border: "1px solid #ffffff0f" }}>
            {unusedCodes.length === 0 ? <span style={{ color: "#8899bb" }}>No unused codes -- generate some above.</span> : unusedCodes.map(([code]) => <div key={code} style={{ color: "#10b981", letterSpacing: 2 }}>{code}</div>)}
          </div>
          <button style={{ ...S.btn, background: "#ffffff0f", color: "#aabbcc", marginTop: 10, fontSize: 12 }} onClick={() => navigator.clipboard.writeText(unusedCodes.map(([c]) => c).join("\n"))}>📋 Copy all unused codes</button>
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div>
          {/* Photo lightbox */}
          {lightboxPhoto && (
            <div style={{ position: "fixed", inset: 0, background: "#000000ee", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setLightboxPhoto(null)}>
              <div style={{ maxWidth: 600, width: "100%", background: "#191740", borderRadius: 12, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                <img src={lightboxPhoto.url} alt="" style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", background: "#0d0c22" }} />
                {lightboxPhoto.comment && <div style={{ padding: "12px 16px", fontSize: 13, color: "#aabbcc" }}>💬 {lightboxPhoto.comment}</div>}
                <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    const { uid, trophyId, allPhotos, photoUrl } = lightboxPhoto;
                    const updated = allPhotos.map(p => p.url === photoUrl ? { ...p, reviewed: true } : p);
                    update(ref(db, `users/${uid}/submissions/${trophyId}`), { photos: updated });
                    setUsers(prev => prev.map(u => {
                      if (u.uid !== uid) return u;
                      const subs = { ...(u.submissions || {}) };
                      subs[trophyId] = { ...(subs[trophyId] || {}), photos: updated };
                      return { ...u, submissions: subs };
                    }));
                    setLightboxPhoto(null);
                  }} style={{ ...S.btn, background: "#ef444422", color: "#ef4444", flex: 1 }}>✕ Delete photo</button>
                  <button onClick={() => setLightboxPhoto(null)} style={{ ...S.btn, background: "#ffffff0f", color: "#8899bb", flex: 1 }}>Close</button>
                </div>
              </div>
            </div>
          )}

          <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="🔍 Search by name or email..." style={{ ...S.input, marginBottom: 14 }} />
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 10 }}>{users.length} registered fan{users.length !== 1 ? "s" : ""}</div>
          {filteredUsers.map(u => {
            const unlockedTrophyIds = Object.keys(u.trophies || {}).filter(k => u.trophies[k]);
            const submissions = u.submissions || {};
            const pendingCount = Object.values(submissions).reduce((n, s) => n + (s.photos || []).filter(p => !p.reviewed).length, 0);
            const isExpanded = expandedUser === u.uid;
            return (
              <div key={u.uid} style={{ background: "#0d0c22", border: `1px solid ${pendingCount > 0 ? "#f59e0b44" : "#ffffff0f"}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                {/* Collapsed header — always visible */}
                <div onClick={() => setExpandedUser(isExpanded ? null : u.uid)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#191740", border: "1px solid #ffffff15", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {u.photo ? <img src={u.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 18 }}>👤</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.displayName || "(no name)"}</div>
                    <div style={{ fontSize: 11, color: "#8899bb", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                      <span style={{ background: u.passUnlocked ? "#10b98122" : "#ffffff0f", color: u.passUnlocked ? "#10b981" : "#8899bb", padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>{u.passUnlocked ? "✓ Pass" : "No Pass"}</span>
                      <span>{unlockedTrophyIds.length}/{trophies.filter(t => t.active).length} trophies</span>
                      {pendingCount > 0 && <span style={{ background: "#f59e0b22", color: "#f59e0b", padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>⏳ {pendingCount} pending</span>}
                    </div>
                  </div>
                  <span style={{ color: "#8899bb", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #ffffff0f", padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 10 }}>{u.email}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {trophies.filter(t => t.active && t.name).map(t => {
                        const has = !!(u.trophies || {})[t.id];
                        const cat = TROPHY_CATEGORIES.find(c => c.key === (t.category || "bronze")) || TROPHY_CATEGORIES[0];
                        const isEvidence = (t.type || "code") === "evidence";
                        const tSubs = (submissions[t.id] || {});
                        const progress = tSubs.count || 0;
                        const threshold = t.threshold || 1;
                        const trophyPhotos = (tSubs.photos || []).filter(p => !p.reviewed);
                        return (
                          <div key={t.id} style={{ background: "#191740", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 18 }}>{t.emoji}</span>
                              <div style={{ flex: 1, minWidth: 100 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: has ? cat.color : "#fff" }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: "#8899bb" }}>{cat.label} · {cat.points}pts · {isEvidence ? `Evidence (${progress}/${threshold})` : "Code"}</div>
                              </div>
                              {isEvidence && !has && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button onClick={() => { const newCount = Math.max(0, progress - 1); update(ref(db, `users/${u.uid}/submissions/${t.id}`), { count: newCount }); setUsers(prev => prev.map(usr => { if (usr.uid !== u.uid) return usr; const subs = { ...(usr.submissions || {}) }; subs[t.id] = { ...(subs[t.id] || {}), count: newCount }; return { ...usr, submissions: subs }; })); }} style={{ ...S.btn, background: "#ffffff0f", color: "#aabbcc", padding: "3px 8px", fontSize: 12 }}>−</button>
                                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 16, color: progress >= threshold ? "#10b981" : "#fff", minWidth: 32, textAlign: "center" }}>{progress}/{threshold}</span>
                                  <button onClick={() => { const newCount = progress + 1; update(ref(db, `users/${u.uid}/submissions/${t.id}`), { count: newCount }); setUsers(prev => prev.map(usr => { if (usr.uid !== u.uid) return usr; const subs = { ...(usr.submissions || {}) }; subs[t.id] = { ...(subs[t.id] || {}), count: newCount }; return { ...usr, submissions: subs }; })); if (newCount >= threshold) { grantTrophy(u.uid, t.id); } }} style={{ ...S.btn, background: progress + 1 >= threshold ? "#10b98122" : "#ffffff0f", color: progress + 1 >= threshold ? "#10b981" : "#aabbcc", padding: "3px 8px", fontSize: 12 }}>+</button>
                                </div>
                              )}
                              <button onClick={() => has ? revokeTrophy(u.uid, t.id) : grantTrophy(u.uid, t.id)}
                                style={{ ...S.btn, background: has ? "#10b98122" : "#ffffff08", color: has ? "#10b981" : "#8899bb", border: `1px solid ${has ? "#10b98144" : "#ffffff15"}`, padding: "4px 10px", fontSize: 11 }}>
                                {has ? "✓ Granted" : "Grant"}
                              </button>
                            </div>
                            {trophyPhotos.length > 0 && (
                              <div style={{ marginTop: 10, borderTop: "1px solid #ffffff0f", paddingTop: 10 }}>
                                <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>📸 {trophyPhotos.length} pending photo{trophyPhotos.length !== 1 ? "s" : ""}</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  {trophyPhotos.map((photo, pi) => (
                                    <div key={pi} style={{ position: "relative" }}>
                                      <img src={photo.url} alt="" onClick={() => setLightboxPhoto({ url: photo.url, comment: photo.comment, uid: u.uid, trophyId: t.id, allPhotos: tSubs.photos || [], photoUrl: photo.url })} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid #f59e0b44", cursor: "pointer" }} />
                                      {photo.comment && <div style={{ fontSize: 9, color: "#8899bb", marginTop: 2, maxWidth: 72, wordBreak: "break-word" }}>{photo.comment.slice(0,40)}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredUsers.length === 0 && <div style={{ color: "#8899bb", fontSize: 13, padding: 20, textAlign: "center" }}>No fans registered yet.</div>}
        </div>
      )}
    </div>
  );
}


function AdminClubhouse({ data, onUpdate }) {
  const [matchday, setMatchday] = useState(data.clubhouse?.matchday || { locked: true, home: "Hemsworth Miners Welfare FC", away: "", homeBadge: "", awayBadge: "" });
  const [motm, setMotm] = useState(data.clubhouse?.motm || { locked: true, players: [], winner: "" });
  const [tab, setTab] = useState("predictions");

  useEffect(() => {
    setMatchday(data.clubhouse?.matchday || { locked: true, home: "Hemsworth Miners Welfare FC", away: "", homeBadge: "", awayBadge: "" });
    setMotm(data.clubhouse?.motm || { locked: true, players: [], winner: "" });
  }, [data.clubhouse]);

  const saveMatchday = () => onUpdate("clubhouse", { ...(data.clubhouse || {}), matchday });
  const saveMotm = () => onUpdate("clubhouse", { ...(data.clubhouse || {}), motm });

  const addPlayer = () => setMotm(m => ({ ...m, players: [...(m.players || []), { name: "", photo: "" }] }));
  const updatePlayer = (idx, field, val) => setMotm(m => ({ ...m, players: m.players.map((p, i) => i === idx ? { ...p, [field]: val } : p) }));
  const removePlayer = (idx) => setMotm(m => ({ ...m, players: m.players.filter((_, i) => i !== idx) }));

  const uploadPlayerPhoto = (idx, file) => {
    if (!file) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 200;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      updatePlayer(idx, "photo", canvas.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div>
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Clubhouse</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #ffffff0f" }}>
        {[["predictions", "⚽ Match Predictions"], ["motm", "🏅 Man of the Match"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...S.btn, borderRadius: 0, borderBottom: tab === k ? "2px solid #347ebf" : "2px solid transparent", color: tab === k ? "#347ebf" : "#8899bb", background: "none", padding: "10px 14px", fontSize: 12 }}>{label}</button>
        ))}
      </div>

      {tab === "predictions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#191740", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, color: matchday.locked ? "#ef4444" : "#10b981", marginBottom: 4 }}>{matchday.locked ? "🔒 Predictions Locked" : "🟢 Predictions Open"}</div>
              <div style={{ fontSize: 12, color: "#8899bb" }}>{matchday.locked ? "Fans cannot submit predictions yet." : "Fans can submit their score predictions."}</div>
            </div>
            <button onClick={() => setMatchday(m => ({ ...m, locked: !m.locked }))} style={{ ...S.btn, background: matchday.locked ? "#ef444422" : "#10b98122", color: matchday.locked ? "#ef4444" : "#10b981", border: `1px solid ${matchday.locked ? "#ef444444" : "#10b98144"}`, flexShrink: 0 }}>{matchday.locked ? "Open" : "Lock"}</button>
          </div>
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 10 }}>Teams and badges are pulled from the league table. For friendlies or cup games, type the team name and upload a badge manually.</div>
          <div style={S.row}>
            {["home", "away"].map(side => {
              const tableTeam = (data.table || []).find(r => r.team === matchday[side]);
              const tableBadge = tableTeam?.badge ? `data:image/png;base64,${tableTeam.badge}` : null;
              const manualBadge = matchday[side + "Badge"];
              const badge = tableBadge || manualBadge;
              return (
                <div key={side} style={{ flex: 1 }}>
                  <label style={S.label}>{side === "home" ? "Home" : "Away"} Team</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {badge ? <img src={badge} alt="" style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} /> : <span style={{ fontSize: 24, flexShrink: 0 }}>🛡</span>}
                    <select style={S.input} value={matchday[side] || ""} onChange={e => setMatchday(m => ({ ...m, [side]: e.target.value, [side + "Badge"]: "" }))}>
                      <option value="">Select or type below...</option>
                      {(data.table || []).sort((a,b) => a.pos - b.pos).map(t => <option key={t.team} value={t.team}>{t.team}</option>)}
                    </select>
                  </div>
                  <input style={{ ...S.input, marginBottom: 6 }} value={matchday[side] || ""} onChange={e => setMatchday(m => ({ ...m, [side]: e.target.value }))} placeholder="Or type team name..." />
                  {!tableBadge && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "#0d0c22", border: "1px dashed #ffffff22", borderRadius: 6, padding: "6px 10px" }}>
                      {manualBadge ? <img src={manualBadge} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} /> : <span style={{ fontSize: 18 }}>🛡</span>}
                      <span style={{ fontSize: 11, color: "#8899bb" }}>{manualBadge ? "Change badge" : "Upload badge (optional)"}</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setMatchday(m => ({ ...m, [side + "Badge"]: ev.target.result }));
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  )}
                  {tableBadge && <div style={{ fontSize: 10, color: "#10b981" }}>✓ Badge from league table</div>}
                </div>
              );
            })}
          </div>
          <button style={{ ...S.btn, background: "#10b981", color: "#fff", alignSelf: "flex-start" }} onClick={saveMatchday}>Save</button>
        </div>
      )}

      {tab === "motm" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#191740", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, color: motm.locked ? "#ef4444" : "#10b981", marginBottom: 4 }}>{motm.locked ? "🔒 Voting Locked" : "🟢 Voting Open"}</div>
              <div style={{ fontSize: 12, color: "#8899bb" }}>{motm.locked ? "Fans see 'Waiting for match result'." : "Fans can vote for Man of the Match."}</div>
            </div>
            <button onClick={() => setMotm(m => ({ ...m, locked: !m.locked }))} style={{ ...S.btn, background: motm.locked ? "#ef444422" : "#10b98122", color: motm.locked ? "#ef4444" : "#10b981", border: `1px solid ${motm.locked ? "#ef444444" : "#10b98144"}`, flexShrink: 0 }}>{motm.locked ? "Open Voting" : "Lock Voting"}</button>
          </div>
          <div><label style={S.label}>Match Title (e.g. vs Frickley Athletic)</label><input style={S.input} value={motm.matchTitle || ""} onChange={e => setMotm(m => ({ ...m, matchTitle: e.target.value }))} placeholder="vs Frickley Athletic — 14 Aug" /></div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, marginBottom: 4 }}>Players on ballot</div>
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 10 }}>Select from current squad — photo pulls through automatically.</div>
          {(motm.players || []).map((p, idx) => {
            const squadPlayer = (data.squad || []).find(s => s.name === p.name);
            const photo = squadPlayer?.photo || p.photo || null;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0d0c22", borderRadius: 8, padding: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#191740", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ffffff15", flexShrink: 0 }}>
                  {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} /> : <span style={{ fontSize: 20 }}>👤</span>}
                </div>
                <select style={{ ...S.input, flex: 1 }} value={p.name} onChange={e => updatePlayer(idx, "name", e.target.value)}>
                  <option value="">Select player...</option>
                  {(data.squad || []).filter(s => s.playing).sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.pos})</option>
                  ))}
                </select>
                <button onClick={() => removePlayer(idx)} style={{ ...S.btn, background: "#ef444411", color: "#ef4444", padding: "6px 10px", flexShrink: 0 }}>✕</button>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={{ ...S.btn, background: "#347ebf22", color: "#347ebf" }} onClick={addPlayer}>+ Add Player</button>
            <button style={{ ...S.btn, background: "#ef444422", color: "#ef4444" }} onClick={() => {
              if (window.confirm("Clear all votes and reset Man of the Match?")) {
                setMotm(m => ({ ...m, locked: true, players: [], matchTitle: "" }));
                update(ref(db), { "hmwfc/clubhouse/motmVotes": null, "hmwfc/clubhouse/motm": { locked: true, players: [], matchTitle: "" } });
              }
            }}>🗑 Clear & Reset</button>
            <button style={{ ...S.btn, background: "#10b981", color: "#fff" }} onClick={saveMotm}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ data, onUpdate, onClose }) {
  const [section, setSection] = useState("News");
  const adminScrollRef = useRef(null);
  const SECTIONS = ["News", "Table", "Fixtures", "Squad", "Merch", "Gallery", "Fundraising", "Season Pass", "Clubhouse"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#060514", zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#191740", borderBottom: "2px solid #347ebf44", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src={"/logo.png"} alt="HMWFC" style={{ height: 36, filter: "drop-shadow(0 0 8px #347ebf66)" }} />
        <div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900, color: "#347ebf" }}>ADMIN PANEL</div>
          <div style={{ fontSize: 11, color: "#8899bb", letterSpacing: 1 }}>HEMSWORTH MINERS WELFARE FC</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ background: "#10b98122", border: "1px solid #10b98144", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#10b981", fontWeight: 700 }}>● LIVE -- SAVES TO FIREBASE</div>
          <button style={{ ...S.btn, background: "#ffffff11", color: "#aabbcc", border: "1px solid #ffffff15", marginRight: 6 }} onClick={() => signOut(auth).then(onClose)}>Sign out</button>
<button style={{ ...S.btn, background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }} onClick={onClose}>✕ Exit Admin</button>
        </div>
      </div>
      <div style={{ background: "#191740", borderBottom: "1px solid #ffffff0f", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch", flexShrink: 0 }}>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)} style={{ ...S.btn, borderRadius: 0, borderBottom: section === s ? "2px solid #347ebf" : "2px solid transparent", color: section === s ? "#347ebf" : "#8899bb", background: "none", padding: "12px 16px", flexShrink: 0, whiteSpace: "nowrap" }}>{s}</button>
        ))}
      </div>
      <div ref={adminScrollRef} data-admin-scroll style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {section === "News" && <AdminNews items={data.news} onSave={v => onUpdate("news", v)} />}
        {section === "Table" && <AdminTable items={data.table} onSave={v => onUpdate("table", v)} />}
        {section === "Fixtures" && <AdminFixtures items={data.fixtures} tableData={data.table} onSave={v => onUpdate("fixtures", v)} />}
        {section === "Squad" && <AdminSquad items={data.squad} onSave={v => onUpdate("squad", v)} scrollRef={adminScrollRef} />}
        {section === "Merch" && <AdminMerch items={data.merch} onSave={v => onUpdate("merch", v)} />}
        {section === "Gallery" && <AdminGallery items={data.gallery || []} onSave={v => onUpdate("gallery", v)} />}
        {section === "Fundraising" && <AdminDraw drawData={data.draw || {}} onSave={v => onUpdate("draw", v)} />}
        {section === "Season Pass" && <AdminSeasonPass spData={data.seasonPass || {}} onSave={v => onUpdate("seasonPass", v)} />}
        {section === "Clubhouse" && <AdminClubhouse data={data} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess, onClose }) {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle opening admin
    } catch (e) {
      setErr("Sign-in failed. Make sure you're using an authorised account.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#191740", border: "1px solid #347ebf44", borderRadius: 16, padding: 32, width: 320, textAlign: "center" }}>
        <img src={"/logo.png"} alt="HMWFC" style={{ height: 56, marginBottom: 16, filter: "drop-shadow(0 0 10px #347ebf66)" }} />
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Admin Access</div>
        <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 20 }}>Sign in with your Google account</div>
        {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{err}</div>}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", background: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, color: "#222", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginBottom: 10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        <button style={{ background: "none", border: "none", color: "#8899bb", fontSize: 12, cursor: "pointer", marginTop: 4 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}



function FanLogin({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const handleGoogle = async () => {
    setLoading(true); setErr("");
    try { await signInWithPopup(auth, googleProvider); onClose(); }
    catch(e) { setErr("Sign-in failed. Please try again."); }
    setLoading(false);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#191740", border: "1px solid #347ebf44", borderRadius: 16, padding: 32, width: 320, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Fan Zone</div>
        <div style={{ fontSize: 13, color: "#8899bb", marginBottom: 24, lineHeight: 1.6 }}>Sign in with Google to access your Season Pass, track your trophies, and appear on The Clubhouse leaderboard.</div>
        {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{err}</div>}
        <button onClick={handleGoogle} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", background: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, color: "#222", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginBottom: 10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        <button style={{ background: "none", border: "none", color: "#8899bb", fontSize: 12, cursor: "pointer" }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}


function NonPassTrophyGrid({ trophies }) {
  const categoryOrder = ["bronze","silver","gold","hidden"];
  const sorted = [...trophies].sort((a, b) => categoryOrder.indexOf(a.category || "bronze") - categoryOrder.indexOf(b.category || "bronze"));
  // First trophy per category is the example (unblurred)
  const firstPerCategory = {};
  categoryOrder.forEach(k => {
    const first = sorted.find(t => (t.category || "bronze") === k);
    if (first) firstPerCategory[k] = first.id;
  });
  return (
    <div>
      {/* Feature highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { icon: "🏆", title: "Earn Trophies", desc: "Complete challenges throughout the season — visit away grounds, attend events and more to unlock your collection." },
          { icon: "📊", title: "Leaderboard", desc: "Compete against fellow fans on The Clubhouse leaderboard. Bronze, Silver and Gold trophies each earn different points." },
          { icon: "❓", title: "Hidden Trophies", desc: "Secret challenges you won't know about until you unlock them. Can you find them all?" },
          { icon: "🎁", title: "End of Season Prizes", desc: "Top fans on the leaderboard at the end of the season will be rewarded. Watch this space." },
        ].map(f => (
          <div key={f.title} style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#8899bb", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      {/* All trophies — first per category unblurred, rest blurred */}
      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 900, marginBottom: 14 }}>This Season's Trophies</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
        {sorted.map(t => {
          const cat = TROPHY_CATEGORIES.find(c => c.key === (t.category || "bronze")) || TROPHY_CATEGORIES[0];
          const isExample = firstPerCategory[t.category || "bronze"] === t.id;
          const isHidden = t.category === "hidden";
          return (
            <div key={t.id} style={{ background: "#191740", border: `1px solid ${isExample ? cat.color + "66" : "#ffffff0f"}`, borderRadius: 12, padding: 14, textAlign: "center", filter: isExample ? "none" : "blur(3px)", opacity: isExample ? 1 : 0.55, order: isExample ? -1 : 0 }}>
              {isExample && t.image
                ? <img src={t.image} alt="" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 8 }} />
                : <div style={{ fontSize: 36, marginBottom: 8 }}>{isExample ? (isHidden ? "❓" : t.emoji) : (isHidden ? "❓" : "🔒")}</div>}
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 900, color: isExample ? cat.color : "#8899bb", marginBottom: 3 }}>{t.name || "???"}</div>
              <div style={{ fontSize: 10, color: "#8899bb", lineHeight: 1.3, marginBottom: 6 }}>{t.description}</div>
              <span style={{ fontSize: 9, fontWeight: 900, color: cat.color, background: cat.color + "22", padding: "2px 6px", borderRadius: 4, letterSpacing: 1 }}>{cat.label.toUpperCase()} · {cat.points}pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function PredictionForm({ homeName, awayName, onSubmit }) {
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const ready = homeGoals !== "" && awayGoals !== "" && !isNaN(homeGoals) && !isNaN(awayGoals);
  return (
    <div>
      <div style={{ fontSize: 13, color: "#aabbcc", marginBottom: 16, textAlign: "center" }}>Enter your score prediction</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 6 }}>{homeName}</div>
          <input
            type="number" min="0" max="20" value={homeGoals}
            onChange={e => setHomeGoals(e.target.value)}
            style={{ width: 64, height: 64, background: "#0d0c22", border: "2px solid #347ebf44", borderRadius: 10, color: "#fff", fontSize: 28, fontWeight: 900, textAlign: "center", fontFamily: "Barlow Condensed, sans-serif", outline: "none" }}
          />
        </div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, fontWeight: 900, color: "#8899bb", paddingTop: 20 }}>–</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 6 }}>{awayName}</div>
          <input
            type="number" min="0" max="20" value={awayGoals}
            onChange={e => setAwayGoals(e.target.value)}
            style={{ width: 64, height: 64, background: "#0d0c22", border: "2px solid #347ebf44", borderRadius: 10, color: "#fff", fontSize: 28, fontWeight: 900, textAlign: "center", fontFamily: "Barlow Condensed, sans-serif", outline: "none" }}
          />
        </div>
      </div>
      <button onClick={() => ready && onSubmit(+homeGoals, +awayGoals)} style={{ ...S.btn, background: ready ? "linear-gradient(135deg,#347ebf,#1a5f9e)" : "#ffffff0f", color: ready ? "#fff" : "#8899bb55", width: "100%", fontSize: 15, padding: "12px 0", cursor: ready ? "pointer" : "not-allowed" }}>
        {ready ? "Lock in my prediction →" : "Enter both scores to continue"}
      </button>
    </div>
  );
}

const parseNewsDate = (d) => {
  if (!d) return 0;
  const clean = d.replace(/(st|nd|rd|th)/g, "").replace(/\s+/g, " ").trim();
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = clean.split(" ");
  if (parts.length >= 3) {
    const day = parseInt(parts[0]);
    const mon = months[parts[1].slice(0,3)] ?? 0;
    const yr = parseInt(parts[2]) + (parseInt(parts[2]) < 100 ? 2000 : 0);
    return new Date(yr, mon, day).getTime();
  }
  return 0;
};

export default function App() {
  const [active, setActive] = useState("Home");
  const [squadSearch, setSquadSearch] = useState("");
  const [squadPage, setSquadPage] = useState(0);
  const SQUAD_PAGE_SIZE = 24;
  const [squadSearchOpen, setSquadSearchOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [navGroup, setNavGroup] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [trophyTab, setTrophyTab] = useState("todo");
  const [trophyCodeInput, setTrophyCodeInput] = useState("");
  const [trophyCodeMsg, setTrophyCodeMsg] = useState("");
  const [predictions, setPredictions] = useState({});
  const [motmVote, setMotmVote] = useState(null);
  const [allPredictions, setAllPredictions] = useState({});
  const [fixtureTab, setFixtureTab] = useState("upcoming");
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showFanLogin, setShowFanLogin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [squadView, setSquadView] = useState("current");
  const [sortBy, setSortBy] = useState("goals");
  const [squadDisplayMode, setSquadDisplayMode] = useState("tiles");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedMerch, setSelectedMerch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [likes, setLikes] = useState({});
  const [views, setViews] = useState({});
  const [fanUser, setFanUser] = useState(null);
  const [fanProfile, setFanProfile] = useState(null);
  const [seasonPassData, setSeasonPassData] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeMsg, setCodeMsg] = useState("");
  const [passInput, setPassInput] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (window.scrollY !== 0) return;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy > 0) setPullY(Math.min(dy, PULL_THRESHOLD + 20));
    };
    const onTouchEnd = () => {
      if (pullY >= PULL_THRESHOLD) {
        setPulling(true);
        setTimeout(() => { window.location.reload(); }, 300);
      }
      setPullY(0);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullY]);

  const handleLike = (articleId) => {
    if (hasLiked(articleId)) return;
    markLiked(articleId);
    setLikes(prev => ({ ...prev, [articleId]: (prev[articleId] || 0) + 1 }));
    const likeRef = ref(db, `hmwfc/likes/${articleId}`);
    runTransaction(likeRef, (current) => (current || 0) + 1);
  };

  const recordView = (articleId) => {
    if (hasViewed(articleId)) return;
    markViewed(articleId);
    setViews(prev => ({ ...prev, [articleId]: (prev[articleId] || 0) + 1 }));
    const viewRef = ref(db, `hmwfc/views/${articleId}`);
    runTransaction(viewRef, (current) => (current || 0) + 1);
  };


  useEffect(() => {
    const dbRef = ref(db, "hmwfc");
    const unsub = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        set(ref(db, "hmwfc"), DEFAULT_DATA);
        setData(DEFAULT_DATA);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setFanUser(null);
        setFanProfile(null);
        return;
      }
      // Admin check -- only opens admin panel for the admin email
      if (user.email === process.env.REACT_APP_ADMIN_EMAIL) {
        setShowLogin(false);
        setAdminOpen(true);
        return;
      }
      // Fan account -- store user, load their profile
      setFanUser(user);
      const profileRef = ref(db, `users/${user.uid}`);
      onValue(profileRef, (snap) => {
        if (snap.exists()) {
          setFanProfile(snap.val());
        } else {
          // Create profile on first login
          const newProfile = { displayName: user.displayName || "", email: user.email, passUnlocked: false, trophies: {} };
          set(profileRef, newProfile);
          setFanProfile(newProfile);
        }
      }, { onlyOnce: false });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const likesRef = ref(db, "hmwfc/likes");
    const unsub = onValue(likesRef, (snapshot) => {
      if (snapshot.exists()) setLikes(snapshot.val());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const viewsRef = ref(db, "hmwfc/views");
    const unsub = onValue(viewsRef, (snapshot) => {
      if (snapshot.exists()) setViews(snapshot.val());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const spRef = ref(db, "hmwfc/seasonPass");
    const unsub = onValue(spRef, (snap) => {
      setSeasonPassData(snap.exists() ? snap.val() : null);
    });
    return () => unsub();
  }, []);

  // Load fan's own predictions
  useEffect(() => {
    if (!fanUser) return;
    const predRef = ref(db, `users/${fanUser.uid}/predictions`);
    const unsub = onValue(predRef, (snap) => {
      if (snap.exists()) setPredictions(snap.val());
    });
    return () => unsub();
  }, [fanUser]);

  // Load fan's motm vote
  useEffect(() => {
    if (!fanUser) return;
    const motmRef = ref(db, `users/${fanUser.uid}/motmVote`);
    const unsub = onValue(motmRef, (snap) => {
      if (snap.exists()) setMotmVote(snap.val());
    });
    return () => unsub();
  }, [fanUser]);

  // Load all fans' predictions for the leaderboard display
  useEffect(() => {
    const unsub = onValue(ref(db, "users"), (snap) => {
      if (!snap.exists()) return;
      const all = {};
      Object.values(snap.val()).forEach(u => {
        if (u.displayName && u.predictions) {
          all[u.displayName] = { predictions: u.predictions, photo: u.photo || null };
        }
      });
      setAllPredictions(all);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onValue(ref(db, "users"), (snap) => {
      if (!snap.exists()) { setLeaderboard([]); return; }
      const sp = seasonPassData || {};
      const activeTrophies = (sp.trophies || []).filter(t => t.active);
      const entries = Object.values(snap.val())
        .filter(u => u.passUnlocked)
        .map(u => {
          const unlockedIds = Object.keys(u.trophies || {}).filter(k => u.trophies[k]);
          const score = unlockedIds.reduce((sum, id) => {
            const trophy = activeTrophies.find(t => String(t.id) === String(id));
            return sum + (CATEGORY_POINTS[trophy?.category || "bronze"] || 0);
          }, 0);
          return { name: u.displayName || u.email || "Fan", photo: u.photo || null, count: unlockedIds.length, total: activeTrophies.length, score };
        })
        .sort((a, b) => b.score - a.score || b.count - a.count);
      setLeaderboard(entries);
    });
    return () => unsub();
  }, [seasonPassData]);





  const updateSection = (section, value) => {
    setData(prev => ({ ...prev, [section]: value }));
    const patch = { [`hmwfc/${section}`]: value };
    if (section === "table") patch["hmwfc/tableUpdatedAt"] = new Date().toISOString();
    update(ref(db), patch);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0c22", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes logoPulse { 0%,100% { opacity:1; transform: scale(1); filter: drop-shadow(0 0 18px #347ebf99); } 50% { opacity:0.75; transform: scale(1.06); filter: drop-shadow(0 0 36px #347ebfcc); } }
        @keyframes loadingDots { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        .loading-dot { display:inline-block; animation: loadingDots 1.2s ease-in-out infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <img src={"/logo.png"} alt="HMWFC" style={{ height: 140, marginBottom: 32, animation: "logoPulse 2s ease-in-out infinite" }} />
        <div style={{ color: "#347ebf", fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: 4 }}>
          LOADING<span className="loading-dot">.</span><span className="loading-dot">.</span><span className="loading-dot">.</span>
        </div>
        <div style={{ color: "#8899bb", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, letterSpacing: 2, marginTop: 8 }}>HEMSWORTH MINERS WELFARE FC</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0d0c22", fontFamily: "Barlow, sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@700;900&display=swap');
        body { font-size: 16px; }
        @media (max-width: 480px) { body { font-size: 17px; } td { font-size: 15px !important; } .tab-btn { font-size: 13px !important; padding: 8px 14px !important; } .nav-btn { font-size: 18px !important; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d0c22; } ::-webkit-scrollbar-thumb { background: #347ebf55; border-radius: 3px; }
        .nav-btn { background: none; border: none; color: #aabbcc; font-family: Barlow Condensed, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; padding: 14px 20px; transition: all 0.2s; border-left: 3px solid transparent; text-align: left; width: 100%; }
        .nav-btn:hover { color: #fff; background: #347ebf18; }
        .nav-btn.active { color: #347ebf; border-left: 3px solid #347ebf; background: #347ebf11; }
        .menu-overlay { position: fixed; inset: 0; background: #000000aa; z-index: 200; }
        .menu-sidebar { position: fixed; top: 0; left: 0; height: 100%; width: 240px; background: #191740; z-index: 201; display: flex; flex-direction: column; box-shadow: 4px 0 30px #00000088; transform: translateX(0); }
        .hamburger { background: none; border: none; cursor: pointer; padding: 6px; display: flex; flex-direction: column; gap: 5px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #aabbcc; border-radius: 2px; transition: all 0.2s; }
        .hamburger:hover span { background: #fff; }
        .card { background: #191740; border: 1px solid #ffffff0f; border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px #347ebf22; }
        .tab-btn { background: none; border: 1px solid #ffffff22; color: #8899bb; font-family: Barlow Condensed, sans-serif; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-size: 12px; cursor: pointer; padding: 7px 18px; border-radius: 20px; transition: all 0.2s; }
        .tab-btn.active { background: #347ebf; border-color: #347ebf; color: #fff; }
        .merch-card { background: #191740; border: 1px solid #ffffff0f; border-radius: 12px; padding: 22px 18px; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .merch-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px #347ebf33; border-color: #347ebf55; }
        .buy-btn { background: linear-gradient(135deg, #347ebf, #1a5f9e); border: none; color: #fff; font-family: Barlow Condensed, sans-serif; font-weight: 700; letter-spacing: 1px; font-size: 13px; padding: 9px 22px; border-radius: 8px; cursor: pointer; width: 100%; }
        .buy-btn:hover { opacity: 0.85; }
        .squad-row:hover { background: #347ebf11 !important; }
        table { width: 100%; border-collapse: collapse; }
        th { font-family: Barlow Condensed, sans-serif; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8899bb; font-weight: 700; padding: 10px 12px; text-align: left; border-bottom: 1px solid #ffffff0f; }
        td { padding: 11px 12px; font-size: 14px; border-bottom: 1px solid #ffffff07; }
        .fixture-card-inner { display: flex; align-items: center; gap: 10px; }
        .fixture-teams { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .fixture-venue { min-width: 110px; font-size: 11px; color: #8899bb; text-align: right; flex-shrink: 0; }
        .fixture-date { min-width: 60px; font-size: 12px; color: #8899bb; font-weight: 600; flex-shrink: 0; }
        @media (max-width: 520px) {
          .fixture-card-inner { flex-direction: column; align-items: stretch; gap: 8px; }
          .fixture-teams { flex-direction: column; gap: 6px; }
          .fixture-venue { min-width: unset; text-align: left; }
          .fixture-date { min-width: unset; }
          .fixture-team-home { justify-content: flex-start !important; flex-direction: row-reverse; }
          .fixture-team-away { justify-content: flex-start !important; }
          .fixture-score { align-self: center; }
          .home-merch-strip { padding-bottom: 8px; scroll-padding-right: 20px; }
        }
        @media (max-width: 680px) {
          @media(max-width:780px){ .home-grid { grid-template-columns: 1fr !important; } }
        }
      `}</style>

      {showLogin && <AdminLogin onSuccess={() => { setShowLogin(false); setAdminOpen(true); }} onClose={() => setShowLogin(false)} />}
      {showFanLogin && <FanLogin onClose={() => setShowFanLogin(false)} />}
      {adminOpen && <AdminPanel data={data} onUpdate={updateSection} onClose={() => setAdminOpen(false)} />}

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }} />
          <div className="menu-sidebar">
            <div style={{ padding: "20px 20px 10px", borderBottom: "1px solid #ffffff0f", display: "flex", alignItems: "center", gap: 12 }}>
              <img src={"/logo.png"} alt="HMWFC" style={{ height: 36, filter: "drop-shadow(0 0 8px #347ebf66)" }} />
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, color: "#347ebf", letterSpacing: 1 }}>THE WELLS</div>
            </div>
            <div style={{ flex: 1, paddingTop: 8 }}>
              {NAV_ITEMS.map(n => {
                if (n === "First Team") {
                  const isGroupActive = FIRST_TEAM_ITEMS.includes(active);
                  return (
                    <div key={n}>
                      <button className={`nav-btn ${isGroupActive ? "active" : ""}`} onClick={() => setNavGroup(g => g === "firstteam" ? null : "firstteam")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>First Team</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>{navGroup === "firstteam" ? "▲" : "▼"}</span>
                      </button>
                      {(navGroup === "firstteam" || isGroupActive) && FIRST_TEAM_ITEMS.map(sub => (
                        <button key={sub} className={`nav-btn ${active === sub ? "active" : ""}`} onClick={() => { setActive(sub); setMenuOpen(false); }} style={{ paddingLeft: 32, fontSize: 13 }}>{sub}</button>
                      ))}
                    </div>
                  );
                }
                if (n === "Help The Wells") {
                  const isGroupActive = HELP_WELLS_ITEMS.includes(active) || active === "Help The Wells" || active === "Merch";
                  return (
                    <div key={n}>
                      <button className={`nav-btn ${isGroupActive ? "active" : ""}`} onClick={() => setNavGroup(g => g === "helpwells" ? null : "helpwells")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Help The Wells</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>{navGroup === "helpwells" ? "▲" : "▼"}</span>
                      </button>
                      {(navGroup === "helpwells" || isGroupActive) && HELP_WELLS_ITEMS.map(sub => (
                        <button key={sub} className={`nav-btn ${active === sub || (sub === "Fundraising" && active === "Help The Wells") ? "active" : ""}`} onClick={() => { setActive(sub === "Fundraising" ? "Help The Wells" : sub); setMenuOpen(false); }} style={{ paddingLeft: 32, fontSize: 13 }}>{sub}</button>
                      ))}
                    </div>
                  );
                }
                if (n === "Fan Zone") {
                  const isGroupActive = FAN_ZONE_ITEMS.includes(active);
                  return (
                    <div key={n}>
                      <button className={`nav-btn ${isGroupActive ? "active" : ""}`} onClick={() => setNavGroup(g => g === "fanzone" ? null : "fanzone")} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Fan Zone</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>{navGroup === "fanzone" ? "▲" : "▼"}</span>
                      </button>
                      {(navGroup === "fanzone" || isGroupActive) && FAN_ZONE_ITEMS.map(sub => (
                        <button key={sub} className={`nav-btn ${active === sub ? "active" : ""}`} onClick={() => { setActive(sub); setMenuOpen(false); }} style={{ paddingLeft: 32, fontSize: 13 }}>{sub}</button>
                      ))}
                    </div>
                  );
                }
                return <button key={n} className={`nav-btn ${active === n ? "active" : ""}`} onClick={() => { setActive(n); setMenuOpen(false); }}>{n}</button>;
              })}
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid #ffffff0f" }}>
              <button onClick={() => { setMenuOpen(false); setShowLogin(true); }} style={{ background: "#ffffff0a", border: "1px solid #ffffff15", borderRadius: 8, color: "#8899bb", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "8px 16px", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", width: "100%" }}>⚙ ADMIN PANEL</button>
            </div>
          </div>
        </>
      )}

      <div style={{ background: "linear-gradient(135deg, #191740 0%, #0d0c22 100%)", borderBottom: "1px solid #ffffff0f" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 3vw, 14px)", paddingTop: 12, paddingBottom: 12 }}>
            <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
              <span /><span /><span />
            </button>
            <img src={"/logo.png"} alt="HMWFC" onClick={() => setActive("Home")} style={{ height: "clamp(44px, 12vw, 64px)", filter: "drop-shadow(0 0 12px #347ebf66)", cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(13px, 3.8vw, 22px)", fontWeight: 900, letterSpacing: 1, lineHeight: 1.1 }}>HEMSWORTH MINERS WELFARE FC</div>
              <div style={{ fontSize: "clamp(9px, 2.5vw, 11px)", color: "#347ebf", letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>The Wells · Est. 1981</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center", position: "relative" }}>
              {fanUser ? (
                <div style={{ position: "relative" }}>
                  <button onClick={() => setProfileMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #347ebf44", background: "#191740", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {fanProfile?.photo
                      ? <img src={fanProfile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 18 }}>👤</span>}
                  </button>
                  {profileMenuOpen && (
                    <div style={{ position: "absolute", top: 44, right: 0, background: "#191740", border: "1px solid #347ebf33", borderRadius: 10, overflow: "hidden", zIndex: 400, minWidth: 160, boxShadow: "0 8px 30px #00000066" }}>
                      <button onClick={() => { setActive("My Account"); setProfileMenuOpen(false); }} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#aabbcc", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "12px 16px", cursor: "pointer", textAlign: "left" }}>👤 My Account</button>
                      {fanProfile?.passUnlocked && <button onClick={() => { setActive("Wells Season Pass"); setProfileMenuOpen(false); }} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#aabbcc", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "12px 16px", cursor: "pointer", textAlign: "left", borderTop: "1px solid #ffffff0f" }}>🎟️ My Season Pass</button>}
                      <button onClick={() => { signOut(auth); setProfileMenuOpen(false); }} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#ef4444", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "12px 16px", cursor: "pointer", textAlign: "left", borderTop: "1px solid #ffffff0f" }}>Sign out</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowFanLogin(true)} style={{ background: "#ffffff0a", border: "1px solid #ffffff15", borderRadius: 8, color: "#aabbcc", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "6px 12px", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>Sign In</button>
              )}
            </div>

          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px 60px", overflow: "hidden" }}>

        {active === "Home" && (() => {

          const sortedNews = [...(data.news || [])].sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date));
          const latest = sortedNews.length > 0 ? sortedNews[0] : null;
          const sorted = [...data.table].sort((a, b) => a.pos - b.pos);
          const total = sorted.length;
          const getZone = (pos) => {
            if (pos === 1) return "champions";
            if (pos <= 5) return "playoff";
            if (pos >= total - 2) return "relegation";
            return "mid";
          };
          const zoneColor = { champions: "#f59e0b", playoff: "#10b981", relegation: "#ef4444", mid: "#8899bb" };
          const latestResult = data.fixtures && [...data.fixtures].filter(f => f.type === "result").sort((a,b) => (b.id||0) - (a.id||0))[0];
          const getBadge = (teamName, fixture) => {
            if (fixture) {
              if (teamName === fixture.home && fixture.homeBadge) return fixture.homeBadge;
              if (teamName === fixture.away && fixture.awayBadge) return fixture.awayBadge;
            }
            const t = data.table && data.table.find(r => r.team === teamName);
            return t && t.badge ? `data:image/png;base64,${t.badge}` : null;
          };
          const oursBadge = latestResult && getBadge(latestResult.home && latestResult.home.includes("Hemsworth") ? latestResult.home : latestResult.away, latestResult);
          const oppName = latestResult ? (latestResult.home.includes("Hemsworth") ? latestResult.away : latestResult.home) : null;
          const oppBadge = latestResult && getBadge(oppName, latestResult);
          const weWereHome = latestResult && latestResult.home.includes("Hemsworth");
          return (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 24, alignItems: "start" }} className="home-grid">
              <style>{`.home-grid { grid-template-columns: minmax(0,1fr) 340px; } @media(max-width:780px){ @media(max-width:780px){ .home-grid { grid-template-columns: 1fr !important; } } }`}</style>
              {/* Latest news */}
              <div style={{ minWidth: 0 }}>
                {/* Help The Wells strip */}
                {data.draw && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#10b981", textTransform: "uppercase" }}>Help The Wells</div>
                      <button onClick={() => { setActive("Help The Wells"); setDrawOpen(false); }} style={{ background: "none", border: "none", color: "#10b981", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1, cursor: "pointer", padding: 0 }}>VIEW ALL →</button>
                    </div>
                    <div className="home-merch-strip" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, paddingRight: 20, WebkitOverflowScrolling: "touch" }}>
                      {/* Monthly Draw card */}
                      <div onClick={() => { setActive("Help The Wells"); setDrawOpen(true); }} style={{ background: "#191740", border: "1px solid #10b98133", borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0, width: "clamp(120px, 36vw, 150px)", transition: "transform 0.2s" }}>
                        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: "linear-gradient(135deg,#10b98122,#0d0c22)" }}>🎟️</div>
                        <div style={{ padding: "8px 10px 10px" }}>
                          <div style={{ background: "#10b98122", color: "#10b981", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, display: "inline-block", marginBottom: 4, letterSpacing: 1 }}>LIVE</div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, lineHeight: 1.2, marginBottom: 3 }}>Monthly Draw</div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, color: "#10b981" }}>£10/month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Merch strip */}
                {data.merch && data.merch.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#347ebf", textTransform: "uppercase" }}>Club Shop</div>
                      <button onClick={() => setActive("Merch")} style={{ background: "none", border: "none", color: "#347ebf", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 1, cursor: "pointer", padding: 0 }}>VIEW ALL →</button>
                    </div>
                    <div className="home-merch-strip" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, paddingRight: 20, WebkitOverflowScrolling: "touch" }}>
                      {data.merch.map(m => (
                        <div key={m.id} onClick={() => setActive("Merch")} style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0, width: "clamp(90px, 28vw, 110px)", transition: "transform 0.2s" }}>
                          {m.image
                            ? <div style={{ height: 80, background: "#0d0c22", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <img src={m.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                              </div>
                            : <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, background: "#0d0c22" }}>{m.emoji}</div>}
                          <div style={{ padding: "8px 10px 10px" }}>
                            {m.tag && <span style={{ background: "#ef444422", color: "#ef4444", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, display: "block", marginBottom: 4 }}>{m.tag}</span>}
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, lineHeight: 1.2, marginBottom: 3 }}>{m.name}</div>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, color: "#347ebf" }}>{m.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#347ebf", textTransform: "uppercase", marginBottom: 12 }}>Latest News</div>
                {latest ? (
                  <div className="card" style={{ overflow: "hidden", minWidth: 0 }}>
                    {/* Hero image */}
                    {latest.image
                      ? <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                          <img src={latest.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent, #191740)" }} />
                        </div>
                      : <div style={{ background: "linear-gradient(135deg, #191740 0%, #0d0c22 60%, #1a3a5c 100%)", height: 200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative" }}>
                          {latest.emoji}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent, #191740)" }} />
                        </div>
                    }
                    <div style={{ padding: "20px 22px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ background: "#347ebf22", color: "#347ebf", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 4 }}>{latest.tag}</span>
                        <span style={{ color: "#8899bb", fontSize: 11 }}>{latest.date}</span>
                      </div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 26, fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}>{latest.title}</div>
                      <div style={{ fontSize: 14, color: "#aabbcc", lineHeight: 1.7, marginBottom: 16 }}>
                        {(latest.body || "").replace(/<[^>]+>/g, "").slice(0, 180)}{(latest.body || "").replace(/<[^>]+>/g, "").length > 180 ? "..." : ""}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => { setSelectedArticle(latest); setActive("News"); recordView(latest.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ background: "none", border: "1px solid #347ebf55", borderRadius: 7, color: "#347ebf", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "8px 18px", cursor: "pointer", transition: "all 0.2s" }}>
                          Read full story →
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8899bb", fontSize: 13 }}>
                          <span>👍 {likes[latest.id] || 0}</span>
                          <span>👀 {views[latest.id] || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#8899bb", fontSize: 14 }}>No news yet -- add some in the admin panel.</div>
                )}
                {/* Other recent articles */}
                {data.news.length > 1 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#8899bb", textTransform: "uppercase", marginBottom: 12 }}>More News</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {sortedNews.slice(1).map(n => (
                        <div key={n.id} className="card" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "center" }} onClick={() => { setSelectedArticle(n); setActive("News"); recordView(n.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                          <div style={{ fontSize: 28, flexShrink: 0 }}>{n.emoji}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                              <span style={{ background: "#347ebf22", color: "#347ebf", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{n.tag}</span>
                              <span style={{ color: "#8899bb", fontSize: 11 }}>{n.date}</span>
                            </div>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</div>
                          </div>
                          <div style={{ marginLeft: "auto", color: "#347ebf", fontSize: 16, flexShrink: 0 }}>→</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mini league table */}
              <div style={{ minWidth: 0 }}>
                {/* Latest result card */}
                {/* Upcoming fixtures */}
                {(() => {
                  const upcoming = data.fixtures && [...data.fixtures].filter(f => f.type === "upcoming").slice(0, 3);
                  if (!upcoming || upcoming.length === 0) return null;
                  return (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#347ebf", textTransform: "uppercase", marginBottom: 12 }}>Upcoming Fixtures</div>
                      <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, overflow: "hidden" }}>
                        {upcoming.map((f, i) => {
                          const homeBadge = getBadge(f.home, f);
                          const awayBadge = getBadge(f.away, f);
                          const weHome = f.home.includes("Hemsworth");
                          return (
                            <div key={f.id} style={{ padding: "12px 14px", borderBottom: i < upcoming.length - 1 ? "1px solid #ffffff07" : "none" }}>
                              <div style={{ fontSize: 10, color: "#8899bb", marginBottom: 6, letterSpacing: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.date} · {f.time} · {f.venue}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {homeBadge ? <img src={homeBadge} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} /> : <span style={{ fontSize: 14 }}>🛡</span>}
                                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: weHome ? 700 : 400, color: "#fff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{weHome ? "The Wells" : f.home}</span>
                                <span style={{ fontSize: 10, color: "#8899bb", fontWeight: 700, flexShrink: 0 }}>vs</span>
                                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: !weHome ? 700 : 400, color: "#fff", flex: 1, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{!weHome ? "The Wells" : f.away}</span>
                                {awayBadge ? <img src={awayBadge} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} /> : <span style={{ fontSize: 14 }}>🛡</span>}
                              </div>
                            </div>
                          );
                        })}
                        <div style={{ padding: "10px 14px", borderTop: "1px solid #ffffff0f" }}>
                          <button onClick={() => setActive("Fixtures")} style={{ background: "none", border: "none", color: "#347ebf", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: "pointer", padding: 0 }}>VIEW ALL FIXTURES →</button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {latestResult && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#347ebf", textTransform: "uppercase", marginBottom: 12 }}>Latest Result</div>
                    <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, overflow: "hidden" }}>
                      <div style={{ background: "linear-gradient(135deg, #191740, #0d0c22)", padding: "20px 16px 16px" }}>
                        {/* Badges + Score */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                          {/* Home badge -- fixed height name prevents misalignment */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                            {(weWereHome ? oursBadge : oppBadge)
                              ? <img src={weWereHome ? oursBadge : oppBadge} alt="" style={{ width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 2px 8px #00000066)", flexShrink: 0 }} />
                              : <div style={{ width: 56, height: 56, background: "#ffffff0f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🛡</div>}
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, textAlign: "center", color: "#fff", lineHeight: 1.2, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{weWereHome ? "The Wells" : oppName}</div>
                          </div>
                          {/* Score */}
                          <div style={{ textAlign: "center", flexShrink: 0 }}>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>{latestResult.result}</div>
                            {latestResult.halftime && <div style={{ fontSize: 10, color: "#8899bb", marginTop: 4, letterSpacing: 1 }}>HT: {latestResult.halftime}</div>}
                            <div style={{ fontSize: 10, color: "#8899bb", marginTop: 2 }}>{latestResult.date}</div>
                          </div>
                          {/* Away badge */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                            {(!weWereHome ? oursBadge : oppBadge)
                              ? <img src={!weWereHome ? oursBadge : oppBadge} alt="" style={{ width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 2px 8px #00000066)", flexShrink: 0 }} />
                              : <div style={{ width: 56, height: 56, background: "#ffffff0f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🛡</div>}
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, textAlign: "center", color: "#fff", lineHeight: 1.2, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{!weWereHome ? "The Wells" : oppName}</div>
                          </div>
                        </div>
                        {/* Venue */}
                        <div style={{ textAlign: "center", fontSize: 10, color: "#8899bb" }}>📍 {latestResult.venue}</div>
                      </div>
                      {/* Scorers -- split home/away with badge */}
                      {(latestResult.homeScorers || latestResult.awayScorers || latestResult.scorers) && (
                        <div style={{ padding: "12px 16px", borderTop: "1px solid #ffffff0f" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            {/* Home scorers */}
                            <div style={{ flex: 1, textAlign: "right" }}>
                              {((latestResult.homeScorers || latestResult.scorers || "")).split(",").filter(s => s.trim() && (weWereHome ? true : !latestResult.homeScorers)).map((s,i) => {
                                return (
                                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginBottom: 3 }}>
                                    <span style={{ fontSize: 12, color: "#aabbcc" }}>{s.trim()}</span>
                                    <span style={{ fontSize: 12 }}>⚽</span>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Divider */}
                            <div style={{ width: 1, background: "#ffffff0f", alignSelf: "stretch", flexShrink: 0 }} />
                            {/* Away scorers */}
                            <div style={{ flex: 1, textAlign: "left" }}>
                              {((latestResult.awayScorers || "")).split(",").filter(s => s.trim()).map((s,i) => {
                                return (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                                    <span style={{ fontSize: 12 }}>⚽</span>
                                    <span style={{ fontSize: 12, color: "#aabbcc" }}>{s.trim()}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#347ebf", textTransform: "uppercase", marginBottom: 12 }}>League Table</div>
                <div style={{ background: "#191740", borderRadius: 12, overflow: "hidden", border: "1px solid #ffffff0f" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #ffffff0f" }}>
                        <th style={{ width: 3 }}></th>
                        <th style={{ padding: "8px 4px", fontSize: 10, color: "#8899bb", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, textAlign: "left" }}>#</th>
                        <th style={{ padding: "8px 4px", fontSize: 10, color: "#8899bb", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, textAlign: "left" }}></th>
                        <th style={{ padding: "8px 4px", fontSize: 10, color: "#8899bb", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, textAlign: "left" }}>Club</th>
                        <th style={{ padding: "8px 6px", fontSize: 10, color: "#8899bb", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, textAlign: "right" }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((r, idx) => {
                        const zone = getZone(r.pos);
                        const isOurs = r.highlight;
                        const prevZone = idx > 0 ? getZone(sorted[idx-1].pos) : null;
                        const showDivider = prevZone && prevZone !== zone;
                        return (
                          <tr key={r.pos} style={{ background: isOurs ? "#347ebf14" : "transparent", borderTop: showDivider ? "1px solid #ffffff14" : "none" }}>
                            <td style={{ padding: 0, width: 3 }}><div style={{ width: 3, height: 36, background: isOurs ? "#347ebf" : zoneColor[zone], opacity: 0.8 }} /></td>
                            <td style={{ padding: "6px 4px", fontSize: 12, color: isOurs ? "#347ebf" : zoneColor[zone], fontWeight: 700 }}>{r.pos}</td>
                            <td style={{ padding: "6px 4px", width: 24 }}>
                              {r.badge
                                ? <img src={`data:image/png;base64,${r.badge}`} alt="" style={{ width: 20, height: 20, objectFit: "contain", display: "block" }} />
                                : <div style={{ width: 20, height: 20, background: "#ffffff08", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🛡</div>}
                            </td>
                            <td style={{ padding: "6px 4px", fontSize: 12, fontWeight: isOurs ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 0, width: "100%" }}>
                              {isOurs ? "The Wells" : r.team.split(" ").slice(0,2).join(" ")}
                            </td>
                            <td style={{ padding: "6px 6px", fontSize: 12, fontWeight: 700, textAlign: "right" }}>{r.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 12px", borderTop: "1px solid #ffffff0f" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => setActive("Table")} style={{ background: "none", border: "none", color: "#347ebf", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: "pointer", padding: 0 }}>VIEW FULL TABLE →</button>
                      {data.tableUpdatedAt && <span style={{ fontSize: 10, color: "#8899bb66" }}>Updated {new Date(data.tableUpdatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                    </div>
                  </div>
                </div>
                {/* Contact the club */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, letterSpacing: 2, color: "#347ebf", textTransform: "uppercase", marginBottom: 12 }}>Contact the Club</div>
                  <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <a href="mailto:HMWFC_1981@hotmail.com" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#aabbcc" }}>
                      <div style={{ width: 36, height: 36, background: "#347ebf22", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✉️</div>
                      <div><div style={{ fontSize: 11, color: "#8899bb", letterSpacing: 0.5, marginBottom: 1 }}>EMAIL</div><div style={{ fontSize: 13, fontWeight: 600 }}>HMWFC_1981@hotmail.com</div></div>
                    </a>
                    <div style={{ height: 1, background: "#ffffff07" }} />
                    <a href="https://x.com/hemsworthmwfc" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#aabbcc" }}>
                      <div style={{ width: 36, height: 36, background: "#ffffff0f", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff", flexShrink: 0 }}>𝕏</div>
                      <div><div style={{ fontSize: 11, color: "#8899bb", letterSpacing: 0.5, marginBottom: 1 }}>X / TWITTER</div><div style={{ fontSize: 13, fontWeight: 600 }}>@hemsworthmwfc</div></div>
                    </a>
                    <div style={{ height: 1, background: "#ffffff07" }} />
                    <a href="https://instagram.com/hemsworthmwfc" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#aabbcc" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)" }}>📷</div>
                      <div><div style={{ fontSize: 11, color: "#8899bb", letterSpacing: 0.5, marginBottom: 1 }}>INSTAGRAM</div><div style={{ fontSize: 13, fontWeight: 600 }}>@hemsworthmwfc</div></div>
                    </a>
                    <div style={{ height: 1, background: "#ffffff07" }} />
                    <a href="https://facebook.com/search/top?q=Hemsworth+Miners+Welfare+FC" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#aabbcc" }}>
                      <div style={{ width: 36, height: 36, background: "#1877f222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👥</div>
                      <div><div style={{ fontSize: 11, color: "#8899bb", letterSpacing: 0.5, marginBottom: 1 }}>FACEBOOK</div><div style={{ fontSize: 13, fontWeight: 600 }}>Hemsworth Miners Welfare FC</div></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {active === "News" && (
          <div>
            {selectedArticle ? (
              <div>
                <button onClick={() => setSelectedArticle(null)} style={{ ...S.btn, background: "#ffffff11", color: "#aabbcc", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back to News</button>
                <div style={{ maxWidth: 680 }}>
                  {selectedArticle.image
                    ? <img src={selectedArticle.image} alt="" style={{ width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: 12, marginBottom: 24 }} />
                    : <div style={{ background: "linear-gradient(135deg, #191740, #0d0c22)", borderRadius: 12, height: 200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 24 }}>{selectedArticle.emoji}</div>
                  }
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ background: "#347ebf22", color: "#347ebf", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 4 }}>{selectedArticle.tag}</span>
                    <span style={{ color: "#8899bb", fontSize: 12 }}>{selectedArticle.date}</span>
                  </div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, fontWeight: 900, lineHeight: 1.15, marginBottom: 18 }}>{selectedArticle.title}</div>
                  <div style={{ fontSize: 15, color: "#aabbcc", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: selectedArticle.body }} />
                  {/* Like + Share bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid #ffffff0f" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ffffff0f", border: "1px solid #ffffff22", borderRadius: 8, padding: "9px 16px", color: "#aabbcc", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14 }}>
                      👀 <span>{views[selectedArticle.id] || 0}</span>
                    </div>
                    <button
                      onClick={() => handleLike(selectedArticle.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: hasLiked(selectedArticle.id) ? "#347ebf22" : "#ffffff0f",
                        border: `1px solid ${hasLiked(selectedArticle.id) ? "#347ebf" : "#ffffff22"}`,
                        borderRadius: 8, padding: "9px 16px", cursor: hasLiked(selectedArticle.id) ? "default" : "pointer",
                        color: hasLiked(selectedArticle.id) ? "#347ebf" : "#aabbcc",
                        fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14,
                        transition: "all 0.2s"
                      }}>
                      👍 <span>{likes[selectedArticle.id] || 0}</span>
                      {hasLiked(selectedArticle.id) && <span style={{ fontSize: 11, color: "#347ebf" }}>Liked</span>}
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: selectedArticle.title,
                            text: selectedArticle.title,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link copied to clipboard!");
                        }
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#ffffff0f", border: "1px solid #ffffff22",
                        borderRadius: 8, padding: "9px 16px", cursor: "pointer",
                        color: "#aabbcc", fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700, fontSize: 14
                      }}>
                      🔗 Share
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Latest News</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                  {[...(data.news || [])].sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date)).map(n => (
                    <div key={n.id} className="card" onClick={() => { setSelectedArticle(n); recordView(n.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ cursor: "pointer" }}>
                      {n.image
                        ? <img src={n.image} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />
                        : <div style={{ background: "linear-gradient(135deg, #191740, #0d0c22)", padding: "28px 20px 18px", fontSize: 44, textAlign: "center" }}>{n.emoji}</div>
                      }
                      <div style={{ padding: "16px 18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ background: "#347ebf22", color: "#347ebf", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 4 }}>{n.tag}</span>
                          <span style={{ color: "#8899bb", fontSize: 11 }}>{n.date}</span>
                        </div>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{n.title}</div>
                        <div style={{ fontSize: 13, color: "#aabbcc", lineHeight: 1.6 }}>{(n.body || "").replace(/<[^>]+>/g, "").slice(0, 100)}{(n.body || "").replace(/<[^>]+>/g, "").length > 100 ? "..." : ""}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8899bb", fontSize: 12 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>👍 {likes[n.id] || 0}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>👀 {views[n.id] || 0}</span>
                          </div>
                          <div style={{ color: "#347ebf", fontSize: 12, fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif", letterSpacing: 1 }}>READ MORE →</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {active === "Table" && (() => {
          const sorted = [...data.table].sort((a, b) => a.pos - b.pos);
          const total = sorted.length;
          const getZone = (pos) => {
            if (pos === 1) return "champions";
            if (pos <= 5) return "playoff";
            if (pos >= total - 2) return "relegation";
            return "mid";
          };
          const zoneBg = { champions: "#f59e0b0d", playoff: "#10b9810d", relegation: "#ef44440d", mid: "transparent" };
          const zoneLeft = { champions: "#f59e0b", playoff: "#10b981", relegation: "#ef4444", mid: "transparent" };
          return (
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 16 }}>League Table</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                {[{ color: "#f59e0b", label: "Automatic promotion" }, { color: "#10b981", label: "Play-off places" }, { color: "#ef4444", label: "Relegation zone" }].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#aabbcc", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#191740", borderRadius: 12, overflow: "hidden", border: "1px solid #ffffff0f" }}>
                <table>
                  <thead><tr><th style={{ width: 4 }}></th><th>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
                  <tbody>
                    {sorted.map((r, idx) => {
                      const zone = getZone(r.pos);
                      const isOurs = r.highlight;
                      const rowBg = isOurs ? "#347ebf14" : zoneBg[zone];
                      const accentColor = isOurs ? "#347ebf" : zoneLeft[zone];
                      const prevZone = idx > 0 ? getZone(sorted[idx - 1].pos) : null;
                      const showDivider = prevZone && prevZone !== zone && zone !== "mid";
                      return (
                        <tr key={r.pos} style={{ background: rowBg, borderTop: showDivider ? "2px solid #ffffff18" : "none" }}>
                          <td style={{ padding: 0, width: 4 }}><div style={{ width: 4, height: 44, background: accentColor === "transparent" ? "transparent" : accentColor, opacity: 0.85 }} /></td>
                          <td style={{ color: isOurs ? "#347ebf" : zone === "champions" ? "#f59e0b" : zone === "playoff" ? "#10b981" : zone === "relegation" ? "#ef4444" : "#8899bb", fontWeight: 700 }}>{r.pos}</td>
                          <td style={{ fontWeight: isOurs ? 700 : 400 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {r.badge
                                ? <img src={`data:image/png;base64,${r.badge}`} alt="" style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
                                : <div style={{ width: 22, height: 22, background: "#ffffff08", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🛡</div>}
                              {r.team}
                            </div>
                          </td>
                          <td style={{ color: "#aabbcc" }}>{r.p}</td>
                          <td style={{ color: "#10b981" }}>{r.w}</td>
                          <td style={{ color: "#aabbcc" }}>{r.d}</td>
                          <td style={{ color: "#ef4444" }}>{r.l}</td>
                          <td style={{ color: r.gd && r.gd.startsWith("+") ? "#10b981" : "#ef4444" }}>{r.gd}</td>
                          <td style={{ fontWeight: 700 }}>{r.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {data.tableUpdatedAt && <div style={{ marginTop: 10, fontSize: 11, color: "#8899bb66", textAlign: "right" }}>Last updated: {new Date(data.tableUpdatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>}
            </div>
          );
        })()}

        {active === "Fixtures" && (() => {
          const fixtures = data.fixtures || [];
          const filtered = fixtures.filter(f => f.type === fixtureTab);
          const getBadgeForFixture = (f, teamName) => {
            if (f.homeBadge && teamName === f.home) return f.homeBadge;
            if (f.awayBadge && teamName === f.away) return f.awayBadge;
            const t = (data.table || []).find(r => r.team === teamName);
            return t && t.badge ? `data:image/png;base64,${t.badge}` : null;
          };
          return (
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Fixtures & Results</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                <button className={`tab-btn ${fixtureTab === "upcoming" ? "active" : ""}`} onClick={() => setFixtureTab("upcoming")}>Upcoming</button>
                <button className={`tab-btn ${fixtureTab === "result" ? "active" : ""}`} onClick={() => setFixtureTab("result")}>Results</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map(f => {
                  const homeBadge = getBadgeForFixture(f, f.home);
                  const awayBadge = getBadgeForFixture(f, f.away);
                  return (
                    <div key={f.id} className="card" style={{ padding: "14px 16px" }}>
                      {(f.friendly || f.cup) && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          {f.friendly && <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, background: "#f59e0b18", padding: "2px 8px", borderRadius: 4 }}>⭐ Friendly</span>}
                          {f.cup && <span style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1, background: "#8b5cf622", padding: "2px 8px", borderRadius: 4 }}>🏆 {f.cupType || "Cup"}</span>}
                        </div>
                      )}
                      <div className="fixture-card-inner">
                        <div className="fixture-date">{f.date}</div>
                        <div className="fixture-teams">
                          {/* Home */}
                          <div className="fixture-team-home" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
                            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700, textAlign: "right" }}>{f.home}</span>
                            {homeBadge ? <img src={homeBadge} alt="" style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }} /> : <span style={{ fontSize: 18, flexShrink: 0 }}>🛡</span>}
                          </div>
                          {/* Score/Time */}
                          <div className="fixture-score" style={{ flexShrink: 0, textAlign: "center" }}>
                            {f.result
                              ? <div>
                                  <span style={{ display: "block", background: "#347ebf22", border: "1px solid #347ebf44", padding: "4px 12px", borderRadius: 8, fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900, color: "#347ebf", minWidth: 72, textAlign: "center" }}>{f.result}</span>
                                  {f.halftime && <div style={{ fontSize: 10, color: "#8899bb", fontWeight: 700, marginTop: 3 }}>HT {f.halftime}</div>}
                                </div>
                              : <span style={{ background: "#ffffff0f", padding: "4px 12px", borderRadius: 8, fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700, minWidth: 72, display: "inline-block", textAlign: "center" }}>{f.time}</span>}
                          </div>
                          {/* Away */}
                          <div className="fixture-team-away" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-start" }}>
                            {awayBadge ? <img src={awayBadge} alt="" style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }} /> : <span style={{ fontSize: 18, flexShrink: 0 }}>🛡</span>}
                            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700 }}>{f.away}</span>
                          </div>
                        </div>
                        <div className="fixture-venue">📍 {f.venue}</div>
                      </div>
                      {/* Scorers */}
                      {f.type === "result" && (f.homeScorers || f.awayScorers) && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #ffffff07", display: "flex", gap: 8 }}>
                          <div style={{ flex: 1, fontSize: 11, color: "#aabbcc", lineHeight: 1.9, textAlign: "right" }}>
                            {(f.homeScorers || "").split(",").filter(s => s.trim()).map((s,i) => <div key={i}>{s.trim()} ⚽</div>)}
                          </div>
                          <div style={{ width: 72, flexShrink: 0 }} />
                          <div style={{ flex: 1, fontSize: 11, color: "#aabbcc", lineHeight: 1.9, textAlign: "left" }}>
                            {(f.awayScorers || "").split(",").filter(s => s.trim()).map((s,i) => <div key={i}>⚽ {s.trim()}</div>)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filtered.length === 0 && <div style={{ color: "#8899bb", fontSize: 14, padding: 20, textAlign: "center" }}>No {fixtureTab === "upcoming" ? "upcoming fixtures" : "results"} yet.</div>}
              </div>
            </div>
          );
        })()}

        {active === "Squad" && (() => {
          const SORT_OPTIONS = [
            { key: "name", label: "Name" },
            { key: "apps", label: "Apps" },
            { key: "goals", label: "Goals" },
            { key: "cleanSheets", label: "Clean Sheets" },
            { key: "yellowCards", label: "Yellow Cards" },
            { key: "redCards", label: "Red Cards" },
            { key: "motm", label: "MotM" },
          ];
          const squad = data.squad || [];
          const filtered = squadView === "current" ? squad.filter(p => p.playing) : squadView === "past" ? squad.filter(p => !p.playing) : squad;
          // For current season tab, display season stats; for overall, display career totals
          const getStat = (p, key) => {
            if (squadView === "current") {
              const seasonKey = "season" + key.charAt(0).toUpperCase() + key.slice(1);
              return p[seasonKey] !== undefined ? p[seasonKey] : p[key] || 0;
            }
            return p[key] || 0;
          };
          const searchedFiltered = squadSearch.trim() ? filtered.filter(p => p.name.toLowerCase().includes(squadSearch.toLowerCase())) : filtered;
          const totalPlayers = searchedFiltered.length;
          const totalPages = Math.ceil(totalPlayers / SQUAD_PAGE_SIZE);
          const sorted = [...searchedFiltered].sort((a, b) => {
            if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
            return getStat(b, sortBy) - getStat(a, sortBy);
          });
          return (
          <div>
            {/* Player profile modal */}
            {selectedPlayer && (
              <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }} onClick={() => setSelectedPlayer(null)}>
                <div style={{ background: "#191740", borderRadius: 16, width: "100%", maxWidth: 560, overflow: "hidden", boxShadow: "0 20px 60px #00000088", margin: "auto" }} onClick={e => e.stopPropagation()}>
                  {/* Side photo + stats layout */}
                  <div style={{ display: "flex", minHeight: 260 }}>
                    {/* Left -- photo with right-fade and bottom-fade */}
                    <div style={{ width: 160, flexShrink: 0, position: "relative", background: "linear-gradient(160deg,#0d0c22,#191740)", overflow: "hidden" }}>
                      {selectedPlayer.photo
                        ? <img src={selectedPlayer.photo} alt={selectedPlayer.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#347ebf22", border: "2px solid #347ebf44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>👤</div>
                          </div>}
                      {/* Right-side gradient fade */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #191740 100%)" }} />
                      {/* Bottom gradient fade */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom, transparent, #191740)" }} />
                    </div>
                    {/* Right -- name, pos badge, stats */}
                    <div style={{ flex: 1, padding: "18px 18px 18px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                      <div>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, fontWeight: 900, lineHeight: 1.1, marginBottom: 6 }}>{selectedPlayer.name}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ background: `${POS_COLOR[selectedPlayer.pos] || "#8b5cf6"}cc`, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5 }}>{selectedPlayer.pos}</span>
                        <span style={{ background: squadView === "current" ? "#347ebf22" : "#f59e0b22", color: squadView === "current" ? "#347ebf" : "#f59e0b", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 5, letterSpacing: 1 }}>{squadView === "current" ? "THIS SEASON" : "CAREER"}</span>
                      </div>
                      </div>
                      {/* Stat pills */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
                        {[
                          { label: "Apps", value: getStat(selectedPlayer,"apps"), color: "#fff" },
                          { label: "Goals", value: getStat(selectedPlayer,"goals"), color: getStat(selectedPlayer,"goals") > 0 ? "#10b981" : "#fff" },
                          { label: "CS", value: getStat(selectedPlayer,"cleanSheets"), color: getStat(selectedPlayer,"cleanSheets") > 0 ? "#347ebf" : "#fff" },
                          { label: "MotM", value: getStat(selectedPlayer,"motm"), color: getStat(selectedPlayer,"motm") > 0 ? "#f59e0b" : "#fff" },
                          { label: "🟨", value: getStat(selectedPlayer,"yellowCards"), color: getStat(selectedPlayer,"yellowCards") > 0 ? "#f59e0b" : "#fff" },
                          { label: "🟥", value: getStat(selectedPlayer,"redCards"), color: getStat(selectedPlayer,"redCards") > 0 ? "#ef4444" : "#fff" },
                        ].map(s => (
                          <div key={s.label} style={{ background: "#0d0c2288", borderRadius: 8, padding: "8px 6px", textAlign: "center", border: "1px solid #ffffff0f" }}>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 9, color: "#8899bb", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 1 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* About + Close */}
                  <div style={{ padding: "0 18px 20px" }}>
                    {selectedPlayer.about && (
                      <div style={{ background: "#0d0c22", borderRadius: 10, padding: "14px 16px", border: "1px solid #ffffff0f", marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "#347ebf", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>About</div>
                        <div style={{ fontSize: 13, color: "#aabbcc", lineHeight: 1.7 }}>{selectedPlayer.about}</div>
                      </div>
                    )}
                    <button onClick={() => setSelectedPlayer(null)} style={{ ...S.btn, background: "#ffffff0f", color: "#8899bb", width: "100%", fontSize: 12 }}>Close</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 16 }}>First Team</div>
            {/* Tabs + Sort + View Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={`tab-btn ${squadView === "current" ? "active" : ""}`} onClick={() => { setSquadView("current"); setSquadPage(0); }}>Current Squad</button>
                <button className={`tab-btn ${squadView === "past" ? "active" : ""}`} onClick={() => { setSquadView("past"); setSquadPage(0); }}>Past Players</button>
                <button className={`tab-btn ${squadView === "all" ? "active" : ""}`} onClick={() => { setSquadView("all"); setSquadPage(0); }}>Overall</button>
              </div>
              <button onClick={() => { setSquadSearchOpen(o => !o); setSquadSearch(""); }} style={{ background: squadSearchOpen ? "#347ebf22" : "#ffffff0f", border: `1px solid ${squadSearchOpen ? "#347ebf" : "#ffffff15"}`, borderRadius: 8, color: squadSearchOpen ? "#347ebf" : "#aabbcc", padding: "5px 10px", cursor: "pointer", fontSize: 15, lineHeight: 1 }} title="Search players">🔍</button>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <>
                    <span style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1 }}>SORT BY</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "#191740", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", padding: "6px 10px", fontSize: 12, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, cursor: "pointer", outline: "none" }}>
                      {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                  </>
                <div style={{ display: "flex", gap: 4, background: "#191740", borderRadius: 8, padding: 3, border: "1px solid #ffffff0f" }}>
                  <button onClick={() => setSquadDisplayMode("tiles")} style={{ ...S.btn, padding: "5px 12px", background: squadDisplayMode === "tiles" ? "#347ebf" : "none", color: squadDisplayMode === "tiles" ? "#fff" : "#8899bb", fontSize: 12 }}>Tiles</button>
                  <button onClick={() => setSquadDisplayMode("table")} style={{ ...S.btn, padding: "5px 12px", background: squadDisplayMode === "table" ? "#347ebf" : "none", color: squadDisplayMode === "table" ? "#fff" : "#8899bb", fontSize: 12 }}>Table</button>
                </div>
              </div>
            </div>
            {squadSearchOpen && (
              <div style={{ marginBottom: 16 }}>
                <input
                  autoFocus
                  value={squadSearch}
                  onChange={e => setSquadSearch(e.target.value)}
                  placeholder="Search player name..."
                  style={{ width: "100%", background: "#191740", border: "1px solid #347ebf44", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, fontFamily: "Barlow, sans-serif", outline: "none" }}
                />
              </div>
            )}
            {(squadView === "past" || squadView === "all") && (
              <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 14, padding: "8px 12px", background: "#191740", borderRadius: 8, border: "1px solid #ffffff0f" }}>
                📊 Stats shown cover appearances from 2017 to present day
              </div>
            )}
            {squadDisplayMode === "tiles" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14, marginBottom: 8 }}>
                {sorted.slice(squadPage * SQUAD_PAGE_SIZE, (squadPage + 1) * SQUAD_PAGE_SIZE).map(p => (
                  <div key={p.id} onClick={() => setSelectedPlayer(p)} style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }} className="card">
                    {/* Photo */}
                    <div style={{ height: 160, background: "linear-gradient(160deg, #191740, #0d0c22)", position: "relative", overflow: "hidden" }}>
                      {p.photo
                        ? <img src={p.photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#347ebf22", border: "2px solid #347ebf44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
                          </div>}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(transparent, #191740)" }} />
                      <span style={{ position: "absolute", top: 8, right: 8, background: `${POS_COLOR[p.pos] || "#8b5cf6"}cc`, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>{p.pos}</span>
                    </div>
                    {/* Info */}
                    <div style={{ padding: "10px 10px 12px" }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{getStat(p, "apps")}</div>
                          <div style={{ fontSize: 9, color: "#8899bb", letterSpacing: 0.5, textTransform: "uppercase" }}>Apps</div>
                        </div>
                        <div style={{ width: 1, background: "#ffffff0f" }} />
                        {p.pos === "GK"
                          ? <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: "#347ebf" }}>{getStat(p, "cleanSheets")}</div>
                              <div style={{ fontSize: 9, color: "#8899bb", letterSpacing: 0.5, textTransform: "uppercase" }}>CS</div>
                            </div>
                          : <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: getStat(p,"goals") > 0 ? "#10b981" : "#fff" }}>{getStat(p, "goals")}</div>
                              <div style={{ fontSize: 9, color: "#8899bb", letterSpacing: 0.5, textTransform: "uppercase" }}>Goals</div>
                            </div>}
                      </div>
                    </div>
                  </div>
                ))}
                {sorted.length === 0 && <div style={{ color: "#8899bb", fontSize: 14, padding: 20, gridColumn: "1/-1" }}>No players in this view.</div>}
              </div>
            )}
            {squadDisplayMode === "tiles" && totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
                <button onClick={() => { setSquadPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={squadPage === 0} style={{ ...S.btn, background: squadPage === 0 ? "#ffffff08" : "#347ebf22", color: squadPage === 0 ? "#8899bb55" : "#347ebf", padding: "7px 16px" }}>← Prev</button>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8899bb", fontWeight: 700 }}>{squadPage + 1} / {totalPages}</span>
                <button onClick={() => { setSquadPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={squadPage >= totalPages - 1} style={{ ...S.btn, background: squadPage >= totalPages - 1 ? "#ffffff08" : "#347ebf22", color: squadPage >= totalPages - 1 ? "#8899bb55" : "#347ebf", padding: "7px 16px" }}>Next →</button>
              </div>
            )}
            {squadDisplayMode === "table" && <div style={{ background: "#191740", borderRadius: 12, overflow: "hidden", border: "1px solid #ffffff0f", overflowX: "auto" }}>
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Pos</th>
                    <th style={{ cursor: "pointer", color: sortBy === "apps" ? "#347ebf" : "#8899bb" }} onClick={() => setSortBy("apps")}>Apps</th>
                    <th style={{ cursor: "pointer", color: sortBy === "goals" ? "#10b981" : "#8899bb" }} onClick={() => setSortBy("goals")}>Goals</th>
                    <th style={{ cursor: "pointer", color: sortBy === "cleanSheets" ? "#347ebf" : "#8899bb" }} onClick={() => setSortBy("cleanSheets")}>CS</th>
                    <th style={{ cursor: "pointer", color: sortBy === "yellowCards" ? "#f59e0b" : "#8899bb" }} onClick={() => setSortBy("yellowCards")}>🟨</th>
                    <th style={{ cursor: "pointer", color: sortBy === "redCards" ? "#ef4444" : "#8899bb" }} onClick={() => setSortBy("redCards")}>🟥</th>
                    <th style={{ cursor: "pointer", color: sortBy === "motm" ? "#f59e0b" : "#8899bb" }} onClick={() => setSortBy("motm")}>MotM</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(squadPage * SQUAD_PAGE_SIZE, (squadPage + 1) * SQUAD_PAGE_SIZE).map(p => (
                    <tr key={p.id} className="squad-row" style={{ transition: "background 0.15s", cursor: "pointer" }} onClick={() => setSelectedPlayer(p)}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span style={{ background: `${POS_COLOR[p.pos] || "#8b5cf6"}22`, color: POS_COLOR[p.pos] || "#8b5cf6", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>{p.pos}</span></td>
                      <td style={{ color: "#aabbcc" }}>{getStat(p,"apps")}</td>
                      <td style={{ fontWeight: 700, color: getStat(p,"goals") > 10 ? "#f59e0b" : getStat(p,"goals") > 0 ? "#10b981" : "#8899bb" }}>{getStat(p,"goals")}</td>
                      <td style={{ color: getStat(p,"cleanSheets") > 0 ? "#347ebf" : "#8899bb" }}>{getStat(p,"cleanSheets")}</td>
                      <td style={{ color: getStat(p,"yellowCards") > 0 ? "#f59e0b" : "#8899bb" }}>{getStat(p,"yellowCards")}</td>
                      <td style={{ color: getStat(p,"redCards") > 0 ? "#ef4444" : "#8899bb" }}>{getStat(p,"redCards")}</td>
                      <td style={{ fontWeight: 700, color: getStat(p,"motm") > 0 ? "#f59e0b" : "#8899bb" }}>{getStat(p,"motm")}</td>
                    </tr>
                  ))}
                  {sorted.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: "#8899bb", padding: 20 }}>No players in this view.</td></tr>}
                </tbody>
              </table>
            </div>}
            {squadDisplayMode === "table" && <div style={{ marginTop: 10, fontSize: 11, color: "#8899bb" }}>CS = Clean Sheets · MotM = Man of the Match · Tap column headers to sort</div>}
            {squadDisplayMode === "table" && totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16 }}>
                <button onClick={() => { setSquadPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={squadPage === 0} style={{ ...S.btn, background: squadPage === 0 ? "#ffffff08" : "#347ebf22", color: squadPage === 0 ? "#8899bb55" : "#347ebf", padding: "7px 16px" }}>← Prev</button>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8899bb", fontWeight: 700 }}>{squadPage + 1} / {totalPages}</span>
                <button onClick={() => { setSquadPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={squadPage >= totalPages - 1} style={{ ...S.btn, background: squadPage >= totalPages - 1 ? "#ffffff08" : "#347ebf22", color: squadPage >= totalPages - 1 ? "#8899bb55" : "#347ebf", padding: "7px 16px" }}>Next →</button>
              </div>
            )}
          </div>
          );
        })()}

        {active === "Merch" && (
          <div>
            {/* Product detail modal */}
            {selectedMerch && (
              <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => { setSelectedMerch(null); setSelectedSize(""); setQty(1); }}>
                <div style={{ background: "#191740", borderRadius: 16, width: "100%", maxWidth: 460, overflow: "hidden", boxShadow: "0 20px 60px #00000088" }} onClick={e => e.stopPropagation()}>
                  {/* Image */}
                  {selectedMerch.image
                    ? <img src={selectedMerch.image} alt="" style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: "#0d0c22" }} />
                    : <div style={{ height: 160, background: "linear-gradient(135deg,#191740,#0d0c22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>{selectedMerch.emoji}</div>}
                  <div style={{ padding: "20px 24px 28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        {selectedMerch.tag && <span style={{ background: "#ef444422", color: "#ef4444", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>{selectedMerch.tag}</span>}
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, fontWeight: 900, marginTop: 6 }}>{selectedMerch.name}</div>
                      </div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, color: "#347ebf", flexShrink: 0 }}>{selectedMerch.price}</div>
                    </div>
                    {/* Sizes */}
                    {selectedMerch.isClothing && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SELECT SIZE</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {["XXS","XS","S","M","L","XL","XXL","3XL"].filter(sz => ((selectedMerch.sizes || {})[sz] || "available") !== "sold_out").map(sz => {
                            const status = (selectedMerch.sizes || {})[sz] || "available";
                            const soldOut = status === "sold_out";
                            const low = status === "low";
                            const chosen = selectedSize === sz;
                            return (
                              <button key={sz} disabled={soldOut} onClick={() => setSelectedSize(sz)} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, padding: "7px 14px", borderRadius: 8, border: chosen ? "2px solid #347ebf" : "2px solid #ffffff22", background: soldOut ? "#ffffff08" : chosen ? "#347ebf22" : "#ffffff0f", color: soldOut ? "#8899bb55" : low ? "#f59e0b" : "#fff", cursor: soldOut ? "not-allowed" : "pointer", textDecoration: soldOut ? "line-through" : "none", position: "relative" }}>
                                {sz}
                                {low && !soldOut && <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, background: "#f59e0b", borderRadius: "50%", display: "block" }} />}
                              </button>
                            );
                          })}
                        </div>

                      </div>
                    )}
                    {/* Quantity */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>QUANTITY</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #ffffff22", background: "#ffffff0f", color: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{qty}</span>
                        <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #ffffff22", background: "#ffffff0f", color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                      </div>
                    </div>
                    {/* Buy button */}
                    {selectedMerch.soldOut
                      ? <div style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 10, padding: "13px 0", textAlign: "center", color: "#ef4444", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>Sold Out</div>
                      : (() => {
                          const sizeLink = selectedMerch.isClothing && selectedSize ? (selectedMerch.sizeLinks || {})[selectedSize] : null;
                          const link = sizeLink || selectedMerch.stripeLink;
                          const noSize = selectedMerch.isClothing && !selectedSize;
                          const noLink = !noSize && !link;
                          if (noSize) return <div style={{ background: "#ffffff0f", border: "1px solid #ffffff22", borderRadius: 10, padding: "13px 0", textAlign: "center", color: "#8899bb", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14 }}>Select a size to continue</div>;
                          if (noLink) return <div style={{ background: "#ffffff0f", border: "1px solid #ffffff15", borderRadius: 10, padding: "12px 16px", textAlign: "center", color: "#8899bb", fontSize: 13 }}>Payment link coming soon</div>;
                          return <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "linear-gradient(135deg,#347ebf,#1a5f9e)", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 1, padding: "13px 0", borderRadius: 10, textAlign: "center", textDecoration: "none" }}>Buy Now — {selectedMerch.price}</a>;
                        })()}
                    <button onClick={() => { setSelectedMerch(null); setSelectedSize(""); setQty(1); }} style={{ ...S.btn, background: "none", color: "#8899bb", width: "100%", marginTop: 10, fontSize: 12 }}>← Back to shop</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Club Shop</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
              {(data.merch || []).map(m => (
                <div key={m.id} className="merch-card" onClick={() => { setSelectedMerch(m); setSelectedSize(""); setQty(1); }}>
                  {m.image
                    ? <img src={m.image} alt="" style={{ width: "100%", height: 120, objectFit: "contain", borderRadius: 8, marginBottom: 4, background: "#0d0c22", padding: 8 }} />
                    : <div style={{ fontSize: 44 }}>{m.emoji}</div>}
                  {m.tag && <span style={{ background: "#ef444422", color: "#ef4444", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 4 }}>{m.tag}</span>}
                  {m.soldOut && <span style={{ background: "#ef444422", color: "#ef4444", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 4 }}>SOLD OUT</span>}
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700, textAlign: "center" }}>{m.name}</div>
                  {m.isClothing && <div style={{ fontSize: 10, color: "#8899bb", letterSpacing: 0.5 }}>Sizes available</div>}
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900, color: "#347ebf" }}>{m.price}</div>
                  <button className="buy-btn" onClick={e => { e.stopPropagation(); setSelectedMerch(m); setSelectedSize(""); setQty(1); }}>View & Buy</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "Gallery" && (
          <div>
            {selectedAlbum ? (
              <div>
                <button onClick={() => setSelectedAlbum(null)} style={{ ...S.btn, background: "#ffffff11", color: "#aabbcc", marginBottom: 20 }}>← Back to Albums</button>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{selectedAlbum.name}</div>
                {selectedAlbum.date && <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 20 }}>📅 {selectedAlbum.date}</div>}
                {(selectedAlbum.photos || []).length === 0
                  ? <div style={{ color: "#8899bb", fontSize: 14, padding: 20, textAlign: "center" }}>No photos in this album yet.</div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                      {selectedAlbum.photos.map(p => (
                        <div key={p.id} style={{ paddingTop: "75%", position: "relative", borderRadius: 10, overflow: "hidden" }}>
                          <img src={p.src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>}
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 20 }}>Photo Gallery</div>
                {(data.gallery || []).length === 0
                  ? <div style={{ color: "#8899bb", fontSize: 14, padding: 20, textAlign: "center" }}>No albums yet -- check back soon!</div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                      {(data.gallery || []).map(a => (
                        <div key={a.id} className="card" onClick={() => setSelectedAlbum(a)} style={{ cursor: "pointer", overflow: "hidden" }}>
                          {a.cover
                            ? <img src={a.cover} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
                            : <div style={{ height: 140, background: "linear-gradient(135deg,#191740,#0d0c22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📸</div>}
                          <div style={{ padding: "12px 14px 14px" }}>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: "#8899bb", display: "flex", gap: 10 }}>
                              {a.date && <span>📅 {a.date}</span>}
                              <span>📷 {(a.photos || []).length} photo{(a.photos||[]).length !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>}
              </div>
            )}
          </div>
        )}

        {active === "Help The Wells" && (() => {
          const draw = data.draw || {};
          const members = draw.members || [];
          const takenCount = members.filter(m => m.name && m.name.trim()).length;
          const prize = Math.floor((takenCount * 10) / 2);
          const winnerNum = draw.winnerNumber || 0;
          const winnerMember = members.find(m => m.number === winnerNum);
          return (
            <div style={{ padding: "0 0 40px" }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 16 }}>Fundraising 🎟️</div>

              {/* Monthly Draw collapsible card */}
              <div style={{ background: "#191740", border: "1px solid #347ebf33", borderRadius: 14, marginBottom: 16, overflow: "hidden" }}>
                    {/* Header row -- always visible */}
                    <div onClick={() => setDrawOpen(o => !o)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Monthly Draw</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ background: "#347ebf22", border: "1px solid #347ebf44", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#347ebf", fontWeight: 700 }}>£10/month</span>
                          <span style={{ background: "#10b98122", border: "1px solid #10b98144", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#10b981", fontWeight: 700 }}>Prize £{prize}</span>
                          <span style={{ background: "#8b5cf622", border: "1px solid #8b5cf644", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#8b5cf6", fontWeight: 700 }}>{takenCount}/59 taken</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 18, color: "#347ebf", transition: "transform 0.3s", transform: drawOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
                    </div>

                    {/* Join button -- always visible */}
                    {draw.stripeLink && (
                      <div style={{ padding: "0 20px 16px" }}>
                        <a href={draw.stripeLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "linear-gradient(135deg,#347ebf,#1a5f9e)", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 1, padding: "13px 0", borderRadius: 10, textAlign: "center", textDecoration: "none" }}>
                          🎟️ Join The Draw -- £10/month
                        </a>
                      </div>
                    )}

                    {/* Expandable content */}
                    {drawOpen && (
                      <div style={{ borderTop: "1px solid #ffffff0f", padding: "20px" }}>
                        {/* Description */}
                        {draw.description && (
                          <div style={{ fontSize: 13, color: "#8899bb", marginBottom: 20, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: draw.description }} />
                        )}

                        {/* Next draw date */}
                        {draw.nextDrawDate && (
                          <div style={{ background: "#0d0c22", border: "1px solid #ffffff0f", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 20 }}>📅</div>
                            <div>
                              <div style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1 }}>NEXT DRAW</div>
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 900 }}>{draw.nextDrawDate}</div>
                            </div>
                          </div>
                        )}

                        {/* Winner */}
                        {winnerNum > 0 && winnerMember && (
                          <div style={{ background: "linear-gradient(135deg,#f59e0b11,#d9770608)", border: "2px solid #f59e0b66", borderRadius: 12, padding: "18px", marginBottom: 20, textAlign: "center" }}>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, color: "#f59e0b", letterSpacing: 2, marginBottom: 4 }}>{draw.winnerMonth} WINNER</div>
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 8 }}>{winnerMember.name}</div>
                            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", fontSize: 16, fontWeight: 900, color: "#fff" }}>{winnerNum}</div>
                          </div>
                        )}

                        {/* Numbers grid */}
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 900, marginBottom: 12 }}>All Numbers</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))", gap: 6 }}>
                          {members.map(m => {
                            const isWinner = m.number === winnerNum;
                            const isTaken = m.name && m.name.trim();
                            return (
                              <div key={m.number} style={{ background: isWinner ? "linear-gradient(135deg,#f59e0b22,#d9770611)" : isTaken ? "#0d0c22" : "#0d0c2299", border: `1px solid ${isWinner ? "#f59e0b" : isTaken ? "#347ebf33" : "#ffffff08"}`, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: isWinner ? "linear-gradient(135deg,#f59e0b,#d97706)" : isTaken ? "#347ebf22" : "#ffffff08", border: `1px solid ${isWinner ? "#f59e0b" : isTaken ? "#347ebf44" : "#ffffff11"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: isWinner ? "#fff" : isTaken ? "#347ebf" : "#8899bb", margin: "0 auto 5px" }}>{m.number}</div>
                                <div style={{ fontSize: 9, color: isWinner ? "#f59e0b" : isTaken ? "#fff" : "#8899bb", fontWeight: isTaken ? 700 : 400, lineHeight: 1.2, wordBreak: "break-word" }}>{isTaken ? m.name : "Vacant"}</div>
                                {isWinner && <div style={{ fontSize: 8, color: "#f59e0b", fontWeight: 900, marginTop: 2, letterSpacing: 1 }}>WINNER</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
            </div>
          );
        })()}


        {active === "Wells Season Pass" && (() => {
          const sp = seasonPassData || {};
          const trophies = (sp.trophies || []).filter(t => t.active && t.name);
          const unlockedTrophies = fanProfile ? (fanProfile.trophies || {}) : {};
          const unlockedCount = Object.values(unlockedTrophies).filter(Boolean).length;

          // Check-in code entry

          const enterCheckInCode = () => {
            if (!fanUser || !fanProfile?.passUnlocked) return;
            const code = codeInput.trim().toUpperCase();
            if (!code) { setCodeMsg("Please enter a code first."); return; }
            const trophy = trophies.find(t => t.checkInCode && t.checkInCode.trim().toUpperCase() === code);
            if (!trophy) { setCodeMsg("Invalid code — please check and try again."); return; }
            if (unlockedTrophies[trophy.id]) { setCodeMsg("You already have this trophy!"); return; }
            update(ref(db, `users/${fanUser.uid}/trophies`), { [trophy.id]: true });
            setCodeMsg(`🏆 ${trophy.name} unlocked!`);
            setCodeInput("");
          };

          const enterPassCode = () => {
            const code = passInput.trim().toUpperCase();
            const codeRef = ref(db, `hmwfc/passCodes/${code}`);
            onValue(codeRef, (snap) => {
              if (!snap.exists()) { setPassMsg("Invalid code. Please check and try again."); return; }
              const codeData = snap.val();
              if (codeData.used) { setPassMsg("This code has already been used."); return; }
              // Mark code as used and unlock pass
              update(ref(db), {
                [`hmwfc/passCodes/${code}/used`]: true,
                [`hmwfc/passCodes/${code}/usedBy`]: fanUser.uid,
                [`hmwfc/passCodes/${code}/usedAt`]: new Date().toISOString(),
                [`users/${fanUser.uid}/passUnlocked`]: true,
                [`users/${fanUser.uid}/passCode`]: code,
              });
              setPassMsg("✅ Season Pass activated! Welcome to the Fan Zone.");
              setPassInput("");
            }, { onlyOnce: true });
          };

          const updateDisplayName = (name) => {
            if (!fanUser) return;
            update(ref(db, `users/${fanUser.uid}`), { displayName: name });
            setFanProfile(prev => ({ ...prev, displayName: name }));
          };

          return (
            <div style={{ padding: "0 0 40px" }}>
              {/* Banner */}
              {sp.bannerImage && (
                <div style={{ margin: "-28px -20px 24px", marginBottom: 24, overflow: "hidden" }}>
                  <img src={sp.bannerImage} alt="" style={{ width: "100%", display: "block", objectFit: "cover" }} />
                </div>
              )}

              {!fanUser ? (
                /* Not signed in */
                <div>
                  <div style={{ background: "linear-gradient(135deg,#191740,#0d0c22)", border: "1px solid #347ebf33", borderRadius: 14, padding: 24, marginBottom: 24, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Unlock Your Season</div>
                    <div style={{ fontSize: 14, color: "#aabbcc", lineHeight: 1.7, marginBottom: 20 }}>{sp.description || "Purchase a Season Pass and unlock exclusive trophies throughout the season. Visit away grounds, attend events, and complete challenges to earn your badges."}</div>
                    <button onClick={() => setShowFanLogin(true)} style={{ ...S.btn, background: "linear-gradient(135deg,#347ebf,#1a5f9e)", color: "#fff", fontSize: 15, padding: "12px 28px" }}>Sign in with Google to get started</button>
                  </div>
                  <NonPassTrophyGrid trophies={trophies} />
                </div>
              ) : !fanProfile?.passUnlocked ? (
                /* Signed in, no pass */
                <div>
                  <div style={{ background: "linear-gradient(135deg,#191740,#0d0c22)", border: "1px solid #347ebf33", borderRadius: 14, padding: 24, marginBottom: 24, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Unlock Your Season</div>
                    <div style={{ fontSize: 14, color: "#aabbcc", lineHeight: 1.7, marginBottom: 20 }}>{sp.description || "Purchase a Season Pass and unlock exclusive trophies throughout the season. Visit away grounds, attend events, and complete challenges to earn your badges."}</div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      {sp.stripeLink && (
                        <a href={sp.stripeLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 1, padding: "13px 28px", borderRadius: 10, textDecoration: "none" }}>
                          🎟️ Buy Your Season Pass
                        </a>
                      )}
                      <button onClick={() => {}} style={{ ...S.btn, background: "#ffffff11", border: "1px solid #ffffff22", color: "#aabbcc", fontSize: 15, padding: "13px 24px" }}>🔑 Already have a code?</button>
                    </div>
                    <div id="sp-code-input" style={{ marginTop: 20 }}>
                      <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}>
                        <input value={passInput} onChange={e => setPassInput(e.target.value.toUpperCase())} placeholder="Enter code here" style={{ ...S.input, fontFamily: "monospace", letterSpacing: 2, fontSize: 13, textAlign: "center", flex: 1 }} />
                        <button onClick={enterPassCode} style={{ ...S.btn, background: "#347ebf", color: "#fff", flexShrink: 0 }}>Activate</button>
                      </div>
                      {passMsg && <div style={{ marginTop: 10, fontSize: 13, color: passMsg.includes("✅") ? "#10b981" : "#ef4444" }}>{passMsg}</div>}
                    </div>
                  </div>
                  <NonPassTrophyGrid trophies={trophies} />
                </div>
              ) : (
                /* Signed in with pass -- show trophy progress */
                <div>
                  {/* Profile bar */}
                  <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 4 }}>YOUR DISPLAY NAME</div>
                      <input value={fanProfile?.displayName || ""} onChange={e => updateDisplayName(e.target.value)} style={{ ...S.input, fontWeight: 700, fontSize: 15 }} placeholder="Enter your display name" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 32, fontWeight: 900, color: "#f59e0b" }}>{(() => {
                        const ids = Object.keys(unlockedTrophies).filter(k => unlockedTrophies[k]);
                        return ids.reduce((sum, id) => {
                          const t = trophies.find(t => String(t.id) === String(id));
                          return sum + CATEGORY_POINTS[t?.category || "bronze"];
                        }, 0);
                      })()}<span style={{ fontSize: 14, color: "#8899bb", fontWeight: 400, marginLeft: 4 }}>pts</span></div>
                      <div style={{ fontSize: 11, color: "#8899bb" }}>{unlockedCount} of {trophies.length} trophies</div>
                    </div>
                    <button onClick={() => signOut(auth)} style={{ ...S.btn, background: "#ffffff0f", color: "#8899bb", fontSize: 11 }}>Sign out</button>
                  </div>

                  {/* Season locked banner */}
                  {sp.locked !== false && (
                    <div style={{ background: "#ef444411", border: "1px solid #ef444444", borderRadius: 12, padding: "16px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontSize: 28, flexShrink: 0 }}>🔒</div>
                      <div>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 900, color: "#ef4444", marginBottom: 4 }}>Season Not Started Yet</div>
                        <div style={{ fontSize: 13, color: "#aabbcc", lineHeight: 1.6 }}>Trophies will be unlockable once the season begins. Keep an eye out for the announcement!</div>
                      </div>
                    </div>
                  )}
                  {/* Check-in code — only show when season is active */}
                  {sp.locked === false && (
                  <div style={{ background: "#191740", border: "1px solid #347ebf33", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 900, marginBottom: 10 }}>🔓 Enter a Check-In Code</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())} placeholder="Enter your code here" style={{ ...S.input, fontFamily: "monospace", letterSpacing: 2, flex: 1 }} />
                      <button onClick={enterCheckInCode} style={{ ...S.btn, background: "#347ebf", color: "#fff", flexShrink: 0 }}>Unlock</button>
                    </div>
                    {codeMsg && <div style={{ marginTop: 10, fontSize: 13, color: codeMsg.includes("🏆") ? "#f59e0b" : codeMsg.includes("already") ? "#8899bb" : "#ef4444" }}>{codeMsg}</div>}
                  </div>
                  )}

                  {/* Trophy modal */}
                  {selectedTrophy && (() => {
                    const t = selectedTrophy;
                    const cat = TROPHY_CATEGORIES.find(c => c.key === (t.category || "bronze")) || TROPHY_CATEGORIES[0];
                    const isUnlocked = !!unlockedTrophies[t.id];
                    return (
                      <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => { setSelectedTrophy(null); setTrophyCodeMsg(""); setTrophyCodeInput(""); }}>
                        <div style={{ background: "#191740", borderRadius: 16, width: "100%", maxWidth: 400, overflow: "hidden", border: `1px solid ${cat.color}44` }} onClick={e => e.stopPropagation()}>
                          <div style={{ background: isUnlocked ? `${cat.color}18` : "#0d0c22", padding: 24, textAlign: "center" }}>
                            {isUnlocked && t.image
                              ? <img src={t.image} alt="" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 12 }} />
                              : <div style={{ fontSize: 56, marginBottom: 12 }}>{isUnlocked ? t.emoji : (t.category === "hidden" ? "❓" : "🔒")}</div>}
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 900, color: cat.color, marginBottom: 6 }}>{t.name}</div>
                            <span style={{ fontSize: 10, fontWeight: 900, color: cat.color, background: cat.color + "22", padding: "3px 10px", borderRadius: 4, letterSpacing: 1 }}>{cat.label.toUpperCase()} · {cat.points}pts</span>
                          </div>
                          <div style={{ padding: "20px 24px 24px" }}>
                            <div style={{ fontSize: 14, color: "#aabbcc", lineHeight: 1.7, marginBottom: 20 }}>{t.description}</div>
                            {isUnlocked ? (
                              <div style={{ background: "#10b98122", border: "1px solid #10b98144", borderRadius: 10, padding: "12px 16px", textAlign: "center", color: "#10b981", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14 }}>✅ Completed!</div>
                            ) : (t.type || "code") === "evidence" ? (
                              <div>
                                <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 10, lineHeight: 1.6 }}>Upload a photo as proof. The club will review it and update your progress.</div>
                                {(() => {
                                  const myProgress = (fanProfile?.submissions || {})[t.id]?.count || 0;
                                  const threshold = t.threshold || 1;
                                  return (
                                    <div style={{ background: "#0d0c22", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: "#8899bb", marginBottom: 2 }}>YOUR PROGRESS</div>
                                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, fontWeight: 900, color: myProgress >= threshold ? "#10b981" : "#fff" }}>{myProgress} <span style={{ fontSize: 13, color: "#8899bb", fontWeight: 400 }}>/ {threshold}</span></div>
                                      </div>
                                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `conic-gradient(${cat.color} ${Math.min(myProgress/threshold,1)*360}deg, #ffffff0f 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0d0c22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: cat.color }}>{Math.round(Math.min(myProgress/threshold,1)*100)}%</div>
                                      </div>
                                    </div>
                                  );
                                })()}
                                {trophyCodeMsg === "submitted" ? (
                                  <div style={{ background: "#10b98122", border: "1px solid #10b98144", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                                    <div style={{ fontSize: 24, marginBottom: 6 }}>📸</div>
                                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 900, color: "#10b981", marginBottom: 4 }}>Photo Submitted!</div>
                                    <div style={{ fontSize: 12, color: "#8899bb" }}>The club will review your submission and update your progress shortly.</div>
                                  </div>
                                ) : trophyCodeInput ? (
                                  <div>
                                    <img src={trophyCodeInput} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 8, border: "1px solid #347ebf44" }} />
                                    <textarea value={trophyCodeMsg} onChange={e => setTrophyCodeMsg(e.target.value)} placeholder="Add a comment (optional)..." style={{ ...S.input, height: 60, resize: "none", marginBottom: 10 }} />
                                    <div style={{ display: "flex", gap: 8 }}>
                                      <button onClick={() => { setTrophyCodeInput(""); setTrophyCodeMsg(""); }} style={{ ...S.btn, background: "#ffffff0f", color: "#8899bb", flex: 1 }}>Change photo</button>
                                      <button onClick={() => {
                                        const existing = (fanProfile?.submissions || {})[t.id]?.photos || [];
                                        const newPhoto = { url: trophyCodeInput, comment: trophyCodeMsg.trim(), submittedAt: new Date().toISOString(), reviewed: false };
                                        update(ref(db, `users/${fanUser.uid}/submissions/${t.id}`), { photos: [...existing, newPhoto] });
                                        setTrophyCodeMsg("submitted");
                                        setTrophyCodeInput("");
                                      }} style={{ ...S.btn, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", flex: 1 }}>Submit →</button>
                                    </div>
                                  </div>
                                ) : (
                                  <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#191740", border: "1px dashed #347ebf44", borderRadius: 8, padding: 14, cursor: "pointer" }}>
                                    <span style={{ fontSize: 24 }}>📸</span>
                                    <div><div style={{ fontSize: 13, color: "#aabbcc", fontWeight: 600 }}>Tap to choose a photo</div><div style={{ fontSize: 11, color: "#8899bb" }}>JPG or PNG · submit button unlocks once chosen</div></div>
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const canvas = document.createElement("canvas");
                                      const ctx = canvas.getContext("2d");
                                      const img = new Image();
                                      const url = URL.createObjectURL(file);
                                      img.onload = () => {
                                        const MAX = 800;
                                        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
                                        canvas.width = img.width * ratio;
                                        canvas.height = img.height * ratio;
                                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                        setTrophyCodeInput(canvas.toDataURL("image/jpeg", 0.7));
                                        setTrophyCodeMsg("");
                                        URL.revokeObjectURL(url);
                                      };
                                      img.src = url;
                                    }} />
                                  </label>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 10 }}>Enter the check-in code to mark this trophy as complete:</div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                  <input value={trophyCodeInput} onChange={e => setTrophyCodeInput(e.target.value.toUpperCase())} placeholder="Enter code..." style={{ ...S.input, fontFamily: "monospace", letterSpacing: 2, flex: 1 }} />
                                  <button onClick={() => {
                                    const code = trophyCodeInput.trim().toUpperCase();
                                    if (!code) { setTrophyCodeMsg("Please enter a code."); return; }
                                    if (!t.checkInCode || t.checkInCode.trim().toUpperCase() !== code) { setTrophyCodeMsg("Wrong code — try again."); return; }
                                    update(ref(db, `users/${fanUser.uid}/trophies`), { [t.id]: true });
                                    setTrophyCodeMsg("🏆 Trophy unlocked!");
                                    setTrophyCodeInput("");
                                    setTimeout(() => { setSelectedTrophy(null); setTrophyCodeMsg(""); }, 1200);
                                  }} style={{ ...S.btn, background: "#347ebf", color: "#fff", flexShrink: 0 }}>Unlock</button>
                                </div>
                                {trophyCodeMsg && <div style={{ fontSize: 13, color: trophyCodeMsg.includes("🏆") ? "#10b981" : "#ef4444" }}>{trophyCodeMsg}</div>}
                              </div>
                            )}
                            <button onClick={() => { setSelectedTrophy(null); setTrophyCodeMsg(""); setTrophyCodeInput(""); }} style={{ ...S.btn, background: "#ffffff0f", color: "#8899bb", width: "100%", marginTop: 14, fontSize: 12 }}>Close</button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                    <button className={`tab-btn ${trophyTab === "todo" ? "active" : ""}`} onClick={() => setTrophyTab("todo")}>To Do</button>
                    <button className={`tab-btn ${trophyTab === "complete" ? "active" : ""}`} onClick={() => setTrophyTab("complete")}>
                      Complete {Object.values(unlockedTrophies).filter(Boolean).length > 0 && `(${Object.values(unlockedTrophies).filter(Boolean).length})`}
                    </button>
                  </div>

                  {/* Trophy grid — sorted by category, filtered by tab */}
                  {(() => {
                    const categoryOrder = ["bronze","silver","gold","hidden"];
                    const sorted = [...trophies].sort((a, b) => categoryOrder.indexOf(a.category || "bronze") - categoryOrder.indexOf(b.category || "bronze"));
                    const filtered = trophyTab === "todo"
                      ? sorted.filter(t => !unlockedTrophies[t.id])
                      : sorted.filter(t => !!unlockedTrophies[t.id]);
                    if (filtered.length === 0) return (
                      <div style={{ color: "#8899bb", fontSize: 14, padding: 24, textAlign: "center", background: "#191740", borderRadius: 12 }}>
                        {trophyTab === "todo" ? "All trophies complete! 🏆" : "No trophies completed yet — get out there!"}
                      </div>
                    );
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                        {filtered.map(t => {
                          const unlocked = !!unlockedTrophies[t.id];
                          const cat = TROPHY_CATEGORIES.find(c => c.key === (t.category || "bronze")) || TROPHY_CATEGORIES[0];
                          const isHidden = t.category === "hidden";
                          return (
                            <div key={t.id} onClick={() => { if (sp.locked !== false && !unlocked) return; setSelectedTrophy(t); setTrophyCodeInput(""); setTrophyCodeMsg(""); }}
                              style={{ background: unlocked ? `${cat.color}15` : "#191740", border: `2px solid ${unlocked ? cat.color : "#ffffff0f"}`, borderRadius: 12, padding: 14, textAlign: "center", cursor: (sp.locked !== false && !unlocked) ? "default" : "pointer", transition: "all 0.2s" }}>
                              {unlocked && t.image
                                ? <img src={t.image} alt="" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 8 }} />
                                : <div style={{ fontSize: 36, marginBottom: 8 }}>{unlocked ? t.emoji : (isHidden ? "❓" : "🔒")}</div>}
                              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 900, color: unlocked ? cat.color : "#8899bb", marginBottom: 3 }}>{t.name || "???"}</div>
                              <div style={{ fontSize: 10, color: "#8899bb66", lineHeight: 1.3, marginBottom: 6 }}>{t.description}</div>
                              <span style={{ fontSize: 9, fontWeight: 900, color: cat.color, background: cat.color + "22", padding: "2px 6px", borderRadius: 4, letterSpacing: 1 }}>{cat.label.toUpperCase()} · {cat.points}pts</span>
                              {unlocked && <div style={{ fontSize: 9, color: "#10b981", fontWeight: 900, marginTop: 5, letterSpacing: 1 }}>✅ COMPLETE</div>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })()}


        {active === "The Clubhouse" && (() => {
          const clubhouse = data.clubhouse || {};
          const matchday = clubhouse.matchday || {};
          const motm = clubhouse.motm || {};
          const motmPlayers = motm.players || [];

          // Total votes for poll percentages
          const motmVotes = clubhouse.motmVotes || {};
          const totalVotes = Object.values(motmVotes).reduce((s, v) => s + v, 0);

          const submitPrediction = (homeGoals, awayGoals) => {
            if (!fanUser) return;
            update(ref(db, `users/${fanUser.uid}/predictions`), {
              [`match_${matchday.home}_${matchday.away}`]: { home: homeGoals, away: awayGoals, submittedAt: new Date().toISOString() }
            });
            setPredictions(prev => ({ ...prev, [`match_${matchday.home}_${matchday.away}`]: { home: homeGoals, away: awayGoals } }));
          };

          const submitMotmVote = (playerName) => {
            if (!fanUser || motmVote) return;
            update(ref(db, `hmwfc/clubhouse/motmVotes`), { [playerName]: (motmVotes[playerName] || 0) + 1 });
            update(ref(db, `users/${fanUser.uid}`), { motmVote: playerName });
            setMotmVote(playerName);
          };

          const predKey = `match_${matchday.home}_${matchday.away}`;
          const myPred = predictions[predKey];

          return (
            <div style={{ padding: "0 0 40px" }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 6 }}>The Clubhouse 🏠</div>
              <div style={{ fontSize: 13, color: "#8899bb", marginBottom: 28 }}>Home of The Wells fan community</div>

              {/* ── Match Predictions ── */}
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>⚽ Match Predictions</div>
              {matchday.locked ? (
                <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: 24, textAlign: "center", color: "#8899bb", fontSize: 14, marginBottom: 28 }}>
                  🔒 Predictions aren't open yet — check back on matchday!
                </div>
              ) : (
                <div style={{ background: "#191740", border: "1px solid #347ebf33", borderRadius: 12, padding: 20, marginBottom: 28 }}>
                  {/* Teams + badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    {(() => {
                      const homeTeam = (data.table || []).find(t => t.team === matchday.home);
                      const awayTeam = (data.table || []).find(t => t.team === matchday.away);
                      const homeBadge = homeTeam?.badge ? `data:image/png;base64,${homeTeam.badge}` : (matchday.homeBadge || null);
                      const awayBadge = awayTeam?.badge ? `data:image/png;base64,${awayTeam.badge}` : (matchday.awayBadge || null);
                      return (
                        <>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            {homeBadge ? <img src={homeBadge} alt="" style={{ width: 52, height: 52, objectFit: "contain" }} /> : <span style={{ fontSize: 36 }}>🛡</span>}
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, textAlign: "center" }}>{matchday.home || "Home"}</div>
                          </div>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, fontWeight: 900, color: "#8899bb" }}>vs</div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            {awayBadge ? <img src={awayBadge} alt="" style={{ width: 52, height: 52, objectFit: "contain" }} /> : <span style={{ fontSize: 36 }}>🛡</span>}
                            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 900, textAlign: "center" }}>{matchday.away || "Away"}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {!fanUser ? (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: "#8899bb", marginBottom: 12 }}>Sign in to submit your prediction</div>
                      <button onClick={() => setShowFanLogin(true)} style={{ ...S.btn, background: "#347ebf", color: "#fff" }}>Sign In</button>
                    </div>
                  ) : myPred ? (
                    <div>
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 4 }}>✓ Your prediction is locked in</div>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 36, fontWeight: 900, color: "#347ebf" }}>{myPred.home} – {myPred.away}</div>
                      </div>
                      {/* All fans' predictions */}
                      {Object.keys(allPredictions).length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: "#8899bb", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>EVERYONE'S PREDICTIONS</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(allPredictions)
                              .filter(([, v]) => v.predictions?.[predKey])
                              .map(([name, v]) => {
                                const pred = v.predictions[predKey];
                                const homeTeam = (data.table || []).find(t => t.team === matchday.home);
                                const awayTeam = (data.table || []).find(t => t.team === matchday.away);
                                const homeBadge = homeTeam?.badge ? `data:image/png;base64,${homeTeam.badge}` : null;
                                const awayBadge = awayTeam?.badge ? `data:image/png;base64,${awayTeam.badge}` : null;
                                const isMe = name === fanProfile?.displayName;
                                return (
                                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: isMe ? "#347ebf11" : "#0d0c22", borderRadius: 8, border: `1px solid ${isMe ? "#347ebf44" : "#ffffff0f"}` }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#191740", border: "1px solid #ffffff15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {v.photo ? <img src={v.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 14 }}>👤</span>}
                                    </div>
                                    <div style={{ flex: 1, fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: isMe ? 700 : 400, color: isMe ? "#347ebf" : "#fff" }}>{name}{isMe ? " (you)" : ""}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                      {homeBadge && <img src={homeBadge} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />}
                                      <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 900 }}>{pred.home} – {pred.away}</span>
                                      {awayBadge && <img src={awayBadge} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <PredictionForm
                      homeName={matchday.home}
                      awayName={matchday.away}
                      onSubmit={submitPrediction}
                    />
                  )}
                </div>
              )}

              {/* ── Man of the Match ── */}
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>🏅 Man of the Match</div>
              {motm.locked ? (
                <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, fontWeight: 900, marginBottom: 6 }}>Waiting for Match Result</div>
                  <div style={{ fontSize: 13, color: "#8899bb" }}>Voting will open once the match is finished.</div>
                </div>
              ) : (
                <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: 20, marginBottom: 28 }}>
                  {motm.matchTitle && <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 16, textAlign: "center", letterSpacing: 1 }}>{motm.matchTitle.toUpperCase()}</div>}
                  {!fanUser ? (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: "#8899bb", marginBottom: 12 }}>Sign in to vote</div>
                      <button onClick={() => setShowFanLogin(true)} style={{ ...S.btn, background: "#347ebf", color: "#fff" }}>Sign In</button>
                    </div>
                  ) : motmVote ? (
                    /* Show poll results after voting */
                    <div>
                      <div style={{ fontSize: 12, color: "#10b981", marginBottom: 16, textAlign: "center" }}>✓ You voted for {motmVote} · {totalVotes} vote{totalVotes !== 1 ? "s" : ""} total</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[...motmPlayers].sort((a, b) => (motmVotes[b.name] || 0) - (motmVotes[a.name] || 0)).map(p => {
                          const votes = motmVotes[p.name] || 0;
                          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                          const isMyVote = motmVote === p.name;
                          return (
                            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#0d0c22", border: `2px solid ${isMyVote ? "#347ebf" : "#ffffff15"}` }}>
                                {p.photo ? <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 18 }}>👤</span>}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: isMyVote ? 700 : 400, color: isMyVote ? "#347ebf" : "#fff" }}>{p.name}{isMyVote ? " ✓" : ""}</span>
                                  <span style={{ fontSize: 12, color: "#8899bb" }}>{pct}%</span>
                                </div>
                                <div style={{ height: 6, background: "#ffffff0f", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: isMyVote ? "#347ebf" : "#8899bb", borderRadius: 3, transition: "width 0.5s" }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Vote screen — tall vertical player cards */
                    <div>
                      <div style={{ fontSize: 13, color: "#aabbcc", marginBottom: 16, textAlign: "center" }}>Who was your Man of the Match?</div>
                      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
                        {motmPlayers.map(p => {
                          const squadPlayer = (data.squad || []).find(s => s.name === p.name);
                          const photo = squadPlayer?.photo || p.photo || null;
                          return (
                            <button key={p.name} onClick={() => submitMotmVote(p.name)}
                              style={{ background: "#0d0c22", border: "1px solid #ffffff22", borderRadius: 10, cursor: "pointer", textAlign: "center", transition: "all 0.2s", flexShrink: 0, width: 100, overflow: "hidden", padding: 0 }}>
                              <div style={{ height: 140, overflow: "hidden", background: "#191740" }}>
                                {photo
                                  ? <img src={photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👤</div>}
                              </div>
                              <div style={{ padding: "8px 6px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{p.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Leaderboard ── */}
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Season Pass Leaderboard 🏆</div>
              {leaderboard.length === 0 ? (
                <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 12, padding: 24, textAlign: "center", color: "#8899bb", fontSize: 14 }}>No season pass holders yet — be the first!</div>
              ) : (
                <div style={{ background: "#191740", borderRadius: 12, overflow: "hidden", border: "1px solid #ffffff0f" }}>
                  {leaderboard.map((entry, idx) => {
                    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: idx < leaderboard.length - 1 ? "1px solid #ffffff07" : "none", background: idx === 0 ? "#f59e0b0a" : "transparent" }}>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: medal ? 22 : 15, fontWeight: 900, width: 28, textAlign: "center", color: idx < 3 ? "#f59e0b" : "#8899bb", flexShrink: 0 }}>{medal || `${idx + 1}`}</div>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#191740", border: `2px solid ${idx === 0 ? "#f59e0b44" : "#ffffff15"}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {entry.photo ? <img src={entry.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>👤</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</div>
                          <div style={{ fontSize: 11, color: "#8899bb", marginTop: 2 }}>{entry.count} {entry.count === 1 ? "trophy" : "trophies"}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, color: idx === 0 ? "#f59e0b" : idx === 1 ? "#aaaaaa" : idx === 2 ? "#cd7f32" : "#fff", lineHeight: 1 }}>{entry.score}</div>
                          <div style={{ fontSize: 10, color: "#8899bb", letterSpacing: 1 }}>PTS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!fanUser && (
                <div style={{ marginTop: 20, background: "#191740", border: "1px solid #347ebf33", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#8899bb", marginBottom: 14 }}>Sign in and get a Season Pass to appear on the leaderboard</div>
                  <button onClick={() => setShowFanLogin(true)} style={{ ...S.btn, background: "#347ebf", color: "#fff" }}>Sign in with Google</button>
                </div>
              )}
            </div>
          );
        })()}


        {active === "My Account" && (() => {
          if (!fanUser) { setActive("Home"); return null; }
          const updateDisplayName = (name) => {
            update(ref(db, `users/${fanUser.uid}`), { displayName: name });
            setFanProfile(prev => ({ ...prev, displayName: name }));
          };
          const uploadAvatar = (file) => {
            if (!file) return;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
              const SIZE = 200;
              const ratio = Math.min(SIZE / img.width, SIZE / img.height);
              canvas.width = img.width * ratio;
              canvas.height = img.height * ratio;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const photo = canvas.toDataURL("image/jpeg", 0.8);
              URL.revokeObjectURL(url);
              update(ref(db, `users/${fanUser.uid}`), { photo });
              setFanProfile(prev => ({ ...prev, photo }));
            };
            img.src = url;
          };
          return (
            <div style={{ maxWidth: 480, padding: "0 0 40px" }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 24 }}>My Account</div>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
                <label style={{ cursor: "pointer", position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid #347ebf44", background: "#191740", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {fanProfile?.photo
                      ? <img src={fanProfile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 36 }}>👤</span>}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, background: "#347ebf", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>📷</div>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadAvatar(e.target.files[0])} />
                </label>
                <div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900 }}>{fanProfile?.displayName || "Set your name"}</div>
                  <div style={{ fontSize: 12, color: "#8899bb", marginTop: 4 }}>{fanUser.email}</div>
                  {fanProfile?.passUnlocked && <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginTop: 6 }}>✓ Season Pass Active</div>}
                </div>
              </div>

              {/* Display name */}
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Display Name (shown on leaderboard)</label>
                <input
                  style={S.input}
                  value={fanProfile?.displayName || ""}
                  onChange={e => updateDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              {/* Sign out */}
              <button onClick={() => { signOut(auth); setActive("Home"); }} style={{ ...S.btn, background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>Sign out</button>
            </div>
          );
        })()}

        {active === "Download" && (
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Download the App</div>
            <div style={{ fontSize: 14, color: "#8899bb", marginBottom: 28, lineHeight: 1.6 }}>The Wells app works on any phone -- no App Store needed. Follow the steps for your device below.</div>

            {/* iOS */}
            <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ background: "linear-gradient(135deg,#1c1c1e,#2c2c2e)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0f" }}>
                <div style={{ fontSize: 28 }}>🍎</div>
                <div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900 }}>iPhone / iPad</div>
                  <div style={{ fontSize: 11, color: "#8899bb" }}>Safari browser required</div>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { step: "1", icon: "🌐", text: "Open Safari and go to", detail: "hemsworthmwfc.co.uk" },
                  { step: "2", icon: "⬆️", text: "Tap the Share button at the bottom of the screen", detail: "(the box with an arrow pointing up)" },
                  { step: "3", icon: "➕", text: 'Scroll down and tap "Add to Home Screen"', detail: null },
                  { step: "4", icon: "✅", text: 'Tap "Add" in the top right corner', detail: "The app will appear on your home screen with the HMWFC badge" },
                ].map(({ step, icon, text, detail }) => (
                  <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, background: "#347ebf22", border: "1px solid #347ebf44", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 13, color: "#347ebf", flexShrink: 0 }}>{step}</div>
                    <div>
                      <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.4 }}>{icon} {text}</div>
                      {detail && <div style={{ fontSize: 12, color: "#8899bb", marginTop: 3 }}>{detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Android */}
            <div style={{ background: "#191740", border: "1px solid #ffffff0f", borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
              <div style={{ background: "linear-gradient(135deg,#1a2a1a,#1e3a1e)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ffffff0f" }}>
                <div style={{ fontSize: 28 }}>🤖</div>
                <div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 900 }}>Android</div>
                  <div style={{ fontSize: 11, color: "#8899bb" }}>Chrome browser required</div>
                </div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { step: "1", icon: "🌐", text: "Open Chrome and go to", detail: "hemsworthmwfc.co.uk" },
                  { step: "2", icon: "⋮", text: "Tap the three dots menu in the top right corner", detail: null },
                  { step: "3", icon: "➕", text: 'Tap "Add to Home screen" or "Install App"', detail: null },
                  { step: "4", icon: "✅", text: 'Tap "Add" or "Install" to confirm', detail: "The app will appear on your home screen with the HMWFC badge" },
                ].map(({ step, icon, text, detail }) => (
                  <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, background: "#10b98122", border: "1px solid #10b98144", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 13, color: "#10b981", flexShrink: 0 }}>{step}</div>
                    <div>
                      <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.4 }}>{icon} {text}</div>
                      {detail && <div style={{ fontSize: 12, color: "#8899bb", marginTop: 3 }}>{detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div style={{ background: "#191740", border: "1px solid #347ebf33", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <img src={"/logo.png"} alt="HMWFC" style={{ height: 52, filter: "drop-shadow(0 0 10px #347ebf66)", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 900, marginBottom: 3 }}>Once installed it works like a real app</div>
                <div style={{ fontSize: 12, color: "#8899bb", lineHeight: 1.6 }}>Opens full screen with no browser bar · Works offline for cached pages · Always up to date</div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={{ borderTop: "1px solid #ffffff0f", padding: "18px 20px", textAlign: "center", color: "#8899bb", fontSize: 12, letterSpacing: 1 }}>
        © 2026 HEMSWORTH MINERS WELFARE FC · THE WELLS · ALL RIGHTS RESERVED
      </div>

      {/* Pull-to-refresh indicator */}
      {pullY > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 999, pointerEvents: "none" }}>
          <div style={{ marginTop: Math.min(pullY - 20, 50), background: "#191740", border: "1px solid #347ebf44", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, opacity: Math.min(pullY / PULL_THRESHOLD, 1), transition: "opacity 0.1s", boxShadow: "0 4px 20px #00000066" }}>
            {pullY >= PULL_THRESHOLD ? "↻" : "↓"}
          </div>
        </div>
      )}
      {pulling && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 999, pointerEvents: "none" }}>
          <div style={{ marginTop: 30, background: "#191740", border: "1px solid #347ebf", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#347ebf", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, letterSpacing: 1 }}>Refreshing...</div>
        </div>
      )}

      {/* Scroll to top -- Squad page only */}
      {active === "Squad" && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position: "fixed", bottom: 24, right: 20, width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #347ebf, #1a5f9e)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 20px #00000066", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, transition: "transform 0.2s" }}
          aria-label="Scroll to top">
          ↑
        </button>
      )}

      {/* Admin scroll to top -- fixed bottom left */}
      {adminOpen && (
        <button
          onClick={() => { const el = document.querySelector('[data-admin-scroll]'); if (el) el.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ position: "fixed", bottom: 24, left: 20, width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #347ebf, #1a5f9e)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 20px #00000066", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
          aria-label="Scroll to top">
          ↑
        </button>
      )}
    </div>
  );
}

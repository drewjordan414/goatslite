import React, { useEffect, useRef, useState } from "react";
import Window from "./Window";
import "./GuestbookApp.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export default function GuestbookApp({
  minimized,          
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  state,
  onChange,
}) {
  const [name, setName] = useState("Anonymous Goat");
  const [msg, setMsg] = useState("");
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const listRef = useRef(null);

  // initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("loading");
        const r = await fetch(`${API_BASE}/api/guestbook`);
        const data = await r.json();
        if (!cancelled) {
          setEntries(data);
          setStatus("idle");
        }
      } catch (e) {
        if (!cancelled) setStatus("error");
        console.error("Fetch entries failed:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // autoscroll to bottom on new entries
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const handlePost = async (e) => {
    e.preventDefault();
    const text = msg.trim();
    if (!text) return;

    try {
      const r = await fetch(`${API_BASE}/api/guestbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who: name || "Anonymous Goat",
          text,
        }),
      });
      if (!r.ok) throw new Error("Post failed");
      const saved = await r.json();
      setEntries((prev) => [...prev, saved]);
      setMsg("");
    } catch (err) {
      console.error(err);
      alert("Sorry, failed to post your message.");
    }
  };

  const handleClear = () => setMsg("");

  return (
    <Window
      title="Guestbook.exe"
      zIndex={zIndex}
      minimized={minimized}    
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      state={state}
      onChange={onChange}
    >
      <div className="guestbook">
        <div className="gb-menubar">
          <span>File</span><span>Edit</span><span>Format</span><span>Help</span>
          <span className="gb-status">
            {status === "loading" ? "Sync: loading…" :
             status === "error"   ? "Sync: error"    :
             "Sync: API"}
          </span>
        </div>

        <form className="gb-editor" onSubmit={handlePost}>
          <label htmlFor="gb-name">Name:</label>
          <input
            id="gb-name"
            className="gb-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous Goat"
            maxLength={60}
          />

          <label htmlFor="gb-msg">Message:</label>
          <textarea
            id="gb-msg"
            className="gb-textarea"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Leave a message…"
            maxLength={400}
          />
        </form>

        <div className="gb-actions">
          <button className="gb-btn" type="button" onClick={handlePost}>Post</button>
          <button className="gb-btn" type="button" onClick={handleClear}>Clear</button>
        </div>

        <div className="gb-entries" ref={listRef}>
          {entries.map((e) => (
            <div key={e.id} className="gb-entry">
              <div className="meta">
                {e.who} — {new Date(e.createdAt).toLocaleString()}
              </div>
              <div className="text">{e.text}</div>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

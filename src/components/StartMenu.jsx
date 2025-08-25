import React, { useEffect, useRef } from "react";
import "./StartMenu.css";
import galleryIco from "../assets/icons/Book.ico";
import guestbookIco from "../assets/icons/Booksfolder.ico";
import musicIco from "../assets/icons/sound.ico"; // ← your icon

export default function StartMenu({ open, onClose, onLaunch, onAbout, onShutdown }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="sm-overlay" onMouseDown={onClose} onTouchStart={onClose} />

      <div
        className="sm-menu"
        ref={ref}
        role="menu"
        aria-label="Start menu"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="sm-header">Goatslite</div>

        <div className="sm-item" role="menuitem" onClick={() => { onLaunch("gallery"); onClose(); }}>
          <img className="sm-icon" src={galleryIco} alt="" />
          <span>Goat Gallery</span>
        </div>

        <div className="sm-item" role="menuitem" onClick={() => { onLaunch("guestbook"); onClose(); }}>
          <img className="sm-icon" src={guestbookIco} alt="" />
          <span>Guestbook</span>
        </div>

        {/* Goat Jukebox */}
        <div className="sm-item" role="menuitem" onClick={() => { onLaunch("jukebox"); onClose(); }}>
          <img className="sm-icon" src={musicIco} alt="" />
          <span>Goat Jukebox</span>
        </div>

        <div className="sm-sep" />

        <div className="sm-item" role="menuitem" onClick={() => { onAbout?.(); onClose(); }}>
          <span className="sm-icon text-icon" aria-hidden>ℹ️</span>
          <span>About…</span>
        </div>

        <div className="sm-item" role="menuitem" onClick={() => { onShutdown?.(); onClose(); }}>
          <span className="sm-icon text-icon" aria-hidden>⏻</span>
          <span>Shut Down…</span>
        </div>
      </div>
    </>
  );
}

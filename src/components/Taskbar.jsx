import React, { useState, useEffect } from "react";
import "./Taskbar.css";
import StartMenu from "./StartMenu";

/** Blinking Win95-style clock: HH:MM with a blinking colon */
function Clock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000); // tick every second
        return () => clearInterval(id);
    }, []);
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const colon = now.getSeconds() % 2 === 0 ? ":" : " ";
    return <span>{hh}{colon}{mm}</span>;
}

export default function Taskbar({ openApps, minimized, onLaunch, onToggle, onAbout, onShutdown }) {
    const [menuOpen, setMenuOpen] = useState(false);
    // in Taskbar.jsx
    const label = (key) =>
        key === "gallery" ? "Goat Gallery" :
            key === "guestbook" ? "Guestbook" :
                key === "jukebox" ? "Goat Jukebox" :
                    key;


    return (
        <>
            <div className="taskbar">
                <button
                    className={`start-btn ${menuOpen ? "pressed" : ""}`}
                    onClick={() => setMenuOpen((v) => !v)}
                    title="Start"
                >
                    <span className="start-flag">🐐</span>
                    <span className="start-text">Start</span>
                </button>

                <div className="task-list">
                    {Object.keys(openApps).filter((k) => openApps[k]).map((key) => (
                        <button
                            key={key}
                            className={`task-btn ${!minimized[key] ? "active" : ""}`}
                            onClick={() => onToggle(key)}
                            title={label(key)}
                        >
                            <span className="task-label">{label(key)}</span>
                        </button>
                    ))}
                </div>

                <div className="tray">
                    <Clock />
                </div>
            </div>

            <StartMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                onLaunch={(k) => { onLaunch(k); setMenuOpen(false); }}
                onAbout={() => { onAbout?.(); setMenuOpen(false); }}
                onShutdown={() => { onShutdown?.(); setMenuOpen(false); }}
            />
        </>
    );
}

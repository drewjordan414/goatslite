import React, { useEffect, useRef, useState } from "react";
import Window from "./Window";
import "./GoatJukeboxApp.css";

import s1 from "../assets/sounds/screaming-goat.mp3";
import s2 from "../assets/sounds/Goat-baa-sound-effect.mp3"
import s3 from "../assets/sounds/goat-sound-effect-259473.mp3"
import s4 from "../assets/sounds/goat-amazing-sound-effects-12537.mp3"
 


const TRACKS = [
  { id: "t1", title: "01. Majestic Bleet", src: s1, duration: null },
  { id: "t2", title: "02. Gentle Maa", src: s2, duration: null },
  { id: "t3", title: "03. Goat Grunt", src: s3, duration: null },
  { id: "t4", title: "04. Amazing Goat", src: s4, duration: null }
];

export default function GoatJukeboxApp({
  minimized,      // 👈 keep this prop
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  state,          // {x,y,width,height}
  onChange,       // (rect) => void
}) {
  const audioRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.8);

  const t = TRACKS[idx];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime || 0);
    const onLoaded = () => {
      const d = a.duration || 0;
      setDur(d);
      TRACKS[idx].duration = d || null;
    };
    const onEnd = () => setPlaying(false);

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnd);
    };
  }, [idx]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = vol;
  }, [vol]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing, idx]);

  const playIdx = (i) => {
    setIdx(i);
    setCur(0);
    setPlaying(true);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Window
      title="Music.exe"
      zIndex={zIndex}
      minimized={minimized}   
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      state={state}
      onChange={onChange}
      defaultPosition={{ x: 520, y: 80 }}
      defaultSize={{ width: 360, height: 300 }}
    >
      <div className="jukebox">
        {/* Playlist */}
        <div className="w95-list">
          {TRACKS.map((tr, i) => (
            <div
              key={tr.id}
              className={`w95-row ${i === idx ? "selected" : ""}`}
              onDoubleClick={() => playIdx(i)}
              title="Double-click to play"
            >
              {tr.title}
            </div>
          ))}
        </div>

        {/* Right: controls */}
        <div className="right">
          <div className="controls">
            <button
              className="w95-btn"
              title="Previous"
              onClick={() => setIdx((i) => (i > 0 ? i - 1 : i))}
            >
              ◀◀
            </button>
            <button
              className="w95-btn"
              title={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "▮▮" : "▶"}
            </button>
            <button
              className="w95-btn"
              title="Next"
              onClick={() => setIdx((i) => (i < TRACKS.length - 1 ? i + 1 : i))}
            >
              ▶▶
            </button>
          </div>

          <div className="sliders">
            <input
              className="w95-range"
              type="range"
              min={0}
              max={dur || 0}
              step="0.1"
              value={Math.min(cur, dur || 0)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setCur(v);
                const a = audioRef.current;
                if (a) a.currentTime = v;
              }}
            />
            <div className="vol">
              <span title="Volume">🔊</span>
              <input
                className="w95-range"
                type="range"
                min={0}
                max={1}
                step="0.01"
                value={vol}
                onChange={(e) => setVol(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="status">
            <span>{t.title.replace(/^\d+\.\s*/, "")}</span>
            <span>{fmt(cur)} / {fmt(dur)}</span>
          </div>

          <audio ref={audioRef} src={t.src} preload="metadata" />
        </div>
      </div>
    </Window>
  );
}

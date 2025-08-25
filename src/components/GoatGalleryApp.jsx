
import React from "react";
import Window from "./Window";
import "./GoatGalleryApp.css";

import g1 from "../assets/g1.webp";
import g2 from "../assets/g2.webp";
import g3 from "../assets/g3.webp";
import g4 from "../assets/g4.webp";
import lick from "../assets/goat-lick.gif";

export default function GoatGalleryApp({
  minimized,    
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  state,        
  onChange,     
}) {
  return (
    <Window
      title="Goat Gallery.exe"
      zIndex={zIndex}
      minimized={minimized}    
      onClose={onClose}
      onMinimize={onMinimize}
      onFocus={onFocus}
      state={state}
      onChange={onChange}
      defaultPosition={{ x: 160, y: 120 }}
      defaultSize={{ width: 440, height: 380 }}
    >
      <div className="goat-gallery">
        <div className="gg-grid">
          <img src={g1} alt="Goat #1" />
          <img src={g2} alt="Goat #2" />
          <img src={g3} alt="Goat #3" />
          <img src={g4} alt="Goat #4" />
          <img src={lick} alt="Goat being a goof" />
        </div>
      </div>
    </Window>
  );
}


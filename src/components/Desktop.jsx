import React, { useEffect, useState } from "react";
import GoatGalleryApp from "./GoatGalleryApp";
import GuestbookApp from "./GuestbookApp";
import GoatJukeboxApp from "./GoatJukeboxApp";
import Taskbar from "./Taskbar";
import DesktopIcon from "./DesktopIcon";
import ContextMenu from "./ContextMenu";
import "./Desktop.css";

import galleryIco from "../assets/icons/Book.ico";
import guestbookIco from "../assets/icons/Booksfolder.ico";
import musicIco from "../assets/icons/sound.ico";

import wp1 from "../assets/b1.webp";
import wp2 from "../assets/b2.webp";
import wp3 from "../assets/b3.webp";
import wp4 from "../assets/b4.webp";

/* LocalStorage keys */
const POS_KEY = "goatslite:iconPositions";
const SET_KEY = "goatslite:settings";           // { snap:boolean, grid:number, wp:number } (wp === -1 => solid teal)
const WIN_KEY = "goatslite:windowRects:v1";     // { gallery:{x,y,width,height}, ... }

/* Defaults */
const DEFAULT_ICON_POS = {
  gallery:   { x: 12,  y: 12 },
  guestbook: { x: 12,  y: 112 },
  jukebox:   { x: 12,  y: 212 },
};
const DEFAULT_SETTINGS = { snap: false, grid: 24, wp: -1 }; // start with teal
const DEFAULT_WIN_RECTS = {
  gallery:   { x: 160, y: 120, width: 440, height: 380 },
  guestbook: { x:  60, y:  40, width: 700, height: 560 },
  jukebox:   { x: 520, y:  80, width: 360, height: 300 },
};

const WALLPAPERS = [wp1, wp2, wp3, wp4];

export default function Desktop() {
  /* Window management */
  const [open, setOpen] = useState({ gallery: false, guestbook: false, jukebox: false });
  const [minimized, setMinimized] = useState({ gallery: false, guestbook: false, jukebox: false });
  const [z, setZ] = useState({ gallery: 1, guestbook: 2, jukebox: 3 });
  const [nextZ, setNextZ] = useState(4);

  const bringToFront = (app) => {
    setZ((prev) => ({ ...prev, [app]: nextZ }));
    setNextZ((n) => n + 1);
  };
  const launchApp = (app) => {
    setOpen((p) => ({ ...p, [app]: true }));
    setMinimized((p) => ({ ...p, [app]: false }));
    bringToFront(app);
  };
  const closeApp = (app) => setOpen((p) => ({ ...p, [app]: false }));
  const toggleMinimize = (app) => {
    if (!open[app]) return launchApp(app);
    setMinimized((p) => {
      const m = !p[app];
      if (!m) bringToFront(app); // restoring → bring to front
      return { ...p, [app]: m };
    });
  };

  /* Settings (wallpaper + snap-to-grid), persisted */
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SET_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const saveSettings = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(SET_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const snapVal = (v) =>
    settings.snap && settings.grid ? Math.round(v / settings.grid) * settings.grid : v;

  const nextWallpaper = () =>
    saveSettings({ wp: settings.wp === -1 ? 0 : (settings.wp + 1) % WALLPAPERS.length });
  const useTealBackground = () => saveSettings({ wp: -1 });
  const toggleSnap = () => saveSettings({ snap: !settings.snap });

  /* Icon positions (persisted) */
  const [iconPos, setIconPos] = useState(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      return { ...DEFAULT_ICON_POS, ...saved };
    } catch {
      return DEFAULT_ICON_POS;
    }
  });
  const saveIconPos = (next) => {
    setIconPos(next);
    try { localStorage.setItem(POS_KEY, JSON.stringify(next)); } catch {}
  };
  const onIconMove = (id, pos) => setIconPos((prev) => ({ ...prev, [id]: pos }));
  const onIconMoveEnd = (id, pos) => {
    const snapped = { x: snapVal(pos.x), y: snapVal(pos.y) };
    saveIconPos({ ...iconPos, [id]: snapped });
  };

  /* Window rects (persisted) — used by each app's <Window /> */
  const [winRect, setWinRect] = useState(() => {
    try {
      const raw = localStorage.getItem(WIN_KEY);
      return raw ? { ...DEFAULT_WIN_RECTS, ...JSON.parse(raw) } : DEFAULT_WIN_RECTS;
    } catch {
      return DEFAULT_WIN_RECTS;
    }
  });
  const saveWinRect = (app, rect) => {
    setWinRect((prev) => {
      const next = { ...prev, [app]: rect };
      try { localStorage.setItem(WIN_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  /* Keep windows reachable when viewport changes */
  useEffect(() => {
    const clampAll = () => {
      setWinRect((prev) => {
        const vw = window.innerWidth, vh = window.innerHeight, pad = 4;
        const clampRect = (r) => ({
          x: Math.min(Math.max(r.x, pad - (r.width - 60)), vw - pad),
          y: Math.min(Math.max(r.y, pad), vh - 32),
          width: r.width, height: r.height,
        });
        const next = Object.fromEntries(Object.entries(prev).map(([k, r]) => [k, clampRect(r)]));
        try { localStorage.setItem(WIN_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    };
    window.addEventListener("resize", clampAll);
    return () => window.removeEventListener("resize", clampAll);
  }, []);

  /* Desktop context menu */
  const [menu, setMenu] = useState(null); // {x,y} | null
  const openMenu = (e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); };
  const closeMenu = () => setMenu(null);

  const style = settings.wp === -1 ? {} : { backgroundImage: `url(${WALLPAPERS[settings.wp]})` };

  return (
    <div
      className="desktop"
      style={style}
      onContextMenu={openMenu}
      onClick={() => menu && closeMenu()}
    >
      {/* Draggable desktop icons */}
      <DesktopIcon
        id="gallery" icon={galleryIco} label="Goat Gallery.exe"
        pos={iconPos.gallery} onOpen={() => launchApp("gallery")}
        onMove={onIconMove} onMoveEnd={onIconMoveEnd}
      />
      <DesktopIcon
        id="guestbook" icon={guestbookIco} label="Guestbook.exe"
        pos={iconPos.guestbook} onOpen={() => launchApp("guestbook")}
        onMove={onIconMove} onMoveEnd={onIconMoveEnd}
      />
      <DesktopIcon
        id="jukebox" icon={musicIco} label="Music.exe"
        pos={iconPos.jukebox} onOpen={() => launchApp("jukebox")}
        onMove={onIconMove} onMoveEnd={onIconMoveEnd}
      />

      {/* Windows — keep mounted; hide when minimized */}
      {open.gallery && (
        <GoatGalleryApp
          minimized={minimized.gallery}              
          zIndex={z.gallery}
          onFocus={() => bringToFront("gallery")}
          onMinimize={() => toggleMinimize("gallery")}
          onClose={() => closeApp("gallery")}
          state={winRect.gallery}
          onChange={(r) => saveWinRect("gallery", r)}
        />
      )}
      {open.guestbook && (
        <GuestbookApp
          minimized={minimized.guestbook}             
          zIndex={z.guestbook}
          onFocus={() => bringToFront("guestbook")}
          onMinimize={() => toggleMinimize("guestbook")}
          onClose={() => closeApp("guestbook")}
          state={winRect.guestbook}
          onChange={(r) => saveWinRect("guestbook", r)}
        />
      )}
      {open.jukebox && (
        <GoatJukeboxApp
          minimized={minimized.jukebox}             
          zIndex={z.jukebox}
          onFocus={() => bringToFront("jukebox")}
          onMinimize={() => toggleMinimize("jukebox")}
          onClose={() => closeApp("jukebox")}
          state={winRect.jukebox}
          onChange={(r) => saveWinRect("jukebox", r)}
        />
      )}

      <Taskbar
        openApps={open}
        minimized={minimized}
        onLaunch={launchApp}
        onToggle={toggleMinimize}
      />

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={closeMenu}
          items={[
            { label: "Goat wallpaper", onClick: nextWallpaper },
            { label: (settings.wp === -1 ? "✓ " : "") + "Use teal background", onClick: useTealBackground },
            { separator: true },
            { label: (settings.snap ? "✓ " : "") + `Snap to grid (${settings.grid}px)`, onClick: toggleSnap },
          ]}
        />
      )}
    </div>
  );
}

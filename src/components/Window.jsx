import React, { useEffect, useRef } from "react";
import "./Window.css";

/**
 * Props (both styles supported):
 *  - Common:
 *      title, children, onClose, onMinimize, onFocus, zIndex, minimized
 *  - Geometry (EITHER pair works):
 *      state     : { x, y, width, height }
 *      onChange  : (rect) => void
 *      OR
 *      initial   : { x, y, width, height }
 *      onCommit  : (rect) => void
 */
export default function Window({
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex = 1,
  minimized = false,

  // geometry (support both prop styles)
  state,
  onChange,
  initial = { x: 80, y: 60, width: 640, height: 420 },
  onCommit,
}) {
  // Unify prop names so we can support either API
  const geomProp = state ?? initial ?? { x: 80, y: 60, width: 640, height: 420 };
  const commitCb = onChange ?? onCommit;

  const frameRef = useRef(null);
  const stateRef = useRef({ ...geomProp });

  const paint = () => {
    const el = frameRef.current;
    if (!el) return;
    const s = stateRef.current;
    el.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px)`;
    el.style.width = `${Math.round(s.width)}px`;
    el.style.height = `${Math.round(s.height)}px`;
  };

  // Sync external geometry (from Desktop) into our live state, then draw once.
  useEffect(() => {
    stateRef.current = { ...stateRef.current, ...geomProp };
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geomProp.x, geomProp.y, geomProp.width, geomProp.height]);

  // ----- DRAG -----
  const drag = useRef({ active: false, sx: 0, sy: 0, bx: 0, by: 0, raf: 0 });

  const startedInControls = (target) =>
    !!(target?.closest && (target.closest(".window-controls") || target.closest("button.btn")));

  const onDragStart = (e) => {
    if (startedInControls(e.target)) return; // don't begin drag from control buttons

    const pt = "touches" in e ? e.touches[0] : e;
    e.preventDefault();
    onFocus?.(); // ensure Z-order on grab
    drag.current = {
      active: true,
      sx: pt.clientX,
      sy: pt.clientY,
      bx: stateRef.current.x,
      by: stateRef.current.y,
      raf: 0,
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd, { once: true });
    window.addEventListener("touchmove", onDragMove, { passive: false });
    window.addEventListener("touchend", onDragEnd, { once: true });
  };

  const onDragMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const pt = "touches" in e ? e.touches[0] : e;
    e.preventDefault();
    stateRef.current.x = d.bx + (pt.clientX - d.sx);
    stateRef.current.y = d.by + (pt.clientY - d.sy);
    if (!d.raf) d.raf = requestAnimationFrame(() => (d.raf = 0, paint()));
  };

  const onDragEnd = () => {
    const d = drag.current;
    d.active = false;
    if (d.raf) cancelAnimationFrame(d.raf);
    commitCb?.({ ...stateRef.current });
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("touchmove", onDragMove);
  };

  // ----- RESIZE (bottom-right handle) -----
  const rs = useRef({ active: false, sx: 0, sy: 0, bw: 0, bh: 0, raf: 0 });

  const onResizeStart = (e) => {
    const pt = "touches" in e ? e.touches[0] : e;
    e.preventDefault();
    e.stopPropagation();
    rs.current = {
      active: true,
      sx: pt.clientX,
      sy: pt.clientY,
      bw: stateRef.current.width,
      bh: stateRef.current.height,
      raf: 0,
    };
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeEnd, { once: true });
    window.addEventListener("touchmove", onResizeMove, { passive: false });
    window.addEventListener("touchend", onResizeEnd, { once: true });
  };

  const onResizeMove = (e) => {
    const r = rs.current;
    if (!r.active) return;
    const pt = "touches" in e ? e.touches[0] : e;
    e.preventDefault();
    const minW = 320, minH = 200;
    stateRef.current.width  = Math.max(minW, r.bw + (pt.clientX - r.sx));
    stateRef.current.height = Math.max(minH, r.bh + (pt.clientY - r.sy));
    if (!r.raf) r.raf = requestAnimationFrame(() => (r.raf = 0, paint()));
  };

  const onResizeEnd = () => {
    const r = rs.current;
    r.active = false;
    if (r.raf) cancelAnimationFrame(r.raf);
    commitCb?.({ ...stateRef.current });
  };

  // Safety: if component ever unmounts mid-drag/resize, clear listeners
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("touchmove", onDragMove);
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("touchmove", onResizeMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={frameRef}
      className="window"
      style={{
        zIndex,
        // initial paint values to avoid flash
        transform: `translate(${geomProp.x}px, ${geomProp.y}px)`,
        width: geomProp.width,
        height: geomProp.height,
        // hide but keep mounted when minimized (preserves state)
        visibility: minimized ? "hidden" : "visible",
        pointerEvents: minimized ? "none" : "auto",
      }}
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      <div className="title-bar" onMouseDown={onDragStart} onTouchStart={onDragStart}>
        <div className="title">{title}</div>
        <div className="window-controls">
          {/* Fire minimize on mousedown/touchstart so it wins over drag handlers */}
          <button
            className="btn"
            aria-label="Minimize"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onMinimize?.(); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onMinimize?.(); }}
          >
            <span className="glyph">▁</span>
          </button>
          <button
            className="btn close"
            aria-label="Close"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose?.(); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onClose?.(); }}
          >
            <span className="glyph">✕</span>
          </button>
        </div>
      </div>

      <div className="window-body">{children}</div>

      {/* bottom-right grabber */}
      <div className="resize-handle" onMouseDown={onResizeStart} onTouchStart={onResizeStart} />
    </div>
  );
}

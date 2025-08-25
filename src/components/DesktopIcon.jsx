import React, { useRef } from "react";
import "./DesktopIcon.css";

/**
 * Props:
 *  - id: string
 *  - icon: string (url)
 *  - label: string
 *  - pos: { x:number, y:number }
 *  - onOpen: () => void
 *  - onMove: (id, {x,y}) => void
 *  - onMoveEnd: (id, {x,y}) => void
 */
export default function DesktopIcon({ id, icon, label, pos, onOpen, onMove, onMoveEnd }) {
  const ref = useRef(null);
  const drag = useRef(null); // {startX,startY,baseX,baseY,isDragging,mode}

  // keep the icon inside its parent (the .desktop)
  const clamp = (x, y) => {
    const el = ref.current;
    if (!el || !el.parentElement) return { x, y };
    const parent = el.parentElement.getBoundingClientRect();
    const self = el.getBoundingClientRect();
    const pad = 6;
    const maxX = parent.width  - self.width  - pad;
    const maxY = parent.height - self.height - pad;
    return { x: Math.max(pad, Math.min(x, maxX)), y: Math.max(pad, Math.min(y, maxY)) };
  };

  // ----- MOUSE -----
  const onMouseDown = (e) => {
    if (e.button !== 0) return;       // left click only
    e.preventDefault();
    e.stopPropagation();

    drag.current = {
      startX: e.clientX, startY: e.clientY,
      baseX: pos.x, baseY: pos.y,
      isDragging: true, mode: "mouse",
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp, { once: true });
  };

  const onMouseMove = (e) => {
    const s = drag.current;
    if (!s || !s.isDragging || s.mode !== "mouse") return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const { x, y } = clamp(s.baseX + dx, s.baseY + dy);
    onMove?.(id, { x, y });
  };

  const onMouseUp = (e) => {
    const s = drag.current;
    if (!s || s.mode !== "mouse") return;
    window.removeEventListener("mousemove", onMouseMove);

    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const { x, y } = clamp(s.baseX + dx, s.baseY + dy);
    onMoveEnd?.(id, { x, y });
    drag.current = null;
  };

  // ----- TOUCH -----
  const onTouchStart = (e) => {
    const t = e.touches[0]; if (!t) return;
    e.preventDefault(); e.stopPropagation();

    drag.current = {
      startX: t.clientX, startY: t.clientY,
      baseX: pos.x, baseY: pos.y,
      isDragging: true, mode: "touch",
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { once: true });
    window.addEventListener("touchcancel", onTouchEnd, { once: true });
  };

  const onTouchMove = (e) => {
    const s = drag.current; if (!s || !s.isDragging || s.mode !== "touch") return;
    const t = e.touches[0]; if (!t) return;
    const dx = t.clientX - s.startX;
    const dy = t.clientY - s.startY;
    const { x, y } = clamp(s.baseX + dx, s.baseY + dy);
    onMove?.(id, { x, y });
  };

  const onTouchEnd = (e) => {
    const s = drag.current; if (!s || s.mode !== "touch") return;
    window.removeEventListener("touchmove", onTouchMove);

    const last = (e.changedTouches && e.changedTouches[0]) || null;
    const endX = last ? last.clientX : s.startX;
    const endY = last ? last.clientY : s.startY;
    const dx = endX - s.startX;
    const dy = endY - s.startY;
    const { x, y } = clamp(s.baseX + dx, s.baseY + dy);

    onMoveEnd?.(id, { x, y });
    drag.current = null;
  };

  return (
    <div
      ref={ref}
      className="desk-icon"
      style={{ left: pos.x, top: pos.y }}
      role="button"
      aria-label={label}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDoubleClick={(e) => { e.stopPropagation(); onOpen?.(); }}
    >
      <img
        className="desk-icon-img"
        src={icon}
        alt=""
        draggable="false"   /* prevent native ghost-drag */
      />
      <div className="desk-icon-label">{label}</div>
    </div>
  );
}

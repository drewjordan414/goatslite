import React, { useEffect, useRef } from "react";
import "./ContextMenu.css";

export default function ContextMenu({ x, y, items = [], onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current || !ref.current.contains(e.target)) onClose?.();
    };
    const esc = (e) => e.key === "Escape" && onClose?.();

    document.addEventListener("mousedown", close, true);
    document.addEventListener("keydown", esc, true);
    return () => {
      document.removeEventListener("mousedown", close, true);
      document.removeEventListener("keydown", esc, true);
    };
  }, [onClose]);

  return (
    <ul
      ref={ref}
      className="ctx-menu"
      style={{ left: x, top: y }}
      role="menu"
    >
      {items.map((it, i) =>
        it.separator ? (
          <li key={`sep-${i}`} className="sep" />
        ) : (
          <li
            key={it.label}
            className={`item ${it.disabled ? "disabled" : ""}`}
            role="menuitem"
            onClick={() => !it.disabled && (it.onClick?.(), onClose?.())}
          >
            {it.label}
          </li>
        )
      )}
    </ul>
  );
}

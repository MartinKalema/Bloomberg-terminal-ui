"use client";

import { useEffect, useRef } from "react";

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Ensure menu stays within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 22 - 10);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: adjustedX,
        top: adjustedY,
        zIndex: 10000,
        background: "#0a0800",
        border: "1px solid #ffa028",
        boxShadow: "0 2px 12px rgba(0,0,0,0.9)",
        minWidth: "180px",
        padding: "2px 0",
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} style={{ height: "1px", background: "#1a1000", margin: "2px 0" }} />
        ) : (
          <div
            key={i}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            style={{
              padding: "4px 12px",
              cursor: item.disabled ? "default" : "pointer",
              color: item.disabled ? "#3d3020" : "#ffa028",
              fontSize: "9px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) e.currentTarget.style.background = "#1a1000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span style={{ color: "#3d3020", fontSize: "8px", marginLeft: "16px" }}>{item.shortcut}</span>
            )}
          </div>
        )
      )}
    </div>
  );
}

// Helper to get standard Bloomberg context menu items for a ticker
export function getTickerMenuItems(ticker: string, onAction?: (action: string) => void): MenuItem[] {
  const act = (action: string) => () => onAction?.(action);
  return [
    { label: `${ticker} <Equity>`, disabled: true },
    { divider: true, label: "" },
    { label: "DES — Description", shortcut: "DES <GO>", action: act("DES") },
    { label: "GP — Graph", shortcut: "GP <GO>", action: act("GP") },
    { label: "FA — Financial Analysis", shortcut: "FA <GO>", action: act("FA") },
    { label: "ANR — Analyst Recs", shortcut: "ANR <GO>", action: act("ANR") },
    { divider: true, label: "" },
    { label: "Add to Watchlist", shortcut: "MON", action: act("MON") },
    { label: "Set Price Alert", shortcut: "ALRT", action: act("ALRT") },
    { label: "Trade Ticket", shortcut: "TSOX", action: act("TRADE") },
    { divider: true, label: "" },
    { label: "Copy Ticker", action: act("COPY") },
    { label: "Send via IB Chat", action: act("IB") },
  ];
}

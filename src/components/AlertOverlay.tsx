"use client";

import { useState, useEffect, useCallback } from "react";

export interface Alert {
  id: number;
  type: "price" | "volume" | "news";
  ticker: string;
  message: string;
  time: string;
}

const MOCK_ALERTS: Omit<Alert, "id" | "time">[] = [
  { type: "price", ticker: "SPX", message: "SPX crossed above 5,430.00 (+0.25%)" },
  { type: "volume", ticker: "NVDA", message: "NVDA unusual volume: 2.3x avg" },
  { type: "news", ticker: "FED", message: "Williams: Policy is in a good place" },
  { type: "price", ticker: "VIX", message: "VIX dropped below 15.00" },
  { type: "price", ticker: "AAPL", message: "AAPL crossed 50-day MA at $188.50" },
  { type: "volume", ticker: "TSLA", message: "TSLA block trade: 50K shares at $248.60" },
  { type: "news", ticker: "ECB", message: "ECB: Inflation expectations well anchored" },
  { type: "price", ticker: "GLD", message: "Gold up $14 to session high $2,342.80" },
];

export default function AlertOverlay() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const nextIdRef = { current: 1 };

  const addAlert = useCallback(() => {
    const mock = MOCK_ALERTS[Math.floor(Math.random() * MOCK_ALERTS.length)];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    const newAlert: Alert = { ...mock, id: nextIdRef.current++, time };

    setAlerts((prev) => {
      const updated = [...prev, newAlert];
      // Keep max 5 visible
      return updated.slice(-5);
    });

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setDismissed((prev) => new Set(prev).add(newAlert.id));
    }, 8000);
  }, []);

  useEffect(() => {
    // First alert after 5 seconds, then every 15-25 seconds
    const firstTimeout = setTimeout(() => {
      addAlert();
      const interval = setInterval(() => {
        addAlert();
      }, 15000 + Math.random() * 10000);
      return () => clearInterval(interval);
    }, 5000);

    return () => clearTimeout(firstTimeout);
  }, [addAlert]);

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "12px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        pointerEvents: "auto",
      }}
    >
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            background: alert.type === "price" ? "#0a0800" : alert.type === "volume" ? "#00080a" : "#0a0005",
            border: `1px solid ${alert.type === "price" ? "#ffa028" : alert.type === "volume" ? "#0068ff" : "#ff433d"}`,
            borderLeft: `3px solid ${alert.type === "price" ? "#ffa028" : alert.type === "volume" ? "#0068ff" : "#ff433d"}`,
            padding: "6px 10px",
            minWidth: "280px",
            maxWidth: "360px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.8)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: "2px" }}>
            <div className="flex items-center gap-2">
              <span style={{
                color: "#000",
                background: alert.type === "price" ? "#ffa028" : alert.type === "volume" ? "#0068ff" : "#ff433d",
                fontSize: "7px",
                fontWeight: "bold",
                padding: "1px 4px",
                borderRadius: "1px",
              }}>
                {alert.type === "price" ? "PRICE" : alert.type === "volume" ? "VOLUME" : "NEWS"}
              </span>
              <span style={{ color: "#0068ff", fontSize: "9px", fontWeight: "bold" }}>{alert.ticker}</span>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
              style={{ color: "#7a6030", fontSize: "10px", cursor: "pointer", background: "none", border: "none", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
          <div style={{ color: "#ffa028", fontSize: "9px" }}>{alert.message}</div>
          <div style={{ color: "#3d3020", fontSize: "7px", marginTop: "2px" }}>{alert.time} ET</div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface OrderLevel {
  price: number;
  size: number;
  orders: number; // number of orders at this level
}

/* ──────────────────── Initial Data ──────────────────── */

const TICK = 0.25;

const INITIAL_BIDS: OrderLevel[] = [
  { price: 5428.50, size: 3240, orders: 15 },
  { price: 5428.25, size: 2180, orders: 12 },
  { price: 5428.00, size: 4560, orders: 8 },
  { price: 5427.75, size: 1890, orders: 5 },
  { price: 5427.50, size: 2750, orders: 11 },
  { price: 5427.25, size: 1420, orders: 4 },
  { price: 5427.00, size: 3100, orders: 13 },
  { price: 5426.75, size: 980, orders: 7 },
  { price: 5426.50, size: 2340, orders: 10 },
  { price: 5426.25, size: 1670, orders: 6 },
  { price: 5426.00, size: 3450, orders: 14 },
  { price: 5425.75, size: 890, orders: 3 },
  { price: 5425.50, size: 2100, orders: 9 },
  { price: 5425.25, size: 1540, orders: 8 },
  { price: 5425.00, size: 3780, orders: 16 },
];

const INITIAL_ASKS: OrderLevel[] = [
  { price: 5429.00, size: 2890, orders: 14 },
  { price: 5429.25, size: 1950, orders: 8 },
  { price: 5429.50, size: 3780, orders: 12 },
  { price: 5429.75, size: 2100, orders: 6 },
  { price: 5430.00, size: 4230, orders: 17 },
  { price: 5430.25, size: 1670, orders: 5 },
  { price: 5430.50, size: 2540, orders: 11 },
  { price: 5430.75, size: 1120, orders: 4 },
  { price: 5431.00, size: 3090, orders: 13 },
  { price: 5431.25, size: 1540, orders: 7 },
  { price: 5431.50, size: 2870, orders: 10 },
  { price: 5431.75, size: 1250, orders: 9 },
  { price: 5432.00, size: 3650, orders: 15 },
  { price: 5432.25, size: 2280, orders: 8 },
  { price: 5432.50, size: 1980, orders: 6 },
];

/* ──────────────────── Component ──────────────────── */

export default function OrderBookPanel() {
  const NUM_LEVELS = 15;
  const [bids, setBids] = useState<OrderLevel[]>(INITIAL_BIDS);
  const [asks, setAsks] = useState<OrderLevel[]>(INITIAL_ASKS);
  const [flashBids, setFlashBids] = useState<Record<number, "up" | "down">>({});
  const [flashAsks, setFlashAsks] = useState<Record<number, "up" | "down">>({});
  const depthCanvasRef = useRef<HTMLCanvasElement>(null);
  const depthContainerRef = useRef<HTMLDivElement>(null);

  // Derived values
  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const bidTotalVol = bids.reduce((s, b) => s + b.size, 0);
  const askTotalVol = asks.reduce((s, a) => s + a.size, 0);
  const maxSize = Math.max(...bids.map(b => b.size), ...asks.map(a => a.size), 1);

  // Cumulative volumes
  const bidCum: number[] = [];
  let bc = 0;
  for (const b of bids) { bc += b.size; bidCum.push(bc); }
  const askCum: number[] = [];
  let ac = 0;
  for (const a of asks) { ac += a.size; askCum.push(ac); }
  const maxCum = Math.max(bidCum[bidCum.length - 1] || 1, askCum[askCum.length - 1] || 1);

  // Imbalance ratio
  const imbalance = bidTotalVol / (askTotalVol || 1);
  const imbalanceColor = imbalance > 1.2 ? "#4af6c3" : imbalance < 0.8 ? "#ff433d" : "#ffa028";

  // Dynamic updates
  useEffect(() => {
    const iv = setInterval(() => {
      const newFlashB: Record<number, "up" | "down"> = {};
      const newFlashA: Record<number, "up" | "down"> = {};

      setBids(prev => {
        const updated = prev.map((b, i) => {
          if (Math.random() > 0.6) {
            const delta = (Math.random() - 0.45) * 1200;
            const newSize = Math.max(100, Math.floor(b.size + delta));
            newFlashB[i] = newSize > b.size ? "up" : "down";
            return { ...b, size: newSize, orders: Math.max(1, b.orders + (Math.random() > 0.5 ? 1 : -1)) };
          }
          return b;
        });
        return updated;
      });

      setAsks(prev => {
        const updated = prev.map((a, i) => {
          if (Math.random() > 0.6) {
            const delta = (Math.random() - 0.45) * 1200;
            const newSize = Math.max(100, Math.floor(a.size + delta));
            newFlashA[i] = newSize > a.size ? "up" : "down";
            return { ...a, size: newSize, orders: Math.max(1, a.orders + (Math.random() > 0.5 ? 1 : -1)) };
          }
          return a;
        });
        return updated;
      });

      setFlashBids(newFlashB);
      setFlashAsks(newFlashA);

      setTimeout(() => {
        setFlashBids({});
        setFlashAsks({});
      }, 400);
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  // Draw cumulative depth chart
  const drawDepth = useCallback(() => {
    const canvas = depthCanvasRef.current;
    const container = depthContainerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 4, bottom: 14, left: 2, right: 2 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const centerX = pad.left + cw / 2;

    // Grid
    ctx.strokeStyle = "#0a0800";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = "#1a1000";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(centerX, pad.top); ctx.lineTo(centerX, pad.top + ch); ctx.stroke();

    const maxCumLocal = Math.max(bidCum[bidCum.length - 1] || 1, askCum[askCum.length - 1] || 1);

    // Bid depth (left side, growing left from center)
    ctx.beginPath();
    ctx.moveTo(centerX, pad.top + ch);
    for (let i = 0; i < bidCum.length; i++) {
      const x = centerX - (bidCum[i] / maxCumLocal) * (cw / 2);
      const y = pad.top + (i / (bidCum.length - 1 || 1)) * ch;
      if (i === 0) ctx.lineTo(centerX, y);
      ctx.lineTo(x, y);
      if (i < bidCum.length - 1) {
        const ny = pad.top + ((i + 1) / (bidCum.length - 1 || 1)) * ch;
        ctx.lineTo(x, ny);
      }
    }
    ctx.lineTo(centerX - (bidCum[bidCum.length - 1] / maxCumLocal) * (cw / 2), pad.top + ch);
    ctx.lineTo(centerX, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = "rgba(74, 246, 195, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "#4af6c3";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ask depth (right side, growing right from center)
    ctx.beginPath();
    ctx.moveTo(centerX, pad.top + ch);
    for (let i = 0; i < askCum.length; i++) {
      const x = centerX + (askCum[i] / maxCumLocal) * (cw / 2);
      const y = pad.top + (i / (askCum.length - 1 || 1)) * ch;
      if (i === 0) ctx.lineTo(centerX, y);
      ctx.lineTo(x, y);
      if (i < askCum.length - 1) {
        const ny = pad.top + ((i + 1) / (askCum.length - 1 || 1)) * ch;
        ctx.lineTo(x, ny);
      }
    }
    ctx.lineTo(centerX + (askCum[askCum.length - 1] / maxCumLocal) * (cw / 2), pad.top + ch);
    ctx.lineTo(centerX, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 67, 61, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "#ff433d";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#7a6030";
    ctx.font = "8px monospace";
    ctx.textAlign = "left";
    ctx.fillText("BID", pad.left + 2, pad.top + ch + 11);
    ctx.textAlign = "right";
    ctx.fillText("ASK", w - pad.right - 2, pad.top + ch + 11);
    ctx.textAlign = "center";
    ctx.fillText("DEPTH", centerX, pad.top + ch + 11);
  }, [bidCum, askCum]);

  useEffect(() => {
    drawDepth();
    const ro = new ResizeObserver(drawDepth);
    if (depthContainerRef.current) ro.observe(depthContainerRef.current);
    return () => ro.disconnect();
  }, [drawDepth]);

  // Format size with K suffix for large numbers
  const fmtSize = (n: number) => n >= 10000 ? (n / 1000).toFixed(1) + "K" : n.toLocaleString();

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="DEPTH" subtitle="Market Depth" rightLabel="SPX" />

      {/* Summary bar */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          fontSize: "9px", fontFamily: "monospace",
          borderBottom: "1px solid #1a1000",
          background: "#050500", padding: "2px 6px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <span><span style={{ color: "#7a6030" }}>MID:</span><span style={{ color: "#ffa028", fontWeight: "bold" }}>{midPrice.toFixed(2)}</span></span>
          <span><span style={{ color: "#7a6030" }}>SPD:</span><span style={{ color: "#ffa028" }}>{spread.toFixed(2)}</span></span>
        </div>
        <span><span style={{ color: "#7a6030" }}>IM:</span><span style={{ color: imbalanceColor, fontWeight: "bold" }}>{imbalance.toFixed(2)}</span></span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "20px 1fr 54px 6px 54px 1fr 20px",
          fontSize: "9px", fontFamily: "monospace",
          color: "#7a6030", padding: "2px 3px",
          background: "#050500", borderBottom: "1px solid #1a1000",
          flexShrink: 0,
        }}
      >
        <span style={{ textAlign: "center" }}>#</span>
        <span style={{ textAlign: "right", paddingRight: "4px" }}>BID SZ</span>
        <span style={{ textAlign: "right" }}>BID</span>
        <span></span>
        <span>ASK</span>
        <span style={{ paddingLeft: "4px" }}>ASK SZ</span>
        <span style={{ textAlign: "center" }}>#</span>
      </div>

      {/* Order book rows */}
      <div className="flex-1 overflow-hidden min-h-0" style={{ fontSize: "10px", fontFamily: "monospace" }}>
        {Array.from({ length: NUM_LEVELS }).map((_, i) => {
          const bid = bids[i];
          const ask = asks[i];
          if (!bid || !ask) return null;

          const bidBarW = (bid.size / maxSize) * 100;
          const askBarW = (ask.size / maxSize) * 100;
          const bidFlash = flashBids[i];
          const askFlash = flashAsks[i];
          const isBest = i === 0;

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "20px 1fr 54px 6px 54px 1fr 20px",
                padding: "1px 3px",
                borderBottom: "1px solid #060600",
                background: isBest ? "#0a0800" : "transparent",
                lineHeight: "16px",
                height: "16px",
              }}
            >
              {/* Bid order count */}
              <span style={{ color: "#555", textAlign: "center", fontSize: "8px" }}>{bid.orders}</span>

              {/* Bid size with bar */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "4px", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", right: 0, top: 0, bottom: 0,
                  width: `${bidBarW}%`,
                  background: bidFlash === "up" ? "rgba(74,246,195,0.35)" : bidFlash === "down" ? "rgba(255,67,61,0.25)" : "rgba(74,246,195,0.12)",
                  transition: "background 0.3s, width 0.3s",
                }} />
                <span style={{
                  position: "relative", zIndex: 1,
                  color: bidFlash === "up" ? "#7fffcc" : bidFlash === "down" ? "#ff8888" : "#4af6c3",
                  fontWeight: isBest ? "bold" : "normal",
                }}>
                  {fmtSize(bid.size)}
                </span>
              </div>

              {/* Bid price */}
              <span style={{
                textAlign: "right",
                color: isBest ? "#fff" : "#4af6c3",
                fontWeight: isBest ? "bold" : "normal",
              }}>
                {bid.price.toFixed(2)}
              </span>

              {/* Divider */}
              <span style={{ textAlign: "center", color: "#1a1000" }}>│</span>

              {/* Ask price */}
              <span style={{
                color: isBest ? "#fff" : "#ff433d",
                fontWeight: isBest ? "bold" : "normal",
              }}>
                {ask.price.toFixed(2)}
              </span>

              {/* Ask size with bar */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", paddingLeft: "4px", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${askBarW}%`,
                  background: askFlash === "up" ? "rgba(74,246,195,0.35)" : askFlash === "down" ? "rgba(255,67,61,0.25)" : "rgba(255,67,61,0.12)",
                  transition: "background 0.3s, width 0.3s",
                }} />
                <span style={{
                  position: "relative", zIndex: 1,
                  color: askFlash === "up" ? "#7fffcc" : askFlash === "down" ? "#ff8888" : "#ff433d",
                  fontWeight: isBest ? "bold" : "normal",
                }}>
                  {fmtSize(ask.size)}
                </span>
              </div>

              {/* Ask order count */}
              <span style={{ color: "#555", textAlign: "center", fontSize: "8px" }}>{ask.orders}</span>
            </div>
          );
        })}
      </div>

      {/* Spread & VWAP bar */}
      <div
        className="shrink-0"
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "9px", fontFamily: "monospace",
          borderTop: "1px solid #1a1000", background: "#050500",
          padding: "2px 6px",
        }}
      >
        <span>
          <span style={{ color: "#7a6030" }}>SPREAD: </span>
          <span style={{ color: "#ffa028", fontWeight: "bold" }}>{spread.toFixed(2)}</span>
          <span style={{ color: "#7a6030" }}> ({((spread / bestBid) * 100).toFixed(3)}%)</span>
        </span>
        <span>
          <span style={{ color: "#7a6030" }}>VWAP: </span>
          <span style={{ color: "#ffa028" }}>{midPrice.toFixed(2)}</span>
        </span>
      </div>

      {/* Volume summary bar */}
      <div
        className="shrink-0"
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "9px", fontFamily: "monospace",
          borderTop: "1px solid #0a0800", background: "#050500",
          padding: "2px 6px",
        }}
      >
        <span style={{ color: "#4af6c3" }}>BID: {(bidTotalVol / 1000).toFixed(1)}K</span>
        {/* Imbalance bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1, margin: "0 8px" }}>
          <div style={{ flex: imbalance / (imbalance + 1), height: 4, background: "#4af6c3", borderRadius: 1 }} />
          <div style={{ flex: 1 / (imbalance + 1), height: 4, background: "#ff433d", borderRadius: 1 }} />
        </div>
        <span style={{ color: "#ff433d" }}>ASK: {(askTotalVol / 1000).toFixed(1)}K</span>
      </div>

      {/* Cumulative depth chart */}
      <div ref={depthContainerRef} className="shrink-0" style={{ height: "60px", borderTop: "1px solid #1a1000" }}>
        <canvas ref={depthCanvasRef} style={{ display: "block" }} />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ borderTop: "1px solid #1a1000", color: "#7a6030", padding: "2px 6px", fontSize: "9px", fontFamily: "monospace" }}
      >
        <span>L2 DATA</span>
        <span>REAL-TIME</span>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface OptionRow {
  strike: number;
  cBid: number; cAsk: number; cLast: number; cVol: number; cOI: number; cIV: number; cDelta: number;
  pBid: number; pAsk: number; pLast: number; pVol: number; pOI: number; pIV: number; pDelta: number;
}

/* ──────────────────── Static Data ──────────────────── */

const CURRENT_PRICE = 5428.00;
const ATM_STRIKE = 5425;

const EXPIRATIONS = [
  { label: "Apr 18", dte: 13, date: "04/18/26" },
  { label: "May 16", dte: 41, date: "05/16/26" },
  { label: "Jun 20", dte: 76, date: "06/20/26" },
  { label: "Jul 18", dte: 104, date: "07/18/26" },
];

// Static initial data to avoid SSR hydration mismatch
const INITIAL_ROWS: OptionRow[] = [
  { strike: 5325, cBid: 108.50, cAsk: 109.75, cLast: 109.10, cVol: 1245, cOI: 18420, cIV: 18.2, cDelta: 0.82, pBid: 3.20, pAsk: 3.75, pLast: 3.50, pVol: 2180, pOI: 25300, pIV: 19.5, pDelta: -0.18 },
  { strike: 5350, cBid: 85.25, cAsk: 86.50, cLast: 85.80, cVol: 1890, cOI: 22150, cIV: 17.8, cDelta: 0.76, pBid: 6.50, pAsk: 7.25, pLast: 6.90, pVol: 3240, pOI: 31200, pIV: 19.1, pDelta: -0.24 },
  { strike: 5375, cBid: 63.75, cAsk: 64.80, cLast: 64.20, cVol: 2650, cOI: 28900, cIV: 17.4, cDelta: 0.68, pBid: 11.80, pAsk: 12.50, pLast: 12.10, pVol: 4120, pOI: 35800, pIV: 18.6, pDelta: -0.32 },
  { strike: 5400, cBid: 44.50, cAsk: 45.40, cLast: 44.90, cVol: 4380, cOI: 42100, cIV: 16.9, cDelta: 0.59, pBid: 19.20, pAsk: 20.10, pLast: 19.60, pVol: 5670, pOI: 48500, pIV: 18.2, pDelta: -0.41 },
  { strike: 5425, cBid: 28.80, cAsk: 29.60, cLast: 29.15, cVol: 8920, cOI: 65400, cIV: 16.5, cDelta: 0.51, pBid: 28.50, pAsk: 29.30, pLast: 28.85, pVol: 8450, pOI: 62800, pIV: 17.8, pDelta: -0.49 },
  { strike: 5450, cBid: 17.20, cAsk: 17.90, cLast: 17.50, cVol: 7650, cOI: 58200, cIV: 16.2, cDelta: 0.42, pBid: 40.80, pAsk: 41.60, pLast: 41.20, pVol: 6320, pOI: 51600, pIV: 17.5, pDelta: -0.58 },
  { strike: 5475, cBid: 9.40, cAsk: 10.00, cLast: 9.70, cVol: 5430, cOI: 44300, cIV: 15.9, cDelta: 0.32, pBid: 55.80, pAsk: 56.70, pLast: 56.20, pVol: 4210, pOI: 38900, pIV: 17.2, pDelta: -0.68 },
  { strike: 5500, cBid: 4.60, cAsk: 5.10, cLast: 4.85, cVol: 3870, cOI: 38600, cIV: 15.7, cDelta: 0.22, pBid: 74.20, pAsk: 75.30, pLast: 74.70, pVol: 2890, pOI: 32400, pIV: 17.0, pDelta: -0.78 },
  { strike: 5525, cBid: 2.10, cAsk: 2.50, cLast: 2.30, cVol: 2150, cOI: 29800, cIV: 15.5, cDelta: 0.14, pBid: 95.50, pAsk: 96.80, pLast: 96.10, pVol: 1540, pOI: 21500, pIV: 16.8, pDelta: -0.86 },
  { strike: 5550, cBid: 0.85, cAsk: 1.15, cLast: 1.00, cVol: 1280, cOI: 22100, cIV: 15.3, cDelta: 0.08, pBid: 119.40, pAsk: 121.00, pLast: 120.20, pVol: 890, pOI: 15800, pIV: 16.6, pDelta: -0.92 },
];

/* ──────────────────── Component ──────────────────── */

export default function OptionsPanel() {
  const [activeExp, setActiveExp] = useState(0);
  const [rows, setRows] = useState<OptionRow[]>(INITIAL_ROWS);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);

  // Live-update option prices
  useEffect(() => {
    const iv = setInterval(() => {
      setRows(prev => prev.map(r => {
        if (Math.random() > 0.5) return r;
        const jitter = () => (Math.random() - 0.48) * 2;
        return {
          ...r,
          cBid: Math.max(0.05, r.cBid + jitter()),
          cAsk: Math.max(0.10, r.cAsk + jitter()),
          cLast: Math.max(0.05, r.cLast + jitter()),
          cVol: r.cVol + Math.floor(Math.random() * 50),
          pBid: Math.max(0.05, r.pBid + jitter()),
          pAsk: Math.max(0.10, r.pAsk + jitter()),
          pLast: Math.max(0.05, r.pLast + jitter()),
          pVol: r.pVol + Math.floor(Math.random() * 50),
        };
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const exp = EXPIRATIONS[activeExp];
  const fmtK = (n: number) => n >= 10000 ? (n / 1000).toFixed(0) + "K" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

  // Put/Call volume ratio
  const totalCVol = rows.reduce((s, r) => s + r.cVol, 0);
  const totalPVol = rows.reduce((s, r) => s + r.pVol, 0);
  const pcRatio = totalPVol / (totalCVol || 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="OMON" subtitle="Option Monitor" rightLabel="OPT" />

      {/* Expiration tabs + info bar */}
      <div style={{
        display: "flex", alignItems: "center", fontSize: "9px",
        borderBottom: "1px solid #1a1000", background: "#050500",
        padding: "1px 6px", flexShrink: 0, gap: "2px",
      }}>
        {EXPIRATIONS.map((e, i) => (
          <button
            key={i}
            onClick={() => setActiveExp(i)}
            style={{
              color: activeExp === i ? "#000" : "#7a6030",
              background: activeExp === i ? "#ffa028" : "transparent",
              border: "none", cursor: "pointer", fontFamily: "monospace",
              fontSize: "9px", padding: "1px 6px", fontWeight: activeExp === i ? "bold" : "normal",
            }}
          >
            {e.label}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ color: "#7a6030" }}>DTE:</span>
        <span style={{ color: "#ffa028", fontWeight: "bold", marginLeft: "2px" }}>{exp.dte}</span>
        <span style={{ color: "#7a6030", marginLeft: "8px" }}>EXP:</span>
        <span style={{ color: "#fff", marginLeft: "2px" }}>{exp.date}</span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "30px 38px 38px 38px 32px 36px 30px 44px 30px 36px 32px 38px 38px 38px 30px",
        fontSize: "8px", padding: "2px 3px", gap: "0 1px",
        borderBottom: "1px solid #ffa028", background: "#050500", flexShrink: 0,
        color: "#7a6030",
      }}>
        {/* Call side */}
        <span style={{ textAlign: "center" }}>Δ</span>
        <span style={{ textAlign: "right" }}>BID</span>
        <span style={{ textAlign: "right" }}>ASK</span>
        <span style={{ textAlign: "right" }}>LAST</span>
        <span style={{ textAlign: "right" }}>VOL</span>
        <span style={{ textAlign: "right" }}>OI</span>
        <span style={{ textAlign: "right" }}>IV</span>
        {/* Strike */}
        <span style={{ textAlign: "center", color: "#ffa028", fontWeight: "bold" }}>STRIKE</span>
        {/* Put side */}
        <span style={{ textAlign: "right" }}>IV</span>
        <span style={{ textAlign: "right" }}>OI</span>
        <span style={{ textAlign: "right" }}>VOL</span>
        <span style={{ textAlign: "right" }}>LAST</span>
        <span style={{ textAlign: "right" }}>BID</span>
        <span style={{ textAlign: "right" }}>ASK</span>
        <span style={{ textAlign: "center" }}>Δ</span>
      </div>

      {/* CALLS label + PUTS label */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 44px 1fr",
        fontSize: "8px", padding: "1px 3px", flexShrink: 0,
        borderBottom: "1px solid #0a0800", background: "#030300",
      }}>
        <span style={{ textAlign: "center", color: "#4af6c3", fontWeight: "bold" }}>— CALLS —</span>
        <span />
        <span style={{ textAlign: "center", color: "#ff433d", fontWeight: "bold" }}>— PUTS —</span>
      </div>

      {/* Option chain rows */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {rows.map(r => {
          const isATM = r.strike === ATM_STRIKE;
          const isITMCall = r.strike < CURRENT_PRICE;
          const isITMPut = r.strike > CURRENT_PRICE;
          const isSelected = selectedStrike === r.strike;

          return (
            <div
              key={r.strike}
              onClick={() => setSelectedStrike(isSelected ? null : r.strike)}
              style={{
                display: "grid",
                gridTemplateColumns: "30px 38px 38px 38px 32px 36px 30px 44px 30px 36px 32px 38px 38px 38px 30px",
                fontSize: "9px", padding: "1px 3px", gap: "0 1px",
                lineHeight: "15px", cursor: "pointer",
                borderBottom: isATM ? "1px solid #3d2800" : "1px solid #060600",
                borderTop: isATM ? "1px solid #3d2800" : "none",
                background: isSelected ? "rgba(0,50,120,0.3)" : isATM ? "rgba(255,160,40,0.06)" : "transparent",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isATM ? "rgba(255,160,40,0.1)" : "#060604"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isATM ? "rgba(255,160,40,0.06)" : "transparent"; }}
            >
              {/* Call delta */}
              <span style={{ textAlign: "center", color: "#0088ff", fontSize: "8px" }}>{r.cDelta.toFixed(2)}</span>
              {/* Call bid/ask/last */}
              <span style={{ textAlign: "right", color: "#4af6c3" }}>{r.cBid.toFixed(2)}</span>
              <span style={{ textAlign: "right", color: "#ff433d" }}>{r.cAsk.toFixed(2)}</span>
              <span style={{ textAlign: "right", color: "#fff" }}>{r.cLast.toFixed(2)}</span>
              {/* Call vol/OI */}
              <span style={{ textAlign: "right", color: "#7a6030", fontSize: "8px" }}>{fmtK(r.cVol)}</span>
              <span style={{ textAlign: "right", color: "#555", fontSize: "8px" }}>{fmtK(r.cOI)}</span>
              {/* Call IV */}
              <span style={{
                textAlign: "right", fontWeight: "bold", fontSize: "8px",
                color: isITMCall ? "#ffa028" : "#c8a848",
              }}>{r.cIV.toFixed(1)}</span>

              {/* Strike */}
              <span style={{
                textAlign: "center", fontWeight: "bold",
                color: isATM ? "#ffa028" : "#fff",
                background: isATM ? "rgba(255,160,40,0.15)" : "transparent",
                borderLeft: "1px solid #1a1000",
                borderRight: "1px solid #1a1000",
              }}>{r.strike}</span>

              {/* Put IV */}
              <span style={{
                textAlign: "right", fontWeight: "bold", fontSize: "8px",
                color: isITMPut ? "#ffa028" : "#c8a848",
              }}>{r.pIV.toFixed(1)}</span>
              {/* Put OI/vol */}
              <span style={{ textAlign: "right", color: "#555", fontSize: "8px" }}>{fmtK(r.pOI)}</span>
              <span style={{ textAlign: "right", color: "#7a6030", fontSize: "8px" }}>{fmtK(r.pVol)}</span>
              {/* Put last/bid/ask */}
              <span style={{ textAlign: "right", color: "#fff" }}>{r.pLast.toFixed(2)}</span>
              <span style={{ textAlign: "right", color: "#4af6c3" }}>{r.pBid.toFixed(2)}</span>
              <span style={{ textAlign: "right", color: "#ff433d" }}>{r.pAsk.toFixed(2)}</span>
              {/* Put delta */}
              <span style={{ textAlign: "center", color: "#0088ff", fontSize: "8px" }}>{r.pDelta.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "9px", padding: "2px 6px",
        borderTop: "1px solid #1a1000", background: "#050500", flexShrink: 0,
      }}>
        <span>
          <span style={{ color: "#7a6030" }}>SPX: </span>
          <span style={{ color: "#4af6c3", fontWeight: "bold" }}>{CURRENT_PRICE.toFixed(2)}</span>
        </span>
        <span>
          <span style={{ color: "#7a6030" }}>P/C Ratio: </span>
          <span style={{ color: pcRatio > 1.2 ? "#ff433d" : pcRatio < 0.8 ? "#4af6c3" : "#ffa028", fontWeight: "bold" }}>{pcRatio.toFixed(2)}</span>
        </span>
        <span>
          <span style={{ color: "#7a6030" }}>ATM IV: </span>
          <span style={{ color: "#ffa028", fontWeight: "bold" }}>16.5%</span>
        </span>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "9px", padding: "2px 6px", color: "#7a6030",
        borderTop: "1px solid #0a0800", background: "#050500", flexShrink: 0,
      }}>
        <span>CBOE OPTIONS</span>
        <span>REAL-TIME</span>
      </div>
    </div>
  );
}

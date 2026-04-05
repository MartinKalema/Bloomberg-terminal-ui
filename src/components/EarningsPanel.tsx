"use client";

import React, { useState } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface EarningsEvent {
  date: string;
  ticker: string;
  name: string;
  time: "BMO" | "AMC" | "DMT";
  estEps: number;
  priorEps: number;
  estRev: number; // in billions
  numEst: number;
  surprise: number | null; // % surprise from last quarter, null if upcoming
}

interface Surprise {
  quarter: string;
  ticker: string;
  actual: number;
  estimate: number;
  pctSurprise: number;
  revenue: number;
  revEst: number;
}

/* ──────────────────── Data ──────────────────── */

const EARNINGS: EarningsEvent[] = [
  { date: "04/06", ticker: "AAPL",  name: "Apple Inc",        time: "AMC", estEps: 1.53, priorEps: 1.95, estRev: 91.5, numEst: 38, surprise: null },
  { date: "04/07", ticker: "MSFT",  name: "Microsoft Corp",   time: "AMC", estEps: 3.08, priorEps: 2.94, estRev: 59.2, numEst: 42, surprise: null },
  { date: "04/08", ticker: "NVDA",  name: "NVIDIA Corp",      time: "BMO", estEps: 4.22, priorEps: 3.81, estRev: 24.8, numEst: 45, surprise: null },
  { date: "04/09", ticker: "AMZN",  name: "Amazon.com",       time: "AMC", estEps: 0.98, priorEps: 0.77, estRev: 142.5, numEst: 40, surprise: null },
  { date: "04/10", ticker: "GOOGL", name: "Alphabet Inc",     time: "BMO", estEps: 2.04, priorEps: 1.88, estRev: 78.4, numEst: 36, surprise: null },
  { date: "04/13", ticker: "META",  name: "Meta Platforms",   time: "AMC", estEps: 5.45, priorEps: 4.99, estRev: 38.2, numEst: 41, surprise: null },
  { date: "04/14", ticker: "JPM",   name: "JPMorgan Chase",   time: "BMO", estEps: 3.82, priorEps: 3.56, estRev: 42.1, numEst: 28, surprise: null },
  { date: "04/15", ticker: "BAC",   name: "Bank of America",  time: "BMO", estEps: 0.81, priorEps: 0.76, estRev: 25.8, numEst: 25, surprise: null },
  { date: "04/16", ticker: "TSLA",  name: "Tesla Inc",        time: "AMC", estEps: 0.78, priorEps: 0.93, estRev: 24.3, numEst: 35, surprise: null },
  { date: "04/17", ticker: "NFLX",  name: "Netflix Inc",      time: "AMC", estEps: 6.22, priorEps: 5.88, estRev: 10.1, numEst: 32, surprise: null },
  { date: "04/20", ticker: "AMD",   name: "AMD Inc",          time: "BMO", estEps: 1.61, priorEps: 1.45, estRev: 7.1,  numEst: 34, surprise: null },
  { date: "04/21", ticker: "CRM",   name: "Salesforce",       time: "AMC", estEps: 1.74, priorEps: 1.53, estRev: 9.4,  numEst: 30, surprise: null },
];

const SURPRISES: Surprise[] = [
  { quarter: "Q4'25", ticker: "AAPL",  actual: 2.18, estimate: 2.12, pctSurprise: 2.8,  revenue: 119.6, revEst: 118.0 },
  { quarter: "Q4'25", ticker: "MSFT",  actual: 3.23, estimate: 3.10, pctSurprise: 4.2,  revenue: 62.0,  revEst: 60.8 },
  { quarter: "Q4'25", ticker: "NVDA",  actual: 5.16, estimate: 4.88, pctSurprise: 5.7,  revenue: 22.1,  revEst: 20.9 },
  { quarter: "Q4'25", ticker: "AMZN",  actual: 1.48, estimate: 1.33, pctSurprise: 11.3, revenue: 170.0, revEst: 166.2 },
  { quarter: "Q4'25", ticker: "GOOGL", actual: 2.15, estimate: 1.98, pctSurprise: 8.6,  revenue: 86.3,  revEst: 83.4 },
  { quarter: "Q4'25", ticker: "META",  actual: 6.03, estimate: 5.75, pctSurprise: 4.9,  revenue: 40.1,  revEst: 39.2 },
  { quarter: "Q4'25", ticker: "JPM",   actual: 4.81, estimate: 4.44, pctSurprise: 8.3,  revenue: 44.2,  revEst: 42.8 },
  { quarter: "Q4'25", ticker: "TSLA",  actual: 0.71, estimate: 0.78, pctSurprise: -9.0, revenue: 25.2,  revEst: 25.8 },
  { quarter: "Q3'25", ticker: "AAPL",  actual: 1.47, estimate: 1.46, pctSurprise: 0.7,  revenue: 89.5,  revEst: 89.3 },
  { quarter: "Q3'25", ticker: "MSFT",  actual: 2.95, estimate: 2.92, pctSurprise: 1.0,  revenue: 56.5,  revEst: 56.1 },
  { quarter: "Q3'25", ticker: "NVDA",  actual: 3.81, estimate: 3.60, pctSurprise: 5.8,  revenue: 18.1,  revEst: 17.4 },
  { quarter: "Q3'25", ticker: "TSLA",  actual: 0.93, estimate: 0.85, pctSurprise: 9.4,  revenue: 23.4,  revEst: 22.0 },
];

/* ──────────────────── Component ──────────────────── */

export default function EarningsPanel() {
  const [activeTab, setActiveTab] = useState<"CALENDAR" | "SURPRISES">("CALENDAR");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const tabs = ["CALENDAR", "SURPRISES"] as const;

  // Stats
  const beatCount = SURPRISES.filter(s => s.quarter === "Q4'25" && s.pctSurprise > 1).length;
  const missCount = SURPRISES.filter(s => s.quarter === "Q4'25" && s.pctSurprise < -1).length;
  const inlineCount = SURPRISES.filter(s => s.quarter === "Q4'25").length - beatCount - missCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="ERN" subtitle="Earnings Analysis" rightLabel="EA" />

      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #1a1000", flexShrink: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "2px 10px", fontSize: "9px", fontFamily: "monospace",
              color: activeTab === tab ? "#000" : "#7a6030",
              background: activeTab === tab ? "#ffa028" : "transparent",
              border: "none", cursor: "pointer",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "8px", color: "#7a6030", padding: "0 6px" }}>
          Q4'25: <span style={{ color: "#4af6c3" }}>{beatCount}B</span> / <span style={{ color: "#ffa028" }}>{inlineCount}I</span> / <span style={{ color: "#ff433d" }}>{missCount}M</span>
        </span>
      </div>

      {/* ── CALENDAR ── */}
      {activeTab === "CALENDAR" && (
        <>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "38px 42px 1fr 28px 44px 44px 38px 22px",
            fontSize: "9px", padding: "2px 4px", gap: "0 2px",
            borderBottom: "1px solid #ffa028", background: "#050500", flexShrink: 0,
            color: "#7a6030",
          }}>
            <span>DATE</span>
            <span>TICKER</span>
            <span>NAME</span>
            <span style={{ textAlign: "center" }}>TIME</span>
            <span style={{ textAlign: "right" }}>EST EPS</span>
            <span style={{ textAlign: "right" }}>PRIOR</span>
            <span style={{ textAlign: "right" }}>EstRev</span>
            <span style={{ textAlign: "center" }}>#</span>
          </div>

          {/* Earnings rows */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            {EARNINGS.map((e, i) => {
              const epsGrowth = ((e.estEps - e.priorEps) / Math.abs(e.priorEps || 1)) * 100;
              const isSelected = selectedTicker === e.ticker;

              return (
                <div
                  key={`${e.date}-${e.ticker}`}
                  onClick={() => setSelectedTicker(isSelected ? null : e.ticker)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "38px 42px 1fr 28px 44px 44px 38px 22px",
                    fontSize: "9px", padding: "1px 4px", gap: "0 2px",
                    lineHeight: "15px", cursor: "pointer",
                    borderBottom: "1px solid #060600",
                    background: isSelected ? "rgba(0,50,120,0.3)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#060604"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? "rgba(0,50,120,0.3)" : "transparent"; }}
                >
                  <span style={{ color: "#7a6030" }}>{e.date}</span>
                  <span style={{ color: "#ffa028", fontWeight: "bold" }}>{e.ticker}</span>
                  <span style={{ color: "#c8a848", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                  <span style={{
                    textAlign: "center", fontWeight: "bold", fontSize: "8px",
                    color: e.time === "BMO" ? "#ffa028" : e.time === "AMC" ? "#0088ff" : "#7a6030",
                  }}>{e.time}</span>
                  <span style={{ textAlign: "right", color: "#fff", fontWeight: "bold" }}>${e.estEps.toFixed(2)}</span>
                  <span style={{ textAlign: "right", color: "#555" }}>${e.priorEps.toFixed(2)}</span>
                  <span style={{ textAlign: "right", color: "#7a6030", fontSize: "8px" }}>{e.estRev.toFixed(1)}B</span>
                  <span style={{ textAlign: "center", color: "#555", fontSize: "8px" }}>{e.numEst}</span>
                </div>
              );
            })}
          </div>

          {/* EPS growth legend */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: "8px", padding: "2px 6px",
            borderTop: "1px solid #1a1000", background: "#050500", flexShrink: 0, color: "#7a6030",
          }}>
            <span>BMO=<span style={{ color: "#ffa028" }}>Before Mkt</span> AMC=<span style={{ color: "#0088ff" }}>After Mkt</span></span>
            <span>{EARNINGS.length} UPCOMING</span>
          </div>
        </>
      )}

      {/* ── SURPRISES ── */}
      {activeTab === "SURPRISES" && (
        <>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "40px 42px 44px 44px 50px 44px 44px",
            fontSize: "9px", padding: "2px 4px", gap: "0 2px",
            borderBottom: "1px solid #ffa028", background: "#050500", flexShrink: 0,
            color: "#7a6030",
          }}>
            <span>QTR</span>
            <span>TICKER</span>
            <span style={{ textAlign: "right" }}>ACTUAL</span>
            <span style={{ textAlign: "right" }}>EST</span>
            <span style={{ textAlign: "right" }}>SURPRISE</span>
            <span style={{ textAlign: "right" }}>REV</span>
            <span style={{ textAlign: "right" }}>RevEst</span>
          </div>

          {/* Surprise rows */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            {SURPRISES.map((s, i) => {
              const beat = s.pctSurprise > 1;
              const miss = s.pctSurprise < -1;
              const revBeat = s.revenue > s.revEst;
              const isSelected = selectedTicker === s.ticker;

              return (
                <div
                  key={`${s.quarter}-${s.ticker}`}
                  onClick={() => setSelectedTicker(isSelected ? null : s.ticker)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 42px 44px 44px 50px 44px 44px",
                    fontSize: "9px", padding: "1px 4px", gap: "0 2px",
                    lineHeight: "15px", cursor: "pointer",
                    borderBottom: "1px solid #060600",
                    borderLeft: beat ? "2px solid #4af6c3" : miss ? "2px solid #ff433d" : "2px solid #ffa028",
                    background: isSelected ? "rgba(0,50,120,0.3)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#060604"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? "rgba(0,50,120,0.3)" : "transparent"; }}
                >
                  <span style={{ color: "#7a6030" }}>{s.quarter}</span>
                  <span style={{ color: "#ffa028", fontWeight: "bold" }}>{s.ticker}</span>
                  <span style={{ textAlign: "right", color: "#fff", fontWeight: "bold" }}>${s.actual.toFixed(2)}</span>
                  <span style={{ textAlign: "right", color: "#555" }}>${s.estimate.toFixed(2)}</span>
                  <span style={{
                    textAlign: "right", fontWeight: "bold",
                    color: beat ? "#4af6c3" : miss ? "#ff433d" : "#ffa028",
                  }}>
                    {s.pctSurprise > 0 ? "+" : ""}{s.pctSurprise.toFixed(1)}%
                    <span style={{ fontSize: "7px", marginLeft: "2px" }}>
                      {beat ? "BEAT" : miss ? "MISS" : "INLN"}
                    </span>
                  </span>
                  <span style={{ textAlign: "right", color: revBeat ? "#4af6c3" : "#ff433d" }}>{s.revenue.toFixed(1)}B</span>
                  <span style={{ textAlign: "right", color: "#555" }}>{s.revEst.toFixed(1)}B</span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: "8px", padding: "2px 6px",
            borderTop: "1px solid #1a1000", background: "#050500", flexShrink: 0, color: "#7a6030",
          }}>
            <span>Q4'25 RESULTS</span>
            <span>
              AVG SURPRISE: <span style={{ color: "#4af6c3", fontWeight: "bold" }}>
                +{(SURPRISES.filter(s => s.quarter === "Q4'25").reduce((a, s) => a + s.pctSurprise, 0) / SURPRISES.filter(s => s.quarter === "Q4'25").length).toFixed(1)}%
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

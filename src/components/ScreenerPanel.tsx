"use client";

import React, { useState, useMemo } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface Stock {
  ticker: string;
  name: string;
  cntry: string;
  last: number;
  chg: number;
  chgPct: number;
  mktCap: number; // in billions
  pe: number;
  divYld: number;
  sector: string;
  totRetYTD: number;
  rev: number; // T12M in billions
  beta: number;
  roe: number;
}

type SortField = keyof Pick<Stock, "ticker" | "last" | "chgPct" | "mktCap" | "pe" | "divYld" | "totRetYTD" | "beta" | "roe">;
type SortOrder = "asc" | "desc";

/* ──────────────────── Data ──────────────────── */

const STOCKS: Stock[] = [
  { ticker: "AAPL",  name: "APPLE INC",         cntry: "US", last: 182.45, chg: 2.15,  chgPct: 1.19,  mktCap: 2850, pe: 28.5, divYld: 0.46, sector: "Tech",     totRetYTD: 8.37,   rev: 383, beta: 1.21, roe: 171.9 },
  { ticker: "MSFT",  name: "MICROSOFT CORP",     cntry: "US", last: 421.80, chg: 5.20,  chgPct: 1.25,  mktCap: 3140, pe: 35.2, divYld: 0.73, sector: "Tech",     totRetYTD: 12.50,  rev: 227, beta: 0.89, roe: 38.5 },
  { ticker: "NVDA",  name: "NVIDIA CORP",        cntry: "US", last: 875.25, chg: 12.50, chgPct: 1.45,  mktCap: 2150, pe: 62.1, divYld: 0.04, sector: "Tech",     totRetYTD: 45.20,  rev: 61,  beta: 1.68, roe: 91.5 },
  { ticker: "AMZN",  name: "AMAZON.COM INC",     cntry: "US", last: 185.40, chg: 4.10,  chgPct: 2.27,  mktCap: 1920, pe: 52.3, divYld: 0.00, sector: "Tech",     totRetYTD: 18.40,  rev: 575, beta: 1.15, roe: 22.8 },
  { ticker: "GOOGL", name: "ALPHABET INC",       cntry: "US", last: 168.90, chg: 2.85,  chgPct: 1.71,  mktCap: 1760, pe: 25.6, divYld: 0.00, sector: "Tech",     totRetYTD: 9.20,   rev: 307, beta: 1.05, roe: 28.4 },
  { ticker: "META",  name: "META PLATFORMS",      cntry: "US", last: 487.35, chg: 6.75,  chgPct: 1.40,  mktCap: 1245, pe: 24.1, divYld: 0.00, sector: "Tech",     totRetYTD: 22.10,  rev: 135, beta: 1.24, roe: 33.4 },
  { ticker: "JPM",   name: "JPMORGAN CHASE",     cntry: "US", last: 198.75, chg: 3.45,  chgPct: 1.77,  mktCap: 565,  pe: 12.8, divYld: 2.45, sector: "Financ",  totRetYTD: 6.80,   rev: 158, beta: 1.08, roe: 15.2 },
  { ticker: "BAC",   name: "BANK OF AMERICA",    cntry: "US", last: 34.20,  chg: 0.65,  chgPct: 1.93,  mktCap: 305,  pe: 10.5, divYld: 2.92, sector: "Financ",  totRetYTD: -2.10,  rev: 98,  beta: 1.35, roe: 10.8 },
  { ticker: "GS",    name: "GOLDMAN SACHS",      cntry: "US", last: 407.50, chg: 8.20,  chgPct: 2.05,  mktCap: 135,  pe: 8.9,  divYld: 2.15, sector: "Financ",  totRetYTD: 15.30,  rev: 47,  beta: 1.42, roe: 12.1 },
  { ticker: "JNJ",   name: "JOHNSON & JOHNSON",  cntry: "US", last: 157.80, chg: 1.25,  chgPct: 0.80,  mktCap: 410,  pe: 23.4, divYld: 2.87, sector: "Health",  totRetYTD: -1.20,  rev: 85,  beta: 0.53, roe: 52.3 },
  { ticker: "PFE",   name: "PFIZER INC",         cntry: "US", last: 26.35,  chg: 0.45,  chgPct: 1.73,  mktCap: 145,  pe: 11.2, divYld: 5.88, sector: "Health",  totRetYTD: -8.50,  rev: 58,  beta: 0.65, roe: 7.8 },
  { ticker: "XOM",   name: "EXXON MOBIL",        cntry: "US", last: 108.20, chg: 2.15,  chgPct: 2.03,  mktCap: 450,  pe: 10.3, divYld: 3.42, sector: "Energy",  totRetYTD: 5.60,   rev: 345, beta: 0.82, roe: 18.9 },
  { ticker: "CVX",   name: "CHEVRON CORP",       cntry: "US", last: 147.65, chg: 3.20,  chgPct: 2.21,  mktCap: 285,  pe: 9.7,  divYld: 3.75, sector: "Energy",  totRetYTD: -1.80,  rev: 196, beta: 0.95, roe: 14.5 },
  { ticker: "TSLA",  name: "TESLA INC",          cntry: "US", last: 238.50, chg: -2.15, chgPct: -0.89, mktCap: 750,  pe: 58.9, divYld: 0.00, sector: "Tech",     totRetYTD: -12.30, rev: 97,  beta: 2.08, roe: 21.2 },
  { ticker: "MCD",   name: "MCDONALD'S CORP",    cntry: "US", last: 290.50, chg: 3.85,  chgPct: 1.34,  mktCap: 215,  pe: 28.5, divYld: 2.24, sector: "Consum",  totRetYTD: 4.30,   rev: 23,  beta: 0.72, roe: 0.0 },
  { ticker: "WMT",   name: "WALMART INC",        cntry: "US", last: 82.40,  chg: 0.95,  chgPct: 1.17,  mktCap: 225,  pe: 32.1, divYld: 1.32, sector: "Consum",  totRetYTD: 10.50,  rev: 648, beta: 0.51, roe: 19.7 },
  { ticker: "PG",    name: "PROCTER & GAMBLE",   cntry: "US", last: 164.25, chg: 1.50,  chgPct: 0.92,  mktCap: 395,  pe: 26.8, divYld: 2.45, sector: "Consum",  totRetYTD: 3.20,   rev: 82,  beta: 0.44, roe: 31.2 },
  { ticker: "KO",    name: "THE COCA-COLA CO",   cntry: "US", last: 65.80,  chg: 0.85,  chgPct: 1.31,  mktCap: 285,  pe: 24.5, divYld: 3.06, sector: "Consum",  totRetYTD: 1.90,   rev: 46,  beta: 0.58, roe: 42.8 },
  { ticker: "NFLX",  name: "NETFLIX INC",        cntry: "US", last: 243.75, chg: 3.65,  chgPct: 1.52,  mktCap: 105,  pe: 34.2, divYld: 0.00, sector: "Consum",  totRetYTD: 28.60,  rev: 34,  beta: 1.32, roe: 28.1 },
  { ticker: "T",     name: "AT&T INC",           cntry: "US", last: 18.75,  chg: 0.22,  chgPct: 1.19,  mktCap: 130,  pe: 7.8,  divYld: 7.65, sector: "Telcom",  totRetYTD: -3.40,  rev: 122, beta: 0.74, roe: 14.2 },
];

const CRITERIA = [
  { id: 51, label: "Trading Status: Active", matches: 251743 },
  { id: 52, label: "Security Attributes: Primary Security only", matches: 68758 },
  { id: 53, label: "Country of Domicile: United States", matches: 12455 },
  { id: 54, label: "Mkt Cap (USD): > $10B", matches: 842 },
];

/* ──────────────────── Component ──────────────────── */

export default function ScreenerPanel() {
  const [view, setView] = useState<"results" | "criteria">("results");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("mktCap");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sorted = useMemo(() => {
    return [...STOCKS].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("desc"); }
  };

  const arrow = (f: SortField) => sortField === f ? (sortOrder === "asc" ? "▲" : "▼") : "";
  const fmtCap = (b: number) => b >= 1000 ? (b / 1000).toFixed(1) + "T" : b + "B";

  /* ── Criteria View ── */
  if (view === "criteria") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
        <PanelHeader title="EQS" subtitle="Equity Screening" rightLabel="SRCH" />
        <div style={{ display: "flex", alignItems: "center", fontSize: "9px", padding: "2px 6px", borderBottom: "1px solid #1a1000", background: "#050500" }}>
          <button onClick={() => setView("results")} style={{ color: "#ffa028", background: "none", border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: "9px" }}>1 &lt;GO&gt; for Results</button>
          <span style={{ color: "#3d3020", margin: "0 6px" }}>|</span>
          <span style={{ color: "#3d3020" }}>89 &lt;GO&gt; to see last unsaved screen</span>
        </div>
        <div style={{ display: "flex", fontSize: "9px", borderBottom: "1px solid #1a1000" }}>
          <span style={{ padding: "2px 6px", color: "#ffa028", borderRight: "1px solid #1a1000" }}>97) Formula</span>
          <span style={{ padding: "2px 6px", color: "#ffa028", borderRight: "1px solid #1a1000" }}>98) Actions</span>
          <span style={{ padding: "2px 6px", color: "#ffa028", borderRight: "1px solid #1a1000" }}>99) Backtest</span>
          <span style={{ flex: 1 }} />
          <span style={{ padding: "2px 8px", color: "#ffa028", fontWeight: "bold" }}>Equity Screening</span>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "4px 6px", fontSize: "9px" }}>
          <div style={{ color: "#ffa028", fontWeight: "bold", marginBottom: "4px", padding: "2px 4px", background: "#050500", border: "1px solid #1a1000" }}>Screening Criteria</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px", marginBottom: "6px" }}>
            {["Exchanges","Sectors","Country/Territory","Indices","Portfolios","Security Types","Security Attr","Trading Status","Multi-Listed","State of Domicile","Debt Distribution","Company Desc","Product Segments","Geographic Seg"].map((c, i) => (
              <div key={i} style={{ padding: "1px 0", cursor: "pointer" }}>
                <span style={{ color: "#7a6030" }}>{31 + i})</span>{" "}
                <span style={{ color: "#c8a848" }}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1a1000", paddingTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 4px", background: "#050500", borderBottom: "1px solid #1a1000" }}>
              <span style={{ color: "#ffa028", fontWeight: "bold" }}>Selected Screening Criteria</span>
              <span style={{ color: "#ffa028", fontWeight: "bold" }}>Matches</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "1px 4px", borderBottom: "1px solid #060600" }}>
              <span style={{ color: "#fff", paddingLeft: "12px" }}>Security Universe</span>
              <span style={{ color: "#fff" }}>894,867</span>
            </div>
            {CRITERIA.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "1px 4px", borderBottom: "1px solid #060600" }}>
                <span><span style={{ color: "#7a6030" }}>{c.id})</span> <span style={{ color: "#c8a848" }}>{c.label}</span></span>
                <span style={{ color: "#fff" }}>{c.matches.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "6px", textAlign: "right" }}>
            <button onClick={() => setView("results")} style={{ background: "#ffa028", color: "#000", border: "none", padding: "2px 10px", fontWeight: "bold", cursor: "pointer", fontFamily: "monospace", fontSize: "9px" }}>1) See Results</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Results View ── */
  const COL = "18px 48px 16px 1fr 38px 44px 50px 38px 42px 36px 38px";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="EQS" subtitle="Equity Screening" rightLabel="SRCH" />

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", fontSize: "9px", padding: "2px 6px", borderBottom: "1px solid #1a1000", flexShrink: 0 }}>
        <button onClick={() => setView("criteria")} style={{ color: "#ffa028", background: "none", border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: "9px" }}>&lt;Menu&gt;</button>
        <span style={{ color: "#fff", marginLeft: "4px" }}>to edit screening criteria</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "#7a6030" }}>97) Backtest</span>
      </div>

      {/* Count bar */}
      <div style={{ display: "flex", alignItems: "center", fontSize: "9px", padding: "2px 6px", borderBottom: "1px solid #1a1000", flexShrink: 0, background: "#050500" }}>
        <span style={{ background: "#cc2200", color: "#fff", padding: "0 4px", fontWeight: "bold", marginRight: "4px", fontSize: "8px" }}>95) Output</span>
        <span style={{ background: "#cc2200", color: "#fff", padding: "0 4px", fontWeight: "bold", marginRight: "8px", fontSize: "8px" }}>96) Actions</span>
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: "11px" }}>{sorted.length}</span>
        <span style={{ color: "#7a6030", marginLeft: "4px" }}>securities</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "#7a6030" }}>As Of </span>
        <span style={{ color: "#ffa028", fontWeight: "bold", background: "#0a0800", padding: "0 3px", border: "1px solid #1a1000" }}>04/05/2026</span>
        <span style={{ color: "#ffa028", fontWeight: "bold", marginLeft: "8px" }}>Equity Screening</span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: COL,
        fontSize: "9px", padding: "2px 4px", gap: "0 2px",
        borderBottom: "2px solid #ffa028", background: "#050500", flexShrink: 0,
      }}>
        <span style={{ color: "#7a6030", textAlign: "center" }}>#</span>
        <span onClick={() => handleSort("ticker")} style={{ color: sortField === "ticker" ? "#ffa028" : "#7a6030", cursor: "pointer" }}>Ticker{arrow("ticker")}</span>
        <span style={{ color: "#7a6030" }}></span>
        <span style={{ color: "#7a6030" }}>Name</span>
        <span onClick={() => handleSort("pe")} style={{ color: sortField === "pe" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>P/E{arrow("pe")}</span>
        <span onClick={() => handleSort("mktCap")} style={{ color: sortField === "mktCap" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>MktCap{arrow("mktCap")}</span>
        <span onClick={() => handleSort("last")} style={{ color: sortField === "last" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>Price{arrow("last")}</span>
        <span onClick={() => handleSort("divYld")} style={{ color: sortField === "divYld" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>DvYld{arrow("divYld")}</span>
        <span onClick={() => handleSort("totRetYTD")} style={{ color: sortField === "totRetYTD" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>TotRet{arrow("totRetYTD")}</span>
        <span onClick={() => handleSort("beta")} style={{ color: sortField === "beta" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>Beta{arrow("beta")}</span>
        <span onClick={() => handleSort("roe")} style={{ color: sortField === "roe" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>ROE{arrow("roe")}</span>
      </div>

      {/* Data rows */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {sorted.map((s, i) => (
          <div
            key={s.ticker}
            onClick={() => setSelectedRow(selectedRow === s.ticker ? null : s.ticker)}
            style={{
              display: "grid", gridTemplateColumns: COL,
              fontSize: "9px", padding: "1px 4px", gap: "0 2px",
              borderBottom: "1px solid #060600",
              background: selectedRow === s.ticker ? "rgba(0,50,120,0.3)" : "transparent",
              cursor: "pointer", lineHeight: "15px",
            }}
            onMouseEnter={e => { if (selectedRow !== s.ticker) e.currentTarget.style.background = "#060604"; }}
            onMouseLeave={e => { if (selectedRow !== s.ticker) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ color: "#7a6030", textAlign: "center" }}>{i + 1})</span>
            <span style={{ color: "#ffa028", fontWeight: "bold" }}>{s.ticker}</span>
            <span style={{ color: "#0088ff", fontSize: "8px" }}>{s.cntry}</span>
            <span style={{ color: "#c8a848", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
            <span style={{ color: "#fff", textAlign: "right" }}>{s.pe.toFixed(1)}</span>
            <span style={{ color: "#fff", textAlign: "right" }}>{fmtCap(s.mktCap)}</span>
            <span style={{ color: "#fff", textAlign: "right" }}>{s.last.toFixed(2)}</span>
            <span style={{ color: "#c8a848", textAlign: "right" }}>{s.divYld.toFixed(1)}%</span>
            <span style={{ color: s.totRetYTD >= 0 ? "#4af6c3" : "#ff433d", textAlign: "right", fontWeight: "bold" }}>
              {s.totRetYTD >= 0 ? "+" : ""}{s.totRetYTD.toFixed(1)}%
            </span>
            <span style={{ color: s.beta > 1.5 ? "#ff8844" : s.beta < 0.7 ? "#0088ff" : "#fff", textAlign: "right" }}>{s.beta.toFixed(2)}</span>
            <span style={{ color: s.roe > 30 ? "#4af6c3" : "#fff", textAlign: "right" }}>{s.roe.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "9px", fontFamily: "monospace", padding: "2px 6px",
        borderTop: "1px solid #1a1000", background: "#050500", flexShrink: 0, color: "#7a6030",
      }}>
        <span>Analyze | 94) Stats | Grouping: None</span>
        <span>300) Edit Panel</span>
      </div>
    </div>
  );
}

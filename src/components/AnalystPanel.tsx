"use client";

import React, { useState } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface AnalystRating {
  firm: string;
  analyst: string;
  rating: "BUY" | "OUTPERFORM" | "HOLD" | "UNDERPERFORM" | "SELL";
  target: number;
  date: string;
  prior: string;
  accuracy: number; // 0-100
}

/* ──────────────────── Data ──────────────────── */

const SECURITY = "SPX Index";
const CURRENT_PRICE = 5428.75;

const RATINGS: AnalystRating[] = [
  { firm: "Goldman Sachs",   analyst: "D.Kostin",    rating: "BUY",         target: 5800, date: "03/28", prior: "BUY",         accuracy: 78 },
  { firm: "Morgan Stanley",  analyst: "M.Wilson",    rating: "HOLD",        target: 5200, date: "03/25", prior: "UNDERPERFORM",accuracy: 62 },
  { firm: "JPMorgan",        analyst: "D.Dubravko",  rating: "OUTPERFORM",  target: 5700, date: "03/22", prior: "OUTPERFORM",  accuracy: 81 },
  { firm: "Bank of America", analyst: "S.Subramanian",rating: "BUY",        target: 5600, date: "03/18", prior: "BUY",         accuracy: 71 },
  { firm: "Barclays",        analyst: "V.Jain",      rating: "OUTPERFORM",  target: 5500, date: "03/15", prior: "HOLD",        accuracy: 68 },
  { firm: "Citi",            analyst: "S.Chronert",  rating: "BUY",         target: 5900, date: "03/12", prior: "BUY",         accuracy: 74 },
  { firm: "Wells Fargo",     analyst: "C.Harvey",    rating: "OUTPERFORM",  target: 5650, date: "03/08", prior: "OUTPERFORM",  accuracy: 66 },
  { firm: "Deutsche Bank",   analyst: "B.Palfrey",   rating: "HOLD",        target: 5300, date: "03/05", prior: "HOLD",        accuracy: 59 },
  { firm: "UBS",             analyst: "J.Emanuel",   rating: "SELL",        target: 4800, date: "02/28", prior: "SELL",         accuracy: 52 },
  { firm: "HSBC",            analyst: "N.Stahel",    rating: "HOLD",        target: 5350, date: "02/25", prior: "HOLD",         accuracy: 64 },
  { firm: "RBC",             analyst: "L.Calvasina", rating: "OUTPERFORM",  target: 5700, date: "02/20", prior: "BUY",         accuracy: 76 },
  { firm: "BNP Paribas",     analyst: "G.Dennis",    rating: "BUY",         target: 5750, date: "02/15", prior: "OUTPERFORM",  accuracy: 69 },
];

const DIST = { BUY: 5, OUTPERFORM: 4, HOLD: 3, UNDERPERFORM: 0, SELL: 1 };
const TOTAL = Object.values(DIST).reduce((a, b) => a + b, 0);

const getRatingColor = (r: string) => {
  if (r === "BUY" || r === "OUTPERFORM") return "#4af6c3";
  if (r === "HOLD") return "#ffa028";
  return "#ff433d";
};

const getRatingNum = (r: string) => {
  if (r === "BUY") return 5;
  if (r === "OUTPERFORM") return 4;
  if (r === "HOLD") return 3;
  if (r === "UNDERPERFORM") return 2;
  return 1;
};

/* ──────────────────── Component ──────────────────── */

type SortCol = "firm" | "rating" | "target" | "date" | "accuracy";

export default function AnalystPanel() {
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const arrow = (col: SortCol) => sortCol === col ? (sortAsc ? "▲" : "▼") : "";

  const sorted = [...RATINGS].sort((a, b) => {
    let av: string | number, bv: string | number;
    switch (sortCol) {
      case "firm": av = a.firm; bv = b.firm; break;
      case "rating": av = getRatingNum(a.rating); bv = getRatingNum(b.rating); break;
      case "target": av = a.target; bv = b.target; break;
      case "date": av = a.date; bv = b.date; break;
      case "accuracy": av = a.accuracy; bv = b.accuracy; break;
    }
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortAsc ? cmp : -cmp;
  });

  // Consensus stats
  const avgTarget = RATINGS.reduce((s, r) => s + r.target, 0) / RATINGS.length;
  const highTarget = Math.max(...RATINGS.map(r => r.target));
  const lowTarget = Math.min(...RATINGS.map(r => r.target));
  const upside = ((avgTarget - CURRENT_PRICE) / CURRENT_PRICE) * 100;

  const buyPct = ((DIST.BUY + DIST.OUTPERFORM) / TOTAL * 100);
  const holdPct = (DIST.HOLD / TOTAL * 100);
  const sellPct = ((DIST.UNDERPERFORM + DIST.SELL) / TOTAL * 100);

  // Consensus score (1-5)
  const consensusScore = RATINGS.reduce((s, r) => s + getRatingNum(r.rating), 0) / RATINGS.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="ANR" subtitle="Analyst Recommendations" rightLabel={SECURITY} />

      {/* Consensus summary */}
      <div style={{ background: "#050500", borderBottom: "1px solid #1a1000", padding: "4px 6px", flexShrink: 0 }}>
        {/* Score + distribution */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <div style={{ fontSize: "9px" }}>
            <span style={{ color: "#7a6030" }}>CONSENSUS: </span>
            <span style={{ color: consensusScore >= 3.5 ? "#4af6c3" : consensusScore >= 2.5 ? "#ffa028" : "#ff433d", fontWeight: "bold", fontSize: "12px" }}>
              {consensusScore.toFixed(1)}
            </span>
            <span style={{ color: "#7a6030", fontSize: "8px" }}>/5</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "8px" }}>
            <span style={{ color: "#4af6c3" }}>BUY {DIST.BUY + DIST.OUTPERFORM}</span>
            <span style={{ color: "#ffa028" }}>HOLD {DIST.HOLD}</span>
            <span style={{ color: "#ff433d" }}>SELL {DIST.UNDERPERFORM + DIST.SELL}</span>
          </div>
        </div>

        {/* Stacked distribution bar */}
        <div style={{ display: "flex", height: "6px", borderRadius: "1px", overflow: "hidden", marginBottom: "4px" }}>
          <div style={{ width: `${buyPct}%`, background: "#4af6c3" }} />
          <div style={{ width: `${holdPct}%`, background: "#ffa028" }} />
          <div style={{ width: `${sellPct}%`, background: "#ff433d" }} />
        </div>

        {/* Target price info */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
          <span>
            <span style={{ color: "#7a6030" }}>AVG TARGET: </span>
            <span style={{ color: "#ffa028", fontWeight: "bold" }}>{avgTarget.toFixed(0)}</span>
            <span style={{ color: upside >= 0 ? "#4af6c3" : "#ff433d", marginLeft: "4px", fontWeight: "bold" }}>
              ({upside >= 0 ? "+" : ""}{upside.toFixed(1)}%)
            </span>
          </span>
          <span>
            <span style={{ color: "#ff433d" }}>{lowTarget}</span>
            <span style={{ color: "#7a6030" }}> — </span>
            <span style={{ color: "#4af6c3" }}>{highTarget}</span>
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 60px 42px 38px 28px 26px",
        fontSize: "9px", padding: "2px 4px", gap: "0 2px",
        borderBottom: "1px solid #ffa028", background: "#050500", flexShrink: 0,
      }}>
        <span onClick={() => handleSort("firm")} style={{ color: sortCol === "firm" ? "#ffa028" : "#7a6030", cursor: "pointer" }}>FIRM{arrow("firm")}</span>
        <span onClick={() => handleSort("rating")} style={{ color: sortCol === "rating" ? "#ffa028" : "#7a6030", cursor: "pointer" }}>RATING{arrow("rating")}</span>
        <span onClick={() => handleSort("target")} style={{ color: sortCol === "target" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>TGT{arrow("target")}</span>
        <span onClick={() => handleSort("date")} style={{ color: sortCol === "date" ? "#ffa028" : "#7a6030", cursor: "pointer" }}>DATE{arrow("date")}</span>
        <span style={{ color: "#7a6030", textAlign: "right" }}>UPS</span>
        <span onClick={() => handleSort("accuracy")} style={{ color: sortCol === "accuracy" ? "#ffa028" : "#7a6030", cursor: "pointer", textAlign: "right" }}>ACC{arrow("accuracy")}</span>
      </div>

      {/* Analyst rows */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {sorted.map((r, i) => {
          const upsideVal = ((r.target - CURRENT_PRICE) / CURRENT_PRICE) * 100;
          const ratingChanged = r.rating !== r.prior;

          return (
            <div
              key={r.firm}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 42px 38px 28px 26px",
                fontSize: "9px", padding: "1px 4px", gap: "0 2px",
                lineHeight: "14px", cursor: "pointer",
                borderBottom: "1px solid #060600",
                borderLeft: ratingChanged ? "2px solid #0088ff" : "2px solid transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#060604"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ color: "#c8a848", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.firm}</span>
              <span style={{ color: getRatingColor(r.rating), fontWeight: "bold" }}>{r.rating}</span>
              <span style={{ textAlign: "right", color: "#fff", fontWeight: "bold" }}>{r.target}</span>
              <span style={{ color: "#0088ff", fontSize: "8px" }}>{r.date}</span>
              <span style={{
                textAlign: "right", fontWeight: "bold", fontSize: "8px",
                color: upsideVal >= 0 ? "#4af6c3" : "#ff433d",
              }}>
                {upsideVal >= 0 ? "+" : ""}{upsideVal.toFixed(0)}%
              </span>
              <span style={{
                textAlign: "right", fontSize: "8px",
                color: r.accuracy >= 75 ? "#4af6c3" : r.accuracy >= 60 ? "#ffa028" : "#ff433d",
              }}>{r.accuracy}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "8px", padding: "2px 6px", color: "#7a6030",
        borderTop: "1px solid #1a1000", background: "#050500", flexShrink: 0,
      }}>
        <span>SOURCE: BLOOMBERG ANALYST ESTIMATES</span>
        <span>{RATINGS.length} ANALYSTS</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import PanelHeader from "./PanelHeader";

interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  last: number;
  mktValue: number;
  dayPnl: number;
  totalPnl: number;
  pctWeight: number;
}

const POSITIONS: Position[] = [
  { ticker: "SPY", name: "SPDR S&P 500", shares: 500, avgCost: 528.40, last: 542.87, mktValue: 271435, dayPnl: 623, totalPnl: 7235, pctWeight: 22.1 },
  { ticker: "QQQ", name: "INVESCO QQQ", shares: 300, avgCost: 438.20, last: 461.53, mktValue: 138459, dayPnl: 415, totalPnl: 6999, pctWeight: 11.3 },
  { ticker: "AAPL", name: "APPLE INC", shares: 400, avgCost: 178.50, last: 189.84, mktValue: 75936, dayPnl: 840, totalPnl: 4536, pctWeight: 6.2 },
  { ticker: "NVDA", name: "NVIDIA CORP", shares: 150, avgCost: 845.00, last: 924.52, mktValue: 138678, dayPnl: 4462, totalPnl: 11928, pctWeight: 11.3 },
  { ticker: "MSFT", name: "MICROSOFT", shares: 200, avgCost: 405.30, last: 428.35, mktValue: 85670, dayPnl: 780, totalPnl: 4610, pctWeight: 7.0 },
  { ticker: "AMZN", name: "AMAZON.COM", shares: 350, avgCost: 175.80, last: 186.45, mktValue: 65257, dayPnl: 420, totalPnl: 3728, pctWeight: 5.3 },
  { ticker: "GOOGL", name: "ALPHABET-A", shares: 250, avgCost: 163.40, last: 174.25, mktValue: 43562, dayPnl: 245, totalPnl: 2713, pctWeight: 3.5 },
  { ticker: "META", name: "META PLATF", shares: 100, avgCost: 478.60, last: 502.30, mktValue: 50230, dayPnl: 770, totalPnl: 2370, pctWeight: 4.1 },
  { ticker: "JPM", name: "JPMORGAN", shares: 300, avgCost: 188.20, last: 197.45, mktValue: 59235, dayPnl: 330, totalPnl: 2775, pctWeight: 4.8 },
  { ticker: "TSLA", name: "TESLA INC", shares: 200, avgCost: 235.80, last: 248.60, mktValue: 49720, dayPnl: 1200, totalPnl: 2560, pctWeight: 4.0 },
  { ticker: "GLD", name: "SPDR GOLD", shares: 250, avgCost: 218.50, last: 224.30, mktValue: 56075, dayPnl: 325, totalPnl: 1450, pctWeight: 4.6 },
  { ticker: "TLT", name: "ISHARES 20Y", shares: 400, avgCost: 92.30, last: 89.15, mktValue: 35660, dayPnl: -120, totalPnl: -1260, pctWeight: 2.9 },
];

const TOTAL_VALUE = POSITIONS.reduce((s, p) => s + p.mktValue, 0);
const TOTAL_DAY_PNL = POSITIONS.reduce((s, p) => s + p.dayPnl, 0);
const TOTAL_PNL = POSITIONS.reduce((s, p) => s + p.totalPnl, 0);

type SortKey = "ticker" | "mktValue" | "dayPnl" | "totalPnl" | "pctWeight";

interface RiskMetric {
  name: string;
  value: string;
  isPositive: boolean;
}

const RISK_METRICS: RiskMetric[] = [
  { name: "Portfolio Beta", value: "1.12", isPositive: true },
  { name: "Sharpe Ratio", value: "1.85", isPositive: true },
  { name: "VaR (95%)", value: "-$12,450", isPositive: false },
  { name: "Max Drawdown", value: "-8.2%", isPositive: false },
  { name: "Volatility (Ann.)", value: "16.4%", isPositive: false },
  { name: "Sortino Ratio", value: "2.31", isPositive: true },
  { name: "Treynor Ratio", value: "0.14", isPositive: true },
  { name: "Information Ratio", value: "0.72", isPositive: true },
  { name: "Tracking Error", value: "3.2%", isPositive: false },
  { name: "Alpha (Ann.)", value: "2.8%", isPositive: true },
];

interface SectorExposure {
  name: string;
  pct: number;
}

const SECTOR_EXPOSURES: SectorExposure[] = [
  { name: "Technology", pct: 45.4 },
  { name: "Financials", pct: 4.8 },
  { name: "Consumer Disc", pct: 9.3 },
  { name: "Healthcare", pct: 0 },
  { name: "Energy", pct: 0 },
  { name: "Fixed Income", pct: 7.5 },
  { name: "Commodities", pct: 4.6 },
  { name: "Cash", pct: 28.4 },
];

export default function PortfolioPanel() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("pctWeight");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"POS" | "ALLOC" | "RISK">("POS");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...POSITIONS].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] > b[sortKey] ? 1 : -1) * dir;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="PORT" subtitle="Portfolio" rightLabel="PRTU" />

      {/* Summary bar */}
      <div
        className="flex items-center h-[20px] text-xs shrink-0 gap-4"
        style={{ background: "#050500", borderBottom: "1px solid #1a1000", padding: "0 8px" }}
      >
        <span style={{ color: "#7a6030" }}>NAV:</span>
        <span style={{ color: "#fff", fontWeight: "bold" }}>${(TOTAL_VALUE / 1000).toFixed(1)}K</span>
        <span style={{ color: "#7a6030" }}>Day P&L:</span>
        <span style={{ color: TOTAL_DAY_PNL >= 0 ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>
          {TOTAL_DAY_PNL >= 0 ? "+" : ""}${TOTAL_DAY_PNL.toLocaleString()}
        </span>
        <span style={{ color: "#7a6030" }}>Total P&L:</span>
        <span style={{ color: TOTAL_PNL >= 0 ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>
          {TOTAL_PNL >= 0 ? "+" : ""}${TOTAL_PNL.toLocaleString()}
        </span>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center h-[18px] text-xs shrink-0"
        style={{ borderBottom: "1px solid #1c1c1c" }}
      >
        {(["POS", "ALLOC", "RISK"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0 10px",
              height: "100%",
              color: activeTab === tab ? "#000" : "#7a6030",
              background: activeTab === tab ? "#ffa028" : "transparent",
              borderRight: "1px solid #1c1c1c",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "POS" ? (
        <>
          {/* Column headers */}
          <div
            className="grid text-xs shrink-0"
            style={{
              gridTemplateColumns: "44px 1fr 56px 56px 56px 36px",
              color: "#7a6030",
              borderBottom: "1px solid #ffa028",
              background: "#050500",
              padding: "3px 8px",
            }}
          >
            <span onClick={() => handleSort("ticker")} style={{ cursor: "pointer" }}>
              TICKER{sortKey === "ticker" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </span>
            <span>NAME</span>
            <span className="text-right" onClick={() => handleSort("mktValue")} style={{ cursor: "pointer" }}>
              MKT VAL{sortKey === "mktValue" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </span>
            <span className="text-right" onClick={() => handleSort("dayPnl")} style={{ cursor: "pointer" }}>
              DAY P&L{sortKey === "dayPnl" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </span>
            <span className="text-right" onClick={() => handleSort("totalPnl")} style={{ cursor: "pointer" }}>
              TOT P&L{sortKey === "totalPnl" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </span>
            <span className="text-right" onClick={() => handleSort("pctWeight")} style={{ cursor: "pointer" }}>
              WT%{sortKey === "pctWeight" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </span>
          </div>

          {/* Positions */}
          <div className="flex-1 overflow-auto">
            {sorted.map((p, idx) => (
              <div
                key={p.ticker}
                className="grid text-xs cursor-pointer"
                style={{
                  gridTemplateColumns: "44px 1fr 56px 56px 56px 36px",
                  borderBottom: "1px solid #0a0a05",
                  background: selectedIdx === idx ? "#0a0a1e" : idx % 2 === 0 ? "transparent" : "#030300",
                  padding: "3px 8px",
                }}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                onMouseEnter={(e) => {
                  if (selectedIdx !== idx) (e.currentTarget as HTMLElement).style.background = "#0a0a14";
                }}
                onMouseLeave={(e) => {
                  if (selectedIdx !== idx) (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "transparent" : "#030300";
                }}
              >
                <span style={{ color: "#0068ff" }}>{p.ticker}</span>
                <span className="truncate" style={{ color: "#ffa028", paddingRight: "4px" }}>{p.name}</span>
                <span className="text-right" style={{ color: "#fff" }}>${(p.mktValue / 1000).toFixed(1)}K</span>
                <span className="text-right" style={{ color: p.dayPnl >= 0 ? "#4af6c3" : "#ff433d" }}>
                  {p.dayPnl >= 0 ? "+" : ""}{p.dayPnl.toLocaleString()}
                </span>
                <span className="text-right" style={{ color: p.totalPnl >= 0 ? "#4af6c3" : "#ff433d" }}>
                  {p.totalPnl >= 0 ? "+" : ""}{p.totalPnl.toLocaleString()}
                </span>
                <span className="text-right" style={{ color: "#7a6030" }}>{p.pctWeight}%</span>
              </div>
            ))}
          </div>
        </>
      ) : activeTab === "ALLOC" ? (
        /* Allocation view — simple bar chart */
        <div className="flex-1 overflow-auto" style={{ padding: "8px" }}>
          {sorted.map((p) => (
            <div key={p.ticker} className="flex items-center gap-2 mb-[3px]">
              <span className="text-xs w-[36px]" style={{ color: "#0068ff" }}>{p.ticker}</span>
              <div className="flex-1 h-[10px] relative" style={{ background: "#0a0a05" }}>
                <div
                  style={{
                    width: `${p.pctWeight * 4}%`,
                    height: "100%",
                    background: p.totalPnl >= 0
                      ? `rgba(74, 246, 195, ${0.3 + p.pctWeight * 0.03})`
                      : `rgba(255, 67, 61, ${0.3 + p.pctWeight * 0.03})`,
                  }}
                />
              </div>
              <span className="text-xs w-[28px] text-right" style={{ color: "#7a6030" }}>{p.pctWeight}%</span>
            </div>
          ))}
        </div>
      ) : (
        /* Risk metrics view */
        <div className="flex-1 overflow-auto" style={{ padding: "8px" }}>
          {/* Risk Metrics Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "16px",
          }}>
            {RISK_METRICS.map((metric, idx) => (
              <div
                key={idx}
                style={{
                  background: "#050510",
                  border: "1px solid #0a0a05",
                  padding: "6px",
                  borderRadius: "2px",
                }}
              >
                <div style={{ fontSize: "9px", color: "#7a6030", marginBottom: "2px" }}>
                  {metric.name}
                </div>
                <div style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: metric.isPositive ? "#4af6c3" : "#ff433d",
                }}>
                  {metric.value}
                </div>
                <div style={{
                  marginTop: "2px",
                  height: "2px",
                  background: "#0a0a05",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    background: metric.isPositive ? "#4af6c3" : "#ff433d",
                    width: `${Math.min(parseFloat(metric.value) * 10, 100)}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Sector Exposure */}
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontSize: "9px", color: "#ffa028", fontWeight: "bold", marginBottom: "6px" }}>
              SECTOR EXPOSURE
            </div>
            {SECTOR_EXPOSURES.map((sector, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-[4px]">
                <span className="text-xs w-[80px]" style={{ color: "#7a6030" }}>
                  {sector.name}
                </span>
                <div className="flex-1 h-[8px] relative" style={{ background: "#0a0a05" }}>
                  <div
                    style={{
                      width: `${sector.pct}%`,
                      height: "100%",
                      background: sector.pct > 0
                        ? `rgba(74, 246, 195, ${0.3 + sector.pct * 0.01})`
                        : "transparent",
                    }}
                  />
                </div>
                <span className="text-xs w-[32px] text-right" style={{ color: "#7a6030" }}>
                  {sector.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between text-xs shrink-0"
        style={{ borderTop: "1px solid #1c1c1c", color: "#7a6030", padding: "3px 8px" }}
      >
        <span>{POSITIONS.length} POSITIONS</span>
        <span>REAL-TIME</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import PanelHeader from "./PanelHeader";
import { worldIndices } from "@/data/mock";

const gainers = [
  { ticker: "NVDA", name: "NVIDIA CORP", last: "924.52", changePct: "+3.21%" },
  { ticker: "AAPL", name: "APPLE INC", last: "189.84", changePct: "+2.10%" },
  { ticker: "MSFT", name: "MICROSOFT", last: "428.35", changePct: "+1.82%" },
  { ticker: "META", name: "META PLATF", last: "502.30", changePct: "+1.54%" },
  { ticker: "AMZN", name: "AMAZON.COM", last: "186.45", changePct: "+1.23%" },
  { ticker: "GOOGL", name: "ALPHABET-A", last: "174.25", changePct: "+0.98%" },
];

const losers = [
  { ticker: "BA", name: "BOEING CO", last: "178.92", changePct: "-2.83%" },
  { ticker: "PFE", name: "PFIZER INC", last: "26.45", changePct: "-2.12%" },
  { ticker: "CVX", name: "CHEVRON", last: "156.30", changePct: "-1.91%" },
  { ticker: "XOM", name: "EXXON MOBIL", last: "112.45", changePct: "-1.52%" },
  { ticker: "DIS", name: "WALT DISNEY", last: "112.80", changePct: "-1.24%" },
  { ticker: "INTC", name: "INTEL CORP", last: "31.25", changePct: "-0.95%" },
];

export default function MarketMoversPanel() {
  const [activeTab, setActiveTab] = useState<"WEI" | "MOV">("WEI");

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader
        title={activeTab === "WEI" ? "WEI" : "MOV"}
        subtitle={activeTab === "WEI" ? "World Equity Indices" : "Market Movers"}
        rightLabel="ALLX"
      />

      {/* Tab bar */}
      <div
        className="flex items-center h-[18px] text-[9px] shrink-0"
        style={{ borderBottom: "1px solid #1c1c1c" }}
      >
        {(["WEI", "MOV"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0 10px",
              height: "100%",
              color: activeTab === tab ? "#000" : "#7a6030",
              background: activeTab === tab ? "#ffa028" : "transparent",
              borderRight: "1px solid #1c1c1c",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "WEI" ? (
        <>
          {/* World Indices headers */}
          <div
            className="grid text-xs shrink-0"
            style={{
              gridTemplateColumns: "62px 1fr 74px 50px",
              color: "#7a6030",
              borderBottom: "1px solid #ffa028",
              background: "#050500",
              padding: "3px 8px",
            }}
          >
            <span>TICKER</span>
            <span>NAME</span>
            <span className="text-right">LAST</span>
            <span className="text-right">%CHG</span>
          </div>
          <div className="flex-1 overflow-auto">
            {worldIndices.map((s, idx) => (
              <div
                key={s.ticker}
                className="grid text-xs cursor-pointer"
                style={{
                  gridTemplateColumns: "62px 1fr 74px 50px",
                  borderBottom: "1px solid #0a0a05",
                  background: idx % 2 === 0 ? "transparent" : "#030300",
                  padding: "3px 8px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#0a0a14";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    idx % 2 === 0 ? "transparent" : "#030300";
                }}
              >
                <span style={{ color: "#0068ff" }}>{s.ticker}</span>
                <span className="truncate" style={{ color: "#ffa028", paddingRight: "4px" }}>{s.name}</span>
                <span className="text-right" style={{ color: "#fff" }}>{s.last}</span>
                <span
                  className="text-right"
                  style={{ color: s.direction === "up" ? "#4af6c3" : "#ff433d" }}
                >
                  {s.changePct}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-auto">
          {/* GAINERS */}
          <div
            className="text-[10px] font-bold"
            style={{ color: "#4af6c3", background: "#001a10", borderBottom: "1px solid #0a0a05", padding: "3px 8px" }}
          >
            ▲ TOP GAINERS
          </div>
          {gainers.map((g, idx) => (
            <div
              key={g.ticker}
              className="grid text-[9px] cursor-pointer"
              style={{
                gridTemplateColumns: "36px 1fr 50px 42px",
                borderBottom: "1px solid #0a0a05",
                background: idx % 2 === 0 ? "transparent" : "#030300",
                padding: "3px 8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0a0a14";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  idx % 2 === 0 ? "transparent" : "#030300";
              }}
            >
              <span style={{ color: "#0068ff" }}>{g.ticker}</span>
              <span className="truncate" style={{ color: "#ffa028", paddingRight: "4px" }}>{g.name}</span>
              <span className="text-right" style={{ color: "#fff" }}>{g.last}</span>
              <span className="text-right font-bold" style={{ color: "#4af6c3" }}>
                {g.changePct}
              </span>
            </div>
          ))}

          {/* LOSERS */}
          <div
            className="text-[10px] font-bold"
            style={{ color: "#ff433d", background: "#1a0000", borderBottom: "1px solid #0a0a05", padding: "3px 8px", marginTop: "2px" }}
          >
            ▼ TOP LOSERS
          </div>
          {losers.map((l, idx) => (
            <div
              key={l.ticker}
              className="grid text-[9px] cursor-pointer"
              style={{
                gridTemplateColumns: "36px 1fr 50px 42px",
                borderBottom: "1px solid #0a0a05",
                background: idx % 2 === 0 ? "transparent" : "#030300",
                padding: "3px 8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0a0a14";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  idx % 2 === 0 ? "transparent" : "#030300";
              }}
            >
              <span style={{ color: "#0068ff" }}>{l.ticker}</span>
              <span className="truncate" style={{ color: "#ffa028", paddingRight: "4px" }}>{l.name}</span>
              <span className="text-right" style={{ color: "#fff" }}>{l.last}</span>
              <span className="text-right font-bold" style={{ color: "#ff433d" }}>
                {l.changePct}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

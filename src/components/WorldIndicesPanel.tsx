"use client";

import PanelHeader from "./PanelHeader";
import { worldIndices } from "@/data/mock";

export default function WorldIndicesPanel() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="WEI" subtitle="World Equity Indices" rightLabel="ALLX" />

      {/* Headers */}
      <div
        className="grid py-[2px] px-2 shrink-0"
        style={{
          gridTemplateColumns: "64px 1fr 80px 56px",
          color: "#7a6030",
          borderBottom: "1px solid #ffa028",
          background: "#050500",
          fontSize: "10.5px",
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
            className="grid py-[4px] px-2 cursor-pointer"
            style={{
              gridTemplateColumns: "64px 1fr 80px 56px",
              borderBottom: "1px solid #0a0a05",
              background: idx % 2 === 0 ? "transparent" : "#030300",
              fontSize: "10.5px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#0a0a14";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                idx % 2 === 0 ? "transparent" : "#030300";
            }}
          >
            <span className="font-bold" style={{ color: "#0068ff" }}>{s.ticker}</span>
            <span className="truncate pr-1" style={{ color: "#ffa028" }}>{s.name}</span>
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
    </div>
  );
}

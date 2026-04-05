"use client";

import { useState } from "react";
import PanelHeader from "./PanelHeader";
import { economicEvents } from "@/data/mock";

export default function EconCalendarPanel() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="ECO" subtitle="Economic Calendar" rightLabel="ECST" />

      {/* Headers */}
      <div
        className="grid text-[10px] shrink-0"
        style={{
          gridTemplateColumns: "28px 36px 1fr 42px 42px 42px",
          color: "#7a6030",
          borderBottom: "1px solid #ffa028",
          background: "#050500",
          padding: "3px 8px",
        }}
      >
        <span>IMP</span>
        <span>TIME</span>
        <span>EVENT</span>
        <span className="text-right">ACT</span>
        <span className="text-right">SURV</span>
        <span className="text-right">PRIOR</span>
      </div>

      <div className="flex-1 overflow-auto">
        {economicEvents.map((e, idx) => (
          <div key={idx}>
            <div
              className="grid text-[10px] cursor-pointer"
              style={{
                gridTemplateColumns: "28px 36px 1fr 42px 42px 42px",
                borderBottom: expandedIdx === idx ? "none" : "1px solid #0a0a05",
                background: selectedIdx === idx ? "#0a0a1e" : idx % 2 === 0 ? "transparent" : "#030300",
                padding: "4px 8px",
              }}
              onClick={() => {
                setSelectedIdx(selectedIdx === idx ? null : idx);
                setExpandedIdx(expandedIdx === idx ? null : idx);
              }}
              onMouseEnter={(ev) => {
                if (selectedIdx !== idx) (ev.currentTarget as HTMLElement).style.background = "#0a0a14";
              }}
              onMouseLeave={(ev) => {
                if (selectedIdx !== idx) (ev.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "transparent" : "#030300";
              }}
            >
              <span style={{
                color: e.importance === 3 ? "#ff433d" : e.importance === 2 ? "#ffa028" : "#3d3020",
                fontSize: "8px"
              }}>
                {e.importance === 3 ? "●●●" : e.importance === 2 ? "●●" : "●"}
              </span>
              <span style={{ color: "#7a6030" }}>{e.time}</span>
              <span className="truncate" style={{ color: selectedIdx === idx ? "#fff" : "#ffa028", paddingRight: "6px" }}>{e.event}</span>
              <span
                className="text-right font-bold"
                style={{
                  color:
                    e.actual === "--"
                      ? "#3d3020"
                      : e.surprise === "up"
                        ? "#4af6c3"
                        : e.surprise === "down"
                          ? "#ff433d"
                          : "#ffa028",
                }}
              >
                {e.actual}
              </span>
              <span className="text-right" style={{ color: "#7a6030" }}>
                {e.forecast}
              </span>
              <span className="text-right" style={{ color: "#7a6030" }}>
                {e.prior}
              </span>
            </div>

            {/* Expanded detail */}
            {expandedIdx === idx && (
              <div
                style={{
                  background: "#050510",
                  borderBottom: "1px solid #0a0a05",
                  padding: "4px 8px 4px 64px",
                  fontSize: "9px",
                  color: "#7a6030",
                }}
              >
                <div style={{ color: "#ffa028" }}>{e.event}</div>
                <div style={{ marginTop: "2px" }}>
                  Importance: <span style={{ color: e.importance === 3 ? "#ff433d" : e.importance === 2 ? "#ffa028" : "#3d3020", fontWeight: "bold" }}>
                    {e.importance === 3 ? "HIGH" : e.importance === 2 ? "MEDIUM" : "LOW"}
                  </span>
                </div>
                <div style={{ marginTop: "2px" }}>
                  {e.actual !== "--" ? (
                    <>
                      Actual: <span style={{ color: e.surprise === "up" ? "#4af6c3" : e.surprise === "down" ? "#ff433d" : "#ffa028", fontWeight: "bold" }}>{e.actual}</span>
                      {" "} | Survey: {e.forecast} | Prior: {e.prior}
                      {e.surprise === "up" && <span style={{ color: "#4af6c3" }}> (Beat)</span>}
                      {e.surprise === "down" && <span style={{ color: "#ff433d" }}> (Miss)</span>}
                    </>
                  ) : (
                    <>Scheduled: {e.time} ET | Survey: {e.forecast} | Prior: {e.prior}</>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex items-center justify-between text-[10px] shrink-0"
        style={{ borderTop: "1px solid #1c1c1c", color: "#7a6030", padding: "3px 8px" }}
      >
        <span>TODAY&apos;S EVENTS</span>
        <span>SOURCE: BN</span>
      </div>
    </div>
  );
}

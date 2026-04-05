"use client";

import { useState, useEffect, useMemo } from "react";
import PanelHeader from "./PanelHeader";
import { newsItems } from "@/data/mock";

const CATEGORIES = ["TOP", "EXCL", "ECO", "FED", "STK", "FX", "CMD", "GOV"];

export default function NewsPanel() {
  const [flashBlink, setFlashBlink] = useState(true);
  const [activeTab, setActiveTab] = useState("TOP");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setFlashBlink((p) => !p), 800);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = useMemo(() => {
    if (activeTab === "TOP") return newsItems;
    return newsItems.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="TOP" subtitle="Top News" rightLabel="N" />

      {/* Category tabs */}
      <div
        className="flex items-center h-[18px] text-[9px] shrink-0"
        style={{ borderBottom: "1px solid #1c1c1c" }}
      >
        {CATEGORIES.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedIdx(null);
              setExpandedIdx(null);
            }}
            style={{
              padding: "0 8px",
              height: "100%",
              color: activeTab === tab ? "#000" : "#7a6030",
              background: activeTab === tab ? "#ffa028" : "transparent",
              borderRight: "1px solid #1c1c1c",
              cursor: "pointer",
              transition: "background 0.1s, color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = "#1a1000";
                e.currentTarget.style.color = "#ffa028";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#7a6030";
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-auto">
        {filteredNews.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px]" style={{ color: "#7a6030" }}>
            No {activeTab} stories available
          </div>
        ) : (
          filteredNews.map((item, idx) => (
            <div key={item.id}>
              <div
                className="flex gap-2 cursor-pointer"
                style={{
                  borderBottom: expandedIdx === idx ? "none" : "1px solid #0a0a05",
                  background:
                    selectedIdx === idx
                      ? "#0a0a1e"
                      : item.urgency === "FLASH"
                        ? "#0a0000"
                        : "transparent",
                  padding: "4px 8px",
                }}
                onClick={() => {
                  setSelectedIdx(selectedIdx === idx ? null : idx);
                  setExpandedIdx(expandedIdx === idx ? null : idx);
                }}
                onMouseEnter={(e) => {
                  if (selectedIdx !== idx) {
                    (e.currentTarget as HTMLElement).style.background = "#0a0a14";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIdx !== idx) {
                    (e.currentTarget as HTMLElement).style.background =
                      item.urgency === "FLASH" ? "#0a0000" : "transparent";
                  }
                }}
              >
                {/* Time */}
                <span className="text-[9px] shrink-0" style={{ color: "#7a6030", width: "34px" }}>
                  {item.time}
                </span>

                {/* Urgency badge */}
                <span className="text-[9px] shrink-0 text-center font-bold" style={{
                  width: "12px",
                  color:
                    item.urgency === "FLASH" ? "#ff433d" :
                    item.urgency === "URGENT" ? "#ffa028" :
                    "#3d3020",
                }}>
                  {item.urgency === "FLASH" ? (
                    <span style={{ opacity: flashBlink ? 1 : 0.3 }}>*</span>
                  ) : item.urgency === "URGENT" ? "!" : " "}
                </span>

                {/* Category */}
                <span className="text-[9px] shrink-0" style={{ color: "#0068ff", width: "28px" }}>
                  {item.category}
                </span>

                {/* Headline */}
                <span
                  className={expandedIdx === idx ? "text-[10px]" : "text-[10px] truncate"}
                  style={{
                    color:
                      item.urgency === "FLASH" ? "#ff433d" :
                      item.urgency === "URGENT" ? "#fff" :
                      selectedIdx === idx ? "#fff" :
                      "#ffa028",
                    fontWeight: item.urgency !== "NORMAL" || selectedIdx === idx ? "bold" : "normal",
                  }}
                >
                  {item.headline}
                </span>

                {/* Source */}
                <span className="text-[10px] shrink-0" style={{ color: "#3d3020", marginLeft: "auto", paddingLeft: "4px" }}>
                  ({item.source})
                </span>

                {/* Sentiment indicator */}
                <span className="text-[10px] shrink-0" style={{
                  color: item.sentiment === "bullish" ? "#4af6c3" : item.sentiment === "bearish" ? "#ff433d" : "#ffa028",
                  paddingLeft: "4px",
                  fontWeight: "bold"
                }}>
                  {item.sentiment === "bullish" ? "▲" : item.sentiment === "bearish" ? "▼" : "●"}
                </span>
              </div>

              {/* Expanded detail */}
              {expandedIdx === idx && (
                <div
                  style={{
                    background: "#050510",
                    borderBottom: "1px solid #0a0a05",
                    padding: "6px 8px 6px 82px",
                    fontSize: "9px",
                    color: "#7a6030",
                    lineHeight: "1.4",
                  }}
                >
                  <div style={{ color: "#ffa028", marginBottom: "3px" }}>
                    {item.headline}
                  </div>
                  <div>
                    Source: {item.source} | Category: {item.category} | {item.time} ET
                  </div>
                  <div style={{ marginTop: "3px" }}>
                    Sentiment: <span style={{
                      color: item.sentiment === "bullish" ? "#4af6c3" : item.sentiment === "bearish" ? "#ff433d" : "#ffa028",
                      fontWeight: "bold"
                    }}>
                      {item.sentiment.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ marginTop: "3px", color: "#3d3020" }}>
                    Click headline for full story. Press ESC to close.
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between text-[10px] shrink-0"
        style={{ borderTop: "1px solid #1c1c1c", color: "#7a6030", padding: "3px 8px" }}
      >
        <span>SOURCE: BN</span>
        <span>BLOOMBERG NEWS</span>
        <span>{filteredNews.length} STORIES</span>
      </div>
    </div>
  );
}

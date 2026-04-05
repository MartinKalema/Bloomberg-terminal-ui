"use client";

import { useState, useRef, useEffect } from "react";
import PanelHeader from "./PanelHeader";
import { watchlist, SecurityRow } from "@/data/mock";

// Mock watchlist data for different categories
const techWatchlist: SecurityRow[] = [
  { ticker: "AAPL", name: "Apple Inc.", last: "195.45", change: "+2.10", changePct: "+1.09%", direction: "up", volume: "52.3M" },
  { ticker: "MSFT", name: "Microsoft Corp.", last: "428.65", change: "+3.20", changePct: "+0.75%", direction: "up", volume: "18.4M" },
  { ticker: "NVDA", name: "NVIDIA Corp.", last: "876.42", change: "+12.50", changePct: "+1.44%", direction: "up", volume: "35.8M" },
  { ticker: "GOOGL", name: "Alphabet Inc.", last: "156.78", change: "+1.45", changePct: "+0.93%", direction: "up", volume: "24.2M" },
  { ticker: "META", name: "Meta Platforms", last: "512.30", change: "+8.15", changePct: "+1.61%", direction: "up", volume: "15.6M" },
  { ticker: "AMZN", name: "Amazon.com Inc.", last: "192.45", change: "+2.35", changePct: "+1.23%", direction: "up", volume: "42.1M" },
  { ticker: "AMD", name: "Advanced Micro Dev.", last: "189.65", change: "+4.20", changePct: "+2.27%", direction: "up", volume: "28.9M" },
  { ticker: "CRM", name: "Salesforce Inc.", last: "268.90", change: "+1.80", changePct: "+0.67%", direction: "up", volume: "6.7M" },
  { ticker: "ADBE", name: "Adobe Inc.", last: "615.32", change: "+3.10", changePct: "+0.51%", direction: "up", volume: "1.9M" },
  { ticker: "INTC", name: "Intel Corp.", last: "42.15", change: "-0.35", changePct: "-0.82%", direction: "down", volume: "44.2M" },
];

const macroWatchlist: SecurityRow[] = [
  { ticker: "USGG10YR", name: "US 10Y Yield", last: "4.25", change: "+0.08", changePct: "+1.92%", direction: "up", volume: "N/A" },
  { ticker: "USGG2YR", name: "US 2Y Yield", last: "4.88", change: "+0.12", changePct: "+2.51%", direction: "up", volume: "N/A" },
  { ticker: "CL1", name: "Crude Oil", last: "78.45", change: "+1.20", changePct: "+1.55%", direction: "up", volume: "285.3K" },
  { ticker: "GC1", name: "Gold Futures", last: "2385.50", change: "+15.30", changePct: "+0.65%", direction: "up", volume: "187.5K" },
  { ticker: "EUR", name: "EUR/USD", last: "1.0856", change: "+0.0045", changePct: "+0.42%", direction: "up", volume: "N/A" },
  { ticker: "GBP", name: "GBP/USD", last: "1.2678", change: "-0.0025", changePct: "-0.20%", direction: "down", volume: "N/A" },
  { ticker: "JPY", name: "USD/JPY", last: "148.35", change: "+0.85", changePct: "+0.57%", direction: "up", volume: "N/A" },
  { ticker: "DXY", name: "Dollar Index", last: "104.25", change: "-0.32", changePct: "-0.31%", direction: "down", volume: "N/A" },
];

// Sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 48,
    h = 14;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export default function WatchlistPanel() {
  const [activeTab, setActiveTab] = useState<"MAIN" | "TECH" | "MACRO" | "CUSTOM">("MAIN");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [flashCells, setFlashCells] = useState<Record<string, "up" | "down">>({});
  const [liveData, setLiveData] = useState<SecurityRow[]>(watchlist);
  const [techData, setTechData] = useState<SecurityRow[]>(techWatchlist);
  const [macroData, setMacroData] = useState<SecurityRow[]>(macroWatchlist);
  const [customData, setCustomData] = useState<SecurityRow[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [addInputValue, setAddInputValue] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  // Generate sparkline data for each ticker
  const sparklineData = useRef<Record<string, number[]>>({});

  const currentWatchlist = {
    MAIN: liveData,
    TECH: techData,
    MACRO: macroData,
    CUSTOM: customData,
  }[activeTab];

  useEffect(() => {
    currentWatchlist.forEach((s) => {
      if (!sparklineData.current[s.ticker]) {
        const base = parseFloat(s.last.replace(/,/g, ""));
        const points: number[] = [];
        let p = base * 0.995;
        for (let i = 0; i < 20; i++) {
          p += (Math.random() - 0.48) * base * 0.002;
          points.push(p);
        }
        sparklineData.current[s.ticker] = points;
      }
    });
  }, [currentWatchlist]);

  // Simulate price updates every 2-3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const updateList = (list: SecurityRow[]) => {
        const count = Math.random() > 0.5 ? 2 : 1;
        const newFlashes: Record<string, "up" | "down"> = {};
        const updatedData = [...list];

        for (let i = 0; i < count && i < updatedData.length; i++) {
          const idx = Math.floor(Math.random() * updatedData.length);
          const security = updatedData[idx];
          const direction = Math.random() > 0.5 ? "up" : "down";
          const changeAmount = direction === "up" ? 0.05 : -0.05;

          newFlashes[security.ticker] = direction;

          // Update sparkline data
          const lastPrice = parseFloat(security.last.replace(/,/g, ""));
          const newPrice = lastPrice + changeAmount;
          if (sparklineData.current[security.ticker]) {
            sparklineData.current[security.ticker] = [
              ...sparklineData.current[security.ticker].slice(1),
              newPrice,
            ];
          }

          // Update the security price
          updatedData[idx] = {
            ...security,
            last: newPrice.toFixed(2),
          };
        }

        setFlashCells(newFlashes);
        setTimeout(() => setFlashCells({}), 600);
        return updatedData;
      };

      if (activeTab === "MAIN") setLiveData(updateList(liveData));
      else if (activeTab === "TECH") setTechData(updateList(techData));
      else if (activeTab === "MACRO") setMacroData(updateList(macroData));
      else if (activeTab === "CUSTOM") setCustomData(updateList(customData));
    }, 2500);

    return () => clearInterval(interval);
  }, [activeTab, liveData, techData, macroData, customData]);

  useEffect(() => {
    if (showAddInput && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddInput]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const handleAddSecurity = () => {
    if (addInputValue.trim() && activeTab === "CUSTOM") {
      const ticker = addInputValue.trim().toUpperCase();
      const newSecurity: SecurityRow = {
        ticker,
        name: ticker,
        last: "0.00",
        change: "0.00",
        changePct: "0.00%",
        direction: "flat",
        volume: "0",
      };
      setCustomData([...customData, newSecurity]);
      setAddInputValue("");
      setShowAddInput(false);
    }
  };

  const handleRemoveSecurity = (tickerToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTab === "CUSTOM") {
      setCustomData(customData.filter((s) => s.ticker !== tickerToRemove));
    } else if (activeTab === "MAIN") {
      setLiveData(liveData.filter((s) => s.ticker !== tickerToRemove));
    } else if (activeTab === "TECH") {
      setTechData(techData.filter((s) => s.ticker !== tickerToRemove));
    } else if (activeTab === "MACRO") {
      setMacroData(macroData.filter((s) => s.ticker !== tickerToRemove));
    }
  };

  const sortedWatchlist = [...currentWatchlist].sort((a, b) => {
    if (!sortCol) return 0;
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortCol) {
      case "TICKER":
        return a.ticker.localeCompare(b.ticker) * dir;
      case "NAME":
        return a.name.localeCompare(b.name) * dir;
      case "LAST":
        return (
          (parseFloat(a.last.replace(/,/g, "")) -
            parseFloat(b.last.replace(/,/g, ""))) *
          dir
        );
      case "%CHG":
        return (parseFloat(a.changePct) - parseFloat(b.changePct)) * dir;
      default:
        return 0;
    }
  });

  const columns = [
    { key: "TICKER", label: "TICKER" },
    { key: "NAME", label: "NAME" },
    { key: "SPARKLINE", label: "" },
    { key: "LAST", label: "LAST" },
    { key: "NET CHG", label: "NET CHG" },
    { key: "%CHG", label: "%CHG" },
    { key: "VOLUME", label: "VOLUME" },
  ];

  const tabs = ["MAIN", "TECH", "MACRO", "CUSTOM"] as const;

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="MONITOR" subtitle="Securities" rightLabel="MON" />

      {/* Watchlist tabs */}
      <div
        className="flex items-center shrink-0 text-xs"
        style={{
          borderBottom: "1px solid #ffa028",
          background: "#050500",
          padding: "0 8px",
          gap: "12px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedIdx(null);
              setSortCol(null);
            }}
            style={{
              background: activeTab === tab ? "#0a0a1e" : "transparent",
              color: activeTab === tab ? "#ffa028" : "#7a6030",
              border: "none",
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: activeTab === tab ? "bold" : "normal",
              transition: "all 0.2s",
              borderBottom: activeTab === tab ? "2px solid #ffa028" : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable table — header + body scroll together horizontally */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: "400px" }}>
          {/* Column Headers */}
          <div
            className="grid text-xs"
            style={{
              gridTemplateColumns: "62px 1fr 50px 74px 58px 50px 52px",
              color: "#7a6030",
              borderBottom: "1px solid #ffa028",
              background: "#050500",
              padding: "3px 8px",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {columns.map((col) => (
              <span
                key={col.key}
                onClick={() =>
                  col.key !== "SPARKLINE" && handleSort(col.key)
                }
                className={
                  col.key !== "TICKER" && col.key !== "NAME" && col.key !== "SPARKLINE"
                    ? "text-right"
                    : ""
                }
                style={{
                  cursor:
                    col.key !== "SPARKLINE" ? "pointer" : "default",
                  color:
                    sortCol === col.key ? "#ffa028" : "#7a6030",
                }}
              >
                {col.label}
                {sortCol === col.key
                  ? sortDir === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </span>
            ))}
          </div>

          {/* Securities */}
          {sortedWatchlist.map((s, idx) => {
            const sparkColor =
              s.direction === "up" ? "#4af6c3" : s.direction === "down" ? "#ff433d" : "#ffa028";
            const flashBg = flashCells[s.ticker]
              ? flashCells[s.ticker] === "up"
                ? "rgba(74, 246, 195, 0.3)"
                : "rgba(255, 67, 61, 0.3)"
              : "transparent";

            return (
              <div
                key={s.ticker}
                className="grid text-xs cursor-pointer group"
                style={{
                  gridTemplateColumns: "62px 1fr 50px 74px 58px 50px 52px",
                  borderBottom: "1px solid #0a0a05",
                  background:
                    selectedIdx === idx ? "#0a0a1e" : idx % 2 === 0 ? "transparent" : "#030300",
                  padding: "3px 8px",
                  position: "relative",
                }}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                onMouseEnter={(e) => {
                  if (selectedIdx !== idx)
                    (e.currentTarget as HTMLElement).style.background = "#0a0a14";
                }}
                onMouseLeave={(e) => {
                  if (selectedIdx !== idx)
                    (e.currentTarget as HTMLElement).style.background =
                      idx % 2 === 0 ? "transparent" : "#030300";
                }}
              >
                <span style={{ color: selectedIdx === idx ? "#fff" : "#0068ff" }}>
                  {s.ticker}
                </span>
                <span
                  className="truncate"
                  style={{
                    color: selectedIdx === idx ? "#fff" : "#ffa028",
                    paddingRight: "6px",
                  }}
                >
                  {s.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sparklineData.current[s.ticker] && (
                    <Sparkline
                      data={sparklineData.current[s.ticker]}
                      color={sparkColor}
                    />
                  )}
                </div>
                <span
                  className="text-right font-bold"
                  style={{
                    color: "#fff",
                    background: flashBg,
                    transition: "background-color 0.6s ease-out",
                    padding: "2px 4px",
                    borderRadius: "2px",
                  }}
                >
                  {s.last}
                </span>
                <span
                  className="text-right"
                  style={{
                    color:
                      s.direction === "up"
                        ? "#4af6c3"
                        : s.direction === "down"
                        ? "#ff433d"
                        : "#ffa028",
                  }}
                >
                  {s.change}
                </span>
                <span
                  className="text-right"
                  style={{
                    color:
                      s.direction === "up"
                        ? "#4af6c3"
                        : s.direction === "down"
                        ? "#ff433d"
                        : "#ffa028",
                  }}
                >
                  {s.changePct}
                </span>
                <span className="text-right" style={{ color: "#7a6030" }}>
                  {s.volume}
                </span>

                {/* X button on hover */}
                <button
                  onClick={(e) => handleRemoveSecurity(s.ticker, e)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 67, 61, 0.3)",
                    border: "1px solid #ff433d",
                    color: "#ff433d",
                    width: "16px",
                    height: "16px",
                    padding: "0",
                    cursor: "pointer",
                    fontSize: "10px",
                    borderRadius: "2px",
                    display: selectedIdx === idx ? "block" : "none",
                    opacity: selectedIdx === idx ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  X
                </button>
              </div>
            );
          })}

          {/* Add security input row */}
          {showAddInput && activeTab === "CUSTOM" && (
            <div
              style={{
                gridTemplateColumns: "62px 1fr 50px 74px 58px 50px 52px",
                display: "grid",
                borderBottom: "1px solid #0a0a05",
                padding: "3px 8px",
                background: "#0a0a14",
              }}
            >
              <input
                ref={addInputRef}
                type="text"
                value={addInputValue}
                onChange={(e) => setAddInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSecurity();
                  if (e.key === "Escape") setShowAddInput(false);
                }}
                placeholder="Ticker"
                style={{
                  background: "#000",
                  border: "1px solid #ffa028",
                  color: "#fff",
                  padding: "2px 4px",
                  fontSize: "10px",
                  gridColumn: "1",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between text-xs shrink-0"
        style={{ borderTop: "1px solid #1c1c1c", color: "#7a6030", padding: "3px 8px" }}
      >
        <div className="flex items-center gap-4">
          <span>{currentWatchlist.length} SECURITIES</span>
          {activeTab === "CUSTOM" && (
            <button
              onClick={() => setShowAddInput(!showAddInput)}
              style={{
                background: "transparent",
                border: "1px solid #ffa028",
                color: "#ffa028",
                padding: "2px 6px",
                cursor: "pointer",
                fontSize: "8px",
                borderRadius: "2px",
              }}
            >
              +
            </button>
          )}
        </div>
        <span>{activeTab}</span>
      </div>
    </div>
  );
}

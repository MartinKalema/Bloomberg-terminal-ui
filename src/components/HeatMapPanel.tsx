"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Data ──────────────────── */

interface Stock {
  ticker: string;
  name: string;
  changePct: number;
  weight: number; // relative market cap
}

interface Sector {
  name: string;
  ticker: string;
  changePct: number;
  weight: number;
  stocks: Stock[];
}

const SECTORS: Sector[] = [
  {
    name: "Technology", ticker: "XLK", changePct: 1.24, weight: 32,
    stocks: [
      { ticker: "AAPL", name: "Apple", changePct: 2.1, weight: 8 },
      { ticker: "MSFT", name: "Microsoft", changePct: 1.8, weight: 7 },
      { ticker: "NVDA", name: "Nvidia", changePct: 3.2, weight: 6 },
      { ticker: "GOOG", name: "Alphabet", changePct: 0.9, weight: 5 },
      { ticker: "META", name: "Meta", changePct: 1.5, weight: 4 },
      { ticker: "AVGO", name: "Broadcom", changePct: 0.7, weight: 2 },
    ],
  },
  {
    name: "Healthcare", ticker: "XLV", changePct: -0.42, weight: 14,
    stocks: [
      { ticker: "UNH", name: "UnitedHealth", changePct: -0.8, weight: 4 },
      { ticker: "JNJ", name: "J&J", changePct: 0.3, weight: 3 },
      { ticker: "LLY", name: "Eli Lilly", changePct: -1.2, weight: 3 },
      { ticker: "PFE", name: "Pfizer", changePct: -2.1, weight: 2 },
      { ticker: "ABBV", name: "AbbVie", changePct: 0.5, weight: 2 },
    ],
  },
  {
    name: "Financials", ticker: "XLF", changePct: 0.67, weight: 13,
    stocks: [
      { ticker: "JPM", name: "JPMorgan", changePct: 1.1, weight: 4 },
      { ticker: "BAC", name: "BofA", changePct: 0.6, weight: 3 },
      { ticker: "WFC", name: "Wells Fargo", changePct: 0.3, weight: 2 },
      { ticker: "GS", name: "Goldman", changePct: 1.4, weight: 2 },
      { ticker: "MS", name: "Morgan St", changePct: 0.8, weight: 2 },
    ],
  },
  {
    name: "Cons Discr", ticker: "XLY", changePct: 0.89, weight: 11,
    stocks: [
      { ticker: "AMZN", name: "Amazon", changePct: 1.2, weight: 5 },
      { ticker: "TSLA", name: "Tesla", changePct: 2.4, weight: 3 },
      { ticker: "HD", name: "Home Depot", changePct: -0.3, weight: 2 },
      { ticker: "NKE", name: "Nike", changePct: -0.6, weight: 1 },
    ],
  },
  {
    name: "Industrials", ticker: "XLI", changePct: 0.31, weight: 9,
    stocks: [
      { ticker: "CAT", name: "Caterpillar", changePct: 0.8, weight: 2 },
      { ticker: "BA", name: "Boeing", changePct: -2.8, weight: 2 },
      { ticker: "HON", name: "Honeywell", changePct: 0.4, weight: 2 },
      { ticker: "UPS", name: "UPS", changePct: -0.2, weight: 2 },
      { ticker: "RTX", name: "RTX Corp", changePct: 0.6, weight: 1 },
    ],
  },
  {
    name: "Cons Stpls", ticker: "XLP", changePct: 0.12, weight: 7,
    stocks: [
      { ticker: "PG", name: "Procter&G", changePct: 0.3, weight: 2 },
      { ticker: "KO", name: "Coca-Cola", changePct: 0.1, weight: 2 },
      { ticker: "PEP", name: "PepsiCo", changePct: -0.2, weight: 2 },
      { ticker: "COST", name: "Costco", changePct: 0.4, weight: 1 },
    ],
  },
  {
    name: "Energy", ticker: "XLE", changePct: -1.52, weight: 5,
    stocks: [
      { ticker: "XOM", name: "ExxonMobil", changePct: -1.5, weight: 2 },
      { ticker: "CVX", name: "Chevron", changePct: -1.9, weight: 2 },
      { ticker: "COP", name: "Conoco", changePct: -1.1, weight: 1 },
    ],
  },
  {
    name: "Comm Svcs", ticker: "XLC", changePct: 0.91, weight: 4,
    stocks: [
      { ticker: "NFLX", name: "Netflix", changePct: 1.8, weight: 2 },
      { ticker: "DIS", name: "Disney", changePct: 0.2, weight: 2 },
    ],
  },
  {
    name: "Utilities", ticker: "XLU", changePct: -0.28, weight: 3,
    stocks: [
      { ticker: "NEE", name: "NextEra", changePct: -0.4, weight: 1 },
      { ticker: "DUK", name: "Duke En", changePct: 0.1, weight: 1 },
      { ticker: "SO", name: "Southern", changePct: -0.3, weight: 1 },
    ],
  },
  {
    name: "Materials", ticker: "XLB", changePct: 0.44, weight: 3,
    stocks: [
      { ticker: "LIN", name: "Linde", changePct: 0.6, weight: 1 },
      { ticker: "APD", name: "Air Prod", changePct: 0.3, weight: 1 },
      { ticker: "FCX", name: "Freeport", changePct: 0.5, weight: 1 },
    ],
  },
];

/* ──────────────────── Color Mapping ──────────────────── */

function getColor(pct: number): string {
  // Bloomberg-style: deep red → dark red → neutral dark → dark green → bright green
  if (pct <= -3) return "#8b0000";
  if (pct <= -2) return "#b91c1c";
  if (pct <= -1) return "#7f1d1d";
  if (pct <= -0.5) return "#4a1515";
  if (pct < 0) return "#2d1a1a";
  if (pct === 0) return "#1a1a1a";
  if (pct < 0.5) return "#1a2d1a";
  if (pct <= 1) return "#15401a";
  if (pct <= 2) return "#166534";
  if (pct <= 3) return "#15803d";
  return "#16a34a";
}

/* ──────────────────── Squarified Treemap Algorithm ──────────────────── */

interface TreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
  data: { ticker: string; name: string; changePct: number; weight: number };
}

function squarify(
  items: { ticker: string; name: string; changePct: number; weight: number }[],
  x: number, y: number, w: number, h: number
): TreeRect[] {
  if (items.length === 0 || w <= 0 || h <= 0) return [];

  const totalArea = w * h;
  const totalWeight = items.reduce((s, d) => s + d.weight, 0);
  if (totalWeight <= 0) return [];

  // Sort by weight descending for better treemap packing
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const rects: TreeRect[] = [];

  let remaining = [...sorted];
  let cx = x, cy = y, cw = w, ch = h;
  let remainingWeight = totalWeight;

  while (remaining.length > 0) {
    const isHorizontal = cw >= ch;
    const side = isHorizontal ? ch : cw;

    // Find best row using squarify heuristic
    let row: typeof remaining = [];
    let rowWeight = 0;
    let bestWorst = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = [...row, remaining[i]];
      const candidateWeight = rowWeight + remaining[i].weight;
      const rowArea = (candidateWeight / remainingWeight) * cw * ch;
      const rowSide = rowArea / side;

      // Calculate worst aspect ratio in this row
      let worst = 0;
      for (const item of candidate) {
        const itemArea = (item.weight / candidateWeight) * rowArea;
        const itemSide = itemArea / rowSide;
        const aspect = Math.max(rowSide / itemSide, itemSide / rowSide);
        worst = Math.max(worst, aspect);
      }

      if (worst <= bestWorst || row.length === 0) {
        row = candidate;
        rowWeight = candidateWeight;
        bestWorst = worst;
      } else {
        break;
      }
    }

    // Layout the row
    const rowFraction = rowWeight / remainingWeight;
    const rowSize = isHorizontal
      ? cw * rowFraction
      : ch * rowFraction;

    let pos = isHorizontal ? cy : cx;
    for (const item of row) {
      const itemFraction = item.weight / rowWeight;
      const itemSize = side * itemFraction;

      if (isHorizontal) {
        rects.push({ x: cx, y: pos, w: rowSize, h: itemSize, data: item });
        pos += itemSize;
      } else {
        rects.push({ x: pos, y: cy, w: itemSize, h: rowSize, data: item });
        pos += itemSize;
      }
    }

    // Update remaining area
    if (isHorizontal) {
      cx += rowSize;
      cw -= rowSize;
    } else {
      cy += rowSize;
      ch -= rowSize;
    }

    remaining = remaining.slice(row.length);
    remainingWeight -= rowWeight;
  }

  return rects;
}

/* ──────────────────── Canvas Treemap Renderer ──────────────────── */

type ViewMode = "sector" | "stocks";

export default function HeatMapPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>("sector");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rectsRef = useRef<TreeRect[]>([]);

  const displaySector = selectedSector ? SECTORS.find(s => s.ticker === selectedSector) : null;

  const items = useMemo(() => {
    if (selectedSector && displaySector) {
      return displaySector.stocks.map(s => ({
        ticker: s.ticker,
        name: s.name,
        changePct: s.changePct,
        weight: s.weight,
      }));
    }
    if (viewMode === "stocks") {
      return SECTORS.flatMap(sec =>
        sec.stocks.map(s => ({
          ticker: s.ticker,
          name: s.name,
          changePct: s.changePct,
          weight: s.weight,
        }))
      );
    }
    return SECTORS.map(sec => ({
      ticker: sec.ticker,
      name: sec.name,
      changePct: sec.changePct,
      weight: sec.weight,
    }));
  }, [viewMode, selectedSector, displaySector]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // Compute treemap layout
    const rects = squarify(items, 0, 0, w, h);
    rectsRef.current = rects;

    // Draw each rect
    for (const rect of rects) {
      const { x, y, w: rw, h: rh, data } = rect;
      const isHovered = hoveredItem === data.ticker;

      // Fill
      ctx.fillStyle = getColor(data.changePct);
      ctx.fillRect(x + 1, y + 1, rw - 2, rh - 2);

      // Hover highlight
      if (isHovered) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x + 1, y + 1, rw - 2, rh - 2);
      }

      // Border
      ctx.strokeStyle = isHovered ? "#ffa028" : "#000";
      ctx.lineWidth = isHovered ? 1.5 : 1;
      ctx.strokeRect(x + 0.5, y + 0.5, rw - 1, rh - 1);

      // Text
      const minDim = Math.min(rw, rh);
      if (minDim < 20) continue; // too small for text

      const tickerSize = Math.min(Math.max(minDim * 0.22, 9), 16);
      const pctSize = Math.min(Math.max(minDim * 0.18, 8), 14);
      const nameSize = Math.min(Math.max(minDim * 0.14, 7), 11);

      const cx = x + rw / 2;
      const cy = y + rh / 2;

      // Ticker
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${tickerSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (rh > 50) {
        // Enough room for 3 lines: ticker, name, pct
        ctx.fillText(data.ticker, cx, cy - tickerSize * 0.8);

        if (rw > 50) {
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = `${nameSize}px monospace`;
          ctx.fillText(data.name, cx, cy + 1);
        }

        ctx.fillStyle = data.changePct >= 0 ? "#4ade80" : "#f87171";
        ctx.font = `bold ${pctSize}px monospace`;
        ctx.fillText(
          `${data.changePct > 0 ? "+" : ""}${data.changePct.toFixed(2)}%`,
          cx, cy + tickerSize * 0.8
        );
      } else if (rh > 30) {
        // 2 lines: ticker + pct
        ctx.fillText(data.ticker, cx, cy - pctSize * 0.4);
        ctx.fillStyle = data.changePct >= 0 ? "#4ade80" : "#f87171";
        ctx.font = `bold ${pctSize}px monospace`;
        ctx.fillText(
          `${data.changePct > 0 ? "+" : ""}${data.changePct.toFixed(2)}%`,
          cx, cy + pctSize * 0.6
        );
      } else {
        // Single line: ticker + pct
        ctx.font = `bold ${Math.max(tickerSize - 2, 8)}px monospace`;
        ctx.fillText(
          `${data.ticker} ${data.changePct > 0 ? "+" : ""}${data.changePct.toFixed(1)}%`,
          cx, cy
        );
      }
    }

    // Sector boundaries overlay (when in stocks mode, show sector grouping lines)
    if (viewMode === "stocks" && !selectedSector) {
      // Thin sector label at the top of each group
    }
  }, [items, hoveredItem, viewMode, selectedSector]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  // Handle mouse interactions on canvas
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const found = rectsRef.current.find(
      r => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
    );
    setHoveredItem(found ? found.data.ticker : null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== "sector" || selectedSector) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const found = rectsRef.current.find(
      r => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
    );
    if (found) {
      setSelectedSector(found.data.ticker);
    }
  }, [viewMode, selectedSector]);

  const handleMouseLeave = useCallback(() => setHoveredItem(null), []);

  // Compute hover info text
  const hoverInfo = useMemo(() => {
    if (!hoveredItem) return null;
    if (viewMode === "sector" && !selectedSector) {
      const sec = SECTORS.find(s => s.ticker === hoveredItem);
      if (sec) return `${sec.name} (${sec.ticker})  ${sec.changePct > 0 ? "+" : ""}${sec.changePct.toFixed(2)}%  Wt: ${((sec.weight / SECTORS.reduce((s, x) => s + x.weight, 0)) * 100).toFixed(1)}%`;
    }
    const allStocks = SECTORS.flatMap(s => s.stocks);
    const stock = allStocks.find(s => s.ticker === hoveredItem);
    if (stock) return `${stock.name} (${stock.ticker})  ${stock.changePct > 0 ? "+" : ""}${stock.changePct.toFixed(2)}%`;
    return null;
  }, [hoveredItem, viewMode, selectedSector]);

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader
        title="IMAP"
        subtitle={selectedSector ? `${displaySector?.name} Stocks` : "S&P 500 Intraday Market Map"}
        rightLabel="REAL-TIME"
      />

      {/* Tab bar */}
      <div
        className="flex items-center shrink-0"
        style={{ height: "18px", borderBottom: "1px solid #1a1000", fontSize: "9px", fontFamily: "monospace" }}
      >
        {(["sector", "stocks"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => { setViewMode(mode); setSelectedSector(null); }}
            style={{
              padding: "0 10px",
              height: "100%",
              color: viewMode === mode && !selectedSector ? "#000" : "#7a6030",
              background: viewMode === mode && !selectedSector ? "#ffa028" : "transparent",
              border: "none",
              borderRight: "1px solid #1a1000",
              cursor: "pointer",
              textTransform: "uppercase",
              fontFamily: "monospace",
              fontWeight: viewMode === mode && !selectedSector ? "bold" : "normal",
            }}
          >
            {mode}
          </button>
        ))}
        {selectedSector && (
          <button
            onClick={() => setSelectedSector(null)}
            style={{
              padding: "0 10px",
              height: "100%",
              color: "#ffa028",
              background: "transparent",
              border: "none",
              borderRight: "1px solid #1a1000",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "9px",
            }}
          >
            ← ALL SECTORS
          </button>
        )}
        <div className="flex-1" />
        {hoverInfo && (
          <span style={{ color: "#c8a848", fontSize: "9px", paddingRight: "6px" }}>
            {hoverInfo}
          </span>
        )}
        {!hoverInfo && (
          <span style={{ color: "#7a6030", fontSize: "9px", paddingRight: "6px" }}>
            S&P 500 ・ {SECTORS.length} Sectors ・ {SECTORS.reduce((s, sec) => s + sec.stocks.length, 0)} Stocks
          </span>
        )}
      </div>

      {/* Canvas treemap */}
      <div ref={containerRef} className="flex-1 min-h-0" style={{ cursor: viewMode === "sector" && !selectedSector ? "pointer" : "default" }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={handleMouseLeave}
          style={{ display: "block" }}
        />
      </div>

      {/* Legend bar */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          borderTop: "1px solid #1a1000",
          padding: "2px 6px",
          fontSize: "9px",
          fontFamily: "monospace",
          color: "#7a6030",
          height: "16px",
        }}
      >
        <div className="flex items-center gap-1">
          {[
            { color: "#8b0000", label: "-3%" },
            { color: "#7f1d1d", label: "-1%" },
            { color: "#2d1a1a", label: "0" },
            { color: "#15401a", label: "+1%" },
            { color: "#16a34a", label: "+3%" },
          ].map((l, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <span style={{ display: "inline-block", width: 8, height: 8, background: l.color, border: "1px solid #333" }} />
              <span>{l.label}</span>
            </span>
          ))}
        </div>
        <span style={{ color: "#ffa028" }}>
          {viewMode === "sector" && !selectedSector ? "Click sector to drill in" : ""}
        </span>
      </div>
    </div>
  );
}

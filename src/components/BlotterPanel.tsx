"use client";

import { useState, useEffect, useRef } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface Order {
  id: string;
  time: string;
  side: "BUY" | "SELL";
  ticker: string;
  qty: number;
  type: string;
  price: number;
  broker: string;
  route: string;
  account: string;
  status: "FILLED" | "WORKING" | "PARTIAL" | "CANCELLED" | "REJECTED";
  fillPrice: number | null;
  fillQty: number | null;
  avgPx: number | null;
  pctDone: number;
}

/* ──────────────────── Data ──────────────────── */

const initialOrders: Order[] = [
  { id: "E001", time: "14:32:18", side: "BUY", ticker: "AAPL", qty: 5000, type: "LMT", price: 178.45, broker: "GS", route: "VWAP", account: "MAIN", status: "FILLED", fillPrice: 178.42, fillQty: 5000, avgPx: 178.42, pctDone: 100 },
  { id: "E002", time: "14:31:52", side: "SELL", ticker: "MSFT", qty: 3200, type: "MKT", price: 425.30, broker: "JPM", route: "DIRECT", account: "MAIN", status: "FILLED", fillPrice: 425.35, fillQty: 3200, avgPx: 425.35, pctDone: 100 },
  { id: "E003", time: "14:31:20", side: "BUY", ticker: "GOOGL", qty: 1500, type: "LMT", price: 142.80, broker: "MS", route: "TWAP", account: "HEDGE", status: "WORKING", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E004", time: "14:30:45", side: "SELL", ticker: "TSLA", qty: 2800, type: "LMT", price: 248.65, broker: "BARC", route: "IS", account: "MAIN", status: "PARTIAL", fillPrice: 248.60, fillQty: 1900, avgPx: 248.58, pctDone: 67.9 },
  { id: "E005", time: "14:30:10", side: "BUY", ticker: "SPY", qty: 8000, type: "LMT", price: 542.25, broker: "GS", route: "VWAP", account: "MAIN", status: "FILLED", fillPrice: 542.18, fillQty: 8000, avgPx: 542.20, pctDone: 100 },
  { id: "E006", time: "14:29:33", side: "SELL", ticker: "AMZN", qty: 600, type: "MKT", price: 182.90, broker: "UBS", route: "BEST EX", account: "PROP", status: "FILLED", fillPrice: 182.88, fillQty: 600, avgPx: 182.88, pctDone: 100 },
  { id: "E007", time: "14:28:55", side: "BUY", ticker: "NVDA", qty: 2500, type: "LMT", price: 912.50, broker: "CS", route: "VWAP", account: "MAIN", status: "WORKING", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E008", time: "14:28:12", side: "SELL", ticker: "META", qty: 1200, type: "LMT", price: 485.20, broker: "CITI", route: "TWAP", account: "HEDGE", status: "CANCELLED", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E009", time: "14:27:40", side: "BUY", ticker: "NFLX", qty: 400, type: "MKT", price: 520.15, broker: "JPM", route: "DIRECT", account: "MAIN", status: "FILLED", fillPrice: 520.18, fillQty: 400, avgPx: 520.18, pctDone: 100 },
  { id: "E010", time: "14:27:02", side: "SELL", ticker: "QQQ", qty: 6000, type: "LMT", price: 460.75, broker: "GS", route: "IS", account: "MAIN", status: "PARTIAL", fillPrice: 460.72, fillQty: 3600, avgPx: 460.70, pctDone: 60 },
  { id: "E011", time: "14:26:28", side: "BUY", ticker: "IWM", qty: 3000, type: "LMT", price: 206.40, broker: "BARC", route: "VWAP", account: "PROP", status: "WORKING", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E012", time: "14:25:55", side: "SELL", ticker: "GLD", qty: 800, type: "LMT", price: 234.25, broker: "MS", route: "TWAP", account: "HEDGE", status: "WORKING", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E013", time: "14:25:15", side: "BUY", ticker: "XLE", qty: 4500, type: "LMT", price: 89.40, broker: "UBS", route: "BEST EX", account: "MAIN", status: "PARTIAL", fillPrice: 89.38, fillQty: 2200, avgPx: 89.37, pctDone: 48.9 },
  { id: "E014", time: "14:24:42", side: "SELL", ticker: "TLT", qty: 1600, type: "LMT", price: 98.35, broker: "CITI", route: "DIRECT", account: "MAIN", status: "FILLED", fillPrice: 98.38, fillQty: 1600, avgPx: 98.38, pctDone: 100 },
  { id: "E015", time: "14:24:10", side: "BUY", ticker: "XLF", qty: 7000, type: "LMT", price: 41.65, broker: "JPM", route: "VWAP", account: "PROP", status: "WORKING", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E016", time: "14:23:35", side: "SELL", ticker: "BA", qty: 350, type: "LMT", price: 178.90, broker: "GS", route: "IS", account: "MAIN", status: "REJECTED", fillPrice: null, fillQty: 0, avgPx: null, pctDone: 0 },
  { id: "E017", time: "14:22:58", side: "BUY", ticker: "DIS", qty: 2000, type: "MKT", price: 112.45, broker: "MS", route: "DIRECT", account: "HEDGE", status: "FILLED", fillPrice: 112.48, fillQty: 2000, avgPx: 112.48, pctDone: 100 },
  { id: "E018", time: "14:22:20", side: "SELL", ticker: "JPM", qty: 1800, type: "LMT", price: 198.60, broker: "BARC", route: "TWAP", account: "MAIN", status: "PARTIAL", fillPrice: 198.55, fillQty: 800, avgPx: 198.54, pctDone: 44.4 },
];

/* ──────────────────── Component ──────────────────── */

type FilterTab = "ALL" | "FILLS" | "WORKING" | "PARTIAL" | "CANCELLED";

const COLS = "52px 26px 42px 50px 30px 46px 30px 36px 34px 52px 50px 46px 40px";

export default function BlotterPanel() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const animRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Simulate partial fills / completions every 8 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setOrders(prev => {
        const working = prev.filter(o => o.status === "WORKING" || o.status === "PARTIAL");
        if (working.length === 0) return prev;

        const target = working[Math.floor(Math.random() * working.length)];

        // Flash animation
        animRef.current.add(target.id);
        forceUpdate(n => n + 1);
        setTimeout(() => { animRef.current.delete(target.id); forceUpdate(n => n + 1); }, 600);

        if (target.status === "WORKING") {
          // Start partial fill
          const fillQty = Math.floor(target.qty * (0.3 + Math.random() * 0.4));
          const fillPx = target.price + (Math.random() * 0.1 - 0.05);
          return prev.map(o => o.id === target.id ? {
            ...o, status: fillQty >= target.qty ? "FILLED" as const : "PARTIAL" as const,
            fillQty, fillPrice: fillPx, avgPx: fillPx,
            pctDone: Math.round((fillQty / target.qty) * 100 * 10) / 10,
          } : o);
        } else {
          // Complete partial fill
          return prev.map(o => o.id === target.id ? {
            ...o, status: "FILLED" as const,
            fillQty: o.qty, pctDone: 100,
            avgPx: o.avgPx ? o.avgPx + (Math.random() * 0.02 - 0.01) : o.price,
          } : o);
        }
      });
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const filtered = orders.filter(o => {
    if (activeTab === "ALL") return true;
    if (activeTab === "FILLS") return o.status === "FILLED";
    if (activeTab === "WORKING") return o.status === "WORKING";
    if (activeTab === "PARTIAL") return o.status === "PARTIAL";
    if (activeTab === "CANCELLED") return o.status === "CANCELLED" || o.status === "REJECTED";
    return true;
  });

  const stats = {
    total: orders.length,
    filled: orders.filter(o => o.status === "FILLED").length,
    working: orders.filter(o => o.status === "WORKING").length,
    partial: orders.filter(o => o.status === "PARTIAL").length,
    cancelled: orders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED").length,
    totalQty: orders.reduce((s, o) => s + o.qty, 0),
    filledQty: orders.reduce((s, o) => s + (o.fillQty || 0), 0),
  };

  const statusColor = (s: string) => {
    if (s === "FILLED") return "#4af6c3";
    if (s === "WORKING") return "#ffa028";
    if (s === "PARTIAL") return "#0088ff";
    if (s === "CANCELLED") return "#5a5550";
    if (s === "REJECTED") return "#ff433d";
    return "#ccc";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="BLOT" subtitle="Order Blotter" rightLabel="EMSX" />

      {/* Tab bar + summary */}
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0,
        borderBottom: "1px solid #1a1000", background: "#050500",
        padding: "2px 8px", gap: "4px",
      }}>
        {(["ALL", "FILLS", "WORKING", "PARTIAL", "CANCELLED"] as const).map(tab => {
          const count = tab === "ALL" ? stats.total : tab === "FILLS" ? stats.filled : tab === "WORKING" ? stats.working : tab === "PARTIAL" ? stats.partial : stats.cancelled;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: "9px", padding: "2px 4px",
              color: activeTab === tab ? "#ffa028" : "#7a6030",
              fontWeight: activeTab === tab ? "bold" : "normal",
              borderBottom: activeTab === tab ? "2px solid #ffa028" : "2px solid transparent",
            }}>
              {tab} <span style={{ fontSize: "7px", color: activeTab === tab ? "#ffa028" : "#555" }}>({count})</span>
            </button>
          );
        })}

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "8px", color: "#7a6030" }}>
          FILLED: <span style={{ color: "#4af6c3" }}>{stats.filledQty.toLocaleString()}</span>
          <span style={{ color: "#333", margin: "0 4px" }}>/</span>
          {stats.totalQty.toLocaleString()}
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: COLS,
        fontSize: "8px", color: "#7a6030", flexShrink: 0,
        background: "#050500", padding: "2px 6px",
        borderBottom: "1px solid #ffa028", gap: "4px",
      }}>
        <span>TIME</span>
        <span>SIDE</span>
        <span>TICKER</span>
        <span style={{ textAlign: "right" }}>QTY</span>
        <span>TYPE</span>
        <span style={{ textAlign: "right" }}>PRICE</span>
        <span>BKR</span>
        <span>ROUTE</span>
        <span>ACCT</span>
        <span>STATUS</span>
        <span style={{ textAlign: "right" }}>AVG PX</span>
        <span style={{ textAlign: "right" }}>FILL QTY</span>
        <span style={{ textAlign: "right" }}>%DONE</span>
      </div>

      {/* Order rows */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {filtered.map((o, idx) => {
          const isAnimating = animRef.current.has(o.id);
          const isSelected = selectedId === o.id;
          return (
            <div key={o.id}
              onClick={() => setSelectedId(selectedId === o.id ? null : o.id)}
              style={{
                display: "grid", gridTemplateColumns: COLS,
                fontSize: "9px", padding: "2px 6px", gap: "4px",
                cursor: "pointer",
                borderBottom: "1px solid #0a0a05",
                borderLeft: `2px solid ${o.side === "BUY" ? "#4af6c3" : "#ff433d"}`,
                background: isAnimating
                  ? "rgba(74, 246, 195, 0.15)"
                  : isSelected ? "#0a0a14" : idx % 2 === 0 ? "transparent" : "#030300",
                transition: "background 0.3s",
              }}
            >
              <span style={{ color: "#3d3020" }}>{o.time}</span>
              <span style={{ color: o.side === "BUY" ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>
                {o.side === "BUY" ? "B" : "S"}
              </span>
              <span style={{ color: "#ffa028", fontWeight: "bold" }}>{o.ticker}</span>
              <span style={{ textAlign: "right", color: "#c8c0b0" }}>{o.qty.toLocaleString()}</span>
              <span style={{ color: "#7a6030" }}>{o.type}</span>
              <span style={{ textAlign: "right", color: "#c8c0b0" }}>{o.price.toFixed(2)}</span>
              <span style={{ color: "#555", fontSize: "8px" }}>{o.broker}</span>
              <span style={{ color: "#555", fontSize: "8px" }}>{o.route}</span>
              <span style={{ color: "#555", fontSize: "8px" }}>{o.account}</span>
              <span style={{ color: statusColor(o.status), fontWeight: "bold", fontSize: "8px" }}>{o.status}</span>
              <span style={{ textAlign: "right", color: o.avgPx ? "#4af6c3" : "#333" }}>
                {o.avgPx ? o.avgPx.toFixed(2) : "-"}
              </span>
              <span style={{ textAlign: "right", color: o.fillQty ? "#c8c0b0" : "#333" }}>
                {o.fillQty ? o.fillQty.toLocaleString() : "-"}
              </span>
              <span style={{ textAlign: "right" }}>
                {o.pctDone > 0 ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <span style={{
                      display: "inline-block", width: "20px", height: "4px",
                      background: "#1a1000", borderRadius: "1px", overflow: "hidden",
                      position: "relative",
                    }}>
                      <span style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${o.pctDone}%`,
                        background: o.pctDone === 100 ? "#4af6c3" : "#0088ff",
                      }} />
                    </span>
                    <span style={{ color: o.pctDone === 100 ? "#4af6c3" : "#0088ff", fontSize: "8px" }}>
                      {o.pctDone === 100 ? "100" : o.pctDone.toFixed(0)}
                    </span>
                  </span>
                ) : (
                  <span style={{ color: "#333" }}>-</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, padding: "3px 8px",
        borderTop: "1px solid #1a1000", background: "#050500",
        fontSize: "8px", color: "#7a6030",
      }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <span>TOTAL: <span style={{ color: "#ffa028", fontWeight: "bold" }}>{stats.total}</span></span>
          <span>FILLS: <span style={{ color: "#4af6c3", fontWeight: "bold" }}>{stats.filled}</span></span>
          <span>WRK: <span style={{ color: "#ffa028", fontWeight: "bold" }}>{stats.working}</span></span>
          <span>PART: <span style={{ color: "#0088ff", fontWeight: "bold" }}>{stats.partial}</span></span>
        </div>
        <span>
          FILL RATE: <span style={{ color: "#4af6c3", fontWeight: "bold" }}>
            {stats.totalQty > 0 ? ((stats.filledQty / stats.totalQty) * 100).toFixed(1) : "0.0"}%
          </span>
        </span>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface RecentOrder {
  id: string;
  side: "BUY" | "SELL";
  qty: number;
  symbol: string;
  type: string;
  price: number | null;
  broker: string;
  status: "SENT" | "FILLED" | "WORKING" | "REJECTED";
  time: string;
  fillPx: number | null;
}

/* ──────────────────── Data ──────────────────── */

const INITIAL_RECENTS: RecentOrder[] = [
  { id: "R1", side: "BUY", qty: 200, symbol: "SPY", type: "LMT", price: 542.50, broker: "VWAP", status: "FILLED", time: "14:28", fillPx: 542.48 },
  { id: "R2", side: "SELL", qty: 100, symbol: "NVDA", type: "MKT", price: null, broker: "DIRECT", status: "FILLED", time: "14:15", fillPx: 912.35 },
  { id: "R3", side: "BUY", qty: 300, symbol: "QQQ", type: "LMT", price: 460.00, broker: "TWAP", status: "WORKING", time: "14:02", fillPx: null },
  { id: "R4", side: "SELL", qty: 50, symbol: "AAPL", type: "STP", price: 190.00, broker: "DIRECT", status: "WORKING", time: "13:45", fillPx: null },
  { id: "R5", side: "BUY", qty: 500, symbol: "MSFT", type: "LMT", price: 425.00, broker: "IS", status: "FILLED", time: "13:30", fillPx: 424.95 },
  { id: "R6", side: "SELL", qty: 150, symbol: "META", type: "MKT", price: null, broker: "BEST EX", status: "FILLED", time: "13:12", fillPx: 485.60 },
  { id: "R7", side: "BUY", qty: 1000, symbol: "TSLA", type: "LMT", price: 252.00, broker: "VWAP", status: "WORKING", time: "12:58", fillPx: null },
  { id: "R8", side: "SELL", qty: 400, symbol: "JPM", type: "LMT", price: 198.50, broker: "DIRECT", status: "REJECTED", time: "12:40", fillPx: null },
];

/* ──────────────────── Component ──────────────────── */

export default function TradeTicketPanel() {
  const [security, setSecurity] = useState("SPX Index");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState("100");
  const [orderType, setOrderType] = useState("MKT");
  const [price, setPrice] = useState("5428.75");
  const [tif, setTif] = useState("DAY");
  const [broker, setBroker] = useState("DIRECT");
  const [account, setAccount] = useState("MAIN");
  const [recents, setRecents] = useState<RecentOrder[]>(INITIAL_RECENTS);
  const [flash, setFlash] = useState(false);
  const nextId = React.useRef(100);

  const needsPrice = orderType === "LMT" || orderType === "STP" || orderType === "STP-LMT";

  const handleSend = useCallback(() => {
    setFlash(true);
    const sym = security.split(" ")[0];
    const newOrder: RecentOrder = {
      id: `R${nextId.current++}`,
      side, qty: parseInt(qty) || 0, symbol: sym,
      type: orderType, price: needsPrice ? parseFloat(price) : null,
      broker, status: "SENT", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      fillPx: null,
    };
    setRecents(prev => [newOrder, ...prev]);

    setTimeout(() => {
      setFlash(false);
      setRecents(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: "WORKING" } : o));
    }, 800);

    setTimeout(() => {
      setRecents(prev => prev.map(o =>
        o.id === newOrder.id
          ? { ...o, status: "FILLED", fillPx: (o.price || 5428.75) + (Math.random() * 0.3 - 0.15) }
          : o
      ));
    }, 4000);
  }, [security, side, qty, orderType, price, broker, needsPrice]);

  const statusColor = (s: string) =>
    s === "FILLED" ? "#4af6c3" : s === "WORKING" ? "#ffa028" : s === "SENT" ? "#0088ff" : "#ff433d";

  /* ──── Field row helper ──── */
  const Field = ({ label, children, width }: { label: string; children: React.ReactNode; width?: string }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: width || "auto", minWidth: 0 }}>
      <span style={{ fontSize: "7px", color: "#7a6030", letterSpacing: "0.5px" }}>{label}</span>
      {children}
    </div>
  );

  const inputStyle: React.CSSProperties = {
    background: "#0a0800", border: "1px solid #1a1000", color: "#fff",
    fontFamily: "monospace", fontSize: "9px", padding: "3px 4px",
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  const btnStyle = (active: boolean, color?: string): React.CSSProperties => ({
    background: active ? (color || "#ffa028") : "#0a0800",
    color: active ? "#000" : "#7a6030",
    border: `1px solid ${active ? (color || "#ffa028") : "#1a1000"}`,
    fontFamily: "monospace", fontSize: "8px", fontWeight: active ? "bold" : "normal",
    padding: "3px 6px", cursor: "pointer", textAlign: "center",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="EMSX" subtitle="Execution Mgmt" rightLabel="TRADE" />

      {/* ── Order Entry Section ── */}
      <div style={{ flexShrink: 0, borderBottom: "1px solid #1a1000" }}>
        {/* Row 1: Security + Account */}
        <div style={{ display: "flex", gap: "4px", padding: "4px 6px", borderBottom: "1px solid #0a0800" }}>
          <Field label="SECURITY" width="100%">
            <input
              type="text" value={security} onChange={e => setSecurity(e.target.value)}
              style={{ ...inputStyle, color: "#ffa028", fontWeight: "bold" }}
              spellCheck={false}
            />
          </Field>
          <Field label="ACCT" width="52px">
            <select value={account} onChange={e => setAccount(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", padding: "3px 2px" }}>
              <option value="MAIN">MAIN</option>
              <option value="HEDGE">HEDGE</option>
              <option value="PROP">PROP</option>
            </select>
          </Field>
        </div>

        {/* Row 2: Side */}
        <div style={{ display: "flex", gap: "2px", padding: "4px 6px", borderBottom: "1px solid #0a0800" }}>
          <button onClick={() => setSide("BUY")} style={{
            ...btnStyle(side === "BUY", "#22aa44"), flex: 1,
            background: side === "BUY" ? "#22aa44" : "#0a0800",
            borderColor: side === "BUY" ? "#22aa44" : "#1a1000",
          }}>BUY</button>
          <button onClick={() => setSide("SELL")} style={{
            ...btnStyle(side === "SELL", "#ff433d"), flex: 1,
            background: side === "SELL" ? "#ff433d" : "#0a0800",
            borderColor: side === "SELL" ? "#ff433d" : "#1a1000",
          }}>SELL</button>
        </div>

        {/* Row 3: Qty + Type + Price */}
        <div style={{ display: "flex", gap: "4px", padding: "4px 6px", borderBottom: "1px solid #0a0800" }}>
          <Field label="QTY" width="58px">
            <input type="text" value={qty} onChange={e => setQty(e.target.value)}
              style={{ ...inputStyle, textAlign: "right" }} />
          </Field>
          <Field label="TYPE" width="auto">
            <div style={{ display: "flex", gap: "1px" }}>
              {["MKT", "LMT", "STP", "STP-LMT", "MOC"].map(t => (
                <button key={t} onClick={() => setOrderType(t)} style={{
                  ...btnStyle(orderType === t),
                  fontSize: "7px", padding: "3px 4px",
                  background: orderType === t ? "#0068ff" : "#0a0800",
                  borderColor: orderType === t ? "#0068ff" : "#1a1000",
                  color: orderType === t ? "#fff" : "#7a6030",
                }}>{t}</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Row 4: Price (if needed) + TIF */}
        <div style={{ display: "flex", gap: "4px", padding: "4px 6px", borderBottom: "1px solid #0a0800" }}>
          {needsPrice && (
            <Field label="PRICE" width="70px">
              <input type="text" value={price} onChange={e => setPrice(e.target.value)}
                style={{ ...inputStyle, color: "#4af6c3", textAlign: "right" }} />
            </Field>
          )}
          <Field label="TIF" width="auto">
            <div style={{ display: "flex", gap: "1px" }}>
              {["DAY", "GTC", "IOC", "FOK"].map(t => (
                <button key={t} onClick={() => setTif(t)} style={{
                  ...btnStyle(tif === t),
                  fontSize: "7px", padding: "3px 5px",
                  background: tif === t ? "#0068ff" : "#0a0800",
                  borderColor: tif === t ? "#0068ff" : "#1a1000",
                  color: tif === t ? "#fff" : "#7a6030",
                }}>{t}</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Row 5: Broker/Algo */}
        <div style={{ display: "flex", gap: "4px", padding: "4px 6px", borderBottom: "1px solid #0a0800" }}>
          <Field label="BROKER / ALGO" width="100%">
            <div style={{ display: "flex", gap: "1px" }}>
              {["DIRECT", "VWAP", "TWAP", "IS", "BEST EX"].map(b => (
                <button key={b} onClick={() => setBroker(b)} style={{
                  ...btnStyle(broker === b),
                  fontSize: "7px", padding: "3px 4px", flex: 1,
                }}>{b}</button>
              ))}
            </div>
          </Field>
        </div>

        {/* Order preview + Send */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "4px 6px", background: "#050500",
        }}>
          <div style={{ flex: 1, fontSize: "9px", color: "#ffa028", fontWeight: "bold", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {side} {qty} {security.split(" ")[0]} {orderType === "MKT" ? "@ MKT" : `@ ${price}`} | {tif} | {broker}
          </div>
          <button onClick={handleSend} style={{
            background: flash ? "#ffcc00" : "#ffa028", color: "#000",
            border: "none", fontFamily: "monospace", fontSize: "9px",
            fontWeight: "bold", padding: "4px 12px", cursor: "pointer",
            transition: "background 0.15s",
          }}>SEND</button>
          <button onClick={() => { setSecurity("SPX Index"); setQty("100"); setOrderType("MKT"); setPrice("5428.75"); setBroker("DIRECT"); }}
            style={{
              background: "transparent", color: "#7a6030",
              border: "1px solid #1a1000", fontFamily: "monospace",
              fontSize: "8px", padding: "3px 8px", cursor: "pointer",
            }}>CLR</button>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0,
        padding: "2px 6px", background: "#050500", borderBottom: "1px solid #ffa028",
        fontSize: "8px", color: "#7a6030", gap: "4px",
      }}>
        <span style={{ fontWeight: "bold" }}>RECENT ORDERS</span>
        <span style={{ flex: 1 }} />
        <span>FILLS: <span style={{ color: "#4af6c3" }}>{recents.filter(r => r.status === "FILLED").length}</span></span>
        <span style={{ marginLeft: "6px" }}>WRK: <span style={{ color: "#ffa028" }}>{recents.filter(r => r.status === "WORKING").length}</span></span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "34px 26px 36px 40px 28px 48px 40px 48px 40px",
        fontSize: "8px", color: "#7a6030", flexShrink: 0,
        background: "#050500", padding: "2px 6px",
        borderBottom: "1px solid #1a1000", gap: "3px",
      }}>
        <span>TIME</span>
        <span>SIDE</span>
        <span>SYM</span>
        <span style={{ textAlign: "right" }}>QTY</span>
        <span>TYPE</span>
        <span>BROKER</span>
        <span>STATUS</span>
        <span style={{ textAlign: "right" }}>FILL PX</span>
        <span style={{ textAlign: "right" }}>PRICE</span>
      </div>

      {/* Order rows */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {recents.map((o, idx) => (
          <div key={o.id} style={{
            display: "grid",
            gridTemplateColumns: "34px 26px 36px 40px 28px 48px 40px 48px 40px",
            fontSize: "9px", padding: "2px 6px", gap: "3px",
            borderBottom: "1px solid #0a0a05",
            borderLeft: `2px solid ${o.side === "BUY" ? "#4af6c3" : "#ff433d"}`,
            background: idx % 2 === 0 ? "transparent" : "#030300",
          }}>
            <span style={{ color: "#3d3020" }}>{o.time}</span>
            <span style={{ color: o.side === "BUY" ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>{o.side === "BUY" ? "B" : "S"}</span>
            <span style={{ color: "#ffa028", fontWeight: "bold" }}>{o.symbol}</span>
            <span style={{ textAlign: "right", color: "#c8c0b0" }}>{o.qty.toLocaleString()}</span>
            <span style={{ color: "#7a6030" }}>{o.type}</span>
            <span style={{ color: "#555", fontSize: "8px" }}>{o.broker}</span>
            <span style={{ color: statusColor(o.status), fontWeight: "bold", fontSize: "8px" }}>{o.status}</span>
            <span style={{ textAlign: "right", color: o.fillPx ? "#4af6c3" : "#333" }}>
              {o.fillPx ? o.fillPx.toFixed(2) : "-"}
            </span>
            <span style={{ textAlign: "right", color: "#c8c0b0" }}>
              {o.price ? o.price.toFixed(2) : "MKT"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface Message {
  id: number;
  sender: string;
  senderColor: string;
  text: string;
  time: string;
  type: "message" | "system" | "alert";
}

interface ChatRoom {
  id: string;
  name: string;
  type: "room" | "dm";
  unread: number;
  lastMsg: string;
  lastTime: string;
}

interface Contact {
  name: string;
  color: string;
  title: string;
  firm: string;
  status: "Active" | "Away" | "Offline";
}

/* ──────────────────── Data ──────────────────── */

const KNOWN_TICKERS = [
  "SPX", "SPY", "QQQ", "INDU", "CCMP", "RTY", "VIX",
  "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "JPM", "BA", "GLD", "TLT",
  "EUR", "GBP", "JPY", "USD", "XLI", "XLE", "XLK", "XLF", "CL1", "GC1",
];

const TICKER_REGEX = new RegExp(`\\b(${KNOWN_TICKERS.join("|")})\\b`, "g");

const CONTACTS: Contact[] = [
  { name: "J.SMITH", color: "#4af6c3", title: "Sr Portfolio Mgr", firm: "Citadel", status: "Active" },
  { name: "M.CHEN", color: "#0088ff", title: "Rates Strategist", firm: "Goldman Sachs", status: "Active" },
  { name: "K.PATEL", color: "#ffcc00", title: "Equity Analyst", firm: "Morgan Stanley", status: "Active" },
  { name: "A.WANG", color: "#ff88ff", title: "Quant Researcher", firm: "Two Sigma", status: "Away" },
  { name: "R.JONES", color: "#ff8844", title: "FX Trader", firm: "JPMorgan", status: "Offline" },
  { name: "S.LEE", color: "#44ddff", title: "Credit Analyst", firm: "PIMCO", status: "Active" },
];

const CHAT_ROOMS: ChatRoom[] = [
  { id: "desk", name: "Trading Desk", type: "room", unread: 0, lastMsg: "J.SMITH: Oil futures down 1.2%", lastTime: "11:00" },
  { id: "macro", name: "Macro Research", type: "room", unread: 2, lastMsg: "M.CHEN: 30Y auction strong", lastTime: "11:15" },
  { id: "alerts", name: "Market Alerts", type: "room", unread: 1, lastMsg: "VIX dropped below 15.00", lastTime: "10:42" },
  { id: "dm-smith", name: "J.SMITH", type: "dm", unread: 0, lastMsg: "Fed Williams at 14:00", lastTime: "10:02" },
  { id: "dm-chen", name: "M.CHEN", type: "dm", unread: 0, lastMsg: "10Y falling 3bps", lastTime: "10:15" },
  { id: "dm-patel", name: "K.PATEL", type: "dm", unread: 1, lastMsg: "NVDA +3.2% on AI news", lastTime: "09:48" },
];

const ROOM_MESSAGES: Record<string, Message[]> = {
  desk: [
    { id: 1, sender: "SYSTEM", senderColor: "#ffa028", text: "ECB Lagarde: Inflation expectations remain well anchored", time: "10:20", type: "system" },
    { id: 2, sender: "K.PATEL", senderColor: "#ffcc00", text: "BA -2.8% dragging XLI. Another quality issue reported.", time: "10:35", type: "message" },
    { id: 3, sender: "ALERT", senderColor: "#ff433d", text: "VIX dropped below 15.00 — lowest in 3 weeks", time: "10:42", type: "alert" },
    { id: 4, sender: "J.SMITH", senderColor: "#4af6c3", text: "Oil futures down 1.2% on OPEC+ demand concerns. XLE weakness.", time: "11:00", type: "message" },
    { id: 5, sender: "M.CHEN", senderColor: "#0088ff", text: "30Y bond auction at 14:05 seeing strong demand. 2.58x cover.", time: "11:15", type: "message" },
    { id: 6, sender: "K.PATEL", senderColor: "#ffcc00", text: "Anyone watching the EUR/USD? Breaking above 1.085.", time: "11:28", type: "message" },
    { id: 7, sender: "J.SMITH", senderColor: "#4af6c3", text: "Gold up $14 to session high $2,342.80", time: "11:35", type: "message" },
    { id: 8, sender: "ALERT", senderColor: "#ff433d", text: "SPX crossed above 5,430.00 (+0.25%)", time: "11:42", type: "alert" },
    { id: 9, sender: "M.CHEN", senderColor: "#0088ff", text: "Russell 2K outperforming today +0.43%. Small caps catching a bid.", time: "11:50", type: "message" },
    { id: 10, sender: "SYSTEM", senderColor: "#ffa028", text: "Fed funds futures now pricing 67% chance of Sept rate cut", time: "12:01", type: "system" },
    { id: 11, sender: "K.PATEL", senderColor: "#ffcc00", text: "ISM Services PMI at 54.8 vs 53.5 expected. Economy resilient.", time: "12:10", type: "message" },
    { id: 12, sender: "J.SMITH", senderColor: "#4af6c3", text: "AAPL crossed 50-day MA at $188.50. Watch for follow-through.", time: "12:22", type: "message" },
  ],
  macro: [
    { id: 1, sender: "M.CHEN", senderColor: "#0088ff", text: "10Y yield falling 3bps to 4.22%. Risk-on mood building.", time: "10:15", type: "message" },
    { id: 2, sender: "S.LEE", senderColor: "#44ddff", text: "Credit spreads tightening too. HY IG both bid.", time: "10:25", type: "message" },
    { id: 3, sender: "M.CHEN", senderColor: "#0088ff", text: "2s10s still inverted at -33bps but narrowing.", time: "10:40", type: "message" },
    { id: 4, sender: "A.WANG", senderColor: "#ff88ff", text: "Our models show recession probability at 28%, down from 35%.", time: "11:05", type: "message" },
  ],
  alerts: [
    { id: 1, sender: "ALERT", senderColor: "#ff433d", text: "SPX broke above 5,420 resistance level", time: "09:45", type: "alert" },
    { id: 2, sender: "ALERT", senderColor: "#ff433d", text: "VIX dropped below 15.00 — lowest in 3 weeks", time: "10:42", type: "alert" },
    { id: 3, sender: "ALERT", senderColor: "#ff433d", text: "AAPL crossed above 50-day MA at $188.50", time: "11:42", type: "alert" },
    { id: 4, sender: "ALERT", senderColor: "#ff433d", text: "SPX crossed above 5,430.00 (+0.25%)", time: "12:05", type: "alert" },
  ],
  "dm-smith": [
    { id: 1, sender: "J.SMITH", senderColor: "#4af6c3", text: "Morning. Watching SPX closely after the jobs number.", time: "09:31", type: "message" },
    { id: 2, sender: "YOU", senderColor: "#fff", text: "Same here. 215K vs 225K est is bullish.", time: "09:33", type: "message" },
    { id: 3, sender: "J.SMITH", senderColor: "#4af6c3", text: "Fed Williams speaking at 14:00. Could move rates.", time: "10:02", type: "message" },
  ],
  "dm-chen": [
    { id: 1, sender: "M.CHEN", senderColor: "#0088ff", text: "Initial claims bullish. Treasury curve reacting.", time: "09:32", type: "message" },
    { id: 2, sender: "YOU", senderColor: "#fff", text: "What's your 10Y target?", time: "09:35", type: "message" },
    { id: 3, sender: "M.CHEN", senderColor: "#0088ff", text: "4.15% by month end if data stays strong.", time: "10:15", type: "message" },
  ],
  "dm-patel": [
    { id: 1, sender: "K.PATEL", senderColor: "#ffcc00", text: "NVDA looking strong pre-market. +3.2% on AI chip demand.", time: "09:48", type: "message" },
    { id: 2, sender: "YOU", senderColor: "#fff", text: "Good call. Adding to position.", time: "09:52", type: "message" },
  ],
};

const AUTO_MESSAGES: Record<string, Omit<Message, "id">[]> = {
  desk: [
    { sender: "J.SMITH", senderColor: "#4af6c3", text: "TSLA breaking out above 255. Volume confirming.", time: "", type: "message" },
    { sender: "M.CHEN", senderColor: "#0088ff", text: "Dollar weakness accelerating. DXY below 104.", time: "", type: "message" },
    { sender: "ALERT", senderColor: "#ff433d", text: "NVDA hit new intraday high $915.20 (+4.5%)", time: "", type: "alert" },
    { sender: "K.PATEL", senderColor: "#ffcc00", text: "Sector rotation into small caps continues. IWM +0.8%.", time: "", type: "message" },
  ],
  macro: [
    { sender: "S.LEE", senderColor: "#44ddff", text: "IG spreads at 90bps — tightest since Feb.", time: "", type: "message" },
    { sender: "M.CHEN", senderColor: "#0088ff", text: "Real yields falling. TIPS break-evens widening.", time: "", type: "message" },
  ],
};

/* ──────────────────── Component ──────────────────── */

type SidebarTab = "rooms" | "contacts";

export default function ChatPanel() {
  const [activeRoom, setActiveRoom] = useState("desk");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("rooms");
  const [messages, setMessages] = useState<Record<string, Message[]>>(ROOM_MESSAGES);
  const [rooms, setRooms] = useState<ChatRoom[]>(CHAT_ROOMS);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(100);
  const autoIdxRef = useRef(0);

  const currentMessages = messages[activeRoom] || [];
  const currentRoom = rooms.find(r => r.id === activeRoom);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  // Auto-generate messages
  useEffect(() => {
    const iv = setInterval(() => {
      const roomId = Math.random() > 0.6 ? "macro" : "desk";
      const roomAutos = AUTO_MESSAGES[roomId];
      if (!roomAutos) return;
      const msg = roomAutos[autoIdxRef.current % roomAutos.length];
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const newMsg = { ...msg, id: nextIdRef.current++, time };

      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMsg],
      }));

      // Update room list
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, unread: r.id === activeRoom ? 0 : r.unread + 1, lastMsg: `${msg.sender}: ${msg.text.slice(0, 30)}`, lastTime: time }
          : r
      ));

      autoIdxRef.current++;
    }, 15000);
    return () => clearInterval(iv);
  }, [activeRoom]);

  // Clear unread when switching rooms
  useEffect(() => {
    setRooms(prev => prev.map(r => r.id === activeRoom ? { ...r, unread: 0 } : r));
  }, [activeRoom]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: Message = { id: nextIdRef.current++, sender: "YOU", senderColor: "#fff", text, time, type: "message" };

    setMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), newMsg],
    }));
    setInput("");
  }, [input, activeRoom]);

  // Render message text with ticker highlights
  const renderText = (text: string, type: string) => {
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    const regex = new RegExp(TICKER_REGEX.source, "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) parts.push(<span key={`t${lastIdx}`}>{text.slice(lastIdx, match.index)}</span>);
      parts.push(<span key={`k${match.index}`} style={{ color: "#0088ff", textDecoration: "underline", textDecorationColor: "rgba(0,136,255,0.3)", cursor: "pointer" }}>{match[1]}</span>);
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) parts.push(<span key={`t${lastIdx}`}>{text.slice(lastIdx)}</span>);

    const color = type === "alert" ? "#ff433d" : type === "system" ? "#ffa028" : "#c8c0b0";
    return <span style={{ color }}>{parts.length > 0 ? parts : text}</span>;
  };

  const totalUnread = rooms.reduce((s, r) => s + r.unread, 0);

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="IB" subtitle="Instant Bloomberg" rightLabel="MSG" />

      {/* Main area: sidebar + chat */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* ── Left sidebar ── */}
        <div style={{ width: "110px", borderRight: "1px solid #1a1000", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Sidebar tabs */}
          <div style={{ display: "flex", flexShrink: 0, borderBottom: "1px solid #1a1000" }}>
            {(["rooms", "contacts"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                style={{
                  flex: 1, padding: "2px 0", fontSize: "8px", fontFamily: "monospace",
                  background: sidebarTab === tab ? "#ffa028" : "transparent",
                  color: sidebarTab === tab ? "#000" : "#7a6030",
                  border: "none", cursor: "pointer", fontWeight: sidebarTab === tab ? "bold" : "normal",
                  textTransform: "uppercase",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sidebar content */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {sidebarTab === "rooms" && rooms.map(room => (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                style={{
                  padding: "3px 6px", cursor: "pointer",
                  background: activeRoom === room.id ? "#0a0800" : "transparent",
                  borderLeft: activeRoom === room.id ? "2px solid #ffa028" : "2px solid transparent",
                  borderBottom: "1px solid #060600",
                }}
                onMouseEnter={e => { if (activeRoom !== room.id) e.currentTarget.style.background = "#060604"; }}
                onMouseLeave={e => { if (activeRoom !== room.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2px" }}>
                  <span style={{
                    fontSize: "9px", fontFamily: "monospace", fontWeight: "bold",
                    color: activeRoom === room.id ? "#ffa028" : "#c8a848",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    minWidth: 0, flex: 1,
                  }}>
                    {room.type === "dm" ? "● " : "# "}{room.name}
                  </span>
                  {room.unread > 0 && (
                    <span style={{
                      fontSize: "7px", fontFamily: "monospace",
                      background: "#ffa028", color: "#000",
                      borderRadius: "2px", padding: "0 2px", fontWeight: "bold",
                      minWidth: "10px", textAlign: "center", flexShrink: 0,
                    }}>
                      {room.unread}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: "8px", fontFamily: "monospace", color: "#555",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  marginTop: "1px",
                }}>
                  {room.lastMsg}
                </div>
              </div>
            ))}

            {sidebarTab === "contacts" && CONTACTS.map(c => (
              <div
                key={c.name}
                onClick={() => {
                  const dmRoom = rooms.find(r => r.type === "dm" && r.name === c.name);
                  if (dmRoom) setActiveRoom(dmRoom.id);
                }}
                style={{
                  padding: "3px 6px", cursor: "pointer",
                  borderBottom: "1px solid #060600",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#060604"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{
                    fontSize: "5px",
                    color: c.status === "Active" ? "#4af6c3" : c.status === "Away" ? "#ffa028" : "#555",
                  }}>●</span>
                  <span style={{ fontSize: "9px", fontFamily: "monospace", color: c.color, fontWeight: "bold" }}>{c.name}</span>
                </div>
                <div style={{ fontSize: "8px", fontFamily: "monospace", color: "#555", paddingLeft: "9px" }}>
                  {c.title} · {c.firm}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Room header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: "9px", fontFamily: "monospace",
            background: "#050500", borderBottom: "1px solid #1a1000",
            padding: "2px 6px", flexShrink: 0,
          }}>
            <span style={{ color: "#ffa028", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1 }}>
              {currentRoom?.type === "dm" ? `DM: ${currentRoom.name}` : currentRoom?.name || ""}
            </span>
            <span style={{ color: "#7a6030", flexShrink: 0, marginLeft: "4px" }}>
              {currentMessages.length}
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "2px 0", minHeight: 0 }}>
            {currentMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: "1px 6px",
                  borderLeft: msg.type === "alert" ? "2px solid #ff433d" : msg.type === "system" ? "2px solid #ffa028" : "2px solid transparent",
                  background: msg.type === "alert" ? "#0a0000" : msg.type === "system" ? "#080800" : "transparent",
                  fontSize: "9px", fontFamily: "monospace",
                  lineHeight: "14px",
                }}
              >
                <span style={{ color: "#3d3020", marginRight: "4px" }}>{msg.time}</span>
                <span style={{ color: msg.senderColor, fontWeight: "bold", marginRight: "4px" }}>{msg.sender}:</span>
                {renderText(msg.text, msg.type)}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            display: "flex", alignItems: "center",
            borderTop: "1px solid #1a1000", background: "#050500",
            padding: "0 6px", height: "20px", flexShrink: 0, gap: "4px",
          }}>
            <span style={{ color: "#7a6030", fontSize: "9px", fontFamily: "monospace" }}>MSG:</span>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder="Type message..."
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#fff", fontSize: "9px", fontFamily: "monospace", caretColor: "#ffa028",
              }}
              spellCheck={false}
            />
            <button
              onClick={handleSend}
              style={{
                color: "#000", background: "#ffa028", border: "none",
                padding: "1px 8px", fontSize: "9px", fontFamily: "monospace",
                fontWeight: "bold", cursor: "pointer",
              }}
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

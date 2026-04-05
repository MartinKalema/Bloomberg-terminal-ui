"use client";

import { useState, useEffect } from "react";
import PanelHeader from "./PanelHeader";

interface Order {
  id: string;
  time: string;
  side: "BUY" | "SELL";
  ticker: string;
  qty: number;
  type: string;
  price: number;
  status: "FILLED" | "WORKING" | "PARTIAL" | "CANCELLED";
  fillPrice: number | null;
  fillQty: number | null;
}

const initialOrders: Order[] = [
  {
    id: "001",
    time: "14:32:18",
    side: "BUY",
    ticker: "AAPL",
    qty: 5000,
    type: "LIMIT",
    price: 178.45,
    status: "FILLED",
    fillPrice: 178.42,
    fillQty: 5000,
  },
  {
    id: "002",
    time: "14:31:52",
    side: "SELL",
    ticker: "MSFT",
    qty: 3200,
    type: "MARKET",
    price: 425.30,
    status: "FILLED",
    fillPrice: 425.35,
    fillQty: 3200,
  },
  {
    id: "003",
    time: "14:31:20",
    side: "BUY",
    ticker: "GOOGL",
    qty: 1500,
    type: "LIMIT",
    price: 142.80,
    status: "WORKING",
    fillPrice: null,
    fillQty: null,
  },
  {
    id: "004",
    time: "14:30:45",
    side: "SELL",
    ticker: "TSLA",
    qty: 2800,
    type: "LIMIT",
    price: 248.65,
    status: "PARTIAL",
    fillPrice: 248.60,
    fillQty: 1900,
  },
  {
    id: "005",
    time: "14:30:10",
    side: "BUY",
    ticker: "SPX",
    qty: 150,
    type: "LIMIT",
    price: 5428.25,
    status: "FILLED",
    fillPrice: 5428.10,
    fillQty: 150,
  },
  {
    id: "006",
    time: "14:29:33",
    side: "SELL",
    ticker: "AMZN",
    qty: 600,
    type: "MARKET",
    price: 182.90,
    status: "FILLED",
    fillPrice: 182.88,
    fillQty: 600,
  },
  {
    id: "007",
    time: "14:28:55",
    side: "BUY",
    ticker: "NVDA",
    qty: 900,
    type: "LIMIT",
    price: 875.50,
    status: "WORKING",
    fillPrice: null,
    fillQty: null,
  },
  {
    id: "008",
    time: "14:28:12",
    side: "SELL",
    ticker: "META",
    qty: 1200,
    type: "LIMIT",
    price: 485.20,
    status: "CANCELLED",
    fillPrice: null,
    fillQty: null,
  },
  {
    id: "009",
    time: "14:27:40",
    side: "BUY",
    ticker: "NFLX",
    qty: 400,
    type: "MARKET",
    price: 520.15,
    status: "FILLED",
    fillPrice: 520.18,
    fillQty: 400,
  },
  {
    id: "010",
    time: "14:27:02",
    side: "SELL",
    ticker: "QQQ",
    qty: 2500,
    type: "LIMIT",
    price: 380.75,
    status: "PARTIAL",
    fillPrice: 380.72,
    fillQty: 1200,
  },
  {
    id: "011",
    time: "14:26:28",
    side: "BUY",
    ticker: "IWM",
    qty: 3000,
    type: "LIMIT",
    price: 206.40,
    status: "WORKING",
    fillPrice: null,
    fillQty: null,
  },
  {
    id: "012",
    time: "14:25:55",
    side: "SELL",
    ticker: "GLD",
    qty: 800,
    type: "LIMIT",
    price: 198.25,
    status: "WORKING",
    fillPrice: null,
    fillQty: null,
  },
  {
    id: "013",
    time: "14:25:15",
    side: "BUY",
    ticker: "EWZ",
    qty: 2200,
    type: "MARKET",
    price: 52.80,
    status: "PARTIAL",
    fillPrice: 52.79,
    fillQty: 900,
  },
  {
    id: "014",
    time: "14:24:42",
    side: "SELL",
    ticker: "USO",
    qty: 1600,
    type: "LIMIT",
    price: 74.35,
    status: "FILLED",
    fillPrice: 74.38,
    fillQty: 1600,
  },
  {
    id: "015",
    time: "14:24:10",
    side: "BUY",
    ticker: "DBC",
    qty: 1100,
    type: "LIMIT",
    price: 28.65,
    status: "WORKING",
    fillPrice: null,
    fillQty: null,
  },
];

export default function BlotterPanel() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"ALL" | "FILLS" | "WORKING" | "CANCELLED">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  // Simulate order updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        const workingOrders = prevOrders.filter((o) => o.status === "WORKING");
        if (workingOrders.length === 0) return prevOrders;

        const randomWorking = workingOrders[Math.floor(Math.random() * workingOrders.length)];

        // Animate the fill
        setAnimatingIds((prev) => new Set(prev).add(randomWorking.id));
        setTimeout(() => {
          setAnimatingIds((prev) => {
            const next = new Set(prev);
            next.delete(randomWorking.id);
            return next;
          });
        }, 600);

        return prevOrders.map((o) =>
          o.id === randomWorking.id
            ? {
                ...o,
                status: "FILLED",
                fillPrice: o.price + (Math.random() * 0.1 - 0.05),
                fillQty: o.qty,
              }
            : o
        );
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "FILLS") return o.status === "FILLED" || o.status === "PARTIAL";
    if (activeTab === "WORKING") return o.status === "WORKING";
    if (activeTab === "CANCELLED") return o.status === "CANCELLED";
    return true;
  });

  const stats = {
    total: orders.length,
    fills: orders.filter((o) => o.status === "FILLED" || o.status === "PARTIAL").length,
    working: orders.filter((o) => o.status === "WORKING").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FILLED":
        return "#4af6c3"; // cyan
      case "WORKING":
        return "#ffa028"; // amber
      case "PARTIAL":
        return "#0068ff"; // blue
      case "CANCELLED":
        return "#5a5550"; // dim
      default:
        return "#cccccc";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "FILLED":
        return "rgba(74, 246, 195, 0.15)";
      case "WORKING":
        return "rgba(255, 160, 40, 0.15)";
      case "PARTIAL":
        return "rgba(0, 104, 255, 0.15)";
      case "CANCELLED":
        return "rgba(90, 85, 80, 0.1)";
      default:
        return "transparent";
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="BLOT" subtitle="Order Blotter" rightLabel="TRAD" />

      {/* Tab bar */}
      <div
        className="flex items-center shrink-0"
        style={{
          borderBottom: "1px solid #1a1000",
          background: "#050500",
          padding: "4px 8px",
          gap: "16px",
        }}
      >
        {(["ALL", "FILLS", "WORKING", "CANCELLED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="text-[10px] font-bold cursor-pointer transition-colors"
            style={{
              color: activeTab === tab ? "#ffa028" : "#7a6030",
              background: "transparent",
              border: "none",
              padding: "2px 4px",
              borderBottom: activeTab === tab ? "2px solid #ffa028" : "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div
        className="grid text-[10px] shrink-0"
        style={{
          gridTemplateColumns: "60px 35px 50px 50px 55px 60px 65px 60px 50px",
          color: "#7a6030",
          borderBottom: "1px solid #ffa028",
          background: "#050500",
          padding: "3px 8px",
          gap: "8px",
        }}
      >
        <span>TIME</span>
        <span>SIDE</span>
        <span>TICKER</span>
        <span>QTY</span>
        <span>TYPE</span>
        <span>PRICE</span>
        <span>STATUS</span>
        <span>FILL PX</span>
        <span>FILL QTY</span>
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-auto">
        {filteredOrders.map((order) => {
          const isSelected = selectedId === order.id;
          const isAnimating = animatingIds.has(order.id);
          const borderColor = order.side === "BUY" ? "#4af6c3" : "#ff433d";

          return (
            <div
              key={order.id}
              className="grid text-[10px] cursor-pointer transition-all"
              style={{
                gridTemplateColumns: "60px 35px 50px 50px 55px 60px 65px 60px 50px",
                borderBottom: "1px solid #0a0a05",
                borderLeft: `3px solid ${order.side === "BUY" ? "#4af6c3" : "#ff433d"}`,
                padding: "3px 8px",
                gap: "8px",
                background: isAnimating
                  ? "rgba(74, 246, 195, 0.2)"
                  : isSelected
                    ? "#0a0a1e"
                    : "transparent",
                color: "#cccccc",
              }}
              onClick={() => setSelectedId(selectedId === order.id ? null : order.id)}
            >
              <span>{order.time}</span>
              <span style={{ color: order.side === "BUY" ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>
                {order.side}
              </span>
              <span style={{ color: "#ffa028", fontWeight: "bold" }}>{order.ticker}</span>
              <span className="text-right">{order.qty.toLocaleString()}</span>
              <span>{order.type}</span>
              <span className="text-right">{order.price.toFixed(2)}</span>
              <span
                style={{
                  color: getStatusColor(order.status),
                  fontWeight: "bold",
                  padding: "2px 4px",
                  background: getStatusBgColor(order.status),
                  borderRadius: "2px",
                }}
              >
                {order.status}
              </span>
              <span className="text-right" style={{ color: order.fillPrice ? "#4af6c3" : "#5a5550" }}>
                {order.fillPrice ? order.fillPrice.toFixed(2) : "-"}
              </span>
              <span className="text-right" style={{ color: order.fillQty ? "#4af6c3" : "#5a5550" }}>
                {order.fillQty ? order.fillQty.toLocaleString() : "-"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div
        className="flex items-center justify-between text-[10px] shrink-0"
        style={{
          borderTop: "1px solid #1a1000",
          borderBottom: "1px solid #1a1000",
          background: "#050500",
          padding: "3px 8px",
          color: "#7a6030",
        }}
      >
        <div className="flex gap-12">
          <span>
            TOTAL: <span style={{ color: "#ffa028", fontWeight: "bold" }}>{stats.total}</span>
          </span>
          <span>
            FILLS: <span style={{ color: "#4af6c3", fontWeight: "bold" }}>{stats.fills}</span>
          </span>
          <span>
            WORKING: <span style={{ color: "#ffa028", fontWeight: "bold" }}>{stats.working}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

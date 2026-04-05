"use client";

import { useState } from "react";
import PanelHeader from "./PanelHeader";

type ActionTab = "ALL" | "DIVIDENDS" | "SPLITS" | "BUYBACKS" | "IPO";

interface CorporateAction {
  id: string;
  date: string;
  ticker: string;
  eventType: "DIVIDEND" | "SPLIT" | "BUYBACK" | "IPO";
  details: string;
  status: "ANNOUNCED" | "RECORD_DATE" | "EX_DATE" | "EFFECTIVE" | "UPCOMING";
  amount?: string;
}

const mockActions: CorporateAction[] = [
  // Dividends
  {
    id: "1",
    date: "2026-04-15",
    ticker: "AAPL",
    eventType: "DIVIDEND",
    details: "Quarterly Dividend $0.25",
    status: "EX_DATE",
    amount: "$0.25",
  },
  {
    id: "2",
    date: "2026-04-20",
    ticker: "MSFT",
    eventType: "DIVIDEND",
    details: "Quarterly Dividend $0.75",
    status: "ANNOUNCED",
    amount: "$0.75",
  },
  {
    id: "3",
    date: "2026-05-01",
    ticker: "JPM",
    eventType: "DIVIDEND",
    details: "Quarterly Dividend $1.15",
    status: "ANNOUNCED",
    amount: "$1.15",
  },
  {
    id: "4",
    date: "2026-04-10",
    ticker: "KO",
    eventType: "DIVIDEND",
    details: "Quarterly Dividend $0.42",
    status: "EFFECTIVE",
    amount: "$0.42",
  },
  {
    id: "5",
    date: "2026-04-25",
    ticker: "PG",
    eventType: "DIVIDEND",
    details: "Quarterly Dividend $0.95",
    status: "RECORD_DATE",
    amount: "$0.95",
  },

  // Splits
  {
    id: "6",
    date: "2026-05-05",
    ticker: "NVDA",
    eventType: "SPLIT",
    details: "10:1 Stock Split",
    status: "ANNOUNCED",
  },
  {
    id: "7",
    date: "2026-06-15",
    ticker: "AMZN",
    eventType: "SPLIT",
    details: "20:1 Stock Split (Historical Ref)",
    status: "UPCOMING",
  },
  {
    id: "8",
    date: "2026-05-20",
    ticker: "TSLA",
    eventType: "SPLIT",
    details: "3:1 Stock Split",
    status: "ANNOUNCED",
  },

  // Buybacks
  {
    id: "9",
    date: "2026-04-01",
    ticker: "AAPL",
    eventType: "BUYBACK",
    details: "$90B Buyback Authorized",
    status: "EFFECTIVE",
  },
  {
    id: "10",
    date: "2026-03-20",
    ticker: "GOOGL",
    eventType: "BUYBACK",
    details: "$70B Buyback Program",
    status: "EFFECTIVE",
  },
  {
    id: "11",
    date: "2026-04-12",
    ticker: "META",
    eventType: "BUYBACK",
    details: "$40B Buyback Approved",
    status: "ANNOUNCED",
  },
  {
    id: "12",
    date: "2026-05-10",
    ticker: "MSFT",
    eventType: "BUYBACK",
    details: "$60B Buyback Program",
    status: "ANNOUNCED",
  },

  // IPOs
  {
    id: "13",
    date: "2026-05-15",
    ticker: "RDDT",
    eventType: "IPO",
    details: "Reddit IPO (Priced at $34)",
    status: "UPCOMING",
  },
  {
    id: "14",
    date: "2026-06-10",
    ticker: "CART",
    eventType: "IPO",
    details: "Instacart IPO (Expected)",
    status: "UPCOMING",
  },
  {
    id: "15",
    date: "2026-07-01",
    ticker: "ARM",
    eventType: "IPO",
    details: "Arm Holdings IPO (Nasdaq)",
    status: "UPCOMING",
  },
];

const getEventColor = (eventType: string): string => {
  switch (eventType) {
    case "DIVIDEND":
      return "#ffa028"; // Amber
    case "SPLIT":
      return "#4af6c3"; // Cyan
    case "BUYBACK":
      return "#0068ff"; // Blue
    case "IPO":
      return "#4af6c3"; // Green (using cyan as proxy)
    default:
      return "#fff";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "EFFECTIVE":
      return "#4af6c3"; // Cyan
    case "EX_DATE":
      return "#ff433d"; // Red
    case "ANNOUNCED":
      return "#ffa028"; // Amber
    case "RECORD_DATE":
      return "#0068ff"; // Blue
    case "UPCOMING":
      return "#7a6030"; // Muted
    default:
      return "#fff";
  }
};

export default function CorporateActionsPanel() {
  const [activeTab, setActiveTab] = useState<ActionTab>("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredActions =
    activeTab === "ALL"
      ? mockActions
      : mockActions.filter((action) => {
          if (activeTab === "DIVIDENDS") return action.eventType === "DIVIDEND";
          if (activeTab === "SPLITS") return action.eventType === "SPLIT";
          if (activeTab === "BUYBACKS") return action.eventType === "BUYBACK";
          if (activeTab === "IPO") return action.eventType === "IPO";
          return true;
        });

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader
        title="CACS"
        subtitle="Corporate Actions"
        rightLabel="CA"
      />

      {/* Tab bar */}
      <div
        className="flex items-center h-[18px] text-[9px] shrink-0 overflow-x-auto"
        style={{ borderBottom: "1px solid #1c1c1c" }}
      >
        {(["ALL", "DIVIDENDS", "SPLITS", "BUYBACKS", "IPO"] as const).map(
          (tab) => (
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
                whiteSpace: "nowrap",
              }}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Column headers */}
      <div
        className="grid text-[10px] shrink-0"
        style={{
          gridTemplateColumns: "70px 45px 80px 180px 100px",
          color: "#7a6030",
          borderBottom: "1px solid #ffa028",
          background: "#050500",
          padding: "3px 8px",
        }}
      >
        <span>DATE</span>
        <span>TICKER</span>
        <span>EVENT TYPE</span>
        <span>DETAILS</span>
        <span>STATUS</span>
      </div>

      {/* Data rows */}
      <div className="flex-1 overflow-auto">
        {filteredActions.map((action, idx) => (
          <div key={action.id}>
            <div
              className="grid text-[9px] cursor-pointer"
              style={{
                gridTemplateColumns: "70px 45px 80px 180px 100px",
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
              onClick={() =>
                setExpandedRow(
                  expandedRow === action.id ? null : action.id
                )
              }
            >
              <span style={{ color: "#fff" }}>{action.date}</span>
              <span style={{ color: "#0068ff", fontWeight: "bold" }}>
                {action.ticker}
              </span>
              <span style={{ color: getEventColor(action.eventType) }}>
                {action.eventType}
              </span>
              <span style={{ color: "#ffa028" }}>{action.details}</span>
              <span style={{ color: getStatusColor(action.status) }}>
                {action.status}
              </span>
            </div>

            {/* Expanded detail row */}
            {expandedRow === action.id && (
              <div
                style={{
                  background: "#050500",
                  borderBottom: "1px solid #0a0a05",
                  padding: "8px 8px",
                  borderLeft: `2px solid ${getEventColor(action.eventType)}`,
                }}
              >
                <div
                  className="text-[10px]"
                  style={{ color: "#7a6030", marginBottom: "4px" }}
                >
                  <div>
                    <span style={{ color: "#ffa028", fontWeight: "bold" }}>
                      Ticker:
                    </span>{" "}
                    {action.ticker}
                  </div>
                  <div>
                    <span style={{ color: "#ffa028", fontWeight: "bold" }}>
                      Date:
                    </span>{" "}
                    {action.date}
                  </div>
                  <div>
                    <span style={{ color: "#ffa028", fontWeight: "bold" }}>
                      Type:
                    </span>{" "}
                    {action.eventType}
                  </div>
                  <div>
                    <span style={{ color: "#ffa028", fontWeight: "bold" }}>
                      Details:
                    </span>{" "}
                    {action.details}
                  </div>
                  {action.amount && (
                    <div>
                      <span style={{ color: "#ffa028", fontWeight: "bold" }}>
                        Amount:
                      </span>{" "}
                      {action.amount}
                    </div>
                  )}
                  <div>
                    <span style={{ color: "#ffa028", fontWeight: "bold" }}>
                      Status:
                    </span>{" "}
                    {action.status}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="text-[10px] shrink-0"
        style={{
          color: "#7a6030",
          background: "#050500",
          borderTop: "1px solid #1a1000",
          padding: "3px 8px",
        }}
      >
        SOURCE: BLOOMBERG CORPORATE ACTIONS
      </div>
    </div>
  );
}

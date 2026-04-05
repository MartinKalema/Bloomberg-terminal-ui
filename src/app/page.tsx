"use client";

import { useState, useCallback } from "react";
import CommandBar from "@/components/CommandBar";
import FunctionKeyBar from "@/components/FunctionKeyBar";
import TickerTape from "@/components/TickerTape";
import StatusBar from "@/components/StatusBar";
import SecurityPanel from "@/components/SecurityPanel";
import NewsPanel from "@/components/NewsPanel";
import ChartPanel from "@/components/ChartPanel";
import WatchlistPanel from "@/components/WatchlistPanel";
import MarketMoversPanel from "@/components/MarketMoversPanel";
import EconCalendarPanel from "@/components/EconCalendarPanel";
import OrderBookPanel from "@/components/OrderBookPanel";
import HeatMapPanel from "@/components/HeatMapPanel";
import ChatPanel from "@/components/ChatPanel";
import PortfolioPanel from "@/components/PortfolioPanel";
import AlertOverlay from "@/components/AlertOverlay";
import ContextMenu, { getTickerMenuItems } from "@/components/ContextMenu";
import TradeTicketPanel from "@/components/TradeTicketPanel";
import BlotterPanel from "@/components/BlotterPanel";
import OptionsPanel from "@/components/OptionsPanel";
import ScreenerPanel from "@/components/ScreenerPanel";
import YieldCurvePanel from "@/components/YieldCurvePanel";
import EarningsPanel from "@/components/EarningsPanel";
import CorporateActionsPanel from "@/components/CorporateActionsPanel";
import AnalystPanel from "@/components/AnalystPanel";
import LaunchpadPanel from "@/components/LaunchpadPanel";

const PAGE_TABS = [
  { num: "1", label: "MONITOR" },
  { num: "2", label: "NEWS" },
  { num: "3", label: "MARKETS" },
  { num: "4", label: "PORTFOLIO" },
  { num: "5", label: "TRADING" },
  { num: "6", label: "RESEARCH" },
  { num: "7", label: "FIXED INC" },
  { num: "8", label: "LAUNCHPAD" },
];

export default function Home() {
  const [activePageTab, setActivePageTab] = useState("1");
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; ticker: string } | null>(null);

  const handleCommand = useCallback((cmd: string) => {
    const cmdMap: Record<string, string> = {
      "MON": "1", "MONITOR": "1",
      "NEWS": "2", "TOP": "2",
      "MARKETS": "3", "WEI": "3", "MOV": "3", "IMAP": "3",
      "PORT": "4", "PORTFOLIO": "4",
      "TRADE": "5", "EMSX": "5", "TSOX": "5", "BLOT": "5", "BLOTTER": "5",
      "EQS": "6", "ANR": "6", "OMON": "6", "EA": "6", "ERN": "6", "CACS": "6", "RESEARCH": "6",
      "YCRV": "7", "YAS": "7", "GOVT": "7", "FI": "7",
      "LNCHPD": "8", "LAUNCHPAD": "8", "DASH": "8",
    };

    if (cmdMap[cmd]) {
      setActivePageTab(cmdMap[cmd]);
      setCommandFeedback(`${cmd} <GO>`);
    } else {
      setCommandFeedback(`${cmd} <GO>`);
    }

    setTimeout(() => setCommandFeedback(null), 2000);
  }, []);

  const handleFunctionKey = useCallback((label: string) => {
    const fkMap: Record<string, string> = {
      "NEWS": "2",
      "PORT": "4",
      "GRAPH": "3",
      "TRADE": "5",
      "BOOK": "1",
      "MSG": "1",
      "LNCHPD": "8",
    };
    if (fkMap[label]) {
      setActivePageTab(fkMap[label]);
      setCommandFeedback(`F-KEY → ${label}`);
      setTimeout(() => setCommandFeedback(null), 2000);
    }
  }, []);

  // Global right-click handler to show Bloomberg context menu on tickers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const style = window.getComputedStyle(target);
    const color = style.color;
    const text = target.textContent?.trim() || "";

    if ((color === "rgb(0, 104, 255)" || target.closest("[data-ticker]")) && text.length <= 10 && text === text.toUpperCase()) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, ticker: text });
    }
  }, []);

  const handleContextAction = useCallback((action: string) => {
    if (action === "COPY" && contextMenu) {
      navigator.clipboard.writeText(contextMenu.ticker).catch(() => {});
    }
    setContextMenu(null);
  }, [contextMenu]);

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ background: "#000" }}
      onContextMenu={handleContextMenu}
    >
      {/* Alert overlay — floating notifications */}
      <AlertOverlay />

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getTickerMenuItems(contextMenu.ticker, handleContextAction)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Command Bar */}
      <CommandBar onCommand={handleCommand} />

      {/* Bloomberg Function Key Bar */}
      <FunctionKeyBar onFunctionKey={handleFunctionKey} />

      {/* Scrolling Ticker Tape */}
      <TickerTape />

      {/* Panel Tabs */}
      <div
        className="flex items-center h-[20px] shrink-0"
        style={{ background: "#000", borderBottom: "1px solid #1a1000" }}
      >
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.num}
            onClick={() => setActivePageTab(tab.num)}
            className="text-[9px] tracking-wide"
            style={{
              padding: "0 12px",
              height: "100%",
              color: activePageTab === tab.num ? "#000" : "#7a6030",
              background: activePageTab === tab.num ? "#ffa028" : "transparent",
              borderRight: "1px solid #1a1000",
              fontWeight: activePageTab === tab.num ? "bold" : "normal",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (activePageTab !== tab.num) {
                e.currentTarget.style.background = "#1a1000";
                e.currentTarget.style.color = "#ffa028";
              }
            }}
            onMouseLeave={(e) => {
              if (activePageTab !== tab.num) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#7a6030";
              }
            }}
          >
            {tab.num}) {tab.label}
          </button>
        ))}
        <div className="flex-1 flex items-center justify-center">
          {commandFeedback && (
            <span className="text-[9px] font-bold" style={{ color: "#ffa028" }}>
              {commandFeedback}
            </span>
          )}
        </div>
        <span className="text-[8px]" style={{ color: "#3d3020", paddingRight: "12px" }}>
          BLOOMBERG PROFESSIONAL SERVICE
        </span>
      </div>

      {/* === TAB 1: MONITOR (main Bloomberg layout) === */}
      {activePageTab === "1" && (
        <div
          className="flex-1 grid grid-cols-[220px_1fr_260px_280px] grid-rows-[1fr_1fr] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden"><SecurityPanel /></div>
          <div className="min-h-0 overflow-hidden"><ChartPanel /></div>
          <div className="min-h-0 overflow-hidden"><MarketMoversPanel /></div>
          <div className="min-h-0 overflow-hidden"><OrderBookPanel /></div>
          <div className="min-h-0 overflow-hidden"><EconCalendarPanel /></div>
          <div className="min-h-0 overflow-hidden"><NewsPanel /></div>
          <div className="min-h-0 overflow-hidden"><ChatPanel /></div>
          <div className="min-h-0 overflow-hidden"><WatchlistPanel /></div>
        </div>
      )}

      {/* === TAB 2: NEWS (full news + sidebar) === */}
      {activePageTab === "2" && (
        <div
          className="flex-1 grid grid-cols-[1fr_300px] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden grid grid-rows-[1fr_1fr]" style={{ gap: "2px" }}>
            <NewsPanel />
            <ChatPanel />
          </div>
          <div className="min-h-0 overflow-hidden grid grid-rows-[1fr_1fr]" style={{ gap: "2px" }}>
            <SecurityPanel />
            <EconCalendarPanel />
          </div>
        </div>
      )}

      {/* === TAB 3: MARKETS (charts + heat map + movers) === */}
      {activePageTab === "3" && (
        <div
          className="flex-1 grid grid-cols-[1fr_1fr] grid-rows-[1fr_1fr] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden"><ChartPanel /></div>
          <div className="min-h-0 overflow-hidden"><HeatMapPanel /></div>
          <div className="min-h-0 overflow-hidden"><MarketMoversPanel /></div>
          <div className="min-h-0 overflow-hidden"><WatchlistPanel /></div>
        </div>
      )}

      {/* === TAB 4: PORTFOLIO === */}
      {activePageTab === "4" && (
        <div
          className="flex-1 grid grid-cols-[1fr_300px] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden grid grid-rows-[1fr_1fr]" style={{ gap: "2px" }}>
            <PortfolioPanel />
            <ChartPanel />
          </div>
          <div className="min-h-0 overflow-hidden grid grid-rows-[1fr_1fr_1fr]" style={{ gap: "2px" }}>
            <SecurityPanel />
            <OrderBookPanel />
            <ChatPanel />
          </div>
        </div>
      )}

      {/* === TAB 5: TRADING (order entry + blotter + depth) === */}
      {activePageTab === "5" && (
        <div
          className="flex-1 grid grid-cols-[280px_1fr_280px] grid-rows-[1fr_1fr] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden row-span-2"><TradeTicketPanel /></div>
          <div className="min-h-0 overflow-hidden"><ChartPanel /></div>
          <div className="min-h-0 overflow-hidden"><OrderBookPanel /></div>
          <div className="min-h-0 overflow-hidden"><BlotterPanel /></div>
          <div className="min-h-0 overflow-hidden"><WatchlistPanel /></div>
        </div>
      )}

      {/* === TAB 6: RESEARCH (screener + options + earnings + analysts) === */}
      {activePageTab === "6" && (
        <div
          className="flex-1 grid grid-cols-[1fr_1fr] grid-rows-[1fr_1fr] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden"><ScreenerPanel /></div>
          <div className="min-h-0 overflow-hidden"><OptionsPanel /></div>
          <div className="min-h-0 overflow-hidden"><EarningsPanel /></div>
          <div className="min-h-0 overflow-hidden"><AnalystPanel /></div>
        </div>
      )}

      {/* === TAB 7: FIXED INCOME (yield curve + econ + corporate actions) === */}
      {activePageTab === "7" && (
        <div
          className="flex-1 grid grid-cols-[1fr_300px] min-h-0"
          style={{ gap: "2px", background: "#1a1000" }}
        >
          <div className="min-h-0 overflow-hidden grid grid-rows-[1fr_1fr]" style={{ gap: "2px" }}>
            <YieldCurvePanel />
            <CorporateActionsPanel />
          </div>
          <div className="min-h-0 overflow-hidden grid grid-rows-[1fr_1fr]" style={{ gap: "2px" }}>
            <SecurityPanel />
            <EconCalendarPanel />
          </div>
        </div>
      )}

      {/* === TAB 8: LAUNCHPAD (customizable dashboard) === */}
      {activePageTab === "8" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <LaunchpadPanel />
        </div>
      )}

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

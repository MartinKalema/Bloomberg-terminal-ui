"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface CommandBarProps {
  onCommand?: (cmd: string) => void;
}

interface Suggestion {
  type: "command" | "security";
  id: string;
  display: string;
  value: string;
  description?: string;
}

const COMMAND_HINTS: Record<string, string> = {
  "DES": "Description",
  "GP": "Graph",
  "FA": "Financial Analysis",
  "NEWS": "News",
  "TOP": "Top News",
  "MON": "Monitor",
  "WEI": "World Equity Indices",
  "MOV": "Market Movers",
  "ECO": "Economic Calendar",
  "DEPTH": "Market Depth",
  "OMON": "Option Monitor",
  "ANR": "Analyst Recommendations",
  "HELP": "Help",
};

const SECURITIES: { ticker: string; name: string; type: string }[] = [
  { ticker: "AAPL", name: "APPLE INC", type: "Equity" },
  { ticker: "MSFT", name: "MICROSOFT CORP", type: "Equity" },
  { ticker: "NVDA", name: "NVIDIA CORP", type: "Equity" },
  { ticker: "TSLA", name: "TESLA INC", type: "Equity" },
  { ticker: "AMZN", name: "AMAZON.COM INC", type: "Equity" },
  { ticker: "GOOGL", name: "ALPHABET INC-A", type: "Equity" },
  { ticker: "META", name: "META PLATFORMS", type: "Equity" },
  { ticker: "JPM", name: "JPMORGAN CHASE", type: "Equity" },
  { ticker: "SPX", name: "S&P 500 INDEX", type: "Index" },
  { ticker: "INDU", name: "DOW JONES INDUS", type: "Index" },
  { ticker: "CCMP", name: "NASDAQ COMPOSITE", type: "Index" },
  { ticker: "VIX", name: "CBOE VOLATILITY", type: "Index" },
  { ticker: "CL1", name: "WTI CRUDE FUTURE", type: "Cmdty" },
  { ticker: "GC1", name: "GOLD FUTURE", type: "Cmdty" },
  { ticker: "EUR", name: "EUR/USD SPOT", type: "Curncy" },
  { ticker: "GBP", name: "GBP/USD SPOT", type: "Curncy" },
  { ticker: "JPY", name: "USD/JPY SPOT", type: "Curncy" },
  { ticker: "USGG10YR", name: "US 10Y GOVT", type: "Govt" },
  { ticker: "TLT", name: "ISHARES 20Y TREAS", type: "Fund" },
  { ticker: "QQQ", name: "INVESCO QQQ", type: "Fund" },
  { ticker: "SPY", name: "SPDR S&P 500", type: "Fund" },
];

export default function CommandBar({ onCommand }: CommandBarProps) {
  const [command, setCommand] = useState("");
  const [hint, setHint] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [flash, setFlash] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const generateSuggestions = useCallback((input: string): Suggestion[] => {
    if (!input.trim()) return [];

    const searchTerm = input.trim().toUpperCase();
    const filtered: Suggestion[] = [];

    // Add matching commands
    for (const [cmd, desc] of Object.entries(COMMAND_HINTS)) {
      if (cmd.startsWith(searchTerm)) {
        filtered.push({
          type: "command",
          id: `cmd-${cmd}`,
          display: cmd,
          value: cmd,
          description: desc,
        });
      }
    }

    // Add matching securities
    for (const sec of SECURITIES) {
      if (
        sec.ticker.startsWith(searchTerm) ||
        sec.name.toUpperCase().includes(searchTerm)
      ) {
        filtered.push({
          type: "security",
          id: `sec-${sec.ticker}`,
          display: sec.ticker,
          value: sec.ticker,
          description: sec.name,
        });
      }
    }

    // Show max 8 suggestions
    return filtered.slice(0, 8);
  }, []);

  useEffect(() => {
    const newSuggestions = generateSuggestions(command);
    setSuggestions(newSuggestions);
    setSelectedSuggestion(-1);
    setShowDropdown(newSuggestions.length > 0);
  }, [command, generateSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < suggestions.length) {
        const suggestion = suggestions[index];
        setCommand(suggestion.value);
        setShowDropdown(false);
        setSuggestions([]);
      }
    },
    [suggestions]
  );

  const executeCommand = useCallback(() => {
    const cmd = command.trim();
    if (!cmd) return;

    setHistory((prev) => [cmd, ...prev.slice(0, 19)]);
    setHistoryIdx(-1);
    setShowDropdown(false);

    // Flash the GO button
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (onCommand) {
      onCommand(cmd);
    }

    setCommand("");
    setHint("");
  }, [command, onCommand]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle dropdown navigation
    if (showDropdown && suggestions.length > 0) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
        return;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev === -1 ? 0 : prev >= suggestions.length - 1 ? 0 : prev + 1
        );
        return;
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          selectSuggestion(selectedSuggestion);
          return;
        }
      }
    }

    // Handle command execution and history
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(newIdx);
        setCommand(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setCommand(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setCommand("");
      }
    } else if (e.key === "Escape") {
      if (showDropdown) {
        setShowDropdown(false);
      } else {
        setCommand("");
        setHint("");
        setHistoryIdx(-1);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCommand(val);
    setHistoryIdx(-1);

    // Show hint for recognized commands
    const match = COMMAND_HINTS[val.trim()];
    setHint(match || "");
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div
      className="flex items-center h-[32px] shrink-0"
      style={{
        background: "#080800",
        borderBottom: "1px solid #1a1000",
        padding: "0 12px",
        gap: "10px",
      }}
    >
      {/* Bloomberg branding pill */}
      <div
        className="flex items-center font-bold text-[11px] tracking-[0.15em]"
        style={{
          color: "#000",
          background: "#ffa028",
          padding: "2px 10px",
          borderRadius: "2px",
        }}
      >
        BLOOMBERG
      </div>

      {/* Security context */}
      <span className="text-[10px]" style={{ color: "#7a6030" }}>
        1)
      </span>
      <span className="text-[10px] font-bold" style={{ color: "#ffa028" }}>
        SPX Index
      </span>

      {/* Separator */}
      <span style={{ color: "#1a1000" }}>│</span>

      {/* Command Input with Dropdown */}
      <div className="flex-1 relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Enter Command..."
          className="flex-1 bg-transparent outline-none text-[11px]"
          style={{
            color: "#fff",
            caretColor: "#ffa028",
            padding: "4px 0",
          }}
          spellCheck={false}
        />
        {hint && (
          <span className="text-[9px]" style={{ color: "#7a6030", marginLeft: "8px", whiteSpace: "nowrap" }}>
            {hint}
          </span>
        )}

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-0 z-[9000]"
            style={{
              background: "#0a0800",
              border: "1px solid #ffa028",
              borderTop: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
              minWidth: "300px",
            }}
          >
            {suggestions.map((suggestion, idx) => (
              <div
                key={suggestion.id}
                onClick={() => selectSuggestion(idx)}
                onMouseEnter={() => setSelectedSuggestion(idx)}
                className="px-3 py-2 cursor-pointer flex items-center gap-3 text-[9px] border-b border-[#1a1000] last:border-b-0"
                style={{
                  background:
                    selectedSuggestion === idx ? "#0a0a1e" : "transparent",
                  fontFamily: "monospace",
                  transition: "background 0.15s",
                }}
              >
                {/* Type badge */}
                <span
                  className="shrink-0 w-8 text-center text-[10px] font-bold"
                  style={{
                    color: suggestion.type === "command" ? "#ffa028" : "#7a6030",
                  }}
                >
                  {suggestion.type === "command" ? "CMD" : "SEC"}
                </span>

                {/* Ticker in blue */}
                <span
                  className="font-bold w-16 shrink-0"
                  style={{ color: "#4af6c3" }}
                >
                  {suggestion.display}
                </span>

                {/* Name in amber */}
                <span
                  className="flex-1 truncate"
                  style={{ color: "#ffa028" }}
                >
                  {suggestion.description}
                </span>

                {/* Shortcut hint in dim */}
                {suggestion.type === "command" && (
                  <span className="text-[10px] shrink-0" style={{ color: "#4a4a3a" }}>
                    ↵
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GO key */}
      <button
        onClick={executeCommand}
        className="text-[10px] font-bold"
        style={{
          color: "#000",
          background: flash ? "#fff" : "#ffa028",
          padding: "3px 14px",
          borderRadius: "2px",
          boxShadow: "0 1px 0 rgba(0,0,0,0.5)",
          cursor: "pointer",
          transition: "background 0.1s",
        }}
      >
        GO
      </button>

      {/* Separator */}
      <span style={{ color: "#1a1000" }}>│</span>

      {/* Right indicators */}
      <div className="flex items-center text-[9px]" style={{ color: "#7a6030", gap: "10px" }}>
        <span>
          <span style={{ color: "#4af6c3", fontSize: "8px" }}>●</span>
          <span style={{ color: "#4af6c3", marginLeft: "4px" }}>CONNECTED</span>
        </span>
        <span>PNL:1</span>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

const functionKeys = [
  { key: "F1", label: "HELP", color: "#FFCC00" },
  { key: "F2", label: "NEWS", color: "#FFCC00" },
  { key: "F3", label: "MENU", color: "#00CC00" },
  { key: "F4", label: "PORT", color: "#00CC00" },
  { key: "F5", label: "GRAPH", color: "#FF3300" },
  { key: "F6", label: "TRADE", color: "#FF3300" },
  { key: "F7", label: "BOOK", color: "#FFA028" },
  { key: "F8", label: "LNCHPD", color: "#FFA028" },
  { key: "F9", label: "EXCEL", color: "#444444" },
  { key: "F10", label: "ACTN", color: "#444444" },
  { key: "F11", label: "MSG", color: "#444444" },
  { key: "F12", label: "PRINT", color: "#444444" },
];

interface FunctionKeyBarProps {
  onFunctionKey?: (label: string) => void;
}

export default function FunctionKeyBar({ onFunctionKey }: FunctionKeyBarProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [toastLabel, setToastLabel] = useState<string | null>(null);

  const handleClick = (key: string, label: string) => {
    setPressedKey(key);
    setActiveKey(key);
    setToastLabel(label);
    onFunctionKey?.(label);
    setTimeout(() => setPressedKey(null), 150);
    setTimeout(() => setActiveKey(null), 1500);
    setTimeout(() => setToastLabel(null), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Match F1-F12 keys
      const fkMatch = e.key.match(/^F(\d+)$/);
      if (fkMatch) {
        e.preventDefault();
        const fkNum = parseInt(fkMatch[1]);
        if (fkNum >= 1 && fkNum <= 12) {
          const fk = functionKeys[fkNum - 1];
          setPressedKey(fk.key);
          setActiveKey(fk.key);
          setToastLabel(fk.label);
          onFunctionKey?.(fk.label);
          setTimeout(() => setPressedKey(null), 150);
          setTimeout(() => setActiveKey(null), 1500);
          setTimeout(() => setToastLabel(null), 2000);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFunctionKey]);

  return (
    <div
      className="flex items-center h-[24px] shrink-0 relative"
      style={{
        background: "#080800",
        borderBottom: "1px solid #1a1000",
        padding: "0 8px",
        gap: "4px",
      }}
    >
      {functionKeys.map((fk) => (
        <button
          key={fk.key}
          onClick={() => handleClick(fk.key, fk.label)}
          className="flex flex-col items-center justify-center cursor-pointer"
          style={{
            background: pressedKey === fk.key ? "#fff" : fk.color,
            color: "#000",
            fontSize: "8px",
            fontWeight: "bold",
            fontFamily: "monospace",
            lineHeight: 1,
            minWidth: "44px",
            height: "20px",
            borderRadius: "2px",
            border: activeKey === fk.key ? "1px solid #fff" : "1px solid rgba(255,255,255,0.15)",
            boxShadow: pressedKey === fk.key
              ? "inset 0 1px 2px rgba(0,0,0,0.3)"
              : "0 1px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            padding: "0 4px",
            transform: pressedKey === fk.key ? "translateY(1px)" : "none",
            transition: "transform 0.05s, background 0.05s",
          }}
        >
          <span style={{ fontSize: "7px", opacity: 0.7 }}>{fk.key}</span>
          <span>{fk.label}</span>
        </button>
      ))}
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {toastLabel && (
          <span className="text-[10px] font-bold animate-pulse" style={{ color: "#ffa028" }}>
            {"{" + functionKeys.find(f => f.label === toastLabel)?.key + "}"} {toastLabel}
          </span>
        )}
        {activeKey && !toastLabel && (
          <span className="text-[10px] font-bold" style={{ color: "#ffa028" }}>
            {activeKey}={functionKeys.find(f => f.key === activeKey)?.label}
          </span>
        )}
        <span className="text-[10px]" style={{ color: "#3d3020" }}>
          BLOOMBERG KEYBOARD
        </span>
      </div>
    </div>
  );
}

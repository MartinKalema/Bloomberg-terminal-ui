"use client";

import { useEffect, useRef } from "react";

const tickers = [
  { symbol: "SPX", price: "5,428.75", change: "+12.50", up: true },
  { symbol: "INDU", price: "40,125.00", change: "+87.00", up: true },
  { symbol: "CCMP", price: "16,892.43", change: "-45.21", up: false },
  { symbol: "USGG10YR", price: "4.2200", change: "-0.030", up: false },
  { symbol: "CL1", price: "78.42", change: "-0.95", up: false },
  { symbol: "GC1", price: "2,342.80", change: "+14.30", up: true },
  { symbol: "EUR", price: "1.0842", change: "+0.0023", up: true },
  { symbol: "GBP", price: "1.2687", change: "-0.0012", up: false },
  { symbol: "JPY", price: "154.23", change: "+0.45", up: true },
  { symbol: "BTC", price: "67,234.50", change: "+1,234.20", up: true },
  { symbol: "VIX", price: "14.52", change: "-0.83", up: false },
  { symbol: "RTY", price: "2,067.34", change: "+8.92", up: true },
];

function TickerItem({ t }: { t: typeof tickers[0] }) {
  return (
    <span className="inline-flex items-center gap-1 mx-3 whitespace-nowrap" style={{ fontSize: "10px" }}>
      <span style={{ color: "#fff", fontWeight: "bold" }}>{t.symbol}</span>
      <span style={{ color: "#ffa028" }}>{t.price}</span>
      <span style={{ color: t.up ? "#4af6c3" : "#ff433d" }}>
        {t.up ? "\u25B2" : "\u25BC"}{t.change}
      </span>
      <span style={{ color: "#1a1000", margin: "0 4px" }}>{"\u2502"}</span>
    </span>
  );
}

export default function TickerTape() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pos = 0;
    const speed = 0.5;
    let animId: number;

    const animate = () => {
      pos -= speed;
      // Reset when first half has scrolled out
      if (Math.abs(pos) >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="h-[16px] overflow-hidden shrink-0 relative"
      style={{
        background: "#050500",
        borderBottom: "1px solid #1a1000",
        borderTop: "1px solid #1a1000",
      }}
    >
      <div
        ref={scrollRef}
        className="flex items-center h-full absolute whitespace-nowrap"
      >
        {/* Duplicate for seamless loop */}
        {[...tickers, ...tickers].map((t, i) => (
          <TickerItem key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

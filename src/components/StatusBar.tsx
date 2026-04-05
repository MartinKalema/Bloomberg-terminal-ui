"use client";

import { useState, useEffect } from "react";

export default function StatusBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [lonTime, setLonTime] = useState("");
  const [tkyTime, setTkyTime] = useState("");
  const [marketStatus, setMarketStatus] = useState("CLOSED");
  const [marketColor, setMarketColor] = useState("#ff3300");
  const [latency, setLatency] = useState(2);
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Format NY time
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      // Format date
      setDate(
        now.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      );

      // Calculate LON time (ET + 5 hours)
      const lonDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      setLonTime(
        lonDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      // Calculate TKY time (ET + 14 hours)
      const tkyDate = new Date(now.getTime() + 14 * 60 * 60 * 1000);
      setTkyTime(
        tkyDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      // Determine market status
      if (hours >= 4 && hours < 9 && minutes >= 0) {
        setMarketStatus("PRE");
        setMarketColor("#4af6c3");
      } else if (hours >= 9 && hours < 16) {
        setMarketStatus("OPEN");
        setMarketColor("#00cc00");
      } else if (hours >= 16 && hours < 20) {
        setMarketStatus("AFTER");
        setMarketColor("#ff9900");
      } else {
        setMarketStatus("CLOSED");
        setMarketColor("#ff3300");
      }

      // Increment last update counter
      setLastUpdate((prev) => prev + 1);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate network latency fluctuation
  useEffect(() => {
    const latencyInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 4) + 1);
    }, 5000);
    return () => clearInterval(latencyInterval);
  }, []);

  return (
    <div
      className="flex items-center justify-between h-[22px] text-[10px] shrink-0"
      style={{
        background: "#050500",
        borderTop: "1px solid #1a1000",
        color: "#7a6030",
        padding: "0 12px",
        fontFamily: "monospace",
      }}
    >
      {/* Left Section: User and Connection Status */}
      <div className="flex items-center" style={{ gap: "12px" }}>
        <span className="font-bold tracking-wider" style={{ color: "#ffa028" }}>
          USER: MKALEMA
        </span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span>
          <span style={{ color: "#4af6c3", fontSize: "7px" }}>●</span>
          <span style={{ color: "#4af6c3", marginLeft: "3px" }}>CONNECTED</span>
        </span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span style={{ color: marketColor }}>
          MKT: {marketStatus}
        </span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span style={{ color: "#ffa028" }}>
          ORDERS: 2 WORKING
        </span>
      </div>

      {/* Middle Section: Metrics */}
      <div className="flex items-center" style={{ gap: "8px", color: "#3d3020" }}>
        <span>LAT: {latency}ms</span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span>LAST UPD: {lastUpdate}s</span>
      </div>

      {/* Right Section: Time Zones and P&L */}
      <div className="flex items-center" style={{ gap: "8px" }}>
        <span style={{ color: "#00cc00" }}>
          +$10,290
        </span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span>NY {time} ET</span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span>LON {lonTime} GMT</span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span>TKY {tkyTime} JST</span>
        <span style={{ color: "#1a1000" }}>│</span>
        <span style={{ color: "#ffa028" }}>{date}</span>
      </div>
    </div>
  );
}

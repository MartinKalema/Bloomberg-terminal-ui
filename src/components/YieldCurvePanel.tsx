"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import PanelHeader from "./PanelHeader";

/* ──────────────────── Types ──────────────────── */

interface YieldPoint {
  maturity: string;
  current: number;
  prior: number;
}

/* ──────────────────── Data ──────────────────── */

const yieldData: YieldPoint[] = [
  { maturity: "1M",  current: 5.33, prior: 5.31 },
  { maturity: "3M",  current: 5.28, prior: 5.25 },
  { maturity: "6M",  current: 5.18, prior: 5.14 },
  { maturity: "1Y",  current: 4.95, prior: 4.89 },
  { maturity: "2Y",  current: 4.62, prior: 4.55 },
  { maturity: "3Y",  current: 4.48, prior: 4.40 },
  { maturity: "5Y",  current: 4.38, prior: 4.30 },
  { maturity: "7Y",  current: 4.42, prior: 4.35 },
  { maturity: "10Y", current: 4.47, prior: 4.42 },
  { maturity: "20Y", current: 4.72, prior: 4.68 },
  { maturity: "30Y", current: 4.65, prior: 4.61 },
];

/* ──────────────────── Component ──────────────────── */

export default function YieldCurvePanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Spread calculations
  const y2 = yieldData[4].current;   // 2Y
  const y10 = yieldData[8].current;  // 10Y
  const y3m = yieldData[1].current;  // 3M
  const spread2s10s = y10 - y2;
  const spread3m10y = y10 - y3m;

  const curveStatus = spread2s10s < -0.05 ? "INVERTED" : spread2s10s < 0.05 ? "FLAT" : "NORMAL";

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const margin = { top: 20, right: 14, bottom: 22, left: 38 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Compute y-axis range from data
    const allYields = yieldData.flatMap(p => [p.current, p.prior]);
    const dataMin = Math.min(...allYields);
    const dataMax = Math.max(...allYields);
    const padding = 0.15;
    const minYield = Math.floor((dataMin - padding) * 5) / 5; // round down to 0.2
    const maxYield = Math.ceil((dataMax + padding) * 5) / 5;  // round up to 0.2
    const yieldRange = maxYield - minYield;

    const toX = (i: number) => margin.left + (i / (yieldData.length - 1)) * chartWidth;
    const toY = (val: number) => margin.top + chartHeight - ((val - minYield) / yieldRange) * chartHeight;

    // Grid lines
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let y = minYield; y <= maxYield + 0.001; y += 0.2) {
      const pixelY = toY(y);
      ctx.strokeStyle = "#1a1000";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(margin.left, pixelY);
      ctx.lineTo(width - margin.right, pixelY);
      ctx.stroke();

      ctx.fillStyle = "#7a6030";
      ctx.font = "9px monospace";
      ctx.fillText(y.toFixed(1) + "%", margin.left - 4, pixelY);
    }

    // X-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#7a6030";
    ctx.font = "8px monospace";
    yieldData.forEach((point, index) => {
      ctx.fillText(point.maturity, toX(index), height - margin.bottom + 4);
    });

    // Curve type label
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "bold 8px monospace";
    ctx.fillStyle = "#7a6030";
    ctx.fillText("US TREASURY ACTIVES", margin.left + 2, margin.top - 14);

    // Smooth curve drawing helper
    const getPoints = (dataKey: "current" | "prior") =>
      yieldData.map((point, index) => ({ x: toX(index), y: toY(point[dataKey]) }));

    const drawSmoothCurve = (points: { x: number; y: number }[], color: string, dashed: boolean, lineWidth: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (dashed) ctx.setLineDash([4, 3]);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x + (cpx - prev.x) * 0.8, prev.y, cpx, (prev.y + curr.y) / 2);
        ctx.quadraticCurveTo(curr.x - (curr.x - cpx) * 0.8, curr.y, curr.x, curr.y);
      }

      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Prior curve (dashed, visible)
    drawSmoothCurve(getPoints("prior"), "#7a6030", true, 1);

    // Current curve (solid amber)
    const currentPoints = getPoints("current");
    drawSmoothCurve(currentPoints, "#ffa028", false, 1.5);

    // Area fill under current curve
    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
    for (let i = 1; i < currentPoints.length; i++) {
      const prev = currentPoints[i - 1];
      const curr = currentPoints[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.quadraticCurveTo(prev.x + (cpx - prev.x) * 0.8, prev.y, cpx, (prev.y + curr.y) / 2);
      ctx.quadraticCurveTo(curr.x - (curr.x - cpx) * 0.8, curr.y, curr.x, curr.y);
    }
    ctx.lineTo(currentPoints[currentPoints.length - 1].x, height - margin.bottom);
    ctx.lineTo(currentPoints[0].x, height - margin.bottom);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom);
    gradient.addColorStop(0, "rgba(255, 160, 40, 0.10)");
    gradient.addColorStop(1, "rgba(255, 160, 40, 0.01)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Data point dots on current curve
    currentPoints.forEach((p, i) => {
      const isHovered = hoveredIdx === i;
      ctx.fillStyle = isHovered ? "#fff" : "#ffa028";
      ctx.beginPath();
      ctx.arc(p.x, p.y, isHovered ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fill();

      // Show tooltip on hover
      if (isHovered) {
        const label = `${yieldData[i].maturity}: ${yieldData[i].current.toFixed(2)}%`;
        ctx.font = "bold 9px monospace";
        const tw = ctx.measureText(label).width;
        const tx = Math.min(p.x - tw / 2, width - margin.right - tw - 2);
        const ty = p.y - 16;
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(tx - 3, ty - 1, tw + 6, 12);
        ctx.strokeStyle = "#ffa028";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx - 3, ty - 1, tw + 6, 12);
        ctx.fillStyle = "#ffa028";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(label, tx, ty);
      }
    });

    // Legend (top right)
    const legendX = width - margin.right - 90;
    const legendY = margin.top - 12;
    ctx.font = "8px monospace";

    ctx.strokeStyle = "#ffa028";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 4);
    ctx.lineTo(legendX + 14, legendY + 4);
    ctx.stroke();
    ctx.fillStyle = "#ffa028";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Current", legendX + 18, legendY + 4);

    ctx.strokeStyle = "#7a6030";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(legendX + 55, legendY + 4);
    ctx.lineTo(legendX + 69, legendY + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#7a6030";
    ctx.fillText("Prior", legendX + 73, legendY + 4);
  }, [hoveredIdx]);

  useEffect(() => {
    drawChart();
    const ro = new ResizeObserver(() => drawChart());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [drawChart]);

  // Handle canvas mouse hover for data points
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    const margin = { left: 38, right: 14 };
    const chartWidth = container.offsetWidth - margin.left - margin.right;

    let closest = -1;
    let closestDist = Infinity;
    yieldData.forEach((_, i) => {
      const px = margin.left + (i / (yieldData.length - 1)) * chartWidth;
      const dist = Math.abs(mx - px);
      if (dist < closestDist && dist < 15) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoveredIdx(closest >= 0 ? closest : null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", fontFamily: "monospace" }}>
      <PanelHeader title="YCRV" subtitle="Yield Curve" rightLabel="GOVT" />

      {/* Spreads bar */}
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0,
        padding: "2px 8px", borderBottom: "1px solid #1a1000",
        background: "#050500", fontSize: "9px", gap: "6px",
      }}>
        <span style={{ color: "#7a6030" }}>2s10s:</span>
        <span style={{ color: spread2s10s >= 0 ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>
          {spread2s10s >= 0 ? "+" : ""}{spread2s10s.toFixed(3)}%
        </span>
        <span style={{ color: "#7a6030", marginLeft: "6px" }}>3m10y:</span>
        <span style={{ color: spread3m10y >= 0 ? "#4af6c3" : "#ff433d", fontWeight: "bold" }}>
          {spread3m10y >= 0 ? "+" : ""}{spread3m10y.toFixed(3)}%
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "#7a6030" }}>STATUS:</span>
        <span style={{
          fontWeight: "bold",
          color: curveStatus === "INVERTED" ? "#ff433d" : curveStatus === "FLAT" ? "#ffa028" : "#4af6c3",
        }}>
          {curveStatus}
        </span>
      </div>

      {/* Chart area — 45% */}
      <div
        ref={containerRef}
        style={{ flex: "0 0 45%", borderBottom: "1px solid #1a1000", position: "relative", minHeight: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        />
      </div>

      {/* Maturity table */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 1fr 1fr",
          fontSize: "9px", color: "#7a6030",
          borderBottom: "1px solid #ffa028",
          background: "#050500", padding: "2px 8px",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <span>TENOR</span>
          <span style={{ textAlign: "right" }}>CURRENT</span>
          <span style={{ textAlign: "right" }}>PRIOR</span>
          <span style={{ textAlign: "right" }}>CHG</span>
        </div>

        {/* Rows */}
        {yieldData.map((point, idx) => {
          const change = point.current - point.prior;
          return (
            <div
              key={point.maturity}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 1fr 1fr",
                fontSize: "10px", cursor: "pointer",
                borderBottom: "1px solid #0a0a05",
                background: hoveredIdx === idx ? "#0a0a14" : idx % 2 === 0 ? "transparent" : "#030300",
                padding: "3px 8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0a0a14";
                setHoveredIdx(idx);
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "transparent" : "#030300";
                setHoveredIdx(null);
              }}
            >
              <span style={{ color: "#ffa028", fontWeight: "bold" }}>{point.maturity}</span>
              <span style={{ textAlign: "right", color: "#fff" }}>{point.current.toFixed(3)}%</span>
              <span style={{ textAlign: "right", color: "#7a6030" }}>{point.prior.toFixed(3)}%</span>
              <span style={{
                textAlign: "right", fontWeight: "bold",
                color: change >= 0 ? "#4af6c3" : "#ff433d",
              }}>
                {change >= 0 ? "+" : ""}{change.toFixed(3)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

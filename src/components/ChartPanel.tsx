"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PanelHeader from "./PanelHeader";

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

function generateCandles(count: number): Candle[] {
  const candles: Candle[] = [];
  let price = 5380;
  for (let i = 0; i < count; i++) {
    const open = price + (Math.random() - 0.48) * 8;
    const close = open + (Math.random() - 0.48) * 12;
    const high = Math.max(open, close) + Math.random() * 6;
    const low = Math.min(open, close) - Math.random() * 6;
    const volume = Math.floor(Math.random() * 50000) + 10000;
    candles.push({ open, close, high, low, volume });
    price = close;
  }
  return candles;
}

// Calculate Simple Moving Average
function calculateSMA(candles: Candle[], period: number, index: number): number | null {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = index - period + 1; i <= index; i++) {
    sum += candles[i].close;
  }
  return sum / period;
}

// Calculate Bollinger Bands
function calculateBollingerBands(candles: Candle[], period: number, stdDev: number, index: number) {
  const sma = calculateSMA(candles, period, index);
  if (sma === null) return null;

  let sqSum = 0;
  for (let i = index - period + 1; i <= index; i++) {
    sqSum += (candles[i].close - sma) ** 2;
  }
  const std = Math.sqrt(sqSum / period);

  return {
    middle: sma,
    upper: sma + stdDev * std,
    lower: sma - stdDev * std,
  };
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(candles: Candle[], period: number, index: number): number | null {
  if (index < period) return null;

  let gains = 0, losses = 0;
  for (let i = index - period + 1; i <= index; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff > 0) gains += diff;
    else losses += -diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate Exponential Moving Average
function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

// Calculate MACD (Moving Average Convergence Divergence)
function calculateMACD(closes: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signal[i]);
  return { macd: macdLine, signal, histogram };
}

// Calculate Stochastic Oscillator
function calculateStochastic(candles: Candle[], period: number, smoothing: number, index: number): { k: number; d: number } | null {
  if (index < period - 1) return null;

  let highest = -Infinity, lowest = Infinity;
  for (let i = index - period + 1; i <= index; i++) {
    highest = Math.max(highest, candles[i].high);
    lowest = Math.min(lowest, candles[i].low);
  }

  const range = highest - lowest;
  let k = 50;
  if (range !== 0) {
    k = ((candles[index].close - lowest) / range) * 100;
  }

  // For D, we need a SMA of K values — simplified to current K for single-point calculation
  // In practice, you'd store K values and SMA them; here we use K as proxy for D
  const d = k;

  return { k, d };
}

const TIMEFRAMES = [
  { label: "1m", candles: 120, visible: 60, subtitle: "1 Minute" },
  { label: "5m", candles: 150, visible: 72, subtitle: "5 Minute" },
  { label: "15m", candles: 120, visible: 48, subtitle: "15 Minute" },
  { label: "30m", candles: 100, visible: 40, subtitle: "30 Minute" },
  { label: "1H", candles: 120, visible: 48, subtitle: "1 Hour" },
  { label: "1D", candles: 200, visible: 90, subtitle: "Daily" },
  { label: "5D", candles: 150, visible: 60, subtitle: "5 Day" },
  { label: "1M", candles: 80, visible: 30, subtitle: "1 Month" },
  { label: "3M", candles: 150, visible: 65, subtitle: "3 Month" },
  { label: "6M", candles: 260, visible: 130, subtitle: "6 Month" },
  { label: "YTD", candles: 180, visible: 80, subtitle: "YTD" },
  { label: "1Y", candles: 500, visible: 252, subtitle: "1 Year" },
  { label: "5Y", candles: 300, visible: 120, subtitle: "5 Year" },
  { label: "MAX", candles: 400, visible: 200, subtitle: "Max" },
];

export default function ChartPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState(0);
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set(["BB", "VOL"]));

  // ALL mutable state in refs — no React re-renders for interactions
  const candlesRef = useRef(generateCandles(200));
  const visibleCountRef = useRef(90);
  const offsetRef = useRef(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const rafIdRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const overlaysRef = useRef(new Set(["BB", "VOL"]));

  // OHLC display refs — update DOM directly, skip React
  const ohlcRef = useRef<HTMLDivElement>(null);

  // Sync overlay state to ref for draw() access
  useEffect(() => {
    overlaysRef.current = activeOverlays;
  }, [activeOverlays]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    if (w === 0 || h === 0) return;

    const allCandles = candlesRef.current;
    const visibleCount = visibleCountRef.current;
    const offset = offsetRef.current;
    const crosshair = mousePosRef.current;
    const overlays = overlaysRef.current;

    const endIdx = allCandles.length - offset;
    const startIdx = Math.max(0, endIdx - visibleCount);
    const candles = allCandles.slice(startIdx, endIdx);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    const chartLeft = 55;
    const chartRight = w - 8;
    const chartTop = 8;

    // Adjust layout based on active overlays - calculate panel heights
    const hasRSI = overlays.has("RSI");
    const hasVOL = overlays.has("VOL");
    const hasMACD = overlays.has("MACD");
    const hasSTOCH = overlays.has("STOCH");

    const rsiPanelH = hasRSI ? 50 : 0;
    const volPanelH = hasVOL ? 30 : 0;
    const macdPanelH = hasMACD ? 45 : 0;
    const stochPanelH = hasSTOCH ? 40 : 0;
    const bottomPadding = 6;

    const totalSubPanelH = volPanelH + rsiPanelH + macdPanelH + stochPanelH;
    const chartBottom = h - bottomPadding - totalSubPanelH;

    // Calculate sub-panel regions (stacked from bottom up)
    let currentTop = chartBottom;
    const volumeTop = hasVOL ? currentTop : -1;
    const volumeBottom = hasVOL ? (currentTop += volPanelH) : -1;
    const rsiTop = hasRSI ? currentTop : -1;
    const rsiBottom = hasRSI ? (currentTop += rsiPanelH) : -1;
    const macdTop = hasMACD ? currentTop : -1;
    const macdBottom = hasMACD ? (currentTop += macdPanelH) : -1;
    const stochTop = hasSTOCH ? currentTop : -1;
    const stochBottom = hasSTOCH ? (currentTop += stochPanelH) : -1;

    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    if (candles.length === 0) return;

    let minPrice = Infinity, maxPrice = -Infinity, maxVol = 0;
    for (const c of candles) {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
      maxVol = Math.max(maxVol, c.volume);
    }
    const pricePad = (maxPrice - minPrice) * 0.05;
    minPrice -= pricePad;
    maxPrice += pricePad;

    // Grid
    ctx.strokeStyle = "#111100";
    ctx.lineWidth = 0.5;
    const gridH = 6;
    for (let i = 0; i <= gridH; i++) {
      const y = chartTop + (chartH / gridH) * i;
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
      const price = maxPrice - ((maxPrice - minPrice) / gridH) * i;
      ctx.fillStyle = "#7a6030";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(price.toFixed(2), chartLeft - 4, y + 3);
    }
    for (let i = 0; i <= 6; i++) {
      const x = chartLeft + (chartW / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartBottom);
      ctx.stroke();
    }

    // Previous close dashed line
    const prevClose = 5416.25;
    const prevCloseY = chartTop + ((maxPrice - prevClose) / (maxPrice - minPrice)) * chartH;
    if (prevCloseY > chartTop && prevCloseY < chartBottom) {
      ctx.strokeStyle = "#ffa028";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(chartLeft, prevCloseY);
      ctx.lineTo(chartRight, prevCloseY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ffa028";
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      ctx.fillText("PC:" + prevClose.toFixed(2), chartRight - 65, prevCloseY - 3);
    }

    // Candlesticks
    const gap = chartW / candles.length;
    const candleWidth = Math.max(2, gap * 0.6);

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = chartLeft + gap * i + gap / 2;
      const yOpen = chartTop + ((maxPrice - c.open) / (maxPrice - minPrice)) * chartH;
      const yClose = chartTop + ((maxPrice - c.close) / (maxPrice - minPrice)) * chartH;
      const yHigh = chartTop + ((maxPrice - c.high) / (maxPrice - minPrice)) * chartH;
      const yLow = chartTop + ((maxPrice - c.low) / (maxPrice - minPrice)) * chartH;
      const bullish = c.close >= c.open;
      const color = bullish ? "#4af6c3" : "#ff433d";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(1, Math.abs(yClose - yOpen));
      if (bullish) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
      }

      if (hasVOL) {
        const volH = (c.volume / maxVol) * (volumeBottom - volumeTop);
        ctx.fillStyle = bullish ? "rgba(74, 246, 195, 0.15)" : "rgba(255, 67, 61, 0.15)";
        ctx.fillRect(x - candleWidth / 2, volumeBottom - volH, candleWidth, volH);
      }
    }

    // Bollinger Bands
    if (overlays.has("BB")) {
      const bbPeriod = 20;
      const bbStdDev = 2;

      // Calculate and draw BB bands
      const bbPoints: { upper: number; middle: number; lower: number; x: number }[] = [];
      for (let i = 0; i < candles.length; i++) {
        const globalIdx = startIdx + i;
        const bb = calculateBollingerBands(allCandles, bbPeriod, bbStdDev, globalIdx);
        if (bb) {
          const x = chartLeft + gap * i + gap / 2;
          bbPoints.push({
            upper: chartTop + ((maxPrice - bb.upper) / (maxPrice - minPrice)) * chartH,
            middle: chartTop + ((maxPrice - bb.middle) / (maxPrice - minPrice)) * chartH,
            lower: chartTop + ((maxPrice - bb.lower) / (maxPrice - minPrice)) * chartH,
            x,
          });
        }
      }

      // Draw semi-transparent fill area
      if (bbPoints.length > 0) {
        ctx.fillStyle = "rgba(74, 246, 195, 0.1)";
        ctx.beginPath();
        ctx.moveTo(bbPoints[0].x, bbPoints[0].upper);
        for (let i = 1; i < bbPoints.length; i++) {
          ctx.lineTo(bbPoints[i].x, bbPoints[i].upper);
        }
        for (let i = bbPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(bbPoints[i].x, bbPoints[i].lower);
        }
        ctx.closePath();
        ctx.fill();

        // Draw upper and lower bands as dashed lines
        ctx.strokeStyle = "#4af6c3";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(bbPoints[0].x, bbPoints[0].upper);
        for (let i = 1; i < bbPoints.length; i++) {
          ctx.lineTo(bbPoints[i].x, bbPoints[i].upper);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bbPoints[0].x, bbPoints[0].lower);
        for (let i = 1; i < bbPoints.length; i++) {
          ctx.lineTo(bbPoints[i].x, bbPoints[i].lower);
        }
        ctx.stroke();

        // Draw middle band as solid line
        ctx.setLineDash([]);
        ctx.strokeStyle = "#4af6c3";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(bbPoints[0].x, bbPoints[0].middle);
        for (let i = 1; i < bbPoints.length; i++) {
          ctx.lineTo(bbPoints[i].x, bbPoints[i].middle);
        }
        ctx.stroke();
      }
    }

    // Volume separator
    if (hasVOL) {
      ctx.strokeStyle = "#1a1000";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(chartLeft, volumeTop);
      ctx.lineTo(chartRight, volumeTop);
      ctx.stroke();
    }

    // RSI Panel
    if (overlays.has("RSI")) {
      const rsiPeriod = 14;
      const rsiPoints: { value: number; x: number; y: number }[] = [];

      // Calculate RSI for visible candles
      for (let i = 0; i < candles.length; i++) {
        const globalIdx = startIdx + i;
        const rsi = calculateRSI(allCandles, rsiPeriod, globalIdx);
        if (rsi !== null) {
          const x = chartLeft + gap * i + gap / 2;
          const y = rsiBottom - ((rsi / 100) * (rsiBottom - rsiTop));
          rsiPoints.push({ value: rsi, x, y: y });
        }
      }

      // Draw RSI background
      ctx.fillStyle = "#050500";
      ctx.fillRect(chartLeft - 55, rsiTop, chartRight - chartLeft + 55, rsiBottom - rsiTop);

      // Draw RSI border
      ctx.strokeStyle = "#1a1000";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(chartLeft, rsiTop, chartRight - chartLeft, rsiBottom - rsiTop);

      // Draw overbought (70) and oversold (30) lines
      const overboughtY = rsiBottom - ((70 / 100) * (rsiBottom - rsiTop));
      const oversoldY = rsiBottom - ((30 / 100) * (rsiBottom - rsiTop));
      const midlineY = rsiBottom - ((50 / 100) * (rsiBottom - rsiTop));

      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(chartLeft, overboughtY);
      ctx.lineTo(chartRight, overboughtY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(chartLeft, oversoldY);
      ctx.lineTo(chartRight, oversoldY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(chartLeft, midlineY);
      ctx.lineTo(chartRight, midlineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw RSI line
      if (rsiPoints.length > 0) {
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rsiPoints[0].x, rsiPoints[0].y);
        for (let i = 1; i < rsiPoints.length; i++) {
          ctx.lineTo(rsiPoints[i].x, rsiPoints[i].y);
        }
        ctx.stroke();
      }

      // RSI labels
      ctx.fillStyle = "#666666";
      ctx.font = "8px monospace";
      ctx.textAlign = "right";
      ctx.fillText("70", chartLeft - 4, overboughtY + 3);
      ctx.fillText("50", chartLeft - 4, midlineY + 3);
      ctx.fillText("30", chartLeft - 4, oversoldY + 3);
    }

    // MACD Panel
    if (overlays.has("MACD")) {
      // Extract close prices for MACD calculation
      const closePrices = allCandles.map(c => c.close);
      const macdData = calculateMACD(closePrices);
      const macdPoints: { x: number; macd: number; signal: number; histogram: number }[] = [];

      // Find min/max for MACD values in visible range
      let minMACD = Infinity, maxMACD = -Infinity;
      for (let i = 0; i < candles.length; i++) {
        const globalIdx = startIdx + i;
        if (globalIdx < macdData.macd.length) {
          const macdVal = macdData.macd[globalIdx];
          const signalVal = macdData.signal[globalIdx];
          minMACD = Math.min(minMACD, macdVal, signalVal);
          maxMACD = Math.max(maxMACD, macdVal, signalVal);
        }
      }

      // Add some padding to the range
      const macdRange = maxMACD - minMACD || 1;
      const macdPad = macdRange * 0.1;
      minMACD -= macdPad;
      maxMACD += macdPad;

      // Calculate MACD points
      for (let i = 0; i < candles.length; i++) {
        const globalIdx = startIdx + i;
        if (globalIdx < macdData.macd.length) {
          const x = chartLeft + gap * i + gap / 2;
          const macdVal = macdData.macd[globalIdx];
          const signalVal = macdData.signal[globalIdx];
          const histVal = macdData.histogram[globalIdx];
          const macdY = macdBottom - ((macdVal - minMACD) / (maxMACD - minMACD)) * (macdBottom - macdTop);
          const signalY = macdBottom - ((signalVal - minMACD) / (maxMACD - minMACD)) * (macdBottom - macdTop);
          macdPoints.push({ x, macd: macdY, signal: signalY, histogram: histVal });
        }
      }

      // Draw MACD background
      ctx.fillStyle = "#050500";
      ctx.fillRect(chartLeft - 55, macdTop, chartRight - chartLeft + 55, macdBottom - macdTop);

      // Draw MACD border
      ctx.strokeStyle = "#1a1000";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(chartLeft, macdTop, chartRight - chartLeft, macdBottom - macdTop);

      // Draw zero line
      const zeroY = macdBottom - ((0 - minMACD) / (maxMACD - minMACD)) * (macdBottom - macdTop);
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(chartLeft, zeroY);
      ctx.lineTo(chartRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw histogram bars
      for (const point of macdPoints) {
        const histY = macdBottom - ((point.histogram - minMACD) / (maxMACD - minMACD)) * (macdBottom - macdTop);
        const barColor = point.histogram >= 0 ? "#4af6c3" : "#ff433d";
        ctx.fillStyle = barColor;
        const barH = Math.abs(histY - zeroY);
        ctx.fillRect(point.x - 1, Math.min(zeroY, histY), 2, barH);
      }

      // Draw MACD line
      if (macdPoints.length > 0) {
        ctx.strokeStyle = "#4af6c3";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(macdPoints[0].x, macdPoints[0].macd);
        for (let i = 1; i < macdPoints.length; i++) {
          ctx.lineTo(macdPoints[i].x, macdPoints[i].macd);
        }
        ctx.stroke();
      }

      // Draw Signal line
      if (macdPoints.length > 0) {
        ctx.strokeStyle = "#ffa028";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(macdPoints[0].x, macdPoints[0].signal);
        for (let i = 1; i < macdPoints.length; i++) {
          ctx.lineTo(macdPoints[i].x, macdPoints[i].signal);
        }
        ctx.stroke();
      }

      // MACD label
      ctx.fillStyle = "#7a6030";
      ctx.font = "8px monospace";
      ctx.textAlign = "right";
      ctx.fillText("MACD", chartLeft - 4, macdTop + 10);
    }

    // Stochastic Oscillator Panel
    if (overlays.has("STOCH")) {
      const stochPeriod = 14;
      const stochSmoothing = 3;
      const stochPoints: { x: number; k: number; d: number }[] = [];

      // Calculate Stochastic for visible candles
      for (let i = 0; i < candles.length; i++) {
        const globalIdx = startIdx + i;
        const stoch = calculateStochastic(allCandles, stochPeriod, stochSmoothing, globalIdx);
        if (stoch !== null) {
          const x = chartLeft + gap * i + gap / 2;
          const kY = stochBottom - ((stoch.k / 100) * (stochBottom - stochTop));
          const dY = stochBottom - ((stoch.d / 100) * (stochBottom - stochTop));
          stochPoints.push({ x, k: kY, d: dY });
        }
      }

      // Draw Stochastic background
      ctx.fillStyle = "#050500";
      ctx.fillRect(chartLeft - 55, stochTop, chartRight - chartLeft + 55, stochBottom - stochTop);

      // Draw Stochastic border
      ctx.strokeStyle = "#1a1000";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(chartLeft, stochTop, chartRight - chartLeft, stochBottom - stochTop);

      // Draw overbought (80) and oversold (20) lines
      const overboughtYStoch = stochBottom - ((80 / 100) * (stochBottom - stochTop));
      const oversoldYStoch = stochBottom - ((20 / 100) * (stochBottom - stochTop));
      const midlineYStoch = stochBottom - ((50 / 100) * (stochBottom - stochTop));

      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(chartLeft, overboughtYStoch);
      ctx.lineTo(chartRight, overboughtYStoch);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(chartLeft, oversoldYStoch);
      ctx.lineTo(chartRight, oversoldYStoch);
      ctx.stroke();

      ctx.setLineDash([]);

      // Draw %K line
      if (stochPoints.length > 0) {
        ctx.strokeStyle = "#4af6c3";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(stochPoints[0].x, stochPoints[0].k);
        for (let i = 1; i < stochPoints.length; i++) {
          ctx.lineTo(stochPoints[i].x, stochPoints[i].k);
        }
        ctx.stroke();
      }

      // Draw %D line
      if (stochPoints.length > 0) {
        ctx.strokeStyle = "#ffa028";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(stochPoints[0].x, stochPoints[0].d);
        for (let i = 1; i < stochPoints.length; i++) {
          ctx.lineTo(stochPoints[i].x, stochPoints[i].d);
        }
        ctx.stroke();
      }

      // Stochastic labels
      ctx.fillStyle = "#666666";
      ctx.font = "8px monospace";
      ctx.textAlign = "right";
      ctx.fillText("80", chartLeft - 4, overboughtYStoch + 3);
      ctx.fillText("20", chartLeft - 4, oversoldYStoch + 3);
    }

    // 20 MA
    ctx.strokeStyle = "#ffa028";
    ctx.lineWidth = 1;
    ctx.beginPath();
    let ema = candles[0].close;
    for (let i = 0; i < candles.length; i++) {
      ema = ema * 0.94 + candles[i].close * 0.06;
      const x = chartLeft + gap * i + gap / 2;
      const y = chartTop + ((maxPrice - ema) / (maxPrice - minPrice)) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 50 MA
    ctx.strokeStyle = "#0068ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    let ema2 = candles[0].close;
    for (let i = 0; i < candles.length; i++) {
      ema2 = ema2 * 0.97 + candles[i].close * 0.03;
      const x = chartLeft + gap * i + gap / 2;
      const y = chartTop + ((maxPrice - ema2) / (maxPrice - minPrice)) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = "9px monospace";
    ctx.fillStyle = "#ffa028";
    ctx.textAlign = "left";
    ctx.fillText("MA(20)", chartLeft + 6, chartTop + 12);
    ctx.fillStyle = "#0068ff";
    ctx.fillText("MA(50)", chartLeft + 56, chartTop + 12);

    let legendX = chartLeft + 106;
    if (overlays.has("BB")) {
      ctx.fillStyle = "#4af6c3";
      ctx.fillText("BB(20,2)", legendX, chartTop + 12);
      legendX += 50;
    }

    if (overlays.has("RSI")) {
      ctx.fillStyle = "#ff00ff";
      ctx.fillText("RSI(14)", legendX, chartTop + 12);
      legendX += 45;
    }

    if (overlays.has("MACD")) {
      ctx.fillStyle = "#4af6c3";
      ctx.fillText("MACD(12,26,9)", legendX, chartTop + 12);
      legendX += 70;
    }

    if (overlays.has("STOCH")) {
      ctx.fillStyle = "#4af6c3";
      ctx.fillText("STOCH(14,3)", legendX, chartTop + 12);
      legendX += 60;
    }

    if (hasVOL) {
      ctx.fillStyle = "#7a6030";
      ctx.font = "8px monospace";
      ctx.fillText("Vol", chartLeft + 2, volumeTop + 10);
    }

    // Pan indicator
    if (offset > 0) {
      ctx.fillStyle = "#ffa028";
      ctx.font = "8px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`\u25C0 ${startIdx + 1}-${endIdx} of ${allCandles.length} \u25B6`, chartRight, chartTop + 12);
    }

    // Crosshair (only when not dragging)
    let hoveredCandle: Candle | null = null;
    if (crosshair && !isDraggingRef.current && crosshair.x > chartLeft && crosshair.x < chartRight && crosshair.y > chartTop && crosshair.y < chartBottom) {
      ctx.strokeStyle = "#ffa028";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(chartLeft, crosshair.y);
      ctx.lineTo(chartRight, crosshair.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crosshair.x, chartTop);
      ctx.lineTo(crosshair.x, chartBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      const hoverPrice = maxPrice - ((crosshair.y - chartTop) / chartH) * (maxPrice - minPrice);
      ctx.fillStyle = "#ffa028";
      ctx.fillRect(chartLeft - 52, crosshair.y - 7, 48, 14);
      ctx.fillStyle = "#000";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(hoverPrice.toFixed(2), chartLeft - 6, crosshair.y + 3);

      const candleIdx = Math.floor((crosshair.x - chartLeft) / gap);
      if (candleIdx >= 0 && candleIdx < candles.length) {
        hoveredCandle = candles[candleIdx];
      }
    }

    // Update OHLC bar directly via DOM (no React re-render)
    if (ohlcRef.current) {
      const c = hoveredCandle || candles[candles.length - 1];
      ohlcRef.current.innerHTML =
        `<span style="color:#7a6030">O:</span> <span style="color:#ffa028">${c.open.toFixed(2)}</span> ` +
        `<span style="color:#7a6030">H:</span> <span style="color:#4af6c3">${c.high.toFixed(2)}</span> ` +
        `<span style="color:#7a6030">L:</span> <span style="color:#ff433d">${c.low.toFixed(2)}</span> ` +
        `<span style="color:#7a6030">C:</span> <span style="color:#fff;font-weight:bold">${c.close.toFixed(2)}</span> ` +
        `<span style="color:#7a6030">V:</span> <span style="color:#ffa028">${c.volume.toLocaleString()}</span>`;
    }
  }, []);

  // Imperative redraw — called directly, no state
  const requestDraw = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // Setup canvas sizing + ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      requestDraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [requestDraw, activeTimeframe]);

  // Native event listeners for immediate response (bypass React synthetic events)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartOffsetRef.current = offsetRef.current;
      canvas.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      if (isDraggingRef.current) {
        const dx = e.clientX - dragStartXRef.current;
        const chartW = rect.width - 63;
        const candlesPerPixel = visibleCountRef.current / chartW;
        const candleDelta = Math.round(dx * candlesPerPixel);
        const maxOffset = candlesRef.current.length - visibleCountRef.current;
        offsetRef.current = Math.max(0, Math.min(maxOffset, dragStartOffsetRef.current + candleDelta));
      }

      requestDraw();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      canvas.style.cursor = "crosshair";
    };

    const onMouseLeave = () => {
      isDraggingRef.current = false;
      mousePosRef.current = null;
      canvas.style.cursor = "crosshair";
      requestDraw();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 5 : -5;
      visibleCountRef.current = Math.max(15, Math.min(candlesRef.current.length, visibleCountRef.current + delta));
      const maxOffset = candlesRef.current.length - visibleCountRef.current;
      offsetRef.current = Math.max(0, Math.min(maxOffset, offsetRef.current));
      requestDraw();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [requestDraw, activeTimeframe]);

  const handleTimeframeChange = useCallback((index: number) => {
    setActiveTimeframe(index);
    const tf = TIMEFRAMES[index];
    candlesRef.current = generateCandles(tf.candles);
    visibleCountRef.current = tf.visible;
    offsetRef.current = 0;
    mousePosRef.current = null;
    requestDraw();
  }, [requestDraw]);

  const toggleOverlay = useCallback((overlay: string) => {
    const newOverlays = new Set(activeOverlays);
    if (newOverlays.has(overlay)) {
      newOverlays.delete(overlay);
    } else {
      newOverlays.add(overlay);
    }
    setActiveOverlays(newOverlays);
    requestDraw();
  }, [activeOverlays, requestDraw]);

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader title="GP" subtitle={`SPX Index  ${TIMEFRAMES[activeTimeframe].subtitle}`} rightLabel="Chart" />

      {/* OHLC info bar — updated via direct DOM manipulation */}
      <div
        ref={ohlcRef}
        className="flex items-center h-[16px] text-[9px] shrink-0"
        style={{ background: "#050500", borderBottom: "1px solid #1a1000", padding: "0 10px", gap: "8px" }}
      />

      {/* Timeframe bar */}
      <div
        className="flex items-center h-[18px] text-[9px] shrink-0"
        style={{ borderBottom: "1px solid #1a1000" }}
      >
        {TIMEFRAMES.map((tf, i) => (
          <button
            key={tf.label}
            onClick={() => handleTimeframeChange(i)}
            style={{
              padding: "0 8px",
              height: "100%",
              color: activeTimeframe === i ? "#000" : "#7a6030",
              background: activeTimeframe === i ? "#ffa028" : "transparent",
              borderRight: "1px solid #1a1000",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (activeTimeframe !== i) {
                e.currentTarget.style.background = "#1a1000";
                e.currentTarget.style.color = "#ffa028";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTimeframe !== i) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#7a6030";
              }
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Overlay toggle bar */}
      <div
        className="flex items-center h-[18px] text-[9px] shrink-0"
        style={{ borderBottom: "1px solid #1a1000", paddingRight: "8px" }}
      >
        {["BB", "RSI", "VOL", "MACD", "STOCH"].map((overlay) => (
          <button
            key={overlay}
            onClick={() => toggleOverlay(overlay)}
            style={{
              padding: "0 8px",
              height: "100%",
              color: activeOverlays.has(overlay) ? "#000" : "#7a6030",
              background: activeOverlays.has(overlay) ? "#ffa028" : "transparent",
              borderRight: "1px solid #1a1000",
              cursor: "pointer",
              fontSize: "9px",
              fontWeight: activeOverlays.has(overlay) ? "bold" : "normal",
            }}
            onMouseEnter={(e) => {
              if (!activeOverlays.has(overlay)) {
                e.currentTarget.style.background = "#1a1000";
                e.currentTarget.style.color = "#ffa028";
              }
            }}
            onMouseLeave={(e) => {
              if (!activeOverlays.has(overlay)) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#7a6030";
              }
            }}
          >
            {overlay}
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ cursor: "crosshair" }}
        />
      </div>
    </div>
  );
}

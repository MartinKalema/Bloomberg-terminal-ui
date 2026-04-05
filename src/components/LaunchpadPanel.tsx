'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ──────────────────── Types ──────────────────── */
type ComponentType =
  | 'MONITOR'
  | 'CHART'
  | 'NEWS'
  | 'PORTFOLIO'
  | 'CLOCK'
  | 'MKTSTAT'
  | 'MOVERS'
  | 'ALERTS'
  | 'ORDERS'
  | 'HEATMAP'
  | 'SCREENER'
  | 'RATES';

interface LPComponent {
  id: string;
  type: ComponentType;
  title: string;
  secGroup: number; // security group color index
}

type ViewPage = LPComponent[];

const SEC_GROUP_COLORS = ['#ffa028', '#00bbff', '#ff5555', '#55ff55', '#ff55ff', '#ffff55'];

/* ──────────────────── Mock Data ──────────────────── */
const MONITOR_DATA = [
  { ticker: 'SPX', name: 'S&P 500', last: 5428.75, chg: 12.50, pctChg: 0.23 },
  { ticker: 'INDU', name: 'Dow Jones', last: 40125.00, chg: 87.00, pctChg: 0.22 },
  { ticker: 'CCMP', name: 'Nasdaq', last: 16892.43, chg: -45.21, pctChg: -0.27 },
  { ticker: 'RTY', name: 'Russell 2k', last: 2067.34, chg: 8.92, pctChg: 0.43 },
  { ticker: 'VIX', name: 'CBOE VIX', last: 14.52, chg: -0.83, pctChg: -5.41 },
  { ticker: 'CL1', name: 'WTI Crude', last: 78.42, chg: -0.95, pctChg: -1.20 },
  { ticker: 'GC1', name: 'Gold', last: 2342.80, chg: 14.30, pctChg: 0.61 },
  { ticker: 'USGG10YR', name: 'UST 10Y', last: 4.22, chg: -0.03, pctChg: -0.71 },
];

const NEWS_ITEMS = [
  { time: '14:32', src: 'FED', headline: "FED'S WILLIAMS: MONETARY POLICY IS IN A GOOD PLACE" },
  { time: '14:28', src: 'ECO', headline: 'U.S. INITIAL JOBLESS CLAIMS FALL TO 215K VS 225K EST.' },
  { time: '14:25', src: 'STK', headline: 'S&P 500 RISES TO SESSION HIGH, UP 0.3% ON FED OPTIMISM' },
  { time: '14:22', src: 'GOV', headline: 'TREASURY 10-YEAR YIELD FALLS 3BPS TO 4.22%' },
  { time: '14:18', src: 'CMD', headline: 'CRUDE OIL FUTURES DECLINE 1.2% ON OPEC+ DEMAND CONCERNS' },
  { time: '14:15', src: 'ECB', headline: 'ECB LAGARDE: INFLATION EXPECTATIONS REMAIN WELL ANCHORED' },
  { time: '14:10', src: 'STK', headline: 'APPLE INC. SHARES RISE 2.1% AFTER PRODUCT ANNOUNCEMENT' },
  { time: '14:05', src: 'GOV', headline: 'U.S. 30-YEAR BOND AUCTION SEES STRONG DEMAND, BTC 2.58X' },
];

const PORTFOLIO_POSITIONS = [
  { ticker: 'AAPL', qty: 500, avg: 178.25, last: 185.42, pnl: 3585 },
  { ticker: 'MSFT', qty: 300, avg: 410.50, last: 422.18, pnl: 3504 },
  { ticker: 'NVDA', qty: 200, avg: 875.00, last: 912.34, pnl: 7468 },
  { ticker: 'GOOGL', qty: 400, avg: 165.80, last: 170.25, pnl: 1780 },
  { ticker: 'AMZN', qty: 250, avg: 178.40, last: 182.15, pnl: 937.5 },
  { ticker: 'JPM', qty: 350, avg: 195.20, last: 198.75, pnl: 1242.5 },
  { ticker: 'TSLA', qty: 150, avg: 245.00, last: 252.80, pnl: 1170 },
];

const SCREENER_DATA = [
  { ticker: 'NVDA', pe: 65.2, mcap: '2.24T', vol: '48.2M', rsi: 72.1 },
  { ticker: 'AAPL', pe: 28.4, mcap: '2.87T', vol: '52.1M', rsi: 58.3 },
  { ticker: 'MSFT', pe: 35.1, mcap: '3.12T', vol: '22.8M', rsi: 61.5 },
  { ticker: 'AMZN', pe: 52.8, mcap: '1.89T', vol: '38.5M', rsi: 55.2 },
  { ticker: 'GOOGL', pe: 24.2, mcap: '2.11T', vol: '28.4M', rsi: 49.8 },
  { ticker: 'META', pe: 22.8, mcap: '1.28T', vol: '18.9M', rsi: 63.7 },
];

const RATES_DATA = [
  { tenor: '3M', yield: 5.02, chg: 0.00 },
  { tenor: '6M', yield: 5.15, chg: -0.01 },
  { tenor: '1Y', yield: 5.12, chg: -0.02 },
  { tenor: '2Y', yield: 4.98, chg: -0.03 },
  { tenor: '5Y', yield: 4.72, chg: -0.02 },
  { tenor: '10Y', yield: 4.65, chg: -0.03 },
  { tenor: '30Y', yield: 4.95, chg: -0.01 },
];

const ORDERS_DATA = [
  { side: 'BUY', qty: 100, ticker: 'AAPL', price: 182.50, status: 'WORKING' },
  { side: 'SELL', qty: 500, ticker: 'MSFT', price: 425.00, status: 'WORKING' },
  { side: 'BUY', qty: 200, ticker: 'GOOGL', price: 170.00, status: 'WORKING' },
  { side: 'BUY', qty: 300, ticker: 'NVDA', price: 900.00, status: 'FILLED' },
  { side: 'SELL', qty: 150, ticker: 'TSLA', price: 255.00, status: 'FILLED' },
];

const ALERT_ITEMS = [
  { type: 'PRICE', msg: 'SPX > 5,450 resistance', status: 'ACTIVE', color: '#ffa028' },
  { type: 'CROSS', msg: 'AAPL crossed 50-day MA', status: 'TRIGGERED', color: '#55ff55' },
  { type: 'VOL', msg: 'VIX crossed above 15.00', status: 'ACTIVE', color: '#ff5555' },
  { type: 'PRICE', msg: 'GC1 > 2,350 target', status: 'ACTIVE', color: '#ffa028' },
  { type: 'EARN', msg: 'MSFT earnings in 3 days', status: 'PENDING', color: '#00bbff' },
];

/* ──────────────────── Component Widgets ──────────────────── */

function MonitorWidget() {
  const [data, setData] = useState(MONITOR_DATA);

  useEffect(() => {
    const iv = setInterval(() => {
      setData(prev =>
        prev.map(d => {
          const delta = (Math.random() - 0.5) * d.last * 0.001;
          return { ...d, last: d.last + delta, chg: d.chg + delta, pctChg: d.pctChg + delta / d.last * 100 };
        })
      );
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '62px 1fr 72px 56px 56px', gap: '0 4px', padding: '0 4px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>TICKER</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>NAME</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>LAST</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>CHG</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>%CHG</div>
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <div style={{ color: '#ffa028', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{d.ticker}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{d.name}</div>
            <div style={{ color: '#fff', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
              {d.last < 100 ? d.last.toFixed(2) : d.last.toFixed(d.last > 10000 ? 0 : 2)}
            </div>
            <div style={{ color: d.chg >= 0 ? '#55ff55' : '#ff5555', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
              {d.chg >= 0 ? '+' : ''}{d.chg.toFixed(2)}
            </div>
            <div style={{ color: d.pctChg >= 0 ? '#55ff55' : '#ff5555', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
              {d.pctChg >= 0 ? '+' : ''}{d.pctChg.toFixed(2)}%
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ChartWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<number[] | null>(null);

  // Generate data once on first call, then only append new ticks
  const getData = useCallback(() => {
    if (!dataRef.current) {
      // Initial generation — 120 points of intraday data
      const pts = 120;
      const data: number[] = [];
      let price = 5410;
      for (let i = 0; i < pts; i++) {
        price += (Math.random() - 0.48) * 3;
        data.push(price);
      }
      dataRef.current = data;
    }
    return dataRef.current;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const data = getData();
    const pts = data.length;
    const open = data[0];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padL = 40, padR = 8, padT = 16, padB = 20;
    const cw = w - padL - padR;
    const ch = h - padT - padB;

    // Grid lines
    ctx.strokeStyle = '#1a1000';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (ch / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#7a6030';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText((max - (range / 4) * i).toFixed(1), padL - 3, y + 3);
    }

    // Time labels
    ctx.fillStyle = '#7a6030';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    const times = ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30'];
    times.forEach((t, i) => {
      const x = padL + (cw / (times.length - 1)) * i;
      ctx.fillText(t, x, h - 4);
    });

    // Open line
    const openY = padT + ch - ((open - min) / range) * ch;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(padL, openY); ctx.lineTo(w - padR, openY); ctx.stroke();
    ctx.setLineDash([]);

    // Price line
    ctx.beginPath();
    data.forEach((p, i) => {
      const x = padL + (i / (pts - 1)) * cw;
      const y = padT + ch - ((p - min) / range) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const lastPrice = data[data.length - 1];
    ctx.strokeStyle = lastPrice >= open ? '#55ff55' : '#ff5555';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Fill under
    const lastX = padL + cw;
    const lastY = padT + ch - ((lastPrice - min) / range) * ch;
    ctx.lineTo(lastX, padT + ch);
    ctx.lineTo(padL, padT + ch);
    ctx.closePath();
    ctx.fillStyle = lastPrice >= open ? 'rgba(85,255,85,0.06)' : 'rgba(255,85,85,0.06)';
    ctx.fill();

    // Current price marker
    ctx.fillStyle = lastPrice >= open ? '#55ff55' : '#ff5555';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = '#ffa028';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SPX Index  Intraday', padL, 10);
    ctx.fillStyle = lastPrice >= open ? '#55ff55' : '#ff5555';
    ctx.fillText(`  ${lastPrice.toFixed(2)}`, padL + ctx.measureText('SPX Index  Intraday').width, 10);
  }, [getData]);

  // Tick: nudge only the last price point and redraw
  const tick = useCallback(() => {
    const data = dataRef.current;
    if (!data || data.length === 0) return;
    const last = data[data.length - 1];
    data[data.length - 1] = last + (Math.random() - 0.48) * 1.5;
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
    const iv = setInterval(tick, 3000);
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => { clearInterval(iv); ro.disconnect(); };
  }, [draw, tick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function NewsWidget() {
  const [highlight, setHighlight] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setHighlight(p => (p + 1) % NEWS_ITEMS.length), 8000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '0 4px' }}>
      {NEWS_ITEMS.map((n, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '36px 26px 1fr',
          gap: '0 4px',
          padding: '2px 0',
          borderBottom: '1px solid #0a0800',
          opacity: i === highlight ? 1 : 0.6,
          background: i === highlight ? '#0a0800' : 'transparent',
        }}>
          <span style={{ color: '#7a6030' }}>{n.time}</span>
          <span style={{ color: n.src === 'FED' || n.src === 'ECB' ? '#ff5555' : n.src === 'STK' ? '#55ff55' : '#ffa028', fontWeight: 'bold' }}>{n.src}</span>
          <span style={{ color: i === highlight ? '#fff' : '#c8a848', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.headline}</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioWidget() {
  const [positions, setPositions] = useState(PORTFOLIO_POSITIONS);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);

  useEffect(() => {
    const iv = setInterval(() => {
      setPositions(prev => prev.map(p => {
        const delta = (Math.random() - 0.5) * p.last * 0.002;
        const newLast = p.last + delta;
        return { ...p, last: newLast, pnl: (newLast - p.avg) * p.qty };
      }));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '48px 40px 58px 58px 62px', gap: '0 4px', padding: '0 4px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>TICKER</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>QTY</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>AVG</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>LAST</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>P&L</div>
        {positions.map((p, i) => (
          <React.Fragment key={i}>
            <div style={{ color: '#ffa028', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{p.ticker}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{p.qty}</div>
            <div style={{ color: '#888', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{p.avg.toFixed(2)}</div>
            <div style={{ color: '#fff', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{p.last.toFixed(2)}</div>
            <div style={{ color: p.pnl >= 0 ? '#55ff55' : '#ff5555', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
              {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(0)}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1a1000', marginTop: '2px', padding: '3px 4px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#7a6030' }}>TOTAL P&L</span>
        <span style={{ color: totalPnl >= 0 ? '#55ff55' : '#ff5555', fontWeight: 'bold' }}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}</span>
      </div>
    </div>
  );
}

function ClockWidget() {
  const [times, setTimes] = useState({ ny: '', lon: '', tky: '', syd: '' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const fmt = (tz: string) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz }).format(now);
      setTimes({ ny: fmt('America/New_York'), lon: fmt('Europe/London'), tky: fmt('Asia/Tokyo'), syd: fmt('Australia/Sydney') });
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  const zones = [
    { label: 'NEW YORK', time: times.ny, open: true },
    { label: 'LONDON', time: times.lon, open: false },
    { label: 'TOKYO', time: times.tky, open: false },
    { label: 'SYDNEY', time: times.syd, open: false },
  ];

  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '4px 6px' }}>
      {zones.map((z, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '4px 0', borderBottom: i < zones.length - 1 ? '1px solid #0a0800' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: z.open ? '#55ff55' : '#ff5555' }} />
            <span style={{ color: '#c8a848' }}>{z.label}</span>
          </div>
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{z.time}</span>
        </div>
      ))}
    </div>
  );
}

function MktStatWidget() {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '4px 6px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px', gap: '0 4px', marginBottom: '2px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>MARKET</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'center' }}>STATUS</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>CLOSE</div>
      </div>
      {[
        { mkt: 'US EQUITIES', open: true, close: '16:00' },
        { mkt: 'EU EQUITIES', open: false, close: '11:30' },
        { mkt: 'ASIA PACIFIC', open: false, close: '01:00' },
        { mkt: 'FX SPOT', open: true, close: '17:00' },
        { mkt: 'COMMODITIES', open: true, close: '17:00' },
        { mkt: 'US TREASURY', open: true, close: '15:00' },
      ].map((m, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 52px 52px', gap: '0 4px',
          padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent',
        }}>
          <span style={{ color: '#c8a848', paddingLeft: '4px' }}>{m.mkt}</span>
          <span style={{ color: m.open ? '#55ff55' : '#ff5555', textAlign: 'center', fontWeight: 'bold' }}>
            {m.open ? 'OPEN' : 'CLOSED'}
          </span>
          <span style={{ color: '#7a6030', textAlign: 'right', paddingRight: '4px' }}>{m.close} ET</span>
        </div>
      ))}
    </div>
  );
}

function MoversWidget() {
  const gainers = [
    { t: 'NVDA', chg: '+4.21%', vol: '48.2M' },
    { t: 'TSLA', chg: '+3.82%', vol: '62.1M' },
    { t: 'AMD', chg: '+3.14%', vol: '35.8M' },
    { t: 'NFLX', chg: '+2.87%', vol: '12.4M' },
  ];
  const losers = [
    { t: 'BA', chg: '-2.53%', vol: '8.9M' },
    { t: 'GS', chg: '-2.11%', vol: '6.2M' },
    { t: 'F', chg: '-1.94%', vol: '28.1M' },
    { t: 'WFC', chg: '-1.72%', vol: '14.5M' },
  ];

  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '0 4px' }}>
      <div style={{ color: '#55ff55', padding: '2px 0', fontWeight: 'bold', borderBottom: '1px solid #1a1000' }}>GAINERS</div>
      {gainers.map((g, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
          <span style={{ color: '#ffa028', width: '44px' }}>{g.t}</span>
          <span style={{ color: '#55ff55', width: '52px', textAlign: 'right' }}>{g.chg}</span>
          <span style={{ color: '#7a6030', width: '44px', textAlign: 'right' }}>{g.vol}</span>
        </div>
      ))}
      <div style={{ color: '#ff5555', padding: '2px 0', fontWeight: 'bold', borderBottom: '1px solid #1a1000', marginTop: '2px' }}>LOSERS</div>
      {losers.map((l, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
          <span style={{ color: '#ffa028', width: '44px' }}>{l.t}</span>
          <span style={{ color: '#ff5555', width: '52px', textAlign: 'right' }}>{l.chg}</span>
          <span style={{ color: '#7a6030', width: '44px', textAlign: 'right' }}>{l.vol}</span>
        </div>
      ))}
    </div>
  );
}

function AlertsWidget() {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', gap: '0 4px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>TYPE</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>CONDITION</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>STATUS</div>
        {ALERT_ITEMS.map((a, i) => (
          <React.Fragment key={i}>
            <div style={{ color: a.color, padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{a.type}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.msg}</div>
            <div style={{
              color: a.status === 'TRIGGERED' ? '#55ff55' : a.status === 'ACTIVE' ? '#ffa028' : '#7a6030',
              padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent',
            }}>{a.status}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function OrdersWidget() {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '32px 36px 44px 58px 52px', gap: '0 4px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>SIDE</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>QTY</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>TICKER</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>PRICE</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>STATUS</div>
        {ORDERS_DATA.map((o, i) => (
          <React.Fragment key={i}>
            <div style={{ color: o.side === 'BUY' ? '#00bbff' : '#ff5555', padding: '2px 0', fontWeight: 'bold', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{o.side}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{o.qty}</div>
            <div style={{ color: '#ffa028', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{o.ticker}</div>
            <div style={{ color: '#fff', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{o.price.toFixed(2)}</div>
            <div style={{
              color: o.status === 'FILLED' ? '#55ff55' : '#ffa028',
              padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent',
            }}>{o.status}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function HeatmapWidget() {
  const sectors = [
    { name: 'TECH', chg: 1.24, w: 3 },
    { name: 'HEALTH', chg: 0.82, w: 2 },
    { name: 'FINANC', chg: -0.45, w: 2 },
    { name: 'ENERGY', chg: -1.18, w: 2 },
    { name: 'CONS.D', chg: 0.67, w: 1.5 },
    { name: 'INDUST', chg: 0.34, w: 1.5 },
    { name: 'REAL.E', chg: -0.28, w: 1 },
    { name: 'UTILS', chg: 0.15, w: 1 },
    { name: 'MATER', chg: -0.62, w: 1 },
    { name: 'COMM', chg: 0.91, w: 1.5 },
  ];

  return (
    <div style={{ padding: '4px', height: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', flex: 1 }}>
        {sectors.map((s, i) => {
          const intensity = Math.min(Math.abs(s.chg) / 2, 1);
          const bg = s.chg >= 0
            ? `rgba(0, ${Math.round(100 + 155 * intensity)}, 0, ${0.15 + intensity * 0.25})`
            : `rgba(${Math.round(100 + 155 * intensity)}, 0, 0, ${0.15 + intensity * 0.25})`;
          return (
            <div key={i} style={{
              flex: `${s.w} 0 0`, minWidth: '48px', minHeight: '28px',
              background: bg, border: '1px solid #1a1000',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontFamily: 'monospace',
            }}>
              <span style={{ color: '#c8a848', fontWeight: 'bold' }}>{s.name}</span>
              <span style={{ color: s.chg >= 0 ? '#55ff55' : '#ff5555' }}>
                {s.chg >= 0 ? '+' : ''}{s.chg.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScreenerWidget() {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '44px 44px 52px 48px 40px', gap: '0 4px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>TICKER</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>P/E</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>MCAP</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>VOL</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>RSI</div>
        {SCREENER_DATA.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ color: '#ffa028', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{s.ticker}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{s.pe.toFixed(1)}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{s.mcap}</div>
            <div style={{ color: '#c8a848', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{s.vol}</div>
            <div style={{
              color: s.rsi > 70 ? '#ff5555' : s.rsi < 30 ? '#55ff55' : '#c8a848',
              padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent',
            }}>{s.rsi.toFixed(1)}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function RatesWidget() {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', padding: '0 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '36px 56px 50px', gap: '0 4px' }}>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0' }}>TENOR</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>YIELD</div>
        <div style={{ color: '#7a6030', borderBottom: '1px solid #1a1000', padding: '2px 0', textAlign: 'right' }}>CHG</div>
        {RATES_DATA.map((r, i) => (
          <React.Fragment key={i}>
            <div style={{ color: '#ffa028', padding: '2px 0', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{r.tenor}</div>
            <div style={{ color: '#fff', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>{r.yield.toFixed(3)}%</div>
            <div style={{ color: r.chg >= 0 ? '#55ff55' : '#ff5555', padding: '2px 0', textAlign: 'right', background: i % 2 === 0 ? '#0a0800' : 'transparent' }}>
              {r.chg >= 0 ? '+' : ''}{(r.chg * 100).toFixed(1)}bp
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────── Component Frame ──────────────────── */

function ComponentFrame({
  comp,
  onClose,
  secGroupColor,
}: {
  comp: LPComponent;
  onClose: () => void;
  secGroupColor: string;
}) {
  const renderContent = () => {
    switch (comp.type) {
      case 'MONITOR': return <MonitorWidget />;
      case 'CHART': return <ChartWidget />;
      case 'NEWS': return <NewsWidget />;
      case 'PORTFOLIO': return <PortfolioWidget />;
      case 'CLOCK': return <ClockWidget />;
      case 'MKTSTAT': return <MktStatWidget />;
      case 'MOVERS': return <MoversWidget />;
      case 'ALERTS': return <AlertsWidget />;
      case 'ORDERS': return <OrdersWidget />;
      case 'HEATMAP': return <HeatmapWidget />;
      case 'SCREENER': return <ScreenerWidget />;
      case 'RATES': return <RatesWidget />;
      default: return null;
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#000', border: '1px solid #2a2000', overflow: 'hidden',
    }}>
      {/* Title bar - Bloomberg amber on dark */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1px 4px', background: '#050500', borderBottom: '1px solid #2a2000',
        minHeight: '18px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Security group indicator */}
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: secGroupColor, flexShrink: 0 }} />
          <span style={{ color: '#ffa028', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            {comp.title}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            color: '#7a6030', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontFamily: 'monospace', lineHeight: 1, padding: '0 2px',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ff5555')}
          onMouseLeave={e => (e.currentTarget.style.color = '#7a6030')}
        >
          ×
        </button>
      </div>
      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {renderContent()}
      </div>
    </div>
  );
}

/* ──────────────────── Main Launchpad ──────────────────── */

const DEFAULT_COMPONENTS: LPComponent[] = [
  { id: '1', type: 'MONITOR', title: 'MON  Market Watch', secGroup: 0 },
  { id: '2', type: 'CHART', title: 'GP  SPX Intraday', secGroup: 0 },
  { id: '3', type: 'NEWS', title: 'TOP  News Headlines', secGroup: 0 },
  { id: '4', type: 'PORTFOLIO', title: 'PORT  Positions', secGroup: 1 },
  { id: '5', type: 'MOVERS', title: 'MOV  Top Movers', secGroup: 0 },
  { id: '6', type: 'HEATMAP', title: 'HEAT  Sector Map', secGroup: 0 },
  { id: '7', type: 'ORDERS', title: 'EMSX  Orders', secGroup: 1 },
  { id: '8', type: 'ALERTS', title: 'ALRT  Active Alerts', secGroup: 2 },
  { id: '9', type: 'CLOCK', title: 'TIME  World Clocks', secGroup: 3 },
  { id: '10', type: 'MKTSTAT', title: 'MKTST  Session Status', secGroup: 3 },
  { id: '11', type: 'RATES', title: 'RATE  Treasury Yields', secGroup: 0 },
  { id: '12', type: 'SCREENER', title: 'EQS  Screener', secGroup: 0 },
];

const COMPONENT_CATALOG: { type: ComponentType; label: string }[] = [
  { type: 'MONITOR', label: 'Monitor' },
  { type: 'CHART', label: 'Chart' },
  { type: 'NEWS', label: 'News' },
  { type: 'PORTFOLIO', label: 'Portfolio' },
  { type: 'MOVERS', label: 'Movers' },
  { type: 'HEATMAP', label: 'Heatmap' },
  { type: 'ORDERS', label: 'Orders' },
  { type: 'ALERTS', label: 'Alerts' },
  { type: 'CLOCK', label: 'Clocks' },
  { type: 'MKTSTAT', label: 'Mkt Status' },
  { type: 'RATES', label: 'Rates' },
  { type: 'SCREENER', label: 'Screener' },
];

export default function LaunchpadPanel() {
  const [components, setComponents] = useState<LPComponent[]>(DEFAULT_COMPONENTS);
  const [activePage, setActivePage] = useState(0);
  const [showCatalog, setShowCatalog] = useState(false);
  const nextIdRef = useRef(20);

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const addComponent = (type: ComponentType) => {
    const catItem = COMPONENT_CATALOG.find(c => c.type === type);
    const newComp: LPComponent = {
      id: String(nextIdRef.current++),
      type,
      title: `${type.slice(0, 4).toUpperCase()}  ${catItem?.label || type}`,
      secGroup: 0,
    };
    setComponents(prev => [...prev, newComp]);
    setShowCatalog(false);
  };

  // Lay out components into a 4-col × 3-row grid (12 slots)
  const gridComps = components.slice(0, 12);

  return (
    <div style={{
      width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column',
      fontFamily: 'monospace', overflow: 'hidden',
    }}>
      {/* ── Launchpad Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        padding: '2px 6px', background: '#050500', borderBottom: '1px solid #2a2000',
        minHeight: '20px', flexShrink: 0,
      }}>
        <span style={{ color: '#ffa028', fontSize: '10px', fontWeight: 'bold', marginRight: '8px' }}>BLP</span>
        <span style={{ color: '#c8a848', fontSize: '10px' }}>Launchpad</span>
        <div style={{ flex: 1 }} />

        {/* Page tabs */}
        {['Main', 'Trading', 'Research'].map((p, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            style={{
              padding: '1px 8px', fontSize: '9px', fontFamily: 'monospace',
              background: activePage === i ? '#ffa028' : 'transparent',
              color: activePage === i ? '#000' : '#7a6030',
              border: '1px solid #2a2000', cursor: 'pointer',
              fontWeight: activePage === i ? 'bold' : 'normal',
            }}
          >
            {p}
          </button>
        ))}

        <div style={{ width: '1px', height: '12px', background: '#2a2000', margin: '0 4px' }} />

        {/* Add component button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            style={{
              padding: '1px 8px', fontSize: '9px', fontFamily: 'monospace',
              background: showCatalog ? '#ffa028' : 'transparent',
              color: showCatalog ? '#000' : '#ffa028',
              border: '1px solid #2a2000', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            + ADD
          </button>
          {showCatalog && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '2px',
              background: '#0a0800', border: '1px solid #2a2000', zIndex: 100,
              padding: '4px', minWidth: '120px',
            }}>
              {COMPONENT_CATALOG.map(c => (
                <button
                  key={c.type}
                  onClick={() => addComponent(c.type)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '3px 6px', fontSize: '9px', fontFamily: 'monospace',
                    background: 'transparent', color: '#c8a848', border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a1000'; e.currentTarget.style.color = '#ffa028'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c8a848'; }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span style={{ color: '#7a6030', fontSize: '9px', marginLeft: '8px' }}>
          {components.length} Components
        </span>
      </div>

      {/* ── Component Grid: 4 columns × 3 rows ── */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '2px', padding: '2px',
        minHeight: 0, background: '#0a0800',
      }}>
        {gridComps.map(comp => (
          <ComponentFrame
            key={comp.id}
            comp={comp}
            onClose={() => removeComponent(comp.id)}
            secGroupColor={SEC_GROUP_COLORS[comp.secGroup % SEC_GROUP_COLORS.length]}
          />
        ))}
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 12 - gridComps.length) }).map((_, i) => (
          <div key={`empty-${i}`} style={{
            background: '#000', border: '1px solid #1a1000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <button
              onClick={() => setShowCatalog(true)}
              style={{
                color: '#2a2000', fontSize: '9px', fontFamily: 'monospace',
                background: 'none', border: '1px dashed #1a1000', padding: '4px 12px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#7a6030'; e.currentTarget.style.borderColor = '#7a6030'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#2a2000'; e.currentTarget.style.borderColor = '#1a1000'; }}
            >
              + Add Component
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

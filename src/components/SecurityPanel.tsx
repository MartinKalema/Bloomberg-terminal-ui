"use client";

import { useState } from "react";
import PanelHeader from "./PanelHeader";
import { primaryQuote } from "@/data/mock";

const PAGES = ["DES", "FA", "ANR", "OMON", "GIP", "DVD", "ERN"];
const ACTIONS = ["GP", "FA", "ANR", "OMON", "GIP", "DES", "DVD", "ERN", "RV"];

export default function SecurityPanel() {
  const q = primaryQuote;
  const up = q.change >= 0;
  const [activePage, setActivePage] = useState("DES");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const dataRows = [
    ["Open", q.open.toLocaleString("en-US", { minimumFractionDigits: 2 })],
    ["PrevCl", q.prevClose.toLocaleString("en-US", { minimumFractionDigits: 2 })],
    ["High", q.high.toLocaleString("en-US", { minimumFractionDigits: 2 })],
    ["Low", q.low.toLocaleString("en-US", { minimumFractionDigits: 2 })],
    ["Bid", q.bid.toLocaleString("en-US", { minimumFractionDigits: 2 })],
    ["Ask", q.ask.toLocaleString("en-US", { minimumFractionDigits: 2 })],
    ["Volume", q.volume],
    ["Curncy", q.currency],
    ["52W Hi", "5,670.89"],
    ["52W Lo", "5,102.34"],
    ["Mkt Cap", "44.2T"],
    ["P/E", "23.45"],
    ["Div Yld", "1.32%"],
    ["EPS", "$231.42"],
    ["Beta", "1.00"],
    ["ShsOut", "7.43B"],
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      <PanelHeader
        title={activePage}
        subtitle={
          activePage === "DES" ? "Description" :
          activePage === "FA" ? "Financial Analysis" :
          activePage === "ANR" ? "Analyst Recommendations" :
          activePage === "OMON" ? "Option Monitor" :
          activePage === "GIP" ? "Company Profile" :
          activePage === "DVD" ? "Dividend Information" :
          activePage === "ERN" ? "Earnings" : "Graph"
        }
        rightLabel={`Page 1/${PAGES.length}`}
      />

      <div className="flex-1 overflow-auto" style={{ padding: "8px 10px" }}>
        {activePage === "DES" && (
          <>
            {/* Security ID */}
            <div style={{ marginBottom: "4px" }}>
              <span className="text-[14px] font-bold" style={{ color: "#fff" }}>
                {q.symbol}
              </span>
              <span className="text-[10px]" style={{ color: "#0068ff", marginLeft: "8px" }}>
                {q.exchange}
              </span>
            </div>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px" }}>
              {q.name}
            </div>

            {/* Price Block */}
            <div
              style={{
                background: "#050500",
                border: "1px solid #1a1000",
                borderLeft: "3px solid #ffa028",
                padding: "8px 10px",
                marginBottom: "8px",
              }}
            >
              <div className="flex items-baseline gap-2 flex-wrap" style={{ overflow: "hidden" }}>
                <span className="text-[20px] font-bold" style={{ color: "#fff", whiteSpace: "nowrap" }}>
                  {q.last.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span
                  className="text-[12px] font-bold"
                  style={{ color: up ? "#4af6c3" : "#ff433d", whiteSpace: "nowrap" }}
                >
                  {up ? "+" : ""}{q.change.toFixed(2)}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: up ? "#4af6c3" : "#ff433d", whiteSpace: "nowrap" }}
                >
                  ({up ? "+" : ""}{q.changePct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between" style={{ marginTop: "4px" }}>
                <span className="text-[9px]" style={{ color: "#7a6030" }}>
                  AS OF 14:32 NEW YORK
                </span>
                <span className="text-[9px]" style={{ color: "#7a6030" }}>
                  LAST TRADE
                </span>
              </div>
            </div>

            {/* Data rows — 2-column Bloomberg DES layout */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: "0",
              }}
            >
              {dataRows.map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between"
                  style={{
                    borderBottom: "1px solid #0a0a05",
                    padding: "1px 4px 1px 0",
                    fontSize: "10px",
                    background: selectedRow === i ? "#0a0a14" : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                  onMouseEnter={(e) => {
                    if (selectedRow !== i) e.currentTarget.style.background = "#050510";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRow !== i) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ color: "#7a6030", whiteSpace: "nowrap" }}>{row[0]}</span>
                  <span style={{ color: "#ffa028", whiteSpace: "nowrap" }}>{row[1]}</span>
                </div>
              ))}
            </div>

            {/* 52 Week Range Bar */}
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "3px" }}>52 WEEK RANGE</div>
              <div className="flex items-center gap-2">
                <span className="text-[9px]" style={{ color: "#ff433d" }}>5,102</span>
                <div className="flex-1 h-[4px] relative" style={{ background: "#1a1000" }}>
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: "57%",
                      background: "linear-gradient(to right, #ff433d, #ffa028, #4af6c3)",
                    }}
                  />
                  <div
                    className="absolute top-[-3px] h-[10px] w-[2px]"
                    style={{ left: "57%", background: "#fff" }}
                  />
                </div>
                <span className="text-[9px]" style={{ color: "#4af6c3" }}>5,671</span>
              </div>
            </div>
          </>
        )}

        {activePage === "FA" && (
          <>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px", fontWeight: "bold" }}>
              {q.name} - Financial Summary
            </div>
            <div style={{ overflowX: "auto", marginBottom: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1000" }}>
                    <th style={{ color: "#ffa028", textAlign: "left", padding: "4px 2px", fontWeight: "bold" }}>Metric</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "4px 2px" }}>2024</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "4px 2px" }}>2023</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "4px 2px" }}>2022</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Revenue", "$394.3B", "$383.3B", "$365.8B"],
                    ["Net Income", "$97.0B", "$94.3B", "$99.8B"],
                    ["EPS", "$6.42", "$6.13", "$6.11"],
                    ["Op. Margin", "30.7%", "29.8%", "30.3%"],
                    ["ROE", "160.1%", "147.0%", "171.0%"],
                    ["Debt/Equity", "1.76", "1.99", "2.39"],
                    ["Free CF", "$111.4B", "$99.6B", "$111.4B"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#ffa028", padding: "4px 2px", fontWeight: "bold" }}>{row[0]}</td>
                      <td style={{ color: "#fff", textAlign: "right", padding: "4px 2px" }}>{row[1]}</td>
                      <td style={{ color: "#fff", textAlign: "right", padding: "4px 2px" }}>{row[2]}</td>
                      <td style={{ color: "#fff", textAlign: "right", padding: "4px 2px" }}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "ANR" && (
          <>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px", fontWeight: "bold" }}>
              Analyst Consensus
            </div>

            {/* Rating Bar */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "2px" }}>CONSENSUS RATING</div>
              <div className="flex h-[16px] gap-[1px]" style={{ background: "#050510", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ flex: 28, background: "#4af6c3" }} title="Buy: 28"></div>
                <div style={{ flex: 8, background: "#ffa028" }} title="Hold: 8"></div>
                <div style={{ flex: 2, background: "#ff433d" }} title="Sell: 2"></div>
              </div>
              <div className="flex justify-between text-[10px]" style={{ marginTop: "2px", color: "#7a6030" }}>
                <span>BUY 28</span>
                <span>HOLD 8</span>
                <span>SELL 2</span>
              </div>
            </div>

            {/* Price Targets */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>PRICE TARGETS</div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Average Target", "$235.50", "#fff"],
                    ["High Target", "$280.00", "#4af6c3"],
                    ["Median Target", "$235.00", "#ffa028"],
                    ["Low Target", "$180.00", "#ff433d"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#ffa028", padding: "3px 2px", fontWeight: "bold" }}>{row[0]}</td>
                      <td style={{ color: row[2] as string, textAlign: "right", padding: "3px 2px" }}>{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rating Changes */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>RECENT RATING CHANGES</div>
              {[
                ["2024-03-20", "Goldman Sachs", "BUY", "BUY", "#4af6c3"],
                ["2024-03-15", "Morgan Stanley", "HOLD", "BUY", "#4af6c3"],
                ["2024-03-10", "JP Morgan", "BUY", "BUY", "#4af6c3"],
                ["2024-03-05", "Barclays", "HOLD", "HOLD", "#ffa028"],
                ["2024-02-28", "Deutsche Bank", "HOLD", "BUY", "#4af6c3"],
              ].map((change, i) => (
                <div key={i} className="flex justify-between text-[10px]" style={{ padding: "2px 0", borderBottom: "1px solid #0a0a05" }}>
                  <span style={{ color: "#7a6030" }}>{change[0]}</span>
                  <span style={{ color: "#fff" }}>{change[1]}</span>
                  <span style={{ color: change[4] as string, fontWeight: "bold" }}>{change[2]} → {change[3]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activePage === "GIP" && (
          <>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px", fontWeight: "bold" }}>
              {q.name}
            </div>

            {/* Company Description */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "2px" }}>DESCRIPTION</div>
              <div className="text-[9px]" style={{ color: "#fff", lineHeight: "1.4", marginBottom: "6px" }}>
                The S&P 500 is a market-capitalization weighted index of the 500 largest U.S. publicly traded companies. It represents approximately 80% of U.S. equity market capitalization and is widely regarded as the best representation of the broad U.S. stock market.
              </div>
            </div>

            {/* Key Data */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>KEY DATA</div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["CEO", "N/A (Index)"],
                    ["Headquarters", "New York, NY"],
                    ["Founded", "1957"],
                    ["Employees", "~500 companies"],
                    ["Industry", "Diversified"],
                    ["Sector", "Multi-sector"],
                    ["Index Members", "500"],
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#ffa028", padding: "3px 2px", fontWeight: "bold" }}>{item[0]}</td>
                      <td style={{ color: "#fff", padding: "3px 2px" }}>{item[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Events */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>RECENT EVENTS</div>
              {[
                ["2024-04-03", "Quarterly rebalancing completed"],
                ["2024-03-28", "New index additions announced"],
                ["2024-03-15", "Q1 earnings season begins"],
                ["2024-03-01", "Index hit new all-time high"],
                ["2024-02-15", "Volatility index adjustment"],
              ].map((event, i) => (
                <div key={i} className="flex justify-between text-[10px]" style={{ padding: "2px 0", borderBottom: "1px solid #0a0a05" }}>
                  <span style={{ color: "#7a6030" }}>{event[0]}</span>
                  <span style={{ color: "#fff" }}>{event[1]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activePage === "DVD" && (
          <>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px", fontWeight: "bold" }}>
              Dividend Information
            </div>

            {/* Dividend Summary */}
            <div style={{ marginBottom: "8px" }}>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Dividend Yield", "1.32%", "#4af6c3"],
                    ["Annual Dividend", "$6.72", "#fff"],
                    ["Payout Ratio", "15.5%", "#fff"],
                    ["5Y Growth Rate", "5.8%", "#4af6c3"],
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#ffa028", padding: "4px 2px", fontWeight: "bold" }}>{item[0]}</td>
                      <td style={{ color: item[2], textAlign: "right", padding: "4px 2px", fontWeight: "bold" }}>{item[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Next Dividend */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>NEXT DIVIDEND</div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Ex-Date", "Mar 8, 2024"],
                    ["Pay Date", "Mar 15, 2024"],
                    ["Amount", "$1.68"],
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#ffa028", padding: "3px 2px", fontWeight: "bold" }}>{item[0]}</td>
                      <td style={{ color: "#fff", padding: "3px 2px" }}>{item[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dividend History */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>RECENT DIVIDEND HISTORY</div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1000" }}>
                    <th style={{ color: "#ffa028", textAlign: "left", padding: "3px 2px", fontWeight: "bold" }}>Ex-Date</th>
                    <th style={{ color: "#ffa028", textAlign: "right", padding: "3px 2px", fontWeight: "bold" }}>Amount</th>
                    <th style={{ color: "#ffa028", textAlign: "right", padding: "3px 2px", fontWeight: "bold" }}>Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Dec 8, 2023", "$1.68", "1.29%"],
                    ["Sep 8, 2023", "$1.65", "1.31%"],
                    ["Jun 8, 2023", "$1.62", "1.30%"],
                    ["Mar 8, 2023", "$1.60", "1.32%"],
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#fff", padding: "3px 2px" }}>{item[0]}</td>
                      <td style={{ color: "#fff", textAlign: "right", padding: "3px 2px" }}>{item[1]}</td>
                      <td style={{ color: "#4af6c3", textAlign: "right", padding: "3px 2px" }}>{item[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "ERN" && (
          <>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px", fontWeight: "bold" }}>
              Earnings Information
            </div>

            {/* Next Earnings */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>NEXT EARNINGS RELEASE</div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Date", "Apr 25, 2024"],
                    ["Time", "AMC (After Market Close)"],
                    ["Current Q EPS Est.", "$1.52"],
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#ffa028", padding: "4px 2px", fontWeight: "bold" }}>{item[0]}</td>
                      <td style={{ color: "#fff", padding: "4px 2px" }}>{item[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Historical Earnings */}
            <div style={{ marginBottom: "8px" }}>
              <div className="text-[10px]" style={{ color: "#7a6030", marginBottom: "4px" }}>RECENT EARNINGS RELEASES</div>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1000" }}>
                    <th style={{ color: "#ffa028", textAlign: "left", padding: "3px 2px", fontWeight: "bold" }}>Date</th>
                    <th style={{ color: "#ffa028", textAlign: "right", padding: "3px 2px", fontWeight: "bold" }}>Est.</th>
                    <th style={{ color: "#ffa028", textAlign: "right", padding: "3px 2px", fontWeight: "bold" }}>Actual</th>
                    <th style={{ color: "#ffa028", textAlign: "center", padding: "3px 2px", fontWeight: "bold" }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["2024-01-30", "$1.48", "$1.53", "BEAT", "#4af6c3"],
                    ["2023-10-31", "$1.45", "$1.49", "BEAT", "#4af6c3"],
                    ["2023-07-28", "$1.40", "$1.42", "BEAT", "#4af6c3"],
                    ["2023-04-25", "$1.35", "$1.39", "BEAT", "#4af6c3"],
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a0a05" }}>
                      <td style={{ color: "#fff", padding: "3px 2px" }}>{item[0]}</td>
                      <td style={{ color: "#fff", textAlign: "right", padding: "3px 2px" }}>{item[1]}</td>
                      <td style={{ color: "#fff", textAlign: "right", padding: "3px 2px" }}>{item[2]}</td>
                      <td style={{ color: item[4], textAlign: "center", padding: "3px 2px", fontWeight: "bold" }}>{item[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "OMON" && (
          <>
            <div className="text-[10px]" style={{ color: "#ffa028", marginBottom: "8px", fontWeight: "bold" }}>
              Option Monitor
            </div>
            <div className="text-[9px]" style={{ color: "#7a6030" }}>
              Option data not currently available
            </div>
          </>
        )}

        {/* Actions row */}
        <div className="flex flex-wrap gap-[4px]" style={{ marginTop: "6px" }}>
          {ACTIONS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                if (PAGES.includes(cmd)) setActivePage(cmd);
              }}
              style={{
                padding: "2px 6px",
                color: activePage === cmd ? "#000" : "#ffa028",
                background: activePage === cmd ? "#ffa028" : "transparent",
                border: "1px solid #3d3020",
                fontSize: "11px",
                cursor: "pointer",
                transition: "background 0.1s, color 0.1s",
              }}
              onMouseEnter={(e) => {
                if (activePage !== cmd) {
                  e.currentTarget.style.background = "#1a1000";
                }
              }}
              onMouseLeave={(e) => {
                if (activePage !== cmd) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

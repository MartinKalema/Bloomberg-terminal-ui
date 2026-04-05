// Bloomberg Terminal mock data

export interface Quote {
  symbol: string;
  name: string;
  exchange: string;
  last: number;
  change: number;
  changePct: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  open: number;
  volume: string;
  prevClose: number;
  currency: string;
}

export interface NewsItem {
  id: string;
  time: string;
  headline: string;
  source: string;
  urgency: "FLASH" | "URGENT" | "NORMAL";
  category: string;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface EconomicEvent {
  time: string;
  event: string;
  actual: string;
  forecast: string;
  prior: string;
  surprise: "up" | "down" | "flat";
  importance: 1 | 2 | 3;
}

export interface SecurityRow {
  ticker: string;
  name: string;
  last: string;
  change: string;
  changePct: string;
  volume: string;
  direction: "up" | "down" | "flat";
}

export const primaryQuote: Quote = {
  symbol: "SPX",
  name: "S&P 500 INDEX",
  exchange: "Index",
  last: 5428.75,
  change: 12.50,
  changePct: 0.23,
  bid: 5428.50,
  ask: 5428.75,
  high: 5445.00,
  low: 5402.25,
  open: 5416.25,
  volume: "2.34B",
  prevClose: 5416.25,
  currency: "USD",
};

export const watchlist: SecurityRow[] = [
  { ticker: "SPX", name: "S&P 500", last: "5,428.75", change: "+12.50", changePct: "+0.23%", volume: "2.34B", direction: "up" },
  { ticker: "INDU", name: "DOW JONES", last: "40,125.00", change: "+87.00", changePct: "+0.22%", volume: "356M", direction: "up" },
  { ticker: "CCMP", name: "NASDAQ", last: "16,892.43", change: "-45.21", changePct: "-0.27%", volume: "4.12B", direction: "down" },
  { ticker: "RTY", name: "RUSSELL 2K", last: "2,067.34", change: "+8.92", changePct: "+0.43%", volume: "892M", direction: "up" },
  { ticker: "VIX", name: "CBOE VIX", last: "14.52", change: "-0.83", changePct: "-5.41%", volume: "--", direction: "down" },
  { ticker: "USGG10YR", name: "US 10Y", last: "4.2200", change: "-0.030", changePct: "-0.71%", volume: "--", direction: "down" },
  { ticker: "USGG2YR", name: "US 2Y", last: "4.7100", change: "-0.015", changePct: "-0.32%", volume: "--", direction: "down" },
  { ticker: "CL1", name: "WTI CRUDE", last: "78.42", change: "-0.95", changePct: "-1.20%", volume: "312K", direction: "down" },
  { ticker: "GC1", name: "GOLD", last: "2,342.80", change: "+14.30", changePct: "+0.61%", volume: "187K", direction: "up" },
  { ticker: "EUR", name: "EUR/USD", last: "1.0842", change: "+0.0023", changePct: "+0.21%", volume: "--", direction: "up" },
  { ticker: "GBP", name: "GBP/USD", last: "1.2687", change: "-0.0012", changePct: "-0.09%", volume: "--", direction: "down" },
  { ticker: "JPY", name: "USD/JPY", last: "154.23", change: "+0.45", changePct: "+0.29%", volume: "--", direction: "up" },
];

export const newsItems: NewsItem[] = [
  { id: "1", time: "14:32", headline: "FED'S WILLIAMS: MONETARY POLICY IS IN A GOOD PLACE RIGHT NOW", source: "BN", urgency: "FLASH", category: "FED", sentiment: "bullish" },
  { id: "2", time: "14:28", headline: "U.S. INITIAL JOBLESS CLAIMS FALL TO 215K VS 225K EST.", source: "BN", urgency: "URGENT", category: "ECO", sentiment: "bullish" },
  { id: "3", time: "14:25", headline: "S&P 500 RISES TO SESSION HIGH, UP 0.3% ON FED OPTIMISM", source: "BN", urgency: "NORMAL", category: "STK", sentiment: "bullish" },
  { id: "4", time: "14:22", headline: "TREASURY 10-YEAR YIELD FALLS 3BPS TO 4.22% AFTER CLAIMS DATA", source: "BN", urgency: "NORMAL", category: "GOV", sentiment: "neutral" },
  { id: "5", time: "14:18", headline: "CRUDE OIL FUTURES DECLINE 1.2% ON OPEC+ DEMAND CONCERNS", source: "BN", urgency: "NORMAL", category: "CMD", sentiment: "bearish" },
  { id: "6", time: "14:15", headline: "ECB'S LAGARDE: INFLATION EXPECTATIONS REMAIN WELL ANCHORED", source: "BN", urgency: "URGENT", category: "ECB", sentiment: "bullish" },
  { id: "7", time: "14:10", headline: "APPLE INC. SHARES RISE 2.1% AFTER PRODUCT ANNOUNCEMENT", source: "BN", urgency: "NORMAL", category: "STK", sentiment: "bullish" },
  { id: "8", time: "14:05", headline: "U.S. 30-YEAR BOND AUCTION SEES STRONG DEMAND, BTC 2.58X", source: "BN", urgency: "NORMAL", category: "GOV", sentiment: "bullish" },
  { id: "9", time: "14:01", headline: "VIX INDEX DROPS TO 14.50, LOWEST LEVEL IN THREE WEEKS", source: "BN", urgency: "NORMAL", category: "STK", sentiment: "bullish" },
  { id: "10", time: "13:58", headline: "FED FUNDS FUTURES PRICE IN 67% CHANCE OF SEPT. RATE CUT", source: "BN", urgency: "URGENT", category: "FED", sentiment: "bullish" },
  { id: "11", time: "13:52", headline: "GOLD FUTURES RISE 0.6% ON HAVEN DEMAND AMID GLOBAL TENSIONS", source: "BN", urgency: "NORMAL", category: "CMD", sentiment: "bearish" },
  { id: "12", time: "13:45", headline: "U.S. ISM SERVICES PMI RISES TO 54.8 VS 53.5 EXPECTED", source: "BN", urgency: "URGENT", category: "ECO", sentiment: "bullish" },
  { id: "13", time: "13:40", headline: "EUROPEAN STOXX 600 CLOSES UP 0.4%, LED BY TECH SHARES", source: "BN", urgency: "NORMAL", category: "STK", sentiment: "bullish" },
  { id: "14", time: "13:35", headline: "DOLLAR INDEX STEADY AT 104.20 AHEAD OF NONFARM PAYROLLS", source: "BN", urgency: "NORMAL", category: "FX", sentiment: "neutral" },
  { id: "15", time: "13:30", headline: "NVIDIA CORP RISES 3.2% TO ALL-TIME HIGH ON AI CHIP DEMAND", source: "BN", urgency: "NORMAL", category: "STK", sentiment: "bullish" },
];

export const worldIndices: SecurityRow[] = [
  { ticker: "UKX", name: "FTSE 100", last: "8,245.30", change: "+32.10", changePct: "+0.39%", volume: "1.2B", direction: "up" },
  { ticker: "DAX", name: "DAX", last: "18,432.56", change: "+78.34", changePct: "+0.43%", volume: "890M", direction: "up" },
  { ticker: "NKY", name: "NIKKEI 225", last: "38,892.12", change: "-123.45", changePct: "-0.32%", volume: "2.1T", direction: "down" },
  { ticker: "HSI", name: "HANG SENG", last: "18,234.56", change: "+156.78", changePct: "+0.87%", volume: "98.2B", direction: "up" },
  { ticker: "SHCOMP", name: "SHANGHAI", last: "3,087.42", change: "-12.34", changePct: "-0.40%", volume: "312B", direction: "down" },
  { ticker: "CAC", name: "CAC 40", last: "7,892.34", change: "+22.15", changePct: "+0.28%", volume: "650M", direction: "up" },
  { ticker: "AS51", name: "ASX 200", last: "7,834.20", change: "-18.90", changePct: "-0.24%", volume: "420M", direction: "down" },
  { ticker: "KOSPI", name: "KOSPI", last: "2,687.45", change: "+15.30", changePct: "+0.57%", volume: "1.8T", direction: "up" },
];

export const economicEvents: EconomicEvent[] = [
  { time: "08:30", event: "Jobless Claims", actual: "215K", forecast: "225K", prior: "222K", surprise: "up" as const, importance: 2 },
  { time: "10:00", event: "ISM Svc PMI", actual: "54.8", forecast: "53.5", prior: "53.4", surprise: "up" as const, importance: 3 },
  { time: "10:30", event: "EIA Nat Gas", actual: "--", forecast: "28B", prior: "37B", surprise: "flat" as const, importance: 1 },
  { time: "13:00", event: "30Y Bond Auc", actual: "4.58%", forecast: "4.55%", prior: "4.52%", surprise: "down" as const, importance: 2 },
  { time: "14:00", event: "Williams Spk", actual: "--", forecast: "--", prior: "--", surprise: "flat" as const, importance: 3 },
  { time: "15:00", event: "Consumer Crd", actual: "--", forecast: "$10B", prior: "$11B", surprise: "flat" as const, importance: 1 },
];

import type { SymbolInfo, Candle, Timeframe } from "../binance/types";

const BASE = "https://api.mexc.com/api/v3";

let cachedSymbols: SymbolInfo[] | null = null;

export async function fetchMexcSymbols(): Promise<SymbolInfo[]> {
  if (cachedSymbols) return cachedSymbols;
  const res = await fetch(`${BASE}/exchangeInfo`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`MEXC exchangeInfo ${res.status}`);
  const data = await res.json();
  cachedSymbols = data.symbols
    .filter((s: { status: string }) => s.status === "ENABLED")
    .map((s: { symbol: string; baseAsset: string; quoteAsset: string }) => ({
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
      status: "TRADING",
      exchange: "MEXC" as const,
    }));
  return cachedSymbols!;
}

export async function fetchMexcKlines(
  symbol: string,
  interval: Timeframe,
  limit = 1000,
): Promise<Candle[]> {
  const url = `${BASE}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`MEXC klines ${res.status}`);
  const data = (await res.json()) as unknown[][];
  return data.map((k) => ({
    time: Math.floor((k[0] as number) / 1000),
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
    isFinal: true,
  }));
}

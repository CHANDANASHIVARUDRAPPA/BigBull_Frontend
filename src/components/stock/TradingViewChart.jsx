import React, { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";

// --- Indicator helpers ---
function SMA(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function EMA(data, period) {
  const result = [];
  const k = 2 / (period + 1);
  let emaPrev = null;

  for (let i = 0; i < data.length; i++) {
    const close = data[i].close;
    if (emaPrev === null) emaPrev = close;
    const ema = close * k + emaPrev * (1 - k);
    emaPrev = ema;

    if (i >= period - 1) {
      result.push({ time: data[i].time, value: ema });
    }
  }
  return result;
}

const TradingViewChart = ({ data, livePrice, onCrosshairMove }) => {
  const containerRef = useRef(null);

  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);

  const sma20Ref = useRef(null);
  const sma50Ref = useRef(null);
  const ema200Ref = useRef(null);

  // Convert backend -> lightweight-charts format
  const formatted = useMemo(() => {
    if (!data?.length) return [];

    return data
      .map((d) => {
        const dt = new Date(d.Date || d.Datetime);
        return {
          time: Math.floor(dt.getTime() / 1000),
          open: Number(d.Open),
          high: Number(d.High),
          low: Number(d.Low),
          close: Number(d.Close),
          volume: Number(d.Volume || 0),
        };
      })
      .filter(
        (x) =>
          Number.isFinite(x.open) &&
          Number.isFinite(x.high) &&
          Number.isFinite(x.low) &&
          Number.isFinite(x.close)
      );
  }, [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#0b1220" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.08)" },
        horzLines: { color: "rgba(148,163,184,0.08)" },
      },
      rightPriceScale: {
        borderColor: "rgba(148,163,184,0.25)",
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.25)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
      height: 460,
    });

    chartRef.current = chart;

    // ✅ v5 way: addSeries()
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // separate scale
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const sma20 = chart.addSeries(LineSeries, { lineWidth: 2, color: "#60a5fa" });
    const sma50 = chart.addSeries(LineSeries, { lineWidth: 2, color: "#f59e0b" });
    const ema200 = chart.addSeries(LineSeries, { lineWidth: 2, color: "#a78bfa" });

    candleRef.current = candles;
    volumeRef.current = volumeSeries;
    sma20Ref.current = sma20;
    sma50Ref.current = sma50;
    ema200Ref.current = ema200;

    // Crosshair OHLC
    chart.subscribeCrosshairMove((param) => {
      if (!param?.time || !param?.seriesData) return;

      const candle = param.seriesData.get(candles);
      if (!candle) return;

      onCrosshairMove?.({
        time: param.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
    });

    // Resize
    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [onCrosshairMove]);

  // Set full dataset
  useEffect(() => {
    if (!formatted.length) return;
    if (!candleRef.current || !volumeRef.current) return;

    candleRef.current.setData(formatted);

    volumeRef.current.setData(
      formatted.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)",
      }))
    );

    sma20Ref.current?.setData(SMA(formatted, 20));
    sma50Ref.current?.setData(SMA(formatted, 50));
    ema200Ref.current?.setData(EMA(formatted, 200));

    chartRef.current?.timeScale().fitContent();
  }, [formatted]);

  // Live update on last candle close
  useEffect(() => {
    if (!livePrice) return;
    if (!formatted.length) return;
    if (!candleRef.current) return;

    const last = formatted[formatted.length - 1];
    const updatedClose = Number(livePrice);

    candleRef.current.update({
      time: last.time,
      open: last.open,
      high: Math.max(last.high, updatedClose),
      low: Math.min(last.low, updatedClose),
      close: updatedClose,
    });
  }, [livePrice, formatted]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
};

export default TradingViewChart;

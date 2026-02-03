import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Grid, Card, CardContent, Button, Stack } from "@mui/material";
import { getStockInfo, getStockHistory } from "../services/api";
import { createWebSocket } from "../services/websocket";
import TradingViewChart from "../components/stock/TradingViewChart";

const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

const StockInfo = () => {
  const { symbol } = useParams();
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState("1M");
  const [liveData, setLiveData] = useState({});

  useEffect(() => {
    getStockInfo(symbol).then((res) => setInfo(res.data.info));
  }, [symbol]);

  useEffect(() => {
    getStockHistory(symbol, timeframe).then((res) => {
      setHistory(res.data.data);
    });
  }, [symbol, timeframe]);

  useEffect(() => {
    const ws = createWebSocket([symbol], (data) => {
      if (data.type === "data") setLiveData(data.data[symbol] || {});
    });
    return () => ws.close();
  }, [symbol]);

  if (!info) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#111" }}>
          {info.shortName}
        </Typography>
        <Typography variant="h6" sx={{ color: "#666" }}>
          ({symbol})
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT CARD */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                📊 Details
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Sector
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {info.sector || "N/A"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Market Cap
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {info.marketCap ? info.marketCap.toLocaleString() : "N/A"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                PE Ratio
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {info.trailingPE || "N/A"}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Live Price
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  ${Number(liveData.price || info.currentPrice || 0).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT CHART */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  📈 TradingView Trendline
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {TIMEFRAMES.map((tf) => (
                    <Button
                      key={tf}
                      size="small"
                      variant={tf === timeframe ? "contained" : "outlined"}
                      onClick={() => setTimeframe(tf)}
                      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                    >
                      {tf}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <TradingViewChart data={history} livePrice={liveData.price} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockInfo;

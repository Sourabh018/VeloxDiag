import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: "8px",
          px: 1.5,
          py: 1,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            fontWeight: 700,
            color: "#60A5FA",
          }}
        >
          {payload[0].value}ms
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#64748B" }}>avg duration</Typography>
      </Box>
    );
  }
  return null;
}

function TrendChart({ history = [] }) {
  const data = history.map((v, i) => ({ t: i, duration: v }));
  const maxDuration = data.length > 0 ? Math.max(...data.map((d) => d.duration)) : 100;
  const yMax = Math.ceil((maxDuration * 1.15) / 100) * 100 || 100;

  const avgDuration =
    data.length > 0 ? Math.round(data.reduce((s, d) => s + d.duration, 0) / data.length) : 0;
  const lastDuration = data.length > 0 ? data[data.length - 1].duration : 0;
  const trend = data.length > 1 ? lastDuration - data[0].duration : 0;
  const trendUp = trend > 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Card Header */}
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                mb: 0.4,
              }}
            >
              Response Time Trend
            </Typography>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 28,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {avgDuration}
              <Box
                component="span"
                sx={{ fontSize: 14, fontWeight: 600, color: "#94A3B8", ml: 0.5 }}
              >
                ms avg
              </Box>
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="flex-end">
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, mb: 0.25 }}>
                CURRENT
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0F172A",
                }}
              >
                {lastDuration}ms
              </Typography>
            </Box>
            {trend !== 0 && (
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, mb: 0.25 }}>
                  TREND
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 15,
                    fontWeight: 700,
                    color: trendUp ? "#DC2626" : "#059669",
                  }}
                >
                  {trendUp ? "+" : ""}
                  {trend}ms
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 200, px: 1, pt: 1.5, pb: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="durationFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
                  <stop offset="60%" stopColor="#2563EB" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="0" />
              <XAxis dataKey="t" hide />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: "#CBD5E1", fontSize: 11, fontFamily: "monospace" }}
                width={42}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="duration"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#durationFill)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TrendChart;
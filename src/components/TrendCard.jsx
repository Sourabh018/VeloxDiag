import { Box, Typography, Paper } from "@mui/material";
import TrendUpIcon from "@mui/icons-material/TrendingUp";
import TrendDownIcon from "@mui/icons-material/TrendingDown";
import TrendFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendChart from "./TrendChart";

const directionConfig = {
  WORSENING: {
    dot: "#DC2626",
    text: "#991B1B",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    icon: TrendUpIcon,
    label: "Worsening",
  },
  IMPROVING: {
    dot: "#059669",
    text: "#065F46",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    icon: TrendDownIcon,
    label: "Improving",
  },
  STABLE: {
    dot: "#64748B",
    text: "#334155",
    bg: "#F1F5F9",
    border: "#CBD5E1",
    icon: TrendFlatIcon,
    label: "Stable",
  },
};

function TrendCard({ trend }) {
  const { endpoint, points, trendDirection, percentChange, firstAvgMs, latestAvgMs } = trend;
  const config = directionConfig[trendDirection] ?? directionConfig.STABLE;
  const Icon = config.icon;
  const history = points.map((p) => p.avgDurationMs);

  return (
    <Paper
      elevation={0}
      sx={{
        marginBottom: 2.5,
        padding: 2.5,
        borderRadius: "12px",
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            sx={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace', color: "#0F172A", fontSize: "15px", fontWeight: 700 }}
          >
            {endpoint}
          </Typography>
          <Typography
            sx={{
              color: "#64748B",
              fontFamily: '"JetBrains Mono", monospace',
              fontVariantNumeric: "tabular-nums",
              fontSize: "13px",
              mt: 0.25,
            }}
          >
            {firstAvgMs.toFixed(0)}ms → {latestAvgMs.toFixed(0)}ms over {points.length} day{points.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: config.bg,
            border: `1px solid ${config.border}`,
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: config.dot, flexShrink: 0 }} />
          <Icon sx={{ fontSize: 16, color: config.text }} />
          <Typography
            sx={{
              color: config.text,
              fontFamily: '"JetBrains Mono", monospace',
              fontVariantNumeric: "tabular-nums",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {config.label} · {percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      <TrendChart history={history} />
    </Paper>
  );
}

export default TrendCard;
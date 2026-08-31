import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts";

const NEUTRAL = "#2563EB";
const GOOD = "#059669";
const WARN = "#D97706";
const CRIT = "#DC2626";

const STATUS_BG = {
  [GOOD]: { bg: "#F0FDF4", border: "#BBF7D0", accent: GOOD },
  [WARN]: { bg: "#FFFBEB", border: "#FDE68A", accent: WARN },
  [CRIT]: { bg: "#FFF5F5", border: "#FECACA", accent: CRIT },
  [NEUTRAL]: { bg: "#F0F7FF", border: "#BFDBFE", accent: NEUTRAL },
};

function StatCard({
  title,
  value,
  unit = "",
  delta = 0,
  history = [],
  invert = false,
  thresholds,
  reverseThresholds = false,
  icon,
}) {
  const isUp = delta > 0;
  const isGood = invert ? delta <= 0 : delta >= 0;

  let statusColor = NEUTRAL;
  if (thresholds) {
    if (reverseThresholds) {
      if (value <= thresholds.critical) statusColor = CRIT;
      else if (value <= thresholds.warning) statusColor = WARN;
      else statusColor = GOOD;
    } else {
      if (value >= thresholds.critical) statusColor = CRIT;
      else if (value >= thresholds.warning) statusColor = WARN;
    }
  }

  const sparkData = history.map((v, i) => ({ i, v }));
  const sparkColor = statusColor;
  const { bg, border, accent } = STATUS_BG[statusColor] || STATUS_BG[NEUTRAL];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        transition: "all 0.2s ease",
        cursor: "default",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          borderColor: "#CBD5E1",
          transform: "translateY(-1px)",
        },
      }}
    >
      {/* Colored top accent bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: accent,
          borderRadius: "14px 14px 0 0",
        }}
      />

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, pt: 3 }}>
        {/* Header row: icon + title + delta */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.25} alignItems="center">
            {icon && (
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  bgcolor: bg,
                  border: `1px solid ${border}`,
                  color: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
          </Stack>

          {delta !== 0 && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.25}
              sx={{
                color: isGood ? GOOD : CRIT,
                bgcolor: isGood ? "#F0FDF4" : "#FFF5F5",
                border: `1px solid ${isGood ? "#BBF7D0" : "#FECACA"}`,
                borderRadius: "6px",
                px: 0.75,
                py: 0.25,
              }}
            >
              {isUp ? (
                <ArrowUpwardIcon sx={{ fontSize: 12 }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 12 }} />
              )}
              <Typography
                sx={{ fontSize: 11.5, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}
              >
                {Math.abs(delta)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Main value */}
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
            fontSize: 34,
            fontWeight: 800,
            color: statusColor,
            mt: 2,
            mb: 0,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {value}
          <Box
            component="span"
            sx={{ fontSize: 15, fontWeight: 600, color: "#94A3B8", ml: 0.75, letterSpacing: 0 }}
          >
            {unit}
          </Box>
        </Typography>

        {/* Sparkline */}
        {history.length > 0 && (
          <Box sx={{ height: 40, mt: 2, mx: -2.5, mb: -2.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparkColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Without this, Recharts defaults the baseline to 0 — fine for
                    near-zero data (GC pause, threads awaiting) but makes any
                    metric that hovers at a high value (heap %, pool %) render
                    as a nearly-solid block instead of a legible trend line. */}
                <YAxis domain={["dataMin", "dataMax"]} hide />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={sparkColor}
                  strokeWidth={2}
                  fill={`url(#spark-${title})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
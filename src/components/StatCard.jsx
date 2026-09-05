import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import AnimatedNumber from "./AnimatedNumber";

const MotionCard = motion.create(Card);

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
  index = 0,
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
    <MotionCard
      elevation={0}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.015 }}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        cursor: "default",
        "&:hover": {
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
          borderColor: "#CBD5E1",
        },
      }}
    >
      {/* Colored top accent bar — sweeps in on mount */}
      <Box
        component={motion.div}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay: index * 0.08 + 0.15, ease: "easeOut" }}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: accent,
          borderRadius: "14px 14px 0 0",
          transformOrigin: "left",
        }}
      />
      {/* Soft glowing orb that drifts on hover */}
      <Box
        component={motion.div}
        aria-hidden
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
      />

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, pt: 3 }}>
        {/* Header row: icon + title + delta */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.25} alignItems="center">
            {icon && (
              <Box
                component={motion.div}
                whileHover={{ rotate: 12, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
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
          <AnimatedNumber value={value} />
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
    </MotionCard>
  );
}

export default StatCard;
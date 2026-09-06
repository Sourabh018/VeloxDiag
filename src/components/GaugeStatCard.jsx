import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Gauge3D from "./3d/Gauge3D";

const NEUTRAL = "#2563EB";
const GOOD = "#059669";
const WARN = "#D97706";
const CRIT = "#DC2626";

/**
 * GaugeStatCard — same card chrome/sizing as StatCard (so it drops into the
 * same Grid row cleanly), but the icon+sparkline are replaced by a full
 * Gauge3D. Reserved for the one or two most important percentage metrics
 * on a page: Dashboard's Health Score, SystemHealth's Heap/Pool usage.
 *
 * `value` must be 0-100 (drives both the arc fill and the threshold color).
 * `displayValue`/`unit` control what text is shown next to the gauge —
 * they don't have to be the same number as `value` (e.g. value=92 drives
 * a green 92%-full ring, displayValue="92" unit="/100" is what's printed).
 */
function GaugeStatCard({
  title,
  value,
  displayValue,
  unit = "",
  delta = 0,
  invert = false,
  thresholds,
  reverseThresholds = false,
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
  const intensity = statusColor === CRIT ? "high" : statusColor === WARN ? "medium" : "low";

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
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: statusColor, borderRadius: "14px 14px 0 0" }} />

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, pt: 3, display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
        <Box sx={{ width: 84, height: 84, flexShrink: 0 }}>
          <Gauge3D value={value} color={statusColor} intensity={intensity} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography
              sx={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.2 }}
            >
              {title}
            </Typography>
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
                  flexShrink: 0,
                }}
              >
                {isUp ? <ArrowUpwardIcon sx={{ fontSize: 12 }} /> : <ArrowDownwardIcon sx={{ fontSize: 12 }} />}
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                  {Math.abs(delta)}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
              fontSize: 30,
              fontWeight: 800,
              color: statusColor,
              mt: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayValue ?? value}
          </Typography>
          {unit && (
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#94A3B8",
                mt: 0.4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default GaugeStatCard;
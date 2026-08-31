import { Box, Typography, Grid, Paper, CircularProgress, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MemoryIcon from "@mui/icons-material/Memory";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import StorageIcon from "@mui/icons-material/Storage";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { useSelectedApp } from "../contexts/AppContext";
import useSystemHealth from "../hooks/useSystemHealth";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Dashboard item 2.5 — the JVM/GC and connection-pool ingestion pipelines
 * (JvmMetricsController, ConnectionPoolMetricsController) have been live
 * and correct server-side for a while with zero UI consumer. This page is
 * that consumer: current-state tiles (via StatCard, same component the
 * main Dashboard uses) plus two history charts.
 */

function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function HistoryChart({ title, data, dataKey, color, unit, emptyMessage }) {
  // Recharts positions points, the hover cursor, and the active dot all off
  // the XAxis's dataKey. Using the formatted "label" string (e.g. "11:51 am")
  // for that is what caused the dot/cursor/tooltip misalignment: telemetry
  // samples land every ~60s, so many points round to the same minute label,
  // and a category axis with duplicate keys doesn't resolve hover position
  // consistently. Indexing instead guarantees a unique, monotonic key for
  // positioning — the visible ticks/tooltip text are unchanged, still pulled
  // from the same "label" field via the formatters below.
  const indexedData = data.map((d, i) => ({ ...d, __x: i }));
  const labelForIndex = (i) => indexedData[i]?.label ?? "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        bgcolor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        height: "100%",
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", mb: 2 }}>{title}</Typography>
      {data.length === 0 ? (
        <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: 13, color: "#94A3B8" }}>{emptyMessage}</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={indexedData}>
              <defs>
                <linearGradient id={`health-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="__x"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={labelForIndex}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                labelFormatter={labelForIndex}
                formatter={(v) => [`${v}${unit}`, title]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#health-${dataKey})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}

function SystemHealth({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { jvmLatest, jvmHistory, poolLatest, poolHistory, loading, error, refetch } =
    useSystemHealth(selectedApp);

  const heapPercent =
    jvmLatest && jvmLatest.heapMaxMb
      ? Math.round((jvmLatest.heapUsedMb / jvmLatest.heapMaxMb) * 100)
      : null;

  const poolUtilPercent =
    poolLatest && poolLatest.maxPoolSize
      ? Math.round((poolLatest.totalConnections / poolLatest.maxPoolSize) * 100)
      : null;

  const heapChartData = jvmHistory.map((m) => ({
    label: fmtTime(m.timestamp),
    heapUsedMb: m.heapUsedMb,
  }));

  const poolChartData = poolHistory.map((m) => ({
    label: fmtTime(m.timestamp),
    activeConnections: m.activeConnections,
  }));

  const hasAnyData = !!jvmLatest || !!poolLatest;

  return (
    <>
      <Header onMobileMenuToggle={onMobileMenuToggle} />
      <Box
        component="main"
        sx={{
          marginLeft: { xs: 0, md: "248px" },
          marginTop: "64px",
          padding: { xs: 2.5, sm: 3, md: 4 },
          bgcolor: "#F8FAFC",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5, letterSpacing: "-0.02em" }}>
              System Health
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 680 }}>
              JVM heap/GC and database connection-pool pressure for <strong>{selectedApp || "this application"}</strong>,
              reported periodically by the starter agent — separate from per-request telemetry.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={refetch}
            sx={{
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              borderColor: "#CBD5E1",
              bgcolor: "#FFFFFF",
              "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
            }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Box
            sx={{
              display: "inline-block",
              fontSize: 13.5,
              fontWeight: 500,
              color: "#991B1B",
              border: "1px solid #FCA5A5",
              backgroundColor: "#FEF2F2",
              borderRadius: "8px",
              padding: "10px 16px",
              marginBottom: 3,
            }}
          >
            Could not reach VeloxDiag server for system health data
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : !hasAnyData ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF" }}>
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              No System Health Data Yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 520, mx: "auto", lineHeight: 1.6 }}>
              This fills in once <strong>{selectedApp || "this application"}</strong>'s starter agent reports its first
              JVM/GC or connection-pool snapshot — no dashboard action needed on your end.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Heap Used"
                  value={jvmLatest ? jvmLatest.heapUsedMb : "—"}
                  unit={jvmLatest ? `/ ${jvmLatest.heapMaxMb} MB` : ""}
                  thresholds={{ warning: 70, critical: 90 }}
                  history={jvmHistory.map((m) =>
                    m.heapMaxMb ? Math.round((m.heapUsedMb / m.heapMaxMb) * 100) : 0
                  )}
                  icon={<MemoryIcon sx={{ fontSize: 18 }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="GC Pause (last report)"
                  value={jvmLatest?.gcPauseMsSinceLastReport ?? "—"}
                  unit="ms"
                  thresholds={{ warning: 200, critical: 500 }}
                  history={jvmHistory.map((m) => m.gcPauseMsSinceLastReport ?? 0)}
                  icon={<AutorenewIcon sx={{ fontSize: 18 }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Pool Connections"
                  value={poolLatest ? poolLatest.totalConnections : "—"}
                  unit={poolLatest?.maxPoolSize ? `/ ${poolLatest.maxPoolSize}` : ""}
                  thresholds={{ warning: 70, critical: 90 }}
                  history={poolHistory.map((m) =>
                    m.maxPoolSize ? Math.round((m.totalConnections / m.maxPoolSize) * 100) : 0
                  )}
                  icon={<StorageIcon sx={{ fontSize: 18 }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  title="Threads Awaiting Connection"
                  value={poolLatest?.threadsAwaitingConnection ?? "—"}
                  thresholds={{ warning: 1, critical: 5 }}
                  history={poolHistory.map((m) => m.threadsAwaitingConnection ?? 0)}
                  icon={<HourglassTopIcon sx={{ fontSize: 18 }} />}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <HistoryChart
                  title="Heap Used (MB)"
                  data={heapChartData}
                  dataKey="heapUsedMb"
                  color="#2563EB"
                  unit=" MB"
                  emptyMessage="No JVM history reported yet for this app."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <HistoryChart
                  title="Active Connections"
                  data={poolChartData}
                  dataKey="activeConnections"
                  color="#D97706"
                  unit=""
                  emptyMessage="No connection-pool history reported yet for this app."
                />
              </Grid>
            </Grid>

            {heapPercent !== null && heapPercent >= 90 && (
              <Typography sx={{ fontSize: 12.5, color: "#991B1B", mt: 2 }}>
                Heap usage is at {heapPercent}% of max — this app may be under memory pressure.
              </Typography>
            )}
            {poolUtilPercent !== null && poolUtilPercent >= 90 && (
              <Typography sx={{ fontSize: 12.5, color: "#991B1B", mt: 1 }}>
                Connection pool is at {poolUtilPercent}% utilization — requests may start queueing.
              </Typography>
            )}
          </>
        )}
      </Box>
    </>
  );
}

export default SystemHealth;
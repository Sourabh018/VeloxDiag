import { Grid, Box, Typography, CircularProgress, Paper, Chip, Stack } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BarChartIcon from "@mui/icons-material/BarChart";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import TimerIcon from "@mui/icons-material/Timer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { motion, AnimatePresence } from "motion/react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";
import DashboardAiSummary from "../components/DashboardAiSummary";
import useDashboardMetrics from "../hooks/useDashboardMetrics";
import { useSelectedApp } from "../contexts/AppContext";

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
  }),
};

function severityForDuration(ms) {
  if (ms >= 3000) return { dot: "#DC2626", text: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5" };
  if (ms >= 1000) return { dot: "#D97706", text: "#92400E", bg: "#FFFBEB", border: "#FCD34D" };
  return { dot: "#2563EB", text: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" };
}

function SlowEndpointRow({ endpoint, avgDuration, count, rank }) {
  const style = severityForDuration(avgDuration);
  const barWidth = Math.min(100, (avgDuration / 5000) * 100);

  return (
    <MotionBox
      custom={rank}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ backgroundColor: "#F8FAFC" }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.75,
        px: 2.5,
        borderBottom: "1px solid #F8FAFC",
        "&:last-of-type": { borderBottom: "none" },
        position: "relative",
      }}
    >
      {/* Rank number */}
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "#CBD5E1",
          fontFamily: '"JetBrains Mono", monospace',
          minWidth: 18,
          flexShrink: 0,
        }}
      >
        {String(rank).padStart(2, "0")}
      </Typography>

      {/* Dot + Endpoint */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: style.dot,
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${style.bg}`,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
              fontSize: 13,
              fontWeight: 600,
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mb: 0.5,
            }}
          >
            {endpoint}
          </Typography>
          {/* Mini progress bar */}
          <Box sx={{ height: 3, bgcolor: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
            <Box
              component={motion.div}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.8, delay: rank * 0.05 + 0.2, ease: "easeOut" }}
              sx={{
                height: "100%",
                bgcolor: style.dot,
                borderRadius: 2,
                opacity: 0.7,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
        <Chip
          label={`${avgDuration.toFixed(0)}ms`}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            fontWeight: 700,
            color: style.text,
            bgcolor: style.bg,
            border: `1px solid ${style.border}`,
            height: 22,
            borderRadius: "6px",
          }}
        />
        <Typography
          sx={{
            fontSize: 12,
            color: "#94A3B8",
            fontWeight: 500,
            minWidth: 70,
            textAlign: "right",
            display: { xs: "none", sm: "block" },
          }}
        >
          {count} req{count !== 1 ? "s" : ""}
        </Typography>
      </Box>
    </MotionBox>
  );
}

function PageHeader({ selectedApp }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      sx={{
        mb: 3.5,
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}
    >
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Box
            component={motion.div}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#2563EB",
            }}
          />
          <Typography
            sx={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "#2563EB",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Dashboard
          </Typography>
        </Stack>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", mb: 0.4 }}
        >
          Performance Overview
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Monitoring{" "}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              color: "#0F172A",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12.5,
            }}
          >
            {selectedApp || "all applications"}
          </Box>{" "}
          · Real-time telemetry and AI diagnostics
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
        <TrendingUpIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
        <Typography
          sx={{
            fontSize: 12,
            color: "#94A3B8",
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 500,
          }}
        >
          {dateStr} · {timeStr}
        </Typography>
      </Stack>
    </MotionBox>
  );
}

function Dashboard({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { summary, slowEndpoints, trends, loading, error } = useDashboardMetrics({
    applicationName: selectedApp,
  });

  const safeSlowEndpoints = Array.isArray(slowEndpoints) ? slowEndpoints : [];
  const safeTrends = Array.isArray(trends) ? trends : [];

  const totalRequests = summary?.totalRequests ?? 0;
  const errorCount = summary?.errorRequests ?? 0;
  const healthScore = summary?.healthScore ?? 100;
  const avgSlowDuration =
    safeSlowEndpoints.length > 0
      ? Math.round(
          safeSlowEndpoints.reduce((sum, e) => sum + e.avgDuration, 0) / safeSlowEndpoints.length
        )
      : 0;

  const trendHistory = safeTrends.map((t) => t.avgDuration ?? 0);

  const SIDEBAR_W = 248;
  const HEADER_H = 64;

  return (
    <>
      <Header onMobileMenuToggle={onMobileMenuToggle} />
      <Box
        component="main"
        sx={{
          marginLeft: { xs: 0, md: `${SIDEBAR_W}px` },
          marginTop: `${HEADER_H}px`,
          padding: { xs: 2.5, sm: 3, md: "32px 36px" },
          bgcolor: "#F8FAFC",
          minHeight: `calc(100vh - ${HEADER_H}px)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative rotating gradient orbs — purely ambient, sit behind content */}
        <Box
          component={motion.div}
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          sx={{
            position: "absolute",
            top: -180,
            right: -160,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #2563EB22, #7C3AED22, #2563EB00, #2563EB22)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Box
          component={motion.div}
          aria-hidden
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          sx={{
            position: "absolute",
            bottom: -200,
            left: -140,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "conic-gradient(from 90deg, #05966922, #2563EB00, #05966918)",
            filter: "blur(48px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
        <PageHeader selectedApp={selectedApp} />

        {/* Error banner */}
        {error && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: 13,
              fontWeight: 500,
              color: "#991B1B",
              border: "1px solid #FCA5A5",
              backgroundColor: "#FEF2F2",
              borderRadius: "10px",
              padding: "12px 16px",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#DC2626",
                flexShrink: 0,
              }}
            />
            VeloxDiag backend unreachable — displaying cached telemetry data
          </Box>
        )}

        {/* AI Summary */}
        {!loading && <DashboardAiSummary applicationName={selectedApp} />}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={32} sx={{ color: "#2563EB", mb: 2 }} />
              <Typography sx={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
                Loading telemetry data...
              </Typography>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Stat Cards */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                index={0}
                title="Health Score"
                value={healthScore}
                unit="/100"
                thresholds={{ warning: 70, critical: 40 }}
                reverseThresholds
                icon={<FavoriteIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                index={1}
                title="Total Requests"
                value={totalRequests}
                unit=""
                icon={<BarChartIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                index={2}
                title="Errors"
                value={errorCount}
                unit=""
                thresholds={{ warning: 5, critical: 15 }}
                invert
                icon={<ErrorOutlineIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                index={3}
                title="Avg Slow Duration"
                value={avgSlowDuration}
                unit="ms"
                thresholds={{ warning: 1000, critical: 3000 }}
                invert
                icon={<TimerIcon sx={{ fontSize: 18 }} />}
              />
            </Grid>

            {/* Trend Chart */}
            <Grid size={{ xs: 12 }}>
              <MotionBox
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
              >
              {trendHistory.length > 0 ? (
                <TrendChart history={trendHistory} />
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 14, color: "#94A3B8", fontWeight: 500, lineHeight: 1.6 }}
                  >
                    Collecting historical telemetry. Trend charts will populate as requests are
                    monitored over time.
                  </Typography>
                </Paper>
              )}
              </MotionBox>
            </Grid>

            {/* Slow Endpoints Table */}
            <Grid size={{ xs: 12 }}>
              <MotionBox
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.75,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#0F172A",
                      letterSpacing: "-0.02em",
                      mb: 0.25,
                    }}
                  >
                    Slow Endpoints
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "#64748B" }}>
                    Endpoints exceeding the slow-request threshold, ordered by average latency
                  </Typography>
                </Box>
                {safeSlowEndpoints.length > 0 && (
                  <Chip
                    label={`${safeSlowEndpoints.length} endpoint${safeSlowEndpoints.length !== 1 ? "s" : ""}`}
                    size="small"
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      bgcolor: "#FEF2F2",
                      color: "#991B1B",
                      border: "1px solid #FCA5A5",
                      height: 24,
                      borderRadius: "6px",
                    }}
                  />
                )}
              </MotionBox>

              {safeSlowEndpoints.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "#ECFDF5",
                      color: "#059669",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                      fontSize: 22,
                    }}
                  >
                    ✓
                  </Box>
                  <Typography
                    sx={{ fontSize: 14.5, fontWeight: 800, color: "#0F172A", mb: 0.5 }}
                  >
                    No Slow Endpoints Detected
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#64748B", maxWidth: 380, mx: "auto" }}>
                    All endpoints for{" "}
                    <strong>{selectedApp || "this application"}</strong> are responding
                    within normal thresholds.
                  </Typography>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  {/* Table header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid #F1F5F9",
                      bgcolor: "#FAFBFC",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "#94A3B8",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Endpoint
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "#94A3B8",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Avg Duration
                    </Typography>
                  </Box>

                  {safeSlowEndpoints.map((ep, i) => (
                    <SlowEndpointRow
                      key={i}
                      rank={i + 1}
                      endpoint={ep.endpoint}
                      avgDuration={ep.avgDuration}
                      count={ep.count}
                    />
                  ))}
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
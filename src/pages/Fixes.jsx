import { Box, Typography, Paper, CircularProgress, Button, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Header from "../components/Header";
import useFixes from "../hooks/useFixes";
import { useSelectedApp } from "../contexts/AppContext";

const statusStyle = {
  WATCHING: { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1", label: "Watching Traffic" },
  IMPROVED: { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", label: "Improved" },
  NO_CHANGE: { color: "#92400E", bg: "#FFFBEB", border: "#FCD34D", label: "No Significant Change" },
  REGRESSED: { color: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5", label: "Regressed" },
};

function StatusTag({ status }) {
  const style = statusStyle[status] ?? statusStyle.WATCHING;
  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11.5,
        fontWeight: 700,
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        height: 24,
        borderRadius: "6px",
      }}
    />
  );
}

function formatMs(v) {
  if (v === null || v === undefined) return "—";
  return `${Math.round(v)}ms`;
}

function FixCard({ fix }) {
  const hasVerdict = fix.status !== "WATCHING" && fix.improvementPercent !== null && fix.improvementPercent !== undefined;

  return (
    <Paper
      elevation={0}
      sx={{
        padding: 2.5,
        marginBottom: 2,
        borderColor: fix.status === "REGRESSED" ? "#FCA5A5" : fix.status === "IMPROVED" ? "#A7F3D0" : "#E2E8F0",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        transition: "all 0.15s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          borderColor: fix.status === "REGRESSED" ? "#EF4444" : fix.status === "IMPROVED" ? "#10B981" : "#CBD5E1",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace', fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
            {fix.endpoint}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "#64748B", marginTop: 0.25 }}>
            {fix.ruleType} · marked fixed on {new Date(fix.markedFixedAt).toLocaleString()}
          </Typography>
        </Box>
        <StatusTag status={fix.status} />
      </Box>

      {fix.note && (
        <Box sx={{ bgcolor: "#F8FAFC", p: 1.5, borderRadius: "8px", mb: 2, border: "1px solid #F1F5F9" }}>
          <Typography sx={{ fontSize: 13, color: "#334155", fontStyle: "italic" }}>
            "{fix.note}"
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 4 }, flexWrap: "wrap", pt: 1 }}>
        <Box sx={{ bgcolor: "#F8FAFC", p: 1.75, borderRadius: "10px", border: "1px solid #E2E8F0", minWidth: 120 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase" }}>BEFORE FIX</Typography>
          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, fontWeight: 800, color: "#475569", mt: 0.5 }}>
            {formatMs(fix.beforeAvgDurationMs)}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>{fix.beforeSampleCount ?? 0} samples</Typography>
        </Box>

        <ArrowForwardIcon sx={{ color: "#94A3B8" }} />

        <Box sx={{ bgcolor: "#F8FAFC", p: 1.75, borderRadius: "10px", border: "1px solid #E2E8F0", minWidth: 120 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase" }}>AFTER FIX</Typography>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 24,
              fontWeight: 800,
              color: fix.status === "REGRESSED" ? "#DC2626" : fix.status === "IMPROVED" ? "#059669" : "#475569",
              mt: 0.5,
            }}
          >
            {formatMs(fix.afterAvgDurationMs)}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>{fix.afterSampleCount ?? 0} samples</Typography>
        </Box>

        {hasVerdict && (
          <Box sx={{ marginLeft: "auto", textAlign: "right" }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 28,
                fontWeight: 800,
                color: fix.improvementPercent >= 0 ? "#059669" : "#DC2626",
                lineHeight: 1,
              }}
            >
              {fix.improvementPercent >= 0 ? "−" : "+"}
              {Math.abs(fix.improvementPercent).toFixed(0)}%
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: fix.improvementPercent >= 0 ? "#065F46" : "#991B1B", mt: 0.5 }}>
              {fix.improvementPercent >= 0 ? "Faster Execution" : "Slower Execution"}
            </Typography>
          </Box>
        )}

        {!hasVerdict && fix.status === "WATCHING" && (
          <Typography sx={{ marginLeft: "auto", fontSize: 13, color: "#64748B", maxWidth: 280, textAlign: "right", fontStyle: "italic" }}>
            {fix.verdictNote || "Collecting post-fix telemetry samples (need 5+ requests for live verdict)."}
          </Typography>
        )}
      </Box>

      {fix.status === "NO_CHANGE" && fix.verdictNote && (
        <Typography sx={{ fontSize: 12.5, color: "#92400E", marginTop: 1.5, fontStyle: "italic" }}>
          {fix.verdictNote}
        </Typography>
      )}
    </Paper>
  );
}

function Fixes({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { comparisons, loading, error, refetch } = useFixes(selectedApp);
  const safeComparisons = Array.isArray(comparisons) ? comparisons : [];

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
              Fix Verification & Impact Tracking
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 680 }}>
              Track latency improvements after shipping code changes. Baseline metrics freeze when marked fixed on Diagnosis page; live post-fix metrics recompute from fresh traffic.
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
            Refresh Metrics
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
            Could not reach VeloxDiag server — showing cached fix tracking data
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : safeComparisons.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}>
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              No Fixes Marked Yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 480, mx: "auto", lineHeight: 1.6 }}>
              No fixes tracked for <strong>{selectedApp || "this application"}</strong>. Go to the <strong>Diagnosis</strong> page and click "Mark as Fixed" when you deploy an optimization to measure its live impact.
            </Typography>
          </Paper>
        ) : (
          safeComparisons.map((fix) => <FixCard key={fix.id} fix={fix} />)
        )}
      </Box>
    </>
  );
}

export default Fixes;
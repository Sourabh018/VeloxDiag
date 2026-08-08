import { Box, Typography, Paper, CircularProgress, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "../components/Header";
import useFixes from "../hooks/useFixes";
import { useSelectedApp } from "../contexts/AppContext";

const statusStyle = {
  WATCHING: { color: "#8A93A3", bg: "rgba(138,147,163,0.12)", label: "Watching" },
  IMPROVED: { color: "#8FD9A8", bg: "rgba(143,217,168,0.12)", label: "Improved" },
  NO_CHANGE: { color: "#F0C989", bg: "rgba(217,162,75,0.12)", label: "No Change" },
  REGRESSED: { color: "#F5A3A3", bg: "rgba(229,72,77,0.12)", label: "Regressed" },
};

function StatusTag({ status }) {
  const style = statusStyle[status] ?? statusStyle.WATCHING;
  return (
    <Typography
      sx={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 11.5,
        letterSpacing: "0.03em",
        color: style.color,
        backgroundColor: style.bg,
        padding: "3px 10px",
        borderRadius: 10,
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </Typography>
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
      variant="outlined"
      sx={{
        padding: "16px 18px",
        marginBottom: 1.25,
        borderColor: fix.status === "REGRESSED" ? "rgba(229,72,77,0.25)" : "rgba(255,255,255,0.07)",
        borderRadius: "10px",
        backgroundColor: "#111113",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1 }}>
        <Box>
          <Typography sx={{ fontFamily: "ui-monospace, monospace", fontSize: 14, color: "#EDEDEF" }}>
            {fix.endpoint}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6B7280", marginTop: 0.25 }}>
            {fix.ruleType} · marked fixed {new Date(fix.markedFixedAt).toLocaleString()}
          </Typography>
        </Box>
        <StatusTag status={fix.status} />
      </Box>

      {fix.note && (
        <Typography sx={{ fontSize: 13, color: "#8C8C93", marginBottom: 1.5, fontStyle: "italic" }}>
          "{fix.note}"
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: "#57575F", letterSpacing: "0.03em" }}>BEFORE</Typography>
          <Typography sx={{ fontFamily: "ui-monospace, monospace", fontSize: 20, color: "#B0B0B6" }}>
            {formatMs(fix.beforeAvgDurationMs)}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#57575F" }}>{fix.beforeSampleCount ?? 0} samples</Typography>
        </Box>

        <Typography sx={{ fontSize: 20, color: "#57575F" }}>→</Typography>

        <Box>
          <Typography sx={{ fontSize: 11, color: "#57575F", letterSpacing: "0.03em" }}>AFTER</Typography>
          <Typography
            sx={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 20,
              color: fix.status === "REGRESSED" ? "#F5A3A3" : fix.status === "IMPROVED" ? "#8FD9A8" : "#B0B0B6",
            }}
          >
            {formatMs(fix.afterAvgDurationMs)}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#57575F" }}>{fix.afterSampleCount ?? 0} samples</Typography>
        </Box>

        {hasVerdict && (
          <Box sx={{ marginLeft: "auto" }}>
            <Typography
              sx={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 22,
                fontWeight: 600,
                color: fix.improvementPercent >= 0 ? "#8FD9A8" : "#F5A3A3",
              }}
            >
              {fix.improvementPercent >= 0 ? "−" : "+"}
              {Math.abs(fix.improvementPercent).toFixed(0)}%
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#57575F" }}>
              {fix.improvementPercent >= 0 ? "faster" : "slower"}
            </Typography>
          </Box>
        )}

        {!hasVerdict && fix.status === "WATCHING" && (
          <Typography sx={{ marginLeft: "auto", fontSize: 12.5, color: "#6B7280" }}>
            Waiting for more traffic since the fix to give a verdict.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function Fixes() {
  const { selectedApp } = useSelectedApp();
  const { comparisons, loading, error, refetch } = useFixes(selectedApp);

  return (
    <>
      <Header />
      <Box sx={{ marginLeft: "220px", marginTop: "64px", padding: 4 }}>

        {error && (
          <Typography
            sx={{
              display: "inline-block",
              fontSize: 13.5,
              color: "#F5A3A3",
              border: "1px solid rgba(229,72,77,0.25)",
              backgroundColor: "rgba(229,72,77,0.08)",
              borderRadius: 10,
              padding: "4px 12px",
              marginBottom: 2,
            }}
          >
            Could not reach VeloxDiag server — showing last known data
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Typography sx={{ fontSize: 16.5, fontWeight: 500, color: "#EDEDEF" }}>
            Fixes
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={refetch}
            sx={{ textTransform: "none", fontSize: 13, color: "#8C8C93" }}
          >
            Refresh
          </Button>
        </Box>

        <Typography sx={{ fontSize: 14, color: "#8C8C93", marginBottom: 2.5 }}>
          Mark a finding as fixed from the Diagnosis page — before-metrics freeze at that moment,
          after-metrics recompute live from traffic since. Needs at least 5 fresh requests before
          giving a verdict; a fix that regresses gets flagged here too, not just praised once.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress size={24} sx={{ color: "text.disabled" }} />
          </Box>
        ) : comparisons.length === 0 ? (
          <Typography sx={{ fontSize: 14.5, color: "text.secondary" }}>
            No fixes marked yet for {selectedApp || "this application"}. Go to the Diagnosis
            page and mark a finding as fixed once you've shipped a change for it.
          </Typography>
        ) : (
          comparisons.map((fix) => <FixCard key={fix.id} fix={fix} />)
        )}
      </Box>
    </>
  );
}

export default Fixes;
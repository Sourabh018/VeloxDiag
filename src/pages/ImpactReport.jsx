import { useMemo } from "react";
import { Box, Typography, Paper, CircularProgress, Chip, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldIcon from "@mui/icons-material/VerifiedUser";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Header from "../components/Header";
import useFixes from "../hooks/useFixes";
import { useSelectedApp } from "../contexts/AppContext";

/**
 * "Impact Report" — the shareable proof page.
 *
 * Deliberately reuses the exact same GET /api/fixes data as the Fixes page
 * (FixSnapshot before/after, computed live from real telemetry) rather than
 * inventing a separate summary endpoint — the whole point is that every
 * number on this page is traceable back to the same live comparisons an
 * engineer sees on the Fixes page. Nothing here is a separately-computed or
 * hand-entered figure.
 *
 * Two sections, both driven by the same fetch:
 *   1. Headline stats + "Confirmed Wins" — only IMPROVED fixes, the
 *      strongest form of proof (real before/after, verified against the
 *      endpoint's own noise band, not just a raw percentage).
 *   2. Full Fix Log — every fix ever marked, including WATCHING/NO_CHANGE/
 *      REGRESSED, so the page doesn't cherry-pick. A regression shown next
 *      to a win is more credible than a wins-only highlight reel.
 *
 * This is currently gated behind the same dashboard login as the rest of
 * the app (no public/unauthenticated route exists yet — VeloxDiag has no
 * client-side router, so a true no-login shareable URL would need either
 * react-router or a separate static build, plus a new backend endpoint
 * that bypasses AppOwnershipFilter). Today this is "proof you can screen-
 * share or screenshot"; a truly public link is a follow-up, not this page.
 */

const statusMeta = {
  WATCHING: { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1", label: "Watching" },
  IMPROVED: { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", label: "Improved" },
  NO_CHANGE: { color: "#92400E", bg: "#FFFBEB", border: "#FCD34D", label: "No Change" },
  REGRESSED: { color: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5", label: "Regressed" },
};

function formatMs(v) {
  if (v === null || v === undefined) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}s`;
  return `${Math.round(v)}ms`;
}

function StatusChip({ status }) {
  const meta = statusMeta[status] ?? statusMeta.WATCHING;
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
        fontWeight: 700,
        color: meta.color,
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        height: 22,
        borderRadius: "6px",
      }}
    />
  );
}

function HeadlineStat({ label, value, sub, accent }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: "1 1 200px",
        p: 2.5,
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        bgcolor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, fontWeight: 800, color: accent || "#0F172A", mt: 0.5, lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: 12.5, color: "#94A3B8", mt: 0.75 }}>{sub}</Typography>
      )}
    </Paper>
  );
}

function WinCard({ fix }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: "1px solid #A7F3D0",
        borderRadius: "12px",
        bgcolor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace', fontSize: 14.5, fontWeight: 700, color: "#0F172A" }}>
            {fix.endpoint}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748B", mt: 0.25 }}>
            {fix.ruleType} · shipped {new Date(fix.markedFixedAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, fontWeight: 800, color: "#059669", lineHeight: 1 }}>
            −{Math.abs(fix.improvementPercent).toFixed(0)}%
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#065F46", fontWeight: 700 }}>faster</Typography>
        </Box>
      </Box>

      {fix.note && (
        <Typography sx={{ fontSize: 12.5, color: "#334155", fontStyle: "italic", mb: 1.5 }}>
          "{fix.note}"
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ bgcolor: "#F8FAFC", px: 1.75, py: 1, borderRadius: "8px", border: "1px solid #E2E8F0" }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.05em" }}>BEFORE</Typography>
          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, fontWeight: 700, color: "#475569" }}>
            {formatMs(fix.beforeAvgDurationMs)}
          </Typography>
        </Box>
        <ArrowForwardIcon sx={{ color: "#A7F3D0", fontSize: 18 }} />
        <Box sx={{ bgcolor: "#ECFDF5", px: 1.75, py: 1, borderRadius: "8px", border: "1px solid #A7F3D0" }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#065F46", letterSpacing: "0.05em" }}>AFTER</Typography>
          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, fontWeight: 700, color: "#059669" }}>
            {formatMs(fix.afterAvgDurationMs)}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11.5, color: "#94A3B8", ml: "auto" }}>
          verified on {fix.afterSampleCount ?? 0} live requests
        </Typography>
      </Box>
    </Paper>
  );
}

function LogRow({ fix }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
        py: 1.5,
        px: 2,
        borderBottom: "1px solid #F1F5F9",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box sx={{ minWidth: 200 }}>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
          {fix.endpoint}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>
          {fix.ruleType} · {new Date(fix.markedFixedAt).toLocaleDateString()}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 12.5, color: "#64748B", fontFamily: '"JetBrains Mono", monospace' }}>
        {formatMs(fix.beforeAvgDurationMs)} → {formatMs(fix.afterAvgDurationMs)}
      </Typography>
      <StatusChip status={fix.status} />
    </Box>
  );
}

function ImpactReport({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { comparisons, loading, error, refetch } = useFixes(selectedApp);
  const safeComparisons = useMemo(
    () => (Array.isArray(comparisons) ? comparisons : []),
    [comparisons]
  );

  const { wins, totalShipped, avgImprovement, totalSamplesVerified } = useMemo(() => {
    const wins = safeComparisons
      .filter((f) => f.status === "IMPROVED" && f.improvementPercent != null)
      .sort((a, b) => b.improvementPercent - a.improvementPercent);

    const avgImprovement = wins.length
      ? wins.reduce((sum, f) => sum + f.improvementPercent, 0) / wins.length
      : null;

    const totalSamplesVerified = safeComparisons.reduce(
      (sum, f) => sum + (f.afterSampleCount || 0),
      0
    );

    return { wins, totalShipped: safeComparisons.length, avgImprovement, totalSamplesVerified };
  }, [safeComparisons]);

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <ShieldIcon sx={{ fontSize: 20, color: "#2563EB" }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
                Impact Report
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 680 }}>
              Every number below comes straight from live telemetry via the same before/after comparison the Fixes page
              uses — nothing here is hand-entered or separately computed. Scoped to <strong>{selectedApp || "this application"}</strong>.
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
            Could not reach VeloxDiag server — showing cached data
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : totalShipped === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF" }}>
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              No Fixes Marked Yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 480, mx: "auto", lineHeight: 1.6 }}>
              This report fills in as fixes get marked on the Diagnosis page for <strong>{selectedApp || "this application"}</strong>.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Headline stats */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
              <HeadlineStat label="Fixes Shipped" value={totalShipped} sub="marked fixed and tracked" />
              <HeadlineStat
                label="Confirmed Wins"
                value={wins.length}
                sub="verified against noise, not just a raw %"
                accent="#059669"
              />
              <HeadlineStat
                label="Avg. Improvement"
                value={avgImprovement != null ? `−${avgImprovement.toFixed(0)}%` : "—"}
                sub={wins.length ? "across confirmed wins" : "no confirmed wins yet"}
                accent="#059669"
              />
              <HeadlineStat
                label="Live Requests Verified"
                value={totalSamplesVerified.toLocaleString()}
                sub="real traffic, not synthetic benchmarks"
              />
            </Box>

            {/* Confirmed wins */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "0.02em", mb: 1.5 }}>
              CONFIRMED WINS
            </Typography>
            {wins.length === 0 ? (
              <Paper elevation={0} sx={{ p: 3, mb: 4, border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF" }}>
                <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                  No fix has cleared the noise-band verdict yet — see the full log below for fixes still being watched.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ mb: 4 }}>
                {wins.map((fix) => (
                  <WinCard key={fix.id} fix={fix} />
                ))}
              </Box>
            )}

            {/* Full transparency log */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "0.02em", mb: 1.5 }}>
              FULL FIX LOG ({totalShipped})
            </Typography>
            <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF", overflow: "hidden" }}>
              {safeComparisons.map((fix) => (
                <LogRow key={fix.id} fix={fix} />
              ))}
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}

export default ImpactReport;
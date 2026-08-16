import { Box, Typography, CircularProgress, Paper, Chip, Alert, Stack } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Header from "../components/Header";
import useIndexAdvisor from "../hooks/useIndexAdvisor";

function IndexAdvisor({ onMobileMenuToggle }) {
  const { candidates, loading, error } = useIndexAdvisor();

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
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BoltIcon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              Index Advisor
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Flags endpoints that are slow on every call rather than only under load — a pattern
            often associated with a missing database index.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server — showing last known data
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            p: "14px 18px",
            borderRadius: "10px",
            mb: 3,
            bgcolor: "#EFF6FF",
            border: "1px solid #BFDBFE",
          }}
        >
          <InfoOutlinedIcon fontSize="small" sx={{ color: "#2563EB", mt: 0.1, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 13.5, color: "#1E40AF", lineHeight: 1.6 }}>
            <strong>Heuristic Mode</strong> — Superseded by EXPLAIN-based Missing Index Candidate findings on Diagnosis page.
            Based on low response-time variance across calls. Treat findings here as actionable leads for index optimization.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : candidates.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 5, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
          >
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              No Candidates Found
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 460, mx: "auto", lineHeight: 1.6 }}>
              No endpoints are currently slow with low variance, or there isn't enough sample data yet
              (requires at least 3 requests per endpoint).
            </Typography>
          </Paper>
        ) : (
          candidates.map((c, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                mb: 2,
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                transition: "all 0.15s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)", borderColor: "#CBD5E1" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, gap: 2, flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: "#0F172A",
                    wordBreak: "break-all",
                  }}
                >
                  {c.endpoint}
                </Typography>
                <Chip
                  label={`avg ${c.avgDurationMs.toFixed(0)}ms`}
                  size="small"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#92400E",
                    bgcolor: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    height: 24,
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                />
              </Box>

              <Typography sx={{ fontSize: 13.5, color: "#334155", mb: 2, lineHeight: 1.6 }}>
                {c.message}
              </Typography>

              <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: "#64748B",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  stdDev: <strong style={{ color: "#0F172A" }}>{c.stdDeviationMs.toFixed(0)}ms</strong>
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: "#64748B",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  cv: <strong style={{ color: "#0F172A" }}>{c.coefficientOfVariation.toFixed(2)}</strong>
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: "#64748B",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  samples: <strong style={{ color: "#0F172A" }}>{c.sampleCount}</strong>
                </Typography>
              </Stack>
            </Paper>
          ))
        )}
      </Box>
    </>
  );
}

export default IndexAdvisor;
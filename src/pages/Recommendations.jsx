import { Box, Typography, CircularProgress, Paper, Chip, Alert } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CodeIcon from "@mui/icons-material/Code";
import Header from "../components/Header";
import FindingCard from "../components/FindingCard";
import useRecommendations from "../hooks/useRecommendations";

function Recommendations({ onMobileMenuToggle }) {
  const { recommendations, loading, error } = useRecommendations();

  const safeRecommendations = {};
  if (recommendations && typeof recommendations === "object" && !Array.isArray(recommendations)) {
    for (const [key, value] of Object.entries(recommendations)) {
      if (Array.isArray(value)) {
        safeRecommendations[key] = value;
      } else if (value !== null && value !== undefined) {
        safeRecommendations[key] = [value];
      }
    }
  }

  const endpoints = Object.keys(safeRecommendations).filter(
    (ep) => safeRecommendations[ep].length > 0
  );

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
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5, letterSpacing: "-0.02em" }}>
            Actionable Recommendations
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Concrete, code-level optimizations and database index recommendations grouped by API endpoint.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server — showing cached recommendation data
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : endpoints.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: "#ECFDF5",
                color: "#059669",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <CheckCircleOutlineIcon fontSize="large" />
            </Box>
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              No Action Required
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 480, mx: "auto", lineHeight: 1.6 }}>
              All monitored endpoints are operating within normal latency and query efficiency limits. No pending recommendations for{" "}
              {recommendations && Object.keys(recommendations).length === 0
                ? "this application — try running a diagnosis scan first."
                : "the current filter."}
            </Typography>
          </Paper>
        ) : (
          endpoints.map((endpoint) => {
            const findings = safeRecommendations[endpoint];
            return (
              <Box key={endpoint} sx={{ marginBottom: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, flexWrap: "wrap" }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      bgcolor: "#EFF6FF",
                      color: "#2563EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CodeIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0F172A",
                    }}
                  >
                    {endpoint}
                  </Typography>
                  <Chip
                    label={`${findings.length} recommendation${findings.length !== 1 ? "s" : ""}`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11.5,
                      fontWeight: 700,
                      bgcolor: "#EFF6FF",
                      color: "#2563EB",
                      border: "1px solid #BFDBFE",
                      borderRadius: "6px",
                    }}
                  />
                </Box>
                {findings.map((finding, i) => (
                  <FindingCard
                    key={`${endpoint}-${i}`}
                    finding={finding}
                    showExplain={false}
                    showSuggestion
                    compact
                  />
                ))}
              </Box>
            );
          })
        )}
      </Box>
    </>
  );
}

export default Recommendations;
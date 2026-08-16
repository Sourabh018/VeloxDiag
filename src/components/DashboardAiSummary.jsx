import { useState } from "react";
import { Box, Typography, Button, CircularProgress, Divider } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import apiClient from "../api/client";

function DashboardAiSummary({ applicationName }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(false);
    try {
      const appParam = applicationName ? { applicationName } : {};
      const res = await apiClient.get("/api/dashboard/ai-summary", { params: appParam });
      setSummary(res.data.summary);
    } catch (err) {
      console.error("AI summary fetch failed:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FAFBFF 100%)",
        border: "1px solid #C7D2FE",
        borderRadius: "16px",
        mb: 3,
        boxShadow: "0 2px 12px rgba(99, 102, 241, 0.07)",
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: "rgba(139, 92, 246, 0.07)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -20,
          left: "40%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "rgba(99, 102, 241, 0.06)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", p: { xs: 2.5, sm: 3 } }}>
        {!summary && !loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#312E81",
                    letterSpacing: "-0.02em",
                    mb: 0.2,
                  }}
                >
                  AI Performance Diagnostics
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "#6366F1", fontWeight: 500, lineHeight: 1.4 }}>
                  Get an instant natural-language synthesis of system health, active bottlenecks, and
                  anomalies across all telemetry.
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={fetchSummary}
              variant="contained"
              startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 13,
                px: 2.5,
                py: 1,
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                "&:hover": {
                  background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                  boxShadow: "0 6px 16px rgba(99, 102, 241, 0.45)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Summarize with AI
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 0.5 }}>
            <CircularProgress size={20} sx={{ color: "#6366F1" }} />
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#312E81" }}>
                Analyzing system telemetry...
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6366F1" }}>
                Scanning metrics, rule findings, and anomalies with AI
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#DC2626" }}>
              ⚠ Couldn't generate AI summary — please check your AI provider configuration and try again.
            </Typography>
          </Box>
        )}

        {summary && !loading && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6366F1",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  AI Performance Summary
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                  Generated just now · {applicationName || "All applications"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#E0E7FF", mb: 2 }} />

            <Typography
              sx={{
                fontSize: 14.5,
                color: "#1E1B4B",
                lineHeight: 1.7,
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {summary}
            </Typography>

            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 0.75 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: "#059669" }} />
              <Typography sx={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
                Analysis complete
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#94A3B8", ml: 0.5 }}>
                · Powered by VeloxDiag AI
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DashboardAiSummary;
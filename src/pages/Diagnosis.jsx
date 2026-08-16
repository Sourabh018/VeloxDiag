import { Box, Typography, CircularProgress, Paper, Chip, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import Header from "../components/Header";
import FindingCard from "../components/FindingCard";
import useDiagnosis from "../hooks/useDiagnosis";
import { useSelectedApp } from "../contexts/AppContext";

function Diagnosis({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { findings, loading, error } = useDiagnosis({ applicationName: selectedApp });

  const safeFindings = Array.isArray(findings) ? findings : [];
  const highCount = safeFindings.filter((f) => f.severity === "HIGH").length;
  const mediumCount = safeFindings.filter((f) => f.severity === "MEDIUM").length;
  const lowCount = safeFindings.filter((f) => f.severity === "LOW").length;

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
            Diagnosis Findings
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Automated rule-engine findings for <strong style={{ color: "#0F172A" }}>{selectedApp || "Selected Application"}</strong>.
            Click any finding to generate plain-English AI root cause explanations or mark fixes as shipped.
          </Typography>
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
            Could not reach VeloxDiag server — showing cached diagnosis data
          </Box>
        )}

        {!loading && safeFindings.length > 0 && (
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`${safeFindings.length} Total Finding${safeFindings.length !== 1 ? "s" : ""}`}
              sx={{ fontWeight: 700, bgcolor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A" }}
            />
            {highCount > 0 && (
              <Chip
                label={`${highCount} Critical`}
                sx={{ fontWeight: 700, bgcolor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" }}
              />
            )}
            {mediumCount > 0 && (
              <Chip
                label={`${mediumCount} Warning`}
                sx={{ fontWeight: 700, bgcolor: "#FFFBEB", border: "1px solid #FCD34D", color: "#92400E" }}
              />
            )}
            {lowCount > 0 && (
              <Chip
                label={`${lowCount} Info`}
                sx={{ fontWeight: 700, bgcolor: "#EFF6FF", border: "1px solid #93C5FD", color: "#1E40AF" }}
              />
            )}
          </Stack>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : safeFindings.length === 0 ? (
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
              All Systems Healthy
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 480, mx: "auto", lineHeight: 1.6 }}>
              No performance anomalies or rule violations detected for <strong>{selectedApp || "this application"}</strong>. The diagnosis engine continuously scans request durations, error rates, and query plans.
            </Typography>
          </Paper>
        ) : (
          safeFindings.map((finding, i) => (
            <FindingCard key={i} finding={finding} applicationName={selectedApp} />
          ))
        )}
      </Box>
    </>
  );
}

export default Diagnosis;
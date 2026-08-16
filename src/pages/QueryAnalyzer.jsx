import { Box, Typography, CircularProgress, ToggleButtonGroup, ToggleButton, Alert, Paper } from "@mui/material";
import { useState } from "react";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import Header from "../components/Header";
import TrendCard from "../components/TrendCard";
import useQueryAnalyzer from "../hooks/useQueryAnalyzer";

const filters = [
  { value: "ALL", label: "All Trends" },
  { value: "WORSENING", label: "Worsening" },
  { value: "IMPROVING", label: "Improving" },
  { value: "STABLE", label: "Stable" },
];

function QueryAnalyzer({ onMobileMenuToggle }) {
  const { trends, loading, error } = useQueryAnalyzer();
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? trends : trends.filter((t) => t.trendDirection === filter);

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
                bgcolor: "#F5F3FF",
                color: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QueryStatsIcon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              Query Analyzer
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Per-endpoint response time trends comparing earliest vs. most recent day of data.
            Requires at least 2 days of telemetry per endpoint.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server — showing last known data
          </Alert>
        )}

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, val) => val && setFilter(val)}
          size="small"
          sx={{
            mb: 3,
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            p: 0.5,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#64748B",
              border: "none",
              borderRadius: "8px !important",
              px: 2.5,
              py: 0.75,
              "&.Mui-selected": {
                color: "#2563EB",
                bgcolor: "#EFF6FF",
                fontWeight: 700,
                boxShadow: "0 1px 2px rgba(37, 99, 235, 0.1)",
                "&:hover": { bgcolor: "#DBEAFE" },
              },
              "&:hover": { bgcolor: "#F8FAFC", color: "#0F172A" },
            },
          }}
        >
          {filters.map((f) => (
            <ToggleButton key={f.value} value={f.value}>
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : filtered.length === 0 ? (
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
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              {trends.length === 0 ? "Not Enough History" : "No Matching Trends"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 440, mx: "auto", lineHeight: 1.6 }}>
              {trends.length === 0
                ? "No endpoints have enough history yet — need at least 2 days of data per endpoint."
                : "No endpoints match the selected trend filter."}
            </Typography>
          </Paper>
        ) : (
          filtered.map((trend, i) => <TrendCard key={i} trend={trend} />)
        )}
      </Box>
    </>
  );
}

export default QueryAnalyzer;
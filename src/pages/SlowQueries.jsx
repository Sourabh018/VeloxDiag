import { useState, Fragment } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Collapse,
  Chip,
  Alert,
  Stack,
} from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Header from "../components/Header";
import useDashboardMetrics from "../hooks/useDashboardMetrics";
import { useSelectedApp } from "../contexts/AppContext";
import apiClient from "../api/client";

function severityForDuration(ms) {
  if (ms >= 3000) return { dot: "#DC2626", color: "#991B1B", bgcolor: "#FEF2F2", border: "#FCA5A5", label: "HIGH" };
  if (ms >= 1000) return { dot: "#D97706", color: "#92400E", bgcolor: "#FFFBEB", border: "#FCD34D", label: "MEDIUM" };
  return { dot: "#2563EB", color: "#1E40AF", bgcolor: "#EFF6FF", border: "#BFDBFE", label: "LOW" };
}

function SeverityChip({ avgDuration }) {
  const s = severityForDuration(avgDuration);
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.dot, flexShrink: 0 }} />
      <Chip
        label={s.label}
        size="small"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          fontWeight: 700,
          color: s.color,
          bgcolor: s.bgcolor,
          border: `1px solid ${s.border}`,
          height: 22,
          borderRadius: "6px",
        }}
      />
    </Stack>
  );
}

function QueryPlanCard({ plan }) {
  const [explainExpanded, setExplainExpanded] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(null);

  async function handleToggleExplain() {
    if (explainExpanded) {
      setExplainExpanded(false);
      return;
    }
    setExplainExpanded(true);
    if (explanation !== null) return;

    setExplainLoading(true);
    setExplainError(null);
    try {
      const res = await apiClient.get(`/api/slow-query-plans/${plan.id}/explain`);
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplainError(err.message ?? "Failed to generate explanation");
    } finally {
      setExplainLoading(false);
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        bgcolor: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
          Captured on {new Date(plan.timestamp).toLocaleString()} · {plan.requestDurationMs}ms request
        </Typography>
        <Chip
          label={plan.containsSeqScan ? "Seq Scan Detected" : "Index Used"}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            fontWeight: 700,
            color: plan.containsSeqScan ? "#92400E" : "#065F46",
            bgcolor: plan.containsSeqScan ? "#FFFBEB" : "#ECFDF5",
            border: `1px solid ${plan.containsSeqScan ? "#FCD34D" : "#6EE7B7"}`,
            height: 22,
            borderRadius: "6px",
          }}
        />
      </Box>

      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", mb: 0.5 }}>
        EXECUTED SQL STATEMENT
      </Typography>
      <Box
        component="pre"
        sx={{
          fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
          fontSize: 12.5,
          color: "#F8FAFC",
          bgcolor: "#0F172A",
          borderRadius: "8px",
          p: 2,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          m: 0,
          mb: 2,
        }}
      >
        {plan.sqlText}
      </Box>

      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", mb: 0.5 }}>
        EXPLAIN QUERY PLAN
      </Typography>
      <Box
        component="pre"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          color: "#334155",
          bgcolor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          p: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          m: 0,
          mb: 1.5,
        }}
      >
        {plan.explainPlan}
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="text"
          onClick={handleToggleExplain}
          disabled={explainLoading}
          startIcon={explainLoading ? <CircularProgress size={12} sx={{ color: "#2563EB" }} /> : <AutoAwesomeIcon fontSize="small" />}
          sx={{
            fontSize: 12.5,
            color: "#2563EB",
            p: 0,
            minWidth: 0,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          {explainExpanded ? "Hide AI explanation" : "Explain with AI"}
        </Button>

        {explainExpanded && (
          <Box sx={{ mt: 1.5 }}>
            {explainError && (
              <Typography variant="caption" color="error">{explainError}</Typography>
            )}
            {explanation && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "8px",
                  bgcolor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                }}
              >
                <Typography sx={{ fontSize: 13.5, color: "#1E40AF", lineHeight: 1.6 }}>
                  {explanation}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

function SlowQueries({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { slowEndpoints, loading, error } = useDashboardMetrics({ applicationName: selectedApp });
  const safeSlowEndpoints = Array.isArray(slowEndpoints) ? slowEndpoints : [];

  const sorted = [...safeSlowEndpoints].sort((a, b) => b.avgDuration - a.avgDuration);

  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [plansByEndpoint, setPlansByEndpoint] = useState({});
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);

  async function handleRowClick(endpoint) {
    if (expandedEndpoint === endpoint) {
      setExpandedEndpoint(null);
      return;
    }
    setExpandedEndpoint(endpoint);
    if (plansByEndpoint[endpoint] !== undefined) return;

    setPlansLoading(true);
    setPlansError(null);
    try {
      const res = await apiClient.get("/api/slow-query-plans", { params: { endpoint } });
      setPlansByEndpoint((prev) => ({ ...prev, [endpoint]: res.data }));
    } catch (err) {
      setPlansError(err.message ?? "Failed to load query plans");
    } finally {
      setPlansLoading(false);
    }
  }

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
                bgcolor: "#FFFBEB",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HourglassBottomIcon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              Slow Queries & Execution Plans
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Endpoints averaging above the slow-request threshold, sorted worst-first.
            Click a row to inspect captured database query statements and EXPLAIN plans.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server — showing last known data
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : sorted.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 5, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
          >
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 800, mb: 0.5 }}>
              No Slow Endpoints
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              All endpoints are within the performance threshold for{" "}
              <strong>{selectedApp || "this application"}</strong>.
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
          >
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Endpoint", "Avg Duration", "Samples", "Severity", ""].map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.map((ep, i) => {
                    const isExpanded = expandedEndpoint === ep.endpoint;
                    const plans = plansByEndpoint[ep.endpoint];
                    return (
                      <Fragment key={i}>
                        <TableRow
                          onClick={() => handleRowClick(ep.endpoint)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#F8FAFC" },
                            bgcolor: isExpanded ? "#EFF6FF" : "transparent",
                            transition: "background-color 0.15s",
                          }}
                        >
                          <TableCell
                            sx={{
                              fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                              fontSize: 13.5,
                              color: "#0F172A",
                              fontWeight: 700,
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ep.endpoint}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: 13.5,
                              color: "#0F172A",
                              fontVariantNumeric: "tabular-nums",
                              fontWeight: 700,
                            }}
                          >
                            {ep.avgDuration.toFixed(0)}ms
                          </TableCell>
                          <TableCell sx={{ fontSize: 13.5, color: "#475569", fontWeight: 500 }}>
                            {ep.count}
                          </TableCell>
                          <TableCell>
                            <SeverityChip avgDuration={ep.avgDuration} />
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>
                            {isExpanded ? (
                              <ExpandLessIcon fontSize="small" sx={{ color: "#2563EB" }} />
                            ) : (
                              <ExpandMoreIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow key={`${i}-expand`}>
                          <TableCell colSpan={5} sx={{ p: isExpanded ? "20px" : 0, border: 0, bgcolor: "#F8FAFC" }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              {plansLoading && !plans && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
                                  <CircularProgress size={16} sx={{ color: "#2563EB" }} />
                                  <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
                                    Loading captured query plans...
                                  </Typography>
                                </Box>
                              )}
                              {plansError && !plans && (
                                <Typography variant="caption" color="error">{plansError}</Typography>
                              )}
                              {plans?.length === 0 && (
                                <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                  No captured query plans found for this endpoint.
                                </Typography>
                              )}
                              {plans?.map((plan) => (
                                <QueryPlanCard key={plan.id} plan={plan} />
                              ))}
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        )}
      </Box>
    </>
  );
}

export default SlowQueries;
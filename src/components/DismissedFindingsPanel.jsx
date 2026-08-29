import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import apiClient from "../api/client";

const ruleTypeLabel = {
  SLOW_REQUEST: "Slow Request",
  HIGH_ERROR_RATE: "High Error Rate",
  SERVER_ERROR: "Server Error",
  POSSIBLE_N_PLUS_ONE: "Possible N+1 Query",
  MISSING_INDEX_CANDIDATE: "Missing Index Candidate",
};

function formatRuleType(ruleType) {
  return (
    ruleTypeLabel[ruleType] ??
    ruleType
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

// Lists every dismissed (endpoint, ruleType) fingerprint for the current
// application, independent of whether it's currently appearing in the live
// Diagnosis Findings list — a dismissed finding that stopped firing (e.g.
// the underlying issue went quiet on its own) would otherwise be invisible
// and impossible to manage from the Diagnosis page alone.
function DismissedFindingsPanel({ applicationName, onRestored }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = applicationName ? { applicationName } : {};
      const res = await apiClient.get("/api/dismissed-findings", { params });
      setDismissed(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message ?? "Failed to load dismissed findings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (expanded) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, applicationName]);

  async function handleRestore(item) {
    setRestoringId(item.id);
    try {
      await apiClient.delete("/api/dismissed-findings", {
        params: { applicationName, endpoint: item.endpoint, ruleType: item.ruleType },
      });
      setDismissed((prev) => prev.filter((d) => d.id !== item.id));
      onRestored?.();
    } catch (err) {
      setError(err.message ?? "Failed to restore finding");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        size="small"
        variant="text"
        onClick={() => setExpanded((v) => !v)}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ fontSize: 13, textTransform: "none", fontWeight: 600, color: "#64748B", padding: 0, minWidth: 0 }}
      >
        Dismissed findings
      </Button>

      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{
            mt: 1.5,
            p: 2,
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            bgcolor: "#FFFFFF",
          }}
        >
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
              <CircularProgress size={20} sx={{ color: "#64748B" }} />
            </Box>
          )}

          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}

          {!loading && dismissed.length === 0 && !error && (
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              No dismissed findings for this application.
            </Typography>
          )}

          {dismissed.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                padding: "10px 0",
                borderBottom: "1px solid #F1F5F9",
                "&:last-of-type": { borderBottom: "none" },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {item.endpoint}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "#475569" }}>
                  {formatRuleType(item.ruleType)}
                  {item.dismissedAt ? ` · dismissed ${new Date(item.dismissedAt).toLocaleDateString()}` : ""}
                  {item.note ? ` · "${item.note}"` : ""}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                onClick={() => handleRestore(item)}
                disabled={restoringId === item.id}
                sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 700, color: "#2563EB", padding: 0, minWidth: 0 }}
              >
                {restoringId === item.id ? "Restoring..." : "Restore"}
              </Button>
            </Box>
          ))}
        </Paper>
      </Collapse>
    </Box>
  );
}

export default DismissedFindingsPanel;
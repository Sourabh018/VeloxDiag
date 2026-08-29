import { useState, useEffect } from "react";
import { Box, Typography, Chip, Paper, Button, CircularProgress } from "@mui/material";
import apiClient from "../api/client";

const severityStyle = {
  HIGH: { dot: "#DC2626", text: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5" },
  MEDIUM: { dot: "#D97706", text: "#92400E", bg: "#FFFBEB", border: "#FCD34D" },
  LOW: { dot: "#2563EB", text: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" },
};

const ruleTypeLabel = {
  SLOW_REQUEST: "Slow Request",
  HIGH_ERROR_RATE: "High Error Rate",
  SERVER_ERROR: "Server Error",
  POSSIBLE_N_PLUS_ONE: "Possible N+1 Query",
  ROOT_CAUSE_CORRELATION: "Root Cause Insight",
};

function formatUnknownRuleType(ruleType) {
  return ruleType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRuleTypeLabel(ruleType) {
  return ruleTypeLabel[ruleType] ?? formatUnknownRuleType(ruleType);
}

function formatEvidenceValue(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value)
      .map(([k, v]) => `${k} (${v} rows)`)
      .join(", ");
  }
  return String(value);
}

const EVIDENCE_KEYS_SHOWN_SEPARATELY = ["conditionMatched", "insufficientSampleSize"];

function SeverityTag({ severity }) {
  const style = severityStyle[severity] ?? severityStyle.LOW;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: style.dot }} />
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.03em",
          color: style.text,
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          padding: "2px 8px",
          borderRadius: "6px",
        }}
      >
        {severity}
      </Typography>
    </Box>
  );
}

const confidenceStyle = {
  HIGH: { color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
  MEDIUM: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  LOW: { color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
};

function ConfidenceTag({ confidence }) {
  if (!confidence) return null;
  const style = confidenceStyle[confidence] ?? confidenceStyle.LOW;
  return (
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        padding: "2px 7px",
        borderRadius: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {confidence} CONFIDENCE
    </Typography>
  );
}

const NO_SUGGESTION_TYPES = ["HIGH_ERROR_RATE", "SERVER_ERROR", "ROOT_CAUSE_CORRELATION"];

function AiEnhancedTag({ aiEnhanced }) {
  const style = aiEnhanced
    ? { color: "#047857", bg: "#ECFDF5", border: "#A7F3D0", label: "AI-grounded fix" }
    : { color: "#64748B", bg: "#F1F5F9", border: "#CBD5E1", label: "Generic — no query captured" };
  return (
    <Typography
      sx={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        padding: "2px 8px",
        borderRadius: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </Typography>
  );
}

function FindingCard({ finding, applicationName, showExplain = true, showSuggestion = false, autoFetchSuggestion = false, fetchDelayMs = 0, compact = false }) {
  const { ruleType, severity, endpoint, message, evidence, relatedFindings, confidence, aiEnhanced } = finding;
  const isCorrelation = ruleType === "ROOT_CAUSE_CORRELATION";
  const isCustomRule = !(ruleType in ruleTypeLabel) && !isCorrelation;
  const isMissingIndex = ruleType === "MISSING_INDEX_CANDIDATE";
  const conditionMatched = evidence?.conditionMatched;
  const canDismiss = !isCorrelation;

  const [plansExpanded, setPlansExpanded] = useState(false);
  const [plans, setPlans] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);

  const [narrativeExpanded, setNarrativeExpanded] = useState(false);
  const [narrative, setNarrative] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState(null);

  const [suggestionExpanded, setSuggestionExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);

  const [fixExpanded, setFixExpanded] = useState(false);
  const [fixNote, setFixNote] = useState("");
  const [fixSaving, setFixSaving] = useState(false);
  const [fixSaved, setFixSaved] = useState(false);
  const [fixError, setFixError] = useState(null);
  const canMarkFixed = !isCorrelation;

  const [dismissedInfo, setDismissedInfo] = useState(finding.dismissedInfo ?? null);
  const [dismissExpanded, setDismissExpanded] = useState(false);
  const [dismissNote, setDismissNote] = useState("");
  const [dismissSaving, setDismissSaving] = useState(false);
  const [dismissError, setDismissError] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    setDismissedInfo(finding.dismissedInfo ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finding.dismissedInfo]);

  async function handleDismiss() {
    if (!applicationName || !endpoint || !ruleType) return;
    setDismissSaving(true);
    setDismissError(null);
    try {
      const res = await apiClient.post("/api/dismissed-findings", null, {
        params: { applicationName, endpoint, ruleType, note: dismissNote || undefined },
      });
      setDismissedInfo({ dismissedAt: res.data.dismissedAt, note: res.data.note });
      setDismissExpanded(false);
    } catch (err) {
      setDismissError(err.message ?? "Failed to dismiss finding");
    } finally {
      setDismissSaving(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setDismissError(null);
    try {
      await apiClient.delete("/api/dismissed-findings", {
        params: { applicationName, endpoint, ruleType },
      });
      setDismissedInfo(null);
    } catch (err) {
      setDismissError(err.message ?? "Failed to restore finding");
    } finally {
      setRestoring(false);
    }
  }

  async function handleMarkFixed() {
    if (!applicationName || !endpoint || !ruleType) return;
    setFixSaving(true);
    setFixError(null);
    try {
      await apiClient.post("/api/fixes", null, {
        params: { applicationName, endpoint, ruleType, note: fixNote || undefined },
      });
      setFixSaved(true);
      setFixExpanded(false);
    } catch (err) {
      setFixError(err.message ?? "Failed to mark as fixed");
    } finally {
      setFixSaving(false);
    }
  }

  async function handleToggleplans() {
    if (plansExpanded) {
      setPlansExpanded(false);
      return;
    }
    setPlansExpanded(true);
    if (plans !== null) return;

    setPlansLoading(true);
    setPlansError(null);
    try {
      const res = await apiClient.get("/api/slow-query-plans", {
        params: { endpoint },
      });
      setPlans(res.data);
    } catch (err) {
      setPlansError(err.message ?? "Failed to load query plans");
    } finally {
      setPlansLoading(false);
    }
  }

  async function handleToggleNarrative() {
    if (narrativeExpanded) {
      setNarrativeExpanded(false);
      return;
    }
    setNarrativeExpanded(true);
    if (narrative !== null) return;

    setNarrativeLoading(true);
    setNarrativeError(null);
    try {
      const res = await apiClient.get("/api/diagnosis/narrative", {
        params: { endpoint, applicationName },
      });
      setNarrative(res.data.narrative);
    } catch (err) {
      setNarrativeError(err.message ?? "Failed to generate explanation");
    } finally {
      setNarrativeLoading(false);
    }
  }

  const canSuggest = !NO_SUGGESTION_TYPES.includes(ruleType);

  async function fetchSuggestion() {
    setSuggestionLoading(true);
    setSuggestionError(null);
    try {
      const res = await apiClient.get("/api/diagnosis/recommendations/explain", {
        params: { endpoint, ruleType },
      });
      setSuggestion(res.data.suggestion);
    } catch (err) {
      setSuggestionError(err.message ?? "Failed to generate suggestion");
    } finally {
      setSuggestionLoading(false);
    }
  }

  useEffect(() => {
    if (showSuggestion && autoFetchSuggestion && canSuggest) {
      setSuggestionExpanded(true);
      const timer = setTimeout(fetchSuggestion, fetchDelayMs);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleSuggestion() {
    if (suggestionExpanded) {
      setSuggestionExpanded(false);
      return;
    }
    setSuggestionExpanded(true);
    if (suggestion !== null) return;
    await fetchSuggestion();
  }

  const reopenedInfo = finding.reopenedInfo;

  return (
    <Paper
      elevation={0}
      sx={{
        padding: "18px 20px",
        marginBottom: 1.5,
        borderColor: reopenedInfo
          ? "#FCA5A5"
          : dismissedInfo ? "#E2E8F0" : isCorrelation ? "#BFDBFE" : "#E2E8F0",
        borderRadius: "12px",
        backgroundColor: isCorrelation ? "#F8FAFC" : "#FFFFFF",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        transition: "all 0.15s ease",
        opacity: dismissedInfo ? 0.6 : 1,
        "&:hover": {
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          borderColor: isCorrelation ? "#93C5FD" : "#CBD5E1",
        },
      }}
    >
      {dismissedInfo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            backgroundColor: "#F1F5F9",
            border: "1px solid #CBD5E1",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
            Dismissed{dismissedInfo.dismissedAt ? ` on ${new Date(dismissedInfo.dismissedAt).toLocaleDateString()}` : ""}
            {dismissedInfo.note ? ` ("${dismissedInfo.note}")` : ""}
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={handleRestore}
            disabled={restoring}
            sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 700, color: "#2563EB", padding: 0, minWidth: 0 }}
          >
            {restoring ? "Restoring..." : "Restore"}
          </Button>
        </Box>
      )}

      {reopenedInfo && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}>
            ⚠ Marked fixed on {new Date(reopenedInfo.markedFixedAt).toLocaleDateString()}
            {reopenedInfo.note ? ` ("${reopenedInfo.note}")` : ""} — issue reopened.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1, gap: 2 }}>
        <Typography sx={{ fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace', fontSize: 14.5, fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>
          {endpoint}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {canSuggest && aiEnhanced !== undefined && <AiEnhancedTag aiEnhanced={aiEnhanced} />}
          <ConfidenceTag confidence={confidence} />
          <SeverityTag severity={severity} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
          {getRuleTypeLabel(ruleType)}
        </Typography>
        {isCustomRule && (
          <Chip
            label="Custom Rule"
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: 11, fontWeight: 600, borderColor: "#CBD5E1", color: "#64748B" }}
          />
        )}
      </Box>

      {!compact && (
        <Typography sx={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, marginBottom: 1.25 }}>
          {message}
        </Typography>
      )}

      {isCorrelation && relatedFindings?.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", marginBottom: 1.25 }}>
          {relatedFindings.map((related) => (
            <Typography
              key={related}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1E40AF",
                bgcolor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              {getRuleTypeLabel(related)}
            </Typography>
          ))}
        </Box>
      )}

      {conditionMatched && !compact && (
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: "#475569",
            marginBottom: 1.25,
            paddingLeft: 1.25,
            borderLeft: "3px solid #CBD5E1",
          }}
        >
          Rule matched: {conditionMatched}
        </Typography>
      )}

      {evidence && !compact && (
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11.5,
            color: "#64748B",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Object.entries(evidence)
            .filter(([key]) => !EVIDENCE_KEYS_SHOWN_SEPARATELY.includes(key))
            .map(([key, value]) => `${key}: ${formatEvidenceValue(value)}`)
            .join(" · ")}
        </Typography>
      )}

      {showSuggestion && canSuggest && (
        <Box sx={{ marginTop: 1.5 }}>
          {!autoFetchSuggestion && (
            <Button
              size="small"
              variant="text"
              onClick={handleToggleSuggestion}
              disabled={suggestionLoading}
              sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 600, color: "#059669", padding: 0, minWidth: 0 }}
            >
              {suggestionLoading ? <CircularProgress size={14} sx={{ mr: 1, color: "#059669" }} /> : null}
              {suggestionExpanded ? "Hide suggested fix" : "Show suggested fix"}
            </Button>
          )}

          {(autoFetchSuggestion || suggestionExpanded) && (
            <Box sx={{ marginTop: autoFetchSuggestion ? 0 : 1 }}>
              {suggestionLoading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} sx={{ color: "#059669" }} />
                  <Typography sx={{ fontSize: 12.5, color: "#475569" }}>
                    Generating code fix...
                  </Typography>
                </Box>
              )}

              {suggestionError && (
                <Typography variant="caption" color="error">
                  {suggestionError}
                </Typography>
              )}

              {suggestion && (
                <Box
                  sx={{
                    padding: 2,
                    borderRadius: "8px",
                    backgroundColor: "#0F172A",
                    border: "1px solid #1E293B",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, marginBottom: 1 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#4ADE80", letterSpacing: "0.05em" }}>
                      SUGGESTED CODE OPTIMIZATION
                    </Typography>
                    {aiEnhanced !== undefined && (
                      <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: aiEnhanced ? "#4ADE80" : "#94A3B8" }}>
                        {aiEnhanced ? "Grounded in captured query + EXPLAIN plan" : "Generic template — no query captured yet"}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                      fontSize: 13,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "#F8FAFC",
                      margin: 0,
                    }}
                  >
                    {suggestion}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {isMissingIndex && (
        <Box sx={{ marginTop: 1.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={handleToggleplans}
            sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 600, color: "#2563EB", padding: 0, minWidth: 0 }}
          >
            {plansExpanded ? "Hide query plan" : "Show query plan"}
          </Button>

          {plansExpanded && (
            <Box sx={{ marginTop: 1 }}>
              {plansLoading && <CircularProgress size={16} />}

              {plansError && (
                <Typography variant="caption" color="error">
                  {plansError}
                </Typography>
              )}

              {plans?.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No captured query plans found for this endpoint.
                </Typography>
              )}

              {plans?.map((plan) => (
                <Paper
                  key={plan.id}
                  elevation={0}
                  sx={{
                    padding: 1.5,
                    marginBottom: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: "8px",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 0.5 }}>
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                      {new Date(plan.timestamp).toLocaleString()} · {plan.requestDurationMs}ms
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        color: plan.containsSeqScan ? "#92400E" : "#065F46",
                        backgroundColor: plan.containsSeqScan ? "#FFFBEB" : "#ECFDF5",
                        border: `1px solid ${plan.containsSeqScan ? "#FCD34D" : "#6EE7B7"}`,
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {plan.containsSeqScan ? "Seq Scan" : "Index Used"}
                    </Typography>
                  </Box>
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "#334155",
                      margin: 0,
                    }}
                  >
                    {plan.explainPlan}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}

      {canMarkFixed && !compact && (
        <Box sx={{ marginTop: 1.5 }}>
          {fixSaved ? (
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#059669" }}>
              ✓ Marked as fixed — track impact on the Fixes page
            </Typography>
          ) : (
            <>
              <Button
                size="small"
                variant="text"
                onClick={() => setFixExpanded((v) => !v)}
                sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 600, color: "#059669", padding: 0, minWidth: 0 }}
              >
                {fixExpanded ? "Cancel" : "Mark as Fixed"}
              </Button>

              {fixExpanded && (
                <Box sx={{ marginTop: 1, display: "flex", gap: 1, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Optional note, e.g. added index on student_id"
                    value={fixNote}
                    onChange={(e) => setFixNote(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 200,
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: 6,
                      padding: "6px 12px",
                      color: "#0F172A",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                  <Button
                    size="small"
                    onClick={handleMarkFixed}
                    disabled={fixSaving}
                    sx={{
                      textTransform: "none",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      backgroundColor: "#059669",
                      padding: "6px 16px",
                      "&:hover": { backgroundColor: "#047857" },
                    }}
                  >
                    {fixSaving ? "Saving..." : "Confirm Fix"}
                  </Button>
                </Box>
              )}
              {fixError && (
                <Typography sx={{ fontSize: 12, color: "#DC2626", marginTop: 0.5 }}>{fixError}</Typography>
              )}
            </>
          )}
        </Box>
      )}

      {canDismiss && !compact && !dismissedInfo && (
        <Box sx={{ marginTop: 1.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setDismissExpanded((v) => !v)}
            sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 600, color: "#64748B", padding: 0, minWidth: 0 }}
          >
            {dismissExpanded ? "Cancel" : "Dismiss"}
          </Button>

          {dismissExpanded && (
            <Box sx={{ marginTop: 1, display: "flex", gap: 1, alignItems: "flex-start", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Optional note, e.g. intentional for this admin endpoint"
                value={dismissNote}
                onChange={(e) => setDismissNote(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: 6,
                  padding: "6px 12px",
                  color: "#0F172A",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <Button
                size="small"
                onClick={handleDismiss}
                disabled={dismissSaving}
                sx={{
                  textTransform: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: "#64748B",
                  padding: "6px 16px",
                  "&:hover": { backgroundColor: "#475569" },
                }}
              >
                {dismissSaving ? "Dismissing..." : "Confirm Dismiss"}
              </Button>
            </Box>
          )}
          {dismissError && (
            <Typography sx={{ fontSize: 12, color: "#DC2626", marginTop: 0.5 }}>{dismissError}</Typography>
          )}
        </Box>
      )}

      {showExplain && (
        <Box sx={{ marginTop: 1.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={handleToggleNarrative}
            sx={{ fontSize: 12.5, textTransform: "none", fontWeight: 600, color: "#2563EB", padding: 0, minWidth: 0 }}
          >
            {narrativeExpanded ? "Hide AI explanation" : "Explain with AI"}
          </Button>

          {narrativeExpanded && (
            <Box sx={{ marginTop: 1 }}>
              {narrativeLoading && <CircularProgress size={16} sx={{ color: "#2563EB" }} />}

              {narrativeError && (
                <Typography variant="caption" color="error">
                  {narrativeError}
                </Typography>
              )}

              {narrative && (
                <Paper
                  elevation={0}
                  sx={{
                    padding: 2,
                    borderColor: "#BFDBFE",
                    borderRadius: "8px",
                    backgroundColor: "#EFF6FF",
                  }}
                >
                  <Typography sx={{ fontSize: 13.5, color: "#1E40AF", lineHeight: 1.6 }}>
                    {narrative}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default FindingCard;
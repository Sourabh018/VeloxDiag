import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, CircularProgress, Paper, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Alert, Chip, Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Header from "../components/Header";
import useSettings from "../hooks/useSettings";
import apiClient from "../api/client";
import { useSelectedApp } from "../contexts/AppContext";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    fontSize: 14,
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root": { color: "#64748B", fontSize: 14 },
  "& .MuiInputBase-input": {
    color: "#0F172A",
    fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
    fontVariantNumeric: "tabular-nums",
    fontSize: 14,
  },
  "& .MuiFormHelperText-root": { color: "#94A3B8", fontSize: 12 },
};

const dialogFieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 14,
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root": { color: "#64748B", fontSize: 14 },
  "& .MuiInputBase-input": { color: "#0F172A", fontSize: 14 },
};

function Settings({ onMobileMenuToggle }) {
  // Reuses the same global app selector already in the Header (AppSelector.jsx)
  // instead of adding a second, separate dropdown on this page. Whatever app
  // the user has selected app-wide is what these thresholds edit.
  const { selectedApp } = useSelectedApp();

  // Apps list — used only for the Reset Application Data section below,
  // which intentionally lists every app regardless of the global selection.
  const [apps, setApps] = useState([]);
  useEffect(() => {
    apiClient
      .get("/api/dashboard/applications")
      .then((res) => setApps(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Fetch applications failed:", err.message));
  }, []);

  // Registered apps — from ApplicationController (name + ingestApiKey), not
  // the telemetry-derived list above. This is what "Delete Registered App"
  // below operates on: deleting here only removes the Application row
  // (registration + key), never touches Telemetry — see
  // ApplicationController.deleteApplication javadoc.
  const [registeredApps, setRegisteredApps] = useState([]);
  const [registeredLoading, setRegisteredLoading] = useState(true);
  const loadRegisteredApps = () => {
    apiClient
      .get("/api/applications")
      .then((res) => setRegisteredApps(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Fetch registered applications failed:", err.message))
      .finally(() => setRegisteredLoading(false));
  };
  useEffect(loadRegisteredApps, []);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const openDeleteDialog = (appName) => {
    setDeleteTarget(appName);
    setDeleteConfirmText("");
    setDeleteError(null);
  };
  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
    setDeleteError(null);
  };
  const handleConfirmDelete = async () => {
    if (deleteConfirmText !== deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/api/applications/${encodeURIComponent(deleteTarget)}`);
      // Clear the session too, not just reload — otherwise the still-valid
      // token skips LoginGate entirely and drops the user straight into
      // AppGate's Register screen, which is confusing right after a delete.
      // Full sign-out + reload lands cleanly back on the Login page instead.
      localStorage.removeItem("veloxdiag_session_token");
      localStorage.removeItem("veloxdiag_session_email");
      window.location.reload();
    } catch (err) {
      setDeleteError(err.response?.data || "Delete failed.");
      setDeleting(false);
    }
  };

  // useSettings is scoped to the globally-selected app — null/empty before
  // AppSelector has loaded is a guarded no-op inside the hook.
  const {
    settings, loading, saving, error, saveError, saveSuccess, saveSettings,
    resetting, resetError, resetSuccess, resetApplication,
  } = useSettings(selectedApp);

  const [form, setForm] = useState({
    slowRequestThresholdMs: "",
    highErrorRateThreshold: "",
    serverErrorStatusThreshold: "",
    lookbackDays: "",
    seqScanRowThreshold: "",
    minAvgDurationMs: "",
    lowVarianceThreshold: "",
    possibleNPlusOneQueryThreshold: "",
  });

  const [resetTarget, setResetTarget] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const openResetDialog = (appName) => {
    setResetTarget(appName);
    setConfirmText("");
  };

  const closeResetDialog = () => {
    setResetTarget(null);
    setConfirmText("");
  };

  const handleConfirmReset = async () => {
    if (confirmText !== resetTarget) return;
    const result = await resetApplication(resetTarget);
    if (result.ok) {
      closeResetDialog();
    }
  };

  // Re-populate the form whenever settings reload — either on first load
  // or because selectedApp changed and useSettings re-fetched for the new app.
  useEffect(() => {
    if (settings) {
      setForm({
        slowRequestThresholdMs: settings.slowRequestThresholdMs,
        highErrorRateThreshold: settings.highErrorRateThreshold,
        serverErrorStatusThreshold: settings.serverErrorStatusThreshold,
        lookbackDays: settings.lookbackDays,
        seqScanRowThreshold: settings.seqScanRowThreshold,
        minAvgDurationMs: settings.minAvgDurationMs,
        lowVarianceThreshold: settings.lowVarianceThreshold,
        possibleNPlusOneQueryThreshold: settings.possibleNPlusOneQueryThreshold,
      });
    }
  }, [settings]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    saveSettings({
      applicationName: selectedApp,
      slowRequestThresholdMs: Number(form.slowRequestThresholdMs),
      highErrorRateThreshold: Number(form.highErrorRateThreshold),
      serverErrorStatusThreshold: Number(form.serverErrorStatusThreshold),
      lookbackDays: Number(form.lookbackDays),
      seqScanRowThreshold: Number(form.seqScanRowThreshold),
      minAvgDurationMs: Number(form.minAvgDurationMs),
      lowVarianceThreshold: Number(form.lowVarianceThreshold),
      possibleNPlusOneQueryThreshold: Number(form.possibleNPlusOneQueryThreshold),
    });
  };

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
        {/* Page header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#F8FAFC",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #E2E8F0",
              }}
            >
              <SettingsIcon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Settings
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 680 }}>
            Adjust the Diagnosis Engine's rule thresholds and lookback window for{" "}
            <strong style={{ color: "#0F172A" }}>{selectedApp || "the selected application"}</strong>{" "}
            (use the app selector in the header to switch). Each application has its own independent thresholds.
            Changes apply immediately to future scans and are persisted.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server — showing last known settings
          </Alert>
        )}

        {/* Rule Engine Thresholds */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            maxWidth: 680,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#0F172A", mb: 0.5 }}>
            Rule Engine Thresholds
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#64748B", mb: 2.5 }}>
            Per-application settings for{" "}
            <Chip
              label={selectedApp || "No app selected"}
              size="small"
              sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, fontWeight: 600, bgcolor: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", height: 22 }}
            />
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={24} sx={{ color: "#2563EB" }} />
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Lookback Window (days)"
                  helperText="Diagnosis, Query Analyzer, and Index Advisor only scan telemetry from this many days back — prevents stale historical data from skewing current findings"
                  type="number"
                  fullWidth
                  value={form.lookbackDays}
                  onChange={handleChange("lookbackDays")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Slow Request Threshold (ms)"
                  helperText="Endpoints averaging above this duration are flagged as SLOW_REQUEST"
                  type="number"
                  fullWidth
                  value={form.slowRequestThresholdMs}
                  onChange={handleChange("slowRequestThresholdMs")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="High Error Rate Threshold (count)"
                  helperText="Endpoints with this many 4xx/5xx errors or more are flagged as HIGH_ERROR_RATE"
                  type="number"
                  fullWidth
                  value={form.highErrorRateThreshold}
                  onChange={handleChange("highErrorRateThreshold")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Server Error Status Threshold"
                  helperText="Status codes at or above this value are counted as SERVER_ERROR (standard: 500)"
                  type="number"
                  fullWidth
                  value={form.serverErrorStatusThreshold}
                  onChange={handleChange("serverErrorStatusThreshold")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Seq Scan Row Threshold"
                  helperText="A Seq Scan is only flagged as MISSING_INDEX_CANDIDATE if the estimated row count exceeds this"
                  type="number"
                  fullWidth
                  value={form.seqScanRowThreshold}
                  onChange={handleChange("seqScanRowThreshold")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Possible N+1 Query Threshold (count)"
                  helperText="If a single request triggers this many SQL statements or more, it's flagged as POSSIBLE_N_PLUS_ONE"
                  type="number"
                  fullWidth
                  value={form.possibleNPlusOneQueryThreshold}
                  onChange={handleChange("possibleNPlusOneQueryThreshold")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Index Advisor: Min Avg Duration (ms)"
                  helperText="Endpoints must average at least this duration to be considered a heuristic missing-index candidate"
                  type="number"
                  fullWidth
                  value={form.minAvgDurationMs}
                  onChange={handleChange("minAvgDurationMs")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Index Advisor: Low Variance Threshold"
                  helperText="Coefficient of variation (stdDev / avg) at or below this value is considered 'consistently slow' — a candidate signal for a missing index (e.g. 0.20 = 20% variance)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  fullWidth
                  value={form.lowVarianceThreshold}
                  onChange={handleChange("lowVarianceThreshold")}
                  sx={fieldSx}
                />
              </Grid>

              {saveError && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ borderRadius: "8px" }}>
                    Failed to save settings. Please try again.
                  </Alert>
                </Grid>
              )}
              {saveSuccess && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="success" sx={{ borderRadius: "8px" }}>
                    Settings saved for <strong>{selectedApp}</strong>.
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || !selectedApp}
                  sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
                >
                  {saving ? "Saving..." : `Save Changes for ${selectedApp || "..."}`}
                </Button>
              </Grid>
            </Grid>
          )}
        </Paper>

        {/* Registered Applications */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid #FCA5A5",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            maxWidth: 680,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <WarningAmberIcon fontSize="small" sx={{ color: "#EF4444" }} />
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>
              Delete Registered App
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: "#64748B", mb: 2.5 }}>
            Permanently deletes the app's registration, API key, and ALL its telemetry + slow-query-plan data.
            This cannot be undone.
          </Typography>

          {registeredLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography sx={{ fontSize: 13.5, color: "#64748B" }}>Loading apps…</Typography>
            </Box>
          ) : registeredApps.length === 0 ? (
            <Typography sx={{ fontSize: 13.5, color: "#94A3B8" }}>
              No registered applications found.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {registeredApps.map((app) => (
                <Box
                  key={app.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "10px 14px",
                    borderRadius: "8px",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 13.5,
                      color: "#0F172A",
                      fontWeight: 600,
                    }}
                  >
                    {app.name}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => openDeleteDialog(app.name)}
                    sx={{
                      color: "#DC2626",
                      border: "1px solid #FCA5A5",
                      bgcolor: "#FEF2F2",
                      fontSize: 12.5,
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#FEE2E2", borderColor: "#EF4444" },
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Reset Application Data */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid #FCA5A5",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            maxWidth: 680,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <WarningAmberIcon fontSize="small" sx={{ color: "#EF4444" }} />
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>
              Reset Application Data
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: "#64748B", mb: 2.5 }}>
            Permanently deletes all telemetry and slow-query-plan records for the selected application only — other
            applications are never affected. This cannot be undone. You must own the application to reset it.
          </Typography>

          {apps.length === 0 ? (
            <Typography sx={{ fontSize: 13.5, color: "#94A3B8" }}>No applications found yet.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {apps
                .filter((appName) => appName === selectedApp)
                .map((appName) => (
                  <Box
                    key={appName}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: "10px 14px",
                      borderRadius: "8px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 13.5,
                        color: "#0F172A",
                        fontWeight: 600,
                      }}
                    >
                      {appName}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => openResetDialog(appName)}
                      sx={{
                        color: "#DC2626",
                        border: "1px solid #FCA5A5",
                        bgcolor: "#FEF2F2",
                        fontSize: 12.5,
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#FEE2E2", borderColor: "#EF4444" },
                      }}
                    >
                      Reset Data
                    </Button>
                  </Box>
                ))}
            </Box>
          )}

          {resetSuccess && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: "8px" }}>
              Reset complete for {resetSuccess.applicationName}: {resetSuccess.telemetryRowsDeleted} telemetry rows,{" "}
              {resetSuccess.slowQueryPlanRowsDeleted} slow-query-plan rows deleted.
            </Alert>
          )}
        </Paper>

        {/* Delete App Dialog */}
        <Dialog open={deleteTarget !== null} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
            Delete "{deleteTarget}" registration?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "#64748B", fontSize: 14, mb: 2 }}>
              Removes the registration, key, and ALL telemetry + slow-query-plan data for{" "}
              <strong style={{ color: "#0F172A" }}>{deleteTarget}</strong>. Cannot be undone. Type
              the app name below to confirm.
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              label={`Type "${deleteTarget}" to confirm`}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              sx={dialogFieldSx}
            />
            {deleteError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "8px" }}>
                {typeof deleteError === "string" ? deleteError : "Delete failed."}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDeleteDialog} sx={{ color: "#64748B" }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteConfirmText !== deleteTarget || deleting}
              sx={{
                color: "#DC2626",
                bgcolor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                "&:hover": { bgcolor: "#FEE2E2" },
                "&.Mui-disabled": { color: "#94A3B8", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" },
              }}
            >
              {deleting ? "Deleting..." : "Delete Registration"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Dialog */}
        <Dialog open={resetTarget !== null} onClose={closeResetDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
            Reset "{resetTarget}" data?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "#64748B", fontSize: 14, mb: 2 }}>
              This permanently deletes all telemetry and slow-query-plan records for{" "}
              <strong style={{ color: "#0F172A" }}>{resetTarget}</strong> only. The app's
              registration and API key are kept — just its collected data is cleared. Type the
              application name below to confirm.
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              label={`Type "${resetTarget}" to confirm`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              sx={dialogFieldSx}
            />
            {resetError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: "8px" }}>
                Reset failed — try again.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeResetDialog} sx={{ color: "#64748B" }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReset}
              disabled={confirmText !== resetTarget || resetting}
              sx={{
                color: "#DC2626",
                bgcolor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                "&:hover": { bgcolor: "#FEE2E2" },
                "&.Mui-disabled": { color: "#94A3B8", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" },
              }}
            >
              {resetting ? "Resetting..." : "Permanently Reset"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default Settings;
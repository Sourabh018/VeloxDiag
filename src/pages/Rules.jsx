import { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  TextField,
  MenuItem,
  Select,
  Switch,
  IconButton,
  FormControlLabel,
  Chip,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";
import Header from "../components/Header";
import useRules from "../hooks/useRules";

// Must match the keys EndpointMetrics.compute() actually produces on the
// backend — a rule referencing anything else silently never fires rather
// than erroring (see RuleCondition.evaluate javadoc), so keeping this list
// in sync matters for the form to be useful rather than just permissive.
const METRICS = [
  { value: "avgDurationMs", label: "Avg duration (ms)" },
  { value: "maxDurationMs", label: "Max duration (ms)" },
  { value: "errorRate", label: "Error rate (0-1)" },
  { value: "errorCount", label: "Error count" },
  { value: "serverErrorCount", label: "Server error count (5xx)" },
  { value: "avgQueryCount", label: "Avg query count" },
  { value: "maxQueryCount", label: "Max query count" },
  { value: "sampleCount", label: "Sample count" },
];

const OPERATORS = [
  { value: "GT", label: "> greater than" },
  { value: "GTE", label: "≥ greater or equal" },
  { value: "LT", label: "< less than" },
  { value: "LTE", label: "≤ less or equal" },
];

const SEVERITIES = ["HIGH", "MEDIUM", "LOW"];

const SEVERITY_COLOR = {
  HIGH: { bg: "#FEF2F2", border: "#FCA5A5", fg: "#991B1B", dot: "#EF4444" },
  MEDIUM: { bg: "#FFFBEB", border: "#FCD34D", fg: "#92400E", dot: "#F59E0B" },
  LOW: { bg: "#EFF6FF", border: "#BFDBFE", fg: "#1E40AF", dot: "#3B82F6" },
};

const selectSx = {
  bgcolor: "#FFFFFF",
  fontSize: 14,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB" },
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    fontSize: 14,
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root": { color: "#64748B", fontSize: 14 },
  "& .MuiInputBase-input": { color: "#0F172A", fontSize: 14 },
  "& .MuiFormHelperText-root": { fontSize: 12, color: "#94A3B8" },
};

const emptyForm = {
  ruleType: "",
  severity: "MEDIUM",
  conditions: [{ metric: "avgDurationMs", operator: "GT", threshold: 1000 }],
  messageTemplate: "",
  enabled: true,
};

function RuleForm({ initial, onCancel, onSubmit, saving, serverError }) {
  const [form, setForm] = useState(initial ?? emptyForm);

  const updateCondition = (i, field, value) => {
    const next = [...form.conditions];
    next[i] = { ...next[i], [field]: value };
    setForm({ ...form, conditions: next });
  };

  const addCondition = () =>
    setForm({
      ...form,
      conditions: [...form.conditions, { metric: "avgDurationMs", operator: "GT", threshold: 0 }],
    });

  const removeCondition = (i) =>
    setForm({ ...form, conditions: form.conditions.filter((_, idx) => idx !== i) });

  const canSubmit =
    form.ruleType.trim().length > 0 &&
    form.messageTemplate.trim().length > 0 &&
    form.conditions.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        bgcolor: "#FFFFFF",
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#0F172A", mb: 2.5 }}>
        {initial ? "Edit Rule" : "New Rule"}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          label="Rule type (unique name)"
          placeholder="e.g. SLOW_AND_ERROR_PRONE"
          value={form.ruleType}
          onChange={(e) => setForm({ ...form, ruleType: e.target.value })}
          size="small"
          sx={{ flex: 1, minWidth: 200, ...fieldSx }}
          disabled={!!initial}
          helperText={initial ? "Rule type can't be changed after creation" : " "}
        />
        <Select
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
          size="small"
          sx={{ minWidth: 160, ...selectSx }}
        >
          {SEVERITIES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#64748B", mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Conditions — ALL must be true for this rule to fire
      </Typography>

      {form.conditions.map((c, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            mb: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Select
            value={c.metric}
            onChange={(e) => updateCondition(i, "metric", e.target.value)}
            size="small"
            sx={{ minWidth: 200, ...selectSx }}
          >
            {METRICS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={c.operator}
            onChange={(e) => updateCondition(i, "operator", e.target.value)}
            size="small"
            sx={{ minWidth: 170, ...selectSx }}
          >
            {OPERATORS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="number"
            label="Threshold"
            value={c.threshold}
            onChange={(e) => updateCondition(i, "threshold", parseFloat(e.target.value) || 0)}
            size="small"
            sx={{ width: 120, ...fieldSx }}
          />
          <IconButton
            size="small"
            onClick={() => removeCondition(i)}
            disabled={form.conditions.length === 1}
            sx={{
              color: "#94A3B8",
              "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addCondition}
        sx={{
          mb: 2.5,
          color: "#2563EB",
          fontSize: 13,
          fontWeight: 600,
          "&:hover": { bgcolor: "#EFF6FF" },
        }}
      >
        Add condition
      </Button>

      <TextField
        label="Message template"
        placeholder="Endpoint {endpoint} is averaging {avgDurationMs}ms with a {errorRate} error rate."
        value={form.messageTemplate}
        onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
        size="small"
        fullWidth
        multiline
        minRows={2}
        helperText="Use {metricName} to insert the endpoint's actual computed value, e.g. {avgDurationMs}"
        sx={{ mb: 2.5, ...fieldSx }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            size="small"
          />
        }
        label={
          <Typography sx={{ color: "#475569", fontSize: 14 }}>
            Enabled — rule is active on next diagnosis run
          </Typography>
        }
        sx={{ mb: 2 }}
      />

      {serverError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
          {serverError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          variant="contained"
          disabled={!canSubmit || saving}
          onClick={() =>
            onSubmit({
              ruleType: form.ruleType.trim(),
              severity: form.severity,
              conditionsJson: JSON.stringify(form.conditions),
              messageTemplate: form.messageTemplate.trim(),
              enabled: form.enabled,
            })
          }
          sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Create Rule"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ color: "#64748B", borderColor: "#E2E8F0", "&:hover": { bgcolor: "#F8FAFC" } }}
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}

function Rules({ onMobileMenuToggle }) {
  const { rules, loading, error, saving, createRule, updateRule, deleteRule, toggleEnabled } = useRules();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);

  const editingRule = editingId != null ? rules.find((r) => r.id === editingId) : null;
  const editingInitial = editingRule
    ? {
        ruleType: editingRule.ruleType,
        severity: editingRule.severity,
        conditions: JSON.parse(editingRule.conditionsJson || "[]"),
        messageTemplate: editingRule.messageTemplate,
        enabled: editingRule.enabled,
      }
    : null;

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleCreate = async (payload) => {
    const res = await createRule(payload);
    if (res.ok) closeForm();
    else setFormError(res.error);
  };

  const handleUpdate = async (payload) => {
    const res = await updateRule(editingId, payload);
    if (res.ok) closeForm();
    else setFormError(res.error);
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, gap: 2 }}>
          <Box>
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
                <GavelIcon fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Rules
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Custom, data-driven detection rules — add a new rule here and it's live on the next
              diagnosis run, no code change or redeploy needed.
            </Typography>
          </Box>
          {!showForm && !editingId && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" }, flexShrink: 0 }}
            >
              New Rule
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server
          </Alert>
        )}

        {showForm && !editingId && (
          <RuleForm onCancel={closeForm} onSubmit={handleCreate} saving={saving} serverError={formError} />
        )}
        {editingId && editingInitial && (
          <RuleForm
            initial={editingInitial}
            onCancel={closeForm}
            onSubmit={handleUpdate}
            saving={saving}
            serverError={formError}
          />
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : rules.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 4, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF" }}
          >
            <Typography variant="h6" sx={{ color: "#0F172A", fontWeight: 700, mb: 0.5 }}>
              No Custom Rules
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 460, mx: "auto" }}>
              Diagnosis still runs on the built-in checks (slow request, N+1, missing index, regression, errors) —
              rules here are additional, not a replacement.
            </Typography>
          </Paper>
        ) : (
          rules.map((r) => {
            const colors = SEVERITY_COLOR[r.severity] ?? SEVERITY_COLOR.LOW;
            let conditions = [];
            try {
              conditions = JSON.parse(r.conditionsJson || "[]");
            } catch {
              conditions = [];
            }
            return (
              <Paper
                key={r.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 2,
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  bgcolor: "#FFFFFF",
                  opacity: r.enabled ? 1 : 0.65,
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                  transition: "all 0.15s ease",
                  "&:hover": { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)", borderColor: "#CBD5E1" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
                      <Typography
                        sx={{
                          fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        {r.ruleType}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.dot }} />
                        <Chip
                          label={r.severity}
                          size="small"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 11,
                            fontWeight: 700,
                            color: colors.fg,
                            bgcolor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            height: 22,
                            borderRadius: "6px",
                          }}
                        />
                      </Stack>
                      {!r.enabled && (
                        <Chip
                          label="Disabled"
                          size="small"
                          sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", bgcolor: "#F1F5F9", height: 22, borderRadius: "6px" }}
                        />
                      )}
                    </Stack>

                    <Typography sx={{ fontSize: 13.5, color: "#334155", mb: 1, lineHeight: 1.55 }}>
                      {r.messageTemplate}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      {conditions.map((c) => `${c.metric} ${c.operator} ${c.threshold}`).join("  AND  ")}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                    <Switch size="small" checked={r.enabled} onChange={() => toggleEnabled(r)} />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingId(r.id);
                        setShowForm(false);
                        setFormError(null);
                      }}
                      sx={{ color: "#94A3B8", "&:hover": { color: "#2563EB", bgcolor: "#EFF6FF" } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (window.confirm(`Delete rule "${r.ruleType}"?`)) deleteRule(r.id);
                      }}
                      sx={{ color: "#94A3B8", "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            );
          })
        )}
      </Box>
    </>
  );
}

export default Rules;
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
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
  { value: "GTE", label: "\u2265 greater or equal" },
  { value: "LT", label: "< less than" },
  { value: "LTE", label: "\u2264 less or equal" },
];

const SEVERITIES = ["HIGH", "MEDIUM", "LOW"];

const SEVERITY_COLOR = {
  HIGH: { bg: "rgba(229,72,77,0.12)", fg: "#F5A3A3", dot: "#E5484D" },
  MEDIUM: { bg: "rgba(217,162,75,0.12)", fg: "#F0C989", dot: "#D9A24B" },
  LOW: { bg: "rgba(255,255,255,0.06)", fg: "#8C8C93", dot: "#57575F" },
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
      variant="outlined"
      sx={{ padding: 3, marginBottom: 3, backgroundColor: "#111113", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <Typography variant="subtitle1" sx={{ color: "#EDEDEF", marginBottom: 2 }}>
        {initial ? "Edit rule" : "New rule"}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <TextField
          label="Rule type (unique name)"
          placeholder="e.g. SLOW_AND_ERROR_PRONE"
          value={form.ruleType}
          onChange={(e) => setForm({ ...form, ruleType: e.target.value })}
          size="small"
          fullWidth
          disabled={!!initial}
          helperText={initial ? "Rule type can't be changed after creation" : " "}
        />
        <Select
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {SEVERITIES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Typography variant="body2" sx={{ color: "#8C8C93", marginBottom: 1 }}>
        Conditions (ALL must be true for this rule to fire)
      </Typography>

      {form.conditions.map((c, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center", marginBottom: 1 }}>
          <Select
            value={c.metric}
            onChange={(e) => updateCondition(i, "metric", e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
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
            sx={{ minWidth: 170 }}
          >
            {OPERATORS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="number"
            label="threshold"
            value={c.threshold}
            onChange={(e) => updateCondition(i, "threshold", parseFloat(e.target.value) || 0)}
            size="small"
            sx={{ width: 130 }}
          />
          <IconButton
            size="small"
            onClick={() => removeCondition(i)}
            disabled={form.conditions.length === 1}
            sx={{ color: "#6B6B73" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Button size="small" startIcon={<AddIcon />} onClick={addCondition} sx={{ marginBottom: 2, color: "#8C8C93" }}>
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
        sx={{ marginBottom: 2 }}
      />

      <FormControlLabel
        control={
          <Switch checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
        }
        label={<Typography sx={{ color: "#8C8C93", fontSize: 14.5 }}>Enabled</Typography>}
        sx={{ marginBottom: 2 }}
      />

      {serverError && (
        <Typography sx={{ color: "#F5A3A3", fontSize: 14, marginBottom: 2 }}>{serverError}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
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
        >
          {saving ? "Saving..." : initial ? "Save changes" : "Create rule"}
        </Button>
        <Button onClick={onCancel} sx={{ color: "#8C8C93" }}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}

function Rules() {
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
      <Header />
      <Box sx={{ marginLeft: "220px", marginTop: "64px", padding: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ marginBottom: 1, color: "#EDEDEF" }}>
              Rules
            </Typography>
            <Typography variant="body2" sx={{ color: "#8C8C93", marginBottom: 2, fontSize: 15.5 }}>
              Custom, data-driven detection rules — add a new rule here and it's live on the next
              diagnosis run, no code change or redeploy needed.
            </Typography>
          </Box>
          {!showForm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
              New rule
            </Button>
          )}
        </Box>

        {error && (
          <Box
            sx={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "4px",
              marginBottom: 2,
              color: "#F5A3A3",
              backgroundColor: "rgba(229,72,77,0.12)",
              fontSize: 14.5,
            }}
          >
            Could not reach VeloxDiag server
          </Box>
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
          <Box sx={{ display: "flex", justifyContent: "center", padding: 8 }}>
            <CircularProgress />
          </Box>
        ) : rules.length === 0 ? (
          <Typography sx={{ color: "#57575F", fontSize: 15.5 }}>
            No custom rules yet. Diagnosis still runs on the built-in checks (slow request, N+1,
            missing index, regression, errors) — rules here are additional, not a replacement.
          </Typography>
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
                variant="outlined"
                sx={{
                  padding: 2,
                  marginBottom: 1.5,
                  backgroundColor: "#111113",
                  borderColor: "rgba(255,255,255,0.07)",
                  opacity: r.enabled ? 1 : 0.5,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: "IBM Plex Mono, ui-monospace, monospace", color: "#EDEDEF", fontSize: 16 }}
                      >
                        {r.ruleType}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: colors.bg,
                        }}
                      >
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.dot }} />
                        <Typography variant="caption" sx={{ color: colors.fg, fontSize: 12.5 }}>
                          {r.severity}
                        </Typography>
                      </Box>
                      {!r.enabled && (
                        <Typography variant="caption" sx={{ color: "#57575F", fontSize: 12.5 }}>
                          disabled
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "#8C8C93", fontSize: 14.5, marginBottom: 0.5 }}>
                      {r.messageTemplate}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#57575F",
                        fontFamily: "IBM Plex Mono, ui-monospace, monospace",
                        fontSize: 12.5,
                      }}
                    >
                      {conditions
                        .map((c) => `${c.metric} ${c.operator} ${c.threshold}`)
                        .join("  AND  ")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Switch size="small" checked={r.enabled} onChange={() => toggleEnabled(r)} />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingId(r.id);
                        setShowForm(false);
                        setFormError(null);
                      }}
                      sx={{ color: "#6B6B73" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (window.confirm(`Delete rule "${r.ruleType}"?`)) deleteRule(r.id);
                      }}
                      sx={{ color: "#6B6B73" }}
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
import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, CircularProgress, IconButton, Alert, Chip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddIcon from "@mui/icons-material/Add";
import Header from "../components/Header";
import useBusinessContext from "../hooks/useBusinessContext";
import { useSelectedApp } from "../contexts/AppContext";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    fontSize: 14,
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root": { color: "#64748B", fontSize: "14px" },
  "& .MuiInputBase-input": { color: "#0F172A", fontSize: "14px" },
  "& .MuiFormHelperText-root": { color: "#94A3B8", fontSize: "12px" },
};

function BusinessContext({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { entries, loading, saving, saveEntry, deleteEntry } = useBusinessContext(selectedApp);

  const [endpoint, setEndpoint] = useState("");
  const [description, setDescription] = useState("");
  const [saveMsg, setSaveMsg] = useState(null);

  const handleAdd = async () => {
    if (!endpoint.trim() || !description.trim()) return;
    const result = await saveEntry(endpoint.trim(), description.trim());
    if (result.ok) {
      setSaveMsg("Note saved successfully.");
      setEndpoint("");
      setDescription("");
      setTimeout(() => setSaveMsg(null), 2500);
    }
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
                bgcolor: "#F0FDF4",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DescriptionOutlinedIcon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A" }}>
              Business Context
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 680 }}>
            Tell VeloxDiag what an endpoint does for{" "}
            <strong style={{ color: "#0F172A" }}>{selectedApp || "the selected application"}</strong>.
            The AI on the Diagnosis page uses this to tie technical root causes to their real-world impact — e.g.
            instead of just "N+1 query pattern," it can add "which matters here because this is the page students
            check right before an exam."
          </Typography>
        </Box>

        {/* Add note form */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            maxWidth: 720,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A", mb: 2 }}>
            Add Endpoint Note
          </Typography>

          <TextField
            label="Endpoint (normalized form)"
            placeholder="/api/exams/{id}/submit"
            fullWidth
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            helperText="Use {id} for dynamic segments — matches how endpoints are grouped elsewhere in the dashboard."
            sx={{ mb: 2, ...fieldSx }}
          />
          <TextField
            label="What does this endpoint do for the user?"
            placeholder="Student submits their final exam answers. This is the last step — a delay or failure here directly risks a lost or duplicate submission."
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2.5, ...fieldSx }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              onClick={handleAdd}
              disabled={saving || !selectedApp || !endpoint.trim() || !description.trim()}
              sx={{
                bgcolor: "#2563EB",
                px: 2.5,
                "&:hover": { bgcolor: "#1D4ED8" },
              }}
            >
              {saving ? "Saving..." : "Save Note"}
            </Button>
            {saveMsg && (
              <Alert severity="success" sx={{ py: 0.25, px: 1.5, borderRadius: "8px", fontSize: 13 }}>
                {saveMsg}
              </Alert>
            )}
          </Box>
        </Paper>

        {/* Existing notes list */}
        <Box sx={{ maxWidth: 720 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A", mb: 1.5 }}>
            Existing Notes
            {!loading && entries.length > 0 && (
              <Chip
                label={entries.length}
                size="small"
                sx={{ ml: 1.5, height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}
              />
            )}
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={24} sx={{ color: "#2563EB" }} />
            </Box>
          ) : entries.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ p: 4, textAlign: "center", border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "#FFFFFF" }}
            >
              <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                No business context notes yet for{" "}
                {selectedApp ? <strong>{selectedApp}</strong> : "this application"}.
              </Typography>
            </Paper>
          ) : (
            entries.map((entry) => (
              <Paper
                key={entry.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  bgcolor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  transition: "box-shadow 0.15s",
                  "&:hover": { boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)" },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#2563EB",
                      mb: 0.5,
                      wordBreak: "break-all",
                    }}
                  >
                    {entry.endpoint}
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                    {entry.description}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => deleteEntry(entry.endpoint)}
                  sx={{
                    color: "#94A3B8",
                    flexShrink: 0,
                    "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" },
                    transition: "all 0.15s",
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))
          )}
        </Box>
      </Box>
    </>
  );
}

export default BusinessContext;
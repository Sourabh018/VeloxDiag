import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, CircularProgress, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Header from "../components/Header";
import useBusinessContext from "../hooks/useBusinessContext";
import { useSelectedApp } from "../contexts/AppContext";

// Same dark-theme field styling used on Settings.jsx, kept local rather than
// shared since it's only these two pages that need it.
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#0C0C0E",
    "& fieldset": { borderColor: "rgba(255,255,255,0.07)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&.Mui-focused fieldset": { borderColor: "#5B7CFF" },
  },
  "& .MuiInputLabel-root": { color: "#8C8C93", fontSize: "14.5px" },
  "& .MuiInputBase-input": { color: "#EDEDEF", fontSize: "14.5px" },
};

function BusinessContext() {
  const { selectedApp } = useSelectedApp();
  const { entries, loading, saving, saveEntry, deleteEntry } = useBusinessContext(selectedApp);

  const [endpoint, setEndpoint] = useState("");
  const [description, setDescription] = useState("");
  const [saveMsg, setSaveMsg] = useState(null);

  const handleAdd = async () => {
    if (!endpoint.trim() || !description.trim()) return;
    const result = await saveEntry(endpoint.trim(), description.trim());
    if (result.ok) {
      setSaveMsg("Saved.");
      setEndpoint("");
      setDescription("");
      setTimeout(() => setSaveMsg(null), 2500);
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ marginLeft: "220px", marginTop: "64px", padding: 4, maxWidth: 720 }}>

        <Typography variant="h5" sx={{ marginBottom: 1, color: "#EDEDEF" }}>
          Business Context
        </Typography>
        <Typography variant="body2" sx={{ color: "#8C8C93", marginBottom: 3, fontSize: "15.5px" }}>
          Tell VeloxDiag what an endpoint actually does for a real user, for{" "}
          <strong style={{ color: "#EDEDEF" }}>{selectedApp || "the selected application"}</strong>.
          The AI explanation on the Diagnosis page uses this to tie a technical root cause to
          its real-world consequence — e.g. instead of just "N+1 query pattern," it can add
          "which matters here because this is the page students check right before an exam."
          Endpoints with no note here still get a technical-only explanation, exactly as before.
        </Typography>

        <Paper
          variant="outlined"
          sx={{ padding: 3, marginBottom: 3, backgroundColor: "#111113", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <TextField
            label="Endpoint (normalized form)"
            placeholder="/api/exams/{id}/submit"
            fullWidth
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            helperText="Use {id} for dynamic segments — matches how endpoints are grouped elsewhere in the dashboard (e.g. /api/exams/{id}, not /api/exams/9a352dba-...)"
            sx={{ marginBottom: 2, ...fieldSx }}
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
            sx={{ marginBottom: 2, ...fieldSx }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              onClick={handleAdd}
              disabled={saving || !selectedApp || !endpoint.trim() || !description.trim()}
              sx={{
                textTransform: "none",
                color: "#EDEDEF",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "6px 18px",
                fontSize: "14.5px",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.09)" },
                "&.Mui-disabled": { color: "#57575F" },
              }}
            >
              {saving ? "Saving..." : "Save Note"}
            </Button>
            {saveMsg && (
              <Typography sx={{ fontSize: "13.5px", color: "#8FD9A8" }}>{saveMsg}</Typography>
            )}
          </Box>
        </Paper>

        <Typography sx={{ fontSize: 14.5, fontWeight: 500, color: "#EDEDEF", marginBottom: 1.5 }}>
          Existing Notes
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
            <CircularProgress size={22} />
          </Box>
        ) : entries.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            No business context notes yet for {selectedApp || "this application"}.
          </Typography>
        ) : (
          entries.map((entry) => (
            <Paper
              key={entry.id}
              variant="outlined"
              sx={{
                padding: "12px 16px",
                marginBottom: 1,
                borderColor: "rgba(255,255,255,0.07)",
                borderRadius: "8px",
                backgroundColor: "#111113",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#C3CCFF", marginBottom: 0.5 }}>
                  {entry.endpoint}
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: "#B0B0B6" }}>
                  {entry.description}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => deleteEntry(entry.endpoint)}
                sx={{ color: "#6B6B73", "&:hover": { color: "#F5A3A3" } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))
        )}
      </Box>
    </>
  );
}

export default BusinessContext;
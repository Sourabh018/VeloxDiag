import { useState } from "react";
import { Box, Button, CircularProgress, Typography, Alert, Paper } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EndpointNarrative({ endpoint }) {
  const [narrative, setNarrative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNarrative = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/diagnosis/narrative`, {
        params: { endpoint },
        timeout: 20000,
      });
      setNarrative(res.data.narrative);
    } catch (err) {
      setError("Couldn't generate an explanation right now.");
    } finally {
      setLoading(false);
    }
  };

  if (narrative) {
    return (
      <Paper elevation={0} sx={{ mt: 1, p: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px" }}>
        <Typography sx={{ fontSize: 13.5, color: "#1E40AF", lineHeight: 1.6 }}>{narrative}</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="outlined"
        onClick={fetchNarrative}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={14} sx={{ color: "#2563EB" }} /> : <AutoAwesomeIcon fontSize="small" />}
        sx={{
          fontSize: 12.5,
          fontWeight: 600,
          color: "#2563EB",
          borderColor: "#BFDBFE",
          bgcolor: "#FFFFFF",
          "&:hover": { bgcolor: "#EFF6FF", borderColor: "#93C5FD" },
        }}
      >
        Explain this
      </Button>
      {error && (
        <Alert severity="warning" sx={{ mt: 1, borderRadius: "8px" }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
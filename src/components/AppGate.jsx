import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Alert, IconButton, Tooltip, Paper } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import BoltIcon from "@mui/icons-material/Bolt";
import apiClient from "../api/client";

const SERVER_URL = import.meta.env.VITE_API_URL;

function AppGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [justCreated, setJustCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient
      .get("/api/applications")
      .then((res) => setApps(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Fetch applications failed:", err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiClient.post("/api/applications", { name: name.trim() });
      setJustCreated(res.data);
      setApps((prev) => [...prev, res.data]);
    } catch (err) {
      const message = err.response?.data || "Could not register application.";
      setError(typeof message === "string" ? message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const snippet = justCreated
    ? `<dependency>
  <groupId>com.veloxdiag</groupId>
  <artifactId>veloxdiag-starter</artifactId>
  <version>0.0.1</version>
</dependency>

# application.yml
veloxdiag:
  applicationName: ${justCreated.name}
  serverUrl: ${SERVER_URL}
  apiKey: ${justCreated.ingestApiKey}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <Typography sx={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Loading applications...</Typography>
      </Box>
    );
  }

  if (justCreated) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", padding: 3 }}>
        <Paper elevation={0} sx={{ width: 560, p: 4, borderRadius: "16px", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
              "{justCreated.name}" Registered
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13.5, color: "#64748B", marginBottom: 3 }}>
            Add <code style={{ color: "#2563EB" }}>veloxdiag-starter</code> to your project's pom.xml, then configure your application.yml:
          </Typography>

          <Box sx={{ position: "relative", backgroundColor: "#0F172A", borderRadius: "10px", padding: 2.5, mb: 2 }}>
            <Tooltip title={copied ? "Copied!" : "Copy Snippet"}>
              <IconButton size="small" onClick={handleCopy} sx={{ position: "absolute", top: 10, right: 10, color: "#94A3B8", "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" } }}>
                {copied ? <CheckIcon fontSize="small" sx={{ color: "#4ADE80" }} /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Typography
              component="pre"
              sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, color: "#F8FAFC", whiteSpace: "pre-wrap", margin: 0 }}
            >
              {snippet}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 12, color: "#94A3B8", marginBottom: 3 }}>
            Your API key is displayed above and is also stored under Settings.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setJustCreated(null)}
            sx={{ py: 1.2, fontSize: 14, fontWeight: 700, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
          >
            Continue to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  if (apps.length > 0) {
    return children;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", padding: 2 }}>
      <Paper elevation={0} sx={{ width: 400, p: 4, borderRadius: "16px", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)", textAlign: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BoltIcon fontSize="medium" />
          </Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
            Register Application
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13.5, color: "#64748B", marginBottom: 3 }}>
          Enter a name for your application to generate an API ingest key and configuration snippet.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2.5, fontSize: 13, textAlign: "left", borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Application name"
          placeholder="e.g. AgroMart or ECommerceApp"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          sx={{
            marginBottom: 3,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              fontSize: 14,
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#2563EB" },
            },
            "& .MuiInputLabel-root": { color: "#64748B", fontSize: 14 },
            "& .MuiInputBase-input": { color: "#0F172A" },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleRegister}
          disabled={creating}
          sx={{ py: 1.2, fontSize: 14, fontWeight: 700, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
        >
          {creating ? "Registering..." : "Register App"}
        </Button>
      </Paper>
    </Box>
  );
}

export default AppGate;
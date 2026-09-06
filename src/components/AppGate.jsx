import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Alert, IconButton, Tooltip, Paper, InputAdornment } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import BoltIcon from "@mui/icons-material/Bolt";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import { motion, AnimatePresence } from "motion/react";
import apiClient from "../api/client";

const SERVER_URL = import.meta.env.VITE_API_URL;

// Same auto light/dark token system as LandingPage/LoginGate — no toggle, follows OS/browser setting.
const THEME_CSS = `
  .lg-root {
    --bg-page: #F8FAFC;
    --bg-glow: rgba(37,99,235,0.06);
    --bg-elevated: #FFFFFF;
    --bg-field: #FFFFFF;
    --bg-code: #0F172A;
    --border-color: #E2E8F0;
    --border-hover: #CBD5E1;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --icon-bg: #EFF6FF;
    --icon-color: #2563EB;
    --icon-bg-success: #ECFDF5;
    --icon-color-success: #059669;
    --shadow-card: rgba(15,23,42,0.08);
  }
  @media (prefers-color-scheme: dark) {
    .lg-root {
      --bg-page: #0B1220;
      --bg-glow: rgba(37,99,235,0.18);
      --bg-elevated: #121A2B;
      --bg-field: #0D1420;
      --bg-code: #060A13;
      --border-color: rgba(255,255,255,0.1);
      --border-hover: rgba(255,255,255,0.2);
      --text-primary: #F1F5F9;
      --text-secondary: #94A3B8;
      --icon-bg: rgba(37,99,235,0.15);
      --icon-color: #60A5FA;
      --icon-bg-success: rgba(16,185,129,0.15);
      --icon-color-success: #34D399;
      --shadow-card: rgba(0,0,0,0.5);
    }
  }
`;

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
    ? `<repositories>
  <repository>
    <id>jitpack.io</id>
    <url>https://jitpack.io</url>
  </repository>
</repositories>

<dependency>
  <groupId>com.github.Sourabh018</groupId>
  <artifactId>veloxdiag-starter</artifactId>
  <version>v0.0.1</version>
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
      <Box
        className="lg-root"
        sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-page)" }}
      >
        <style>{THEME_CSS}</style>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Typography sx={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Loading applications...</Typography>
        </motion.div>
      </Box>
    );
  }

  if (justCreated) {
    return (
      <Box
        className="lg-root"
        sx={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(ellipse 700px 450px at 50% 0%, var(--bg-glow), transparent 65%), var(--bg-page)",
          padding: 3,
        }}
      >
        <style>{THEME_CSS}</style>
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: -18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1200 }}
        >
          <Paper elevation={0} sx={{ width: 560, p: 4, borderRadius: "16px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)", boxShadow: "0 20px 45px -12px var(--shadow-card)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "var(--icon-bg-success)", color: "var(--icon-color-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckIcon fontSize="small" />
                </Box>
              </motion.div>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                "{justCreated.name}" Registered
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 3 }}>
              Add <code style={{ color: "#60A5FA" }}>veloxdiag-starter</code> to your project's pom.xml, then configure your application.yml:
            </Typography>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Box sx={{ position: "relative", backgroundColor: "var(--bg-code)", borderRadius: "10px", padding: 2.5, mb: 2 }}>
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
            </motion.div>

            <Typography sx={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>
              Your API key is displayed above and is also stored under Settings.
            </Typography>

            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setJustCreated(null)}
                sx={{ py: 1.2, fontSize: 14, fontWeight: 700, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
              >
                Continue to Dashboard
              </Button>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (apps.length > 0) {
    return children;
  }

  return (
    <Box
      className="lg-root"
      sx={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse 700px 450px at 50% 0%, var(--bg-glow), transparent 65%), var(--bg-page)",
        padding: 2,
      }}
    >
      <style>{THEME_CSS}</style>
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: -18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1200 }}
      >
        <Paper elevation={0} sx={{ width: 400, p: 4, borderRadius: "16px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)", boxShadow: "0 20px 45px -12px var(--shadow-card)", textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "var(--icon-bg)", color: "var(--icon-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BoltIcon fontSize="medium" />
              </Box>
            </motion.div>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Register Application
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 3 }}>
            Enter a name for your application to generate an API ingest key and configuration snippet.
          </Typography>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <Alert severity="error" sx={{ fontSize: 13, textAlign: "left", borderRadius: "8px" }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <TextField
            label="Application name"
            placeholder="e.g. AgroMart or ECommerceApp"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AppsOutlinedIcon sx={{ fontSize: 18, color: "var(--icon-color)" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              marginBottom: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "var(--bg-field)",
                borderRadius: "8px",
                fontSize: 14,
                transition: "background-color 0.3s ease",
                "& fieldset": { borderColor: "var(--border-color)" },
                "&:hover fieldset": { borderColor: "var(--border-hover)" },
                "&.Mui-focused fieldset": { borderColor: "#2563EB" },
              },
              "& .MuiInputLabel-root": { color: "var(--text-secondary)", fontSize: 14 },
              "& .MuiInputBase-input": { color: "var(--text-primary)" },
            }}
          />

          <motion.div whileHover={{ scale: creating ? 1 : 1.015 }} whileTap={{ scale: creating ? 1 : 0.985 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleRegister}
              disabled={creating}
              sx={{ py: 1.2, fontSize: 14, fontWeight: 700, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
            >
              {creating ? "Registering..." : "Register App"}
            </Button>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default AppGate;
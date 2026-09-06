import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Box, Typography, TextField, Button, Alert, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import BoltIcon from "@mui/icons-material/Bolt";
import apiClient from "../api/client";
import NetworkBackground from "./NetworkBackground";

const SERVER_URL = import.meta.env.VITE_API_URL;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  .appgate-root { font-family: 'DM Sans', sans-serif; }
  .appgate-success-check {
    width: 32px; height: 32px; border-radius: 8px;
    background: #ECFDF5; color: #059669;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .appgate-success-ring {
    position: absolute; inset: -5px; border-radius: 10px;
    border: 1.5px solid #A7F3D0;
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
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Typography sx={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Loading applications...</Typography>
        </motion.div>
      </Box>
    );
  }

  if (justCreated) {
    return (
      <Box className="appgate-root" sx={{ minHeight: "100vh", position: "relative", overflow: "hidden", backgroundColor: "#F8FAFC" }}>
        <style>{CSS}</style>
        <NetworkBackground maxHeight={1200} />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 3, position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 560,
              maxWidth: "100%",
              padding: 32,
              borderRadius: 20,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid #E2E8F0",
              boxShadow: "0 24px 60px -20px rgba(37,99,235,0.2)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
            >
              <motion.div
                className="appgate-success-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.div
                  className="appgate-success-ring"
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
                />
                <CheckIcon fontSize="small" />
              </motion.div>
              <Typography sx={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
                "{justCreated.name}" Registered
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}>
              <Typography sx={{ fontSize: 13.5, color: "#64748B", marginBottom: 3 }}>
                Add <code style={{ color: "#2563EB" }}>veloxdiag-starter</code> to your project's pom.xml, then configure your application.yml:
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", backgroundColor: "#0F172A", borderRadius: 10, padding: 20, marginBottom: 16 }}
            >
              <Tooltip title={copied ? "Copied!" : "Copy Snippet"}>
                <IconButton size="small" onClick={handleCopy} sx={{ position: "absolute", top: 10, right: 10, color: "#94A3B8", "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" } }}>
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <CheckIcon fontSize="small" sx={{ color: "#4ADE80" }} />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <ContentCopyIcon fontSize="small" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </IconButton>
              </Tooltip>
              <Typography
                component="pre"
                sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, color: "#F8FAFC", whiteSpace: "pre-wrap", margin: 0 }}
              >
                {snippet}
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: "#94A3B8", marginBottom: 3 }}>
                Your API key is displayed above and is also stored under Settings.
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setJustCreated(null)}
                  sx={{
                    py: 1.2, fontSize: 14, fontWeight: 700, fontFamily: "'Syne',sans-serif",
                    bgcolor: "#2563EB", borderRadius: "10px", textTransform: "none", boxShadow: "none",
                    transition: "background 0.2s, transform 0.15s",
                    "&:hover": { bgcolor: "#1D4ED8", transform: "translateY(-1px)", boxShadow: "0 8px 20px -8px rgba(37,99,235,0.5)" },
                  }}
                >
                  Continue to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </Box>
      </Box>
    );
  }

  if (apps.length > 0) {
    return children;
  }

  return (
    <Box className="appgate-root" sx={{ minHeight: "100vh", position: "relative", overflow: "hidden", backgroundColor: "#F8FAFC" }}>
      <style>{CSS}</style>
      <NetworkBackground maxHeight={1200} />
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 2, position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 400,
            padding: 32,
            borderRadius: 20,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 24px 60px -20px rgba(37,99,235,0.2)",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}
          >
            <motion.div
              initial={{ rotate: -20, scale: 0.7 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BoltIcon fontSize="medium" />
              </Box>
            </motion.div>
            <Typography sx={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              Register Application
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22, duration: 0.5 }}>
            <Typography sx={{ fontSize: 13.5, color: "#64748B", marginBottom: 3 }}>
              Enter a name for your application to generate an API ingest key and configuration snippet.
            </Typography>
          </motion.div>

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

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
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
                  transition: "box-shadow 0.2s",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "1.5px" },
                  "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(37,99,235,0.1)" },
                },
                "& .MuiInputLabel-root": { color: "#64748B", fontSize: 14 },
                "& .MuiInputBase-input": { color: "#0F172A" },
              }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.5 }}>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
                disabled={creating}
                sx={{
                  py: 1.2, fontSize: 14, fontWeight: 700, fontFamily: "'Syne',sans-serif",
                  bgcolor: "#2563EB", borderRadius: "10px", textTransform: "none", boxShadow: "none",
                  transition: "background 0.2s, transform 0.15s",
                  "&:hover": { bgcolor: "#1D4ED8", transform: "translateY(-1px)", boxShadow: "0 8px 20px -8px rgba(37,99,235,0.5)" },
                }}
              >
                {creating ? "Registering..." : "Register App"}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </Box>
    </Box>
  );
}

export default AppGate;
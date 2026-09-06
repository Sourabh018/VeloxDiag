import { useState } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab, Alert, Paper, InputAdornment } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { motion, AnimatePresence } from "motion/react";
import apiClient from "../api/client";
import BackgroundScene from "./3d/BackgroundScene";

const TOKEN_KEY = "veloxdiag_session_token";
const EMAIL_KEY = "veloxdiag_session_email";

// Same auto light/dark token system as LandingPage — no toggle, follows OS/browser setting.
const THEME_CSS = `
  .lg-root {
    --bg-page: #F8FAFC;
    --bg-glow: rgba(37,99,235,0.06);
    --bg-elevated: #FFFFFF;
    --bg-field: #FFFFFF;
    --bg-tabs: #F1F5F9;
    --bg-tab-active: #FFFFFF;
    --border-color: #E2E8F0;
    --border-hover: #CBD5E1;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --icon-bg: #EFF6FF;
    --icon-color: #2563EB;
    --shadow-card: rgba(15,23,42,0.08);
    --shadow-tab: rgba(15,23,42,0.08);
  }
  @media (prefers-color-scheme: dark) {
    .lg-root {
      --bg-page: #0B1220;
      --bg-glow: rgba(37,99,235,0.18);
      --bg-elevated: #121A2B;
      --bg-field: #0D1420;
      --bg-tabs: #0D1420;
      --bg-tab-active: #1B2438;
      --border-color: rgba(255,255,255,0.1);
      --border-hover: rgba(255,255,255,0.2);
      --text-primary: #F1F5F9;
      --text-secondary: #94A3B8;
      --icon-bg: rgba(37,99,235,0.15);
      --icon-color: #60A5FA;
      --shadow-card: rgba(0,0,0,0.5);
      --shadow-tab: rgba(0,0,0,0.35);
    }
  }
`;

function LoginGate({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || "");
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    apiClient.post("/api/auth/logout").catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken("");
    setEmail("");
  };

  const handleSubmit = async () => {
    if (!formEmail.trim() || !formPassword) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await apiClient.post(endpoint, { email: formEmail.trim(), password: formPassword });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(EMAIL_KEY, res.data.email);
      setToken(res.data.token);
      setEmail(res.data.email);
    } catch (err) {
      const message = err.response?.data || (mode === "login" ? "Invalid email or password." : "Registration failed.");
      setError(typeof message === "string" ? message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    window.__veloxdiagSignOut = handleSignOut;
    window.__veloxdiagCurrentEmail = email;
    return children;
  }

  return (
    <Box
      className="lg-root"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 700px 450px at 50% 0%, var(--bg-glow), transparent 65%), var(--bg-page)",
        padding: 2,
        position: "relative",
      }}
    >
      <style>{THEME_CSS}</style>
      <BackgroundScene intensity="hero" />

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: -18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1200 }}
      >
        <Paper
          elevation={0}
          sx={{
            width: 400,
            p: 4,
            borderRadius: "16px",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 20px 45px -12px var(--shadow-card)",
            textAlign: "center",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: "var(--icon-bg)",
                  color: "var(--icon-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BoltIcon fontSize="medium" />
              </Box>
            </motion.div>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              VeloxDiag
            </Typography>
          </Box>

          <Box sx={{ position: "relative", height: 20, mb: 3, overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                style={{ position: "absolute", left: 0, right: 0 }}
              >
                <Typography sx={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                  {mode === "login" ? "Sign in to access your APM dashboard" : "Create an account to begin monitoring"}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
          <Tabs
            value={mode}
            onChange={(_, v) => { setMode(v); setError(null); }}
            variant="fullWidth"
            sx={{
              marginBottom: 3,
              minHeight: 40,
              bgcolor: "var(--bg-tabs)",
              borderRadius: "8px",
              padding: "4px",
              transition: "background-color 0.3s ease",
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": {
                minHeight: 32,
                fontSize: 13.5,
                fontWeight: 600,
                textTransform: "none",
                color: "var(--text-secondary)",
                borderRadius: "6px",
                transition: "all 0.15s",
              },
              "& .Mui-selected": {
                color: "var(--text-primary) !important",
                backgroundColor: "var(--bg-tab-active)",
                boxShadow: "0 1px 3px var(--shadow-tab)",
              },
            }}
          >
            <Tab label="Log in" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>
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

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
          <TextField
            type="email"
            label="Email address"
            placeholder="developer@company.com"
            fullWidth
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 18, color: "var(--icon-color)" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.42 }}
            >
              <TextField
                type="password"
                label="Password"
                placeholder={mode === "register" ? "Minimum 8 characters" : "Enter password"}
                fullWidth
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 18, color: "var(--icon-color)" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ ...fieldSx, marginTop: 2, marginBottom: 3 }}
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                py: 1.2,
                fontSize: 14,
                fontWeight: 700,
                bgcolor: "#2563EB",
                "&:hover": { bgcolor: "#1D4ED8" },
              }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-field)",
    fontSize: 14,
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
    "& fieldset": { borderColor: "var(--border-color)" },
    "&:hover fieldset": { borderColor: "var(--border-hover)" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root": { color: "var(--text-secondary)", fontSize: 14 },
  "& .MuiInputBase-input": { color: "var(--text-primary)" },
};

export default LoginGate;
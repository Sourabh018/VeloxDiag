import { useState } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab, Alert, Paper } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import apiClient from "../api/client";

const TOKEN_KEY = "veloxdiag_session_token";
const EMAIL_KEY = "veloxdiag_session_email";

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
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        padding: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 400,
          p: 4,
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "#EFF6FF",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltIcon fontSize="medium" />
          </Box>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
            VeloxDiag
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 13.5, color: "#64748B", mb: 3 }}>
          {mode === "login" ? "Sign in to access your APM dashboard" : "Create an account to begin monitoring"}
        </Typography>

        <Tabs
          value={mode}
          onChange={(_, v) => { setMode(v); setError(null); }}
          variant="fullWidth"
          sx={{
            marginBottom: 3,
            minHeight: 40,
            bgcolor: "#F1F5F9",
            borderRadius: "8px",
            padding: "4px",
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 32,
              fontSize: 13.5,
              fontWeight: 600,
              textTransform: "none",
              color: "#64748B",
              borderRadius: "6px",
              transition: "all 0.15s",
            },
            "& .Mui-selected": {
              color: "#0F172A !important",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            },
          }}
        >
          <Tab label="Log in" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2.5, fontSize: 13, textAlign: "left", borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <TextField
          type="email"
          label="Email address"
          placeholder="developer@company.com"
          fullWidth
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          sx={fieldSx}
        />
        <TextField
          type="password"
          label="Password"
          placeholder={mode === "register" ? "Minimum 8 characters" : "Enter password"}
          fullWidth
          value={formPassword}
          onChange={(e) => setFormPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          sx={{ ...fieldSx, marginTop: 2, marginBottom: 3 }}
        />

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
      </Paper>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    borderRadius: "8px",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
  },
  "& .MuiInputLabel-root": { color: "#64748B", fontSize: 14 },
  "& .MuiInputBase-input": { color: "#0F172A" },
};

export default LoginGate;
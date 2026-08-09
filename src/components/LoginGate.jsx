import { useState } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab, Alert } from "@mui/material";
import apiClient from "../api/client";

const TOKEN_KEY = "veloxdiag_session_token";
const EMAIL_KEY = "veloxdiag_session_email";

/**
 * Real per-user login/register — replaces the old shared-secret AccessGate.
 * Talks to AuthController (/api/auth/register, /api/auth/login) on the
 * backend. Session token stored in localStorage; apiClient's interceptor
 * (see api/client.js) attaches it as a Bearer token on every request.
 *
 * "Sign out" is exposed on window for the same reason the old AccessGate
 * did it — rare action, not worth threading through props/context everywhere.
 */
function LoginGate({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || "");
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    apiClient.post("/api/auth/logout").catch(() => {}); // best-effort, don't block sign-out on it
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
        backgroundColor: "#0C0C0E",
      }}
    >
      <Box sx={{ width: 360, textAlign: "center" }}>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#EDEDEF", marginBottom: 0.5 }}>
          VeloxDiag
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: "#8C8C93", marginBottom: 2.5 }}>
          {mode === "login" ? "Log in to see your applications." : "Create an account to start monitoring."}
        </Typography>

        <Tabs
          value={mode}
          onChange={(_, v) => { setMode(v); setError(null); }}
          centered
          sx={{
            marginBottom: 2.5,
            minHeight: 36,
            "& .MuiTab-root": { minHeight: 36, fontSize: 13, textTransform: "none", color: "#8C8C93" },
            "& .Mui-selected": { color: "#EDEDEF !important" },
          }}
        >
          <Tab label="Log in" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2, fontSize: 13, textAlign: "left" }}>
            {error}
          </Alert>
        )}

        <TextField
          type="email"
          placeholder="Email"
          fullWidth
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          sx={fieldSx}
        />
        <TextField
          type="password"
          placeholder={mode === "register" ? "Password (min 8 characters)" : "Password"}
          fullWidth
          value={formPassword}
          onChange={(e) => setFormPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          sx={{ ...fieldSx, marginTop: 1.5, marginBottom: 2.5 }}
        />

        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            textTransform: "none",
            color: "#EDEDEF",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 0",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.09)" },
          }}
        >
          {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
        </Button>
      </Box>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#111113",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
  },
  "& .MuiInputBase-input": { color: "#EDEDEF", fontSize: 14 },
};

export default LoginGate;
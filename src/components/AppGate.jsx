import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Alert, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import apiClient from "../api/client";

const SERVER_URL = import.meta.env.VITE_API_URL;

/**
 * Sits between LoginGate and the rest of the app. A logged-in user with zero
 * registered applications has nothing to look at yet — no app-selector value,
 * no telemetry, nothing. Old behavior was AppSelector spinning on "Loading…"
 * forever. This gate calls GET /api/applications first; if empty, it shows a
 * "register your app" form (POST /api/applications) and then the exact
 * pom.xml + application.yml snippet for veloxdiag-starter, using the key that
 * came back. Only once at least one app exists does it render children.
 */
function AppGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [justCreated, setJustCreated] = useState(null); // {name, ingestApiKey}
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
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0C0C0E" }}>
        <Typography sx={{ fontSize: 13.5, color: "#8C8C93" }}>Loading…</Typography>
      </Box>
    );
  }

  // Step 2: app just created — show the starter snippet, then let them in.
  // Checked before the apps.length>0 fallthrough since justCreated's app is
  // already in `apps` at this point (added in handleRegister) — without this
  // ordering the snippet screen would never render, it'd skip straight past.
  if (justCreated) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0C0C0E", padding: 2 }}>
        <Box sx={{ width: 560, textAlign: "left" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#EDEDEF", marginBottom: 0.5 }}>
            "{justCreated.name}" registered
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "#8C8C93", marginBottom: 2.5 }}>
            Add veloxdiag-starter to your app's pom.xml, then drop this into application.yml. Data shows up here as soon as your app takes its first request.
          </Typography>

          <Box sx={{ position: "relative", backgroundColor: "#111113", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: 2 }}>
            <Tooltip title={copied ? "Copied" : "Copy"}>
              <IconButton size="small" onClick={handleCopy} sx={{ position: "absolute", top: 8, right: 8, color: "#8C8C93" }}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Typography
              component="pre"
              sx={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5, color: "#EDEDEF", whiteSpace: "pre-wrap", margin: 0 }}
            >
              {snippet}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 12, color: "#57575F", marginTop: 1.5, marginBottom: 2.5 }}>
            Your API key is shown once here. It's also on the Settings page if you need it again.
          </Typography>

          <Button
            fullWidth
            onClick={() => setJustCreated(null)}
            sx={{
              textTransform: "none",
              color: "#EDEDEF",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 0",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.09)" },
            }}
          >
            Continue to dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  if (apps.length > 0) {
    return children;
  }

  // Step 1: no apps yet — register one.
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0C0C0E" }}>
      <Box sx={{ width: 360, textAlign: "center" }}>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#EDEDEF", marginBottom: 0.5 }}>
          Register your app
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: "#8C8C93", marginBottom: 2.5 }}>
          Give it a name — you'll get an API key and a starter snippet to drop into your project.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2, fontSize: 13, textAlign: "left" }}>
            {error}
          </Alert>
        )}

        <TextField
          placeholder="App name, e.g. AgroMart"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          sx={{
            marginBottom: 2.5,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#111113",
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
            },
            "& .MuiInputBase-input": { color: "#EDEDEF", fontSize: 14 },
          }}
        />

        <Button
          fullWidth
          onClick={handleRegister}
          disabled={creating}
          sx={{
            textTransform: "none",
            color: "#EDEDEF",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 0",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.09)" },
          }}
        >
          {creating ? "..." : "Register app"}
        </Button>
      </Box>
    </Box>
  );
}

export default AppGate;
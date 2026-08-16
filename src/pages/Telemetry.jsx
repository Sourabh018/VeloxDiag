import { Box, Typography, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Paper, Chip, Alert } from "@mui/material";
import SensorsIcon from "@mui/icons-material/Sensors";
import Header from "../components/Header";
import useDashboardMetrics from "../hooks/useDashboardMetrics";
import { useSelectedApp } from "../contexts/AppContext";

function statusStyle(status) {
  if (status >= 500) return { color: "#991B1B", bgcolor: "#FEF2F2", border: "#FCA5A5", label: `${status}` };
  if (status >= 400) return { color: "#92400E", bgcolor: "#FFFBEB", border: "#FCD34D", label: `${status}` };
  if (status >= 200) return { color: "#065F46", bgcolor: "#ECFDF5", border: "#6EE7B7", label: `${status}` };
  return { color: "#475569", bgcolor: "#F8FAFC", border: "#CBD5E1", label: `${status}` };
}

function StatusChip({ status }) {
  const s = statusStyle(status);
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
        fontSize: 11.5,
        fontWeight: 700,
        color: s.color,
        bgcolor: s.bgcolor,
        border: `1px solid ${s.border}`,
        height: 22,
        borderRadius: "6px",
      }}
    />
  );
}

function MethodChip({ method }) {
  const colors = {
    GET: { color: "#1E40AF", bgcolor: "#EFF6FF", border: "#BFDBFE" },
    POST: { color: "#065F46", bgcolor: "#ECFDF5", border: "#6EE7B7" },
    PUT: { color: "#92400E", bgcolor: "#FFFBEB", border: "#FCD34D" },
    PATCH: { color: "#6B21A8", bgcolor: "#FAF5FF", border: "#D8B4FE" },
    DELETE: { color: "#991B1B", bgcolor: "#FEF2F2", border: "#FCA5A5" },
  };
  const c = colors[method?.toUpperCase()] || { color: "#475569", bgcolor: "#F8FAFC", border: "#CBD5E1" };
  return (
    <Chip
      label={method || "—"}
      size="small"
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
        fontWeight: 700,
        color: c.color,
        bgcolor: c.bgcolor,
        border: `1px solid ${c.border}`,
        height: 22,
        borderRadius: "6px",
      }}
    />
  );
}

function TelemetryTable({ title, rows, emptyMessage }) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
          {title}
        </Typography>
        <Chip
          label={`${rows.length} record${rows.length !== 1 ? "s" : ""}`}
          size="small"
          sx={{ fontSize: 11.5, fontWeight: 600, bgcolor: "#F1F5F9", color: "#475569", height: 22, borderRadius: "6px" }}
        />
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 13.5, color: "#94A3B8" }}>{emptyMessage}</Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Endpoint", "Method", "Status", "Duration", "Timestamp"].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{
                    "&:hover": { bgcolor: "#F8FAFC" },
                    "&:last-of-type td": { border: 0 },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <TableCell
                    sx={{
                      fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
                      fontSize: 13,
                      color: "#0F172A",
                      fontWeight: 600,
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.endpoint}
                  </TableCell>
                  <TableCell>
                    <MethodChip method={row.method} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 13,
                      color: "#334155",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.durationMs != null ? `${row.durationMs}ms` : "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      color: "#64748B",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.timestamp
                      ? new Date(row.timestamp.endsWith("Z") ? row.timestamp : row.timestamp + "Z").toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "short",
                          timeStyle: "medium",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}

function Telemetry({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { recent, errors, loading, error } = useDashboardMetrics({ applicationName: selectedApp });

  const safeRecent = Array.isArray(recent) ? recent : [];
  const safeErrors = Array.isArray(errors) ? errors : [];

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
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SensorsIcon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
              Telemetry Feed
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Live request and error stream for{" "}
            <strong style={{ color: "#0F172A" }}>{selectedApp || "Selected Application"}</strong>.
            Displaying the latest HTTP events ingested into the analysis buffer.
          </Typography>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "10px" }}>
            Could not reach VeloxDiag server — showing last known telemetry data
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </Box>
        ) : (
          <>
            <TelemetryTable title="Recent Requests" rows={safeRecent} emptyMessage="No recent requests recorded for this application." />
            <TelemetryTable title="Recent Errors" rows={safeErrors} emptyMessage="No errors recorded — your application looks clean!" />
          </>
        )}
      </Box>
    </>
  );
}

export default Telemetry;
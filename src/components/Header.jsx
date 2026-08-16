import { AppBar, Toolbar, Typography, Box, Stack, IconButton, Chip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import BoltIcon from "@mui/icons-material/Bolt";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useEffect, useState } from "react";
import AppSelector from "./AppSelector";

function LivePulse() {
  const bars = 10;
  return (
    <Stack direction="row" spacing={0.35} alignItems="flex-end" sx={{ height: 14 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 2.5,
            bgcolor: "#3B82F6",
            borderRadius: 0.5,
            animation: `veloxPulse 1.4s ease-in-out ${i * 0.1}s infinite`,
            "@keyframes veloxPulse": {
              "0%, 100%": { height: "25%", opacity: 0.25 },
              "50%": { height: "100%", opacity: 1 },
            },
          }}
        />
      ))}
    </Stack>
  );
}

function Header({ onMobileMenuToggle }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E9EEF4",
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Left: mobile menu + logo + app selector */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {onMobileMenuToggle && (
            <IconButton
              edge="start"
              onClick={onMobileMenuToggle}
              size="small"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "#475569",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                width: 34,
                height: 34,
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <MenuIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}

          {/* VeloxDiag logo + heading */}
<Stack
  direction="row"
  spacing={1}
  alignItems="center"
  sx={{ cursor: "pointer" }}
>
  <Box
    sx={{
      width: 32,
      height: 32,
      borderRadius: "8px",
      background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
    }}
  >
    <BoltIcon sx={{ fontSize: 18 }} />
  </Box>

  <Typography
    sx={{
      fontSize: 18,
      fontWeight: 800,
      color: "#0F172A",
      letterSpacing: "-0.03em",
    }}
  >
    VeloxDiag
  </Typography>
</Stack>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <AppSelector />
          </Box>
        </Stack>

        {/* Right: clock + pulse + status + notification */}
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
              fontSize: 11.5,
              fontWeight: 500,
              color: "#94A3B8",
              display: { xs: "none", md: "block" },
              letterSpacing: "0.02em",
            }}
          >
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </Typography>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <LivePulse />
          </Box>

          {/* Connected status badge */}
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{
              bgcolor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "20px",
              px: 1.25,
              py: 0.35,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#10B981",
                animation: "connectedPing 2s ease-in-out infinite",
                "@keyframes connectedPing": {
                  "0%, 100%": { opacity: 1, transform: "scale(1)" },
                  "50%": { opacity: 0.6, transform: "scale(0.85)" },
                },
              }}
            />
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#166534",
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: "0.01em",
              }}
            >
              live
            </Typography>
          </Stack>

          <IconButton
            size="small"
            sx={{
              color: "#94A3B8",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              width: 32,
              height: 32,
              display: { xs: "none", sm: "flex" },
              "&:hover": { bgcolor: "#F1F5F9", color: "#475569" },
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Stack>
      </Toolbar>

      {/* Mobile app selector row */}
      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          px: 2,
          pb: 1.25,
          borderTop: "1px solid #F1F5F9",
          pt: 1,
        }}
      >
        <AppSelector />
      </Box>
    </AppBar>
  );
}

export default Header;
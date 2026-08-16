import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    primary: {
      main: "#2563EB",
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#475569",
      light: "#64748B",
      dark: "#334155",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#059669",
      light: "#10B981",
      dark: "#047857",
    },
    warning: {
      main: "#D97706",
      light: "#F59E0B",
      dark: "#B45309",
    },
    error: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
    },
    info: {
      main: "#0284C7",
      light: "#0EA5E9",
      dark: "#0369A1",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h3: {
      fontSize: "1.75rem",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: "#0F172A",
      lineHeight: 1.2,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 800,
      letterSpacing: "-0.025em",
      color: "#0F172A",
      lineHeight: 1.3,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 700,
      color: "#0F172A",
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontSize: "0.9375rem",
      fontWeight: 500,
      color: "#475569",
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#475569",
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: "#0F172A",
    },
    body2: {
      fontSize: "0.8125rem",
      lineHeight: 1.6,
      color: "#475569",
    },
    caption: {
      fontSize: "0.75rem",
      color: "#64748B",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0 1px 2px rgba(15, 23, 42, 0.04)",
    "0 1px 4px rgba(15, 23, 42, 0.06)",
    "0 2px 8px rgba(15, 23, 42, 0.08)",
    "0 4px 12px rgba(15, 23, 42, 0.08)",
    "0 6px 16px rgba(15, 23, 42, 0.10)",
    "0 8px 24px rgba(15, 23, 42, 0.10)",
    "0 10px 32px rgba(15, 23, 42, 0.12)",
    "0 12px 40px rgba(15, 23, 42, 0.12)",
    "0 16px 48px rgba(15, 23, 42, 0.14)",
    "0 20px 56px rgba(15, 23, 42, 0.14)",
    "0 24px 64px rgba(15, 23, 42, 0.16)",
    "0 28px 72px rgba(15, 23, 42, 0.16)",
    "0 32px 80px rgba(15, 23, 42, 0.18)",
    "0 36px 88px rgba(15, 23, 42, 0.18)",
    "0 40px 96px rgba(15, 23, 42, 0.20)",
    "0 44px 104px rgba(15, 23, 42, 0.20)",
    "0 48px 112px rgba(15, 23, 42, 0.22)",
    "0 52px 120px rgba(15, 23, 42, 0.22)",
    "0 56px 128px rgba(15, 23, 42, 0.24)",
    "0 60px 136px rgba(15, 23, 42, 0.24)",
    "0 64px 144px rgba(15, 23, 42, 0.26)",
    "0 68px 152px rgba(15, 23, 42, 0.26)",
    "0 72px 160px rgba(15, 23, 42, 0.28)",
    "0 76px 168px rgba(15, 23, 42, 0.28)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@import": "url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')",
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
        },
        "*::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          background: "#CBD5E1",
          borderRadius: "3px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "#94A3B8",
        },
        body: {
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          boxShadow: "none",
          letterSpacing: "-0.01em",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#2563EB",
          "&:hover": {
            backgroundColor: "#1D4ED8",
          },
        },
        outlinedPrimary: {
          borderColor: "#BFDBFE",
          "&:hover": {
            borderColor: "#2563EB",
            backgroundColor: "#EFF6FF",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F1F5F9",
          padding: "12px 16px",
          color: "#0F172A",
          fontSize: "0.8125rem",
        },
        head: {
          backgroundColor: "#F8FAFC",
          color: "#64748B",
          fontWeight: 700,
          fontSize: "0.6875rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          borderBottom: "1px solid #E2E8F0",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-of-type td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.8125rem",
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0F172A",
          fontSize: "0.75rem",
          fontWeight: 500,
          borderRadius: 6,
          padding: "6px 10px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: "#E2E8F0",
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
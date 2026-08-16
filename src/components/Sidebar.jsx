import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import SensorsIcon from "@mui/icons-material/Sensors";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import BoltIcon from "@mui/icons-material/Bolt";
import SettingsIcon from "@mui/icons-material/Settings";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ChatIcon from "@mui/icons-material/Chat";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";

const menuGroups = [
  {
    title: "MONITORING",
    items: [
      { index: 0, label: "Dashboard", icon: <SpeedIcon sx={{ fontSize: 17 }} /> },
      { index: 1, label: "Diagnosis", icon: <TroubleshootIcon sx={{ fontSize: 17 }} /> },
      { index: 2, label: "Recommendations", icon: <LightbulbIcon sx={{ fontSize: 17 }} /> },
      { index: 3, label: "Fixes", icon: <BuildCircleIcon sx={{ fontSize: 17 }} /> },
      { index: 4, label: "Telemetry", icon: <SensorsIcon sx={{ fontSize: 17 }} /> },
    ],
  },
  {
    title: "DATABASE INTELLIGENCE",
    items: [
      { index: 5, label: "Slow Queries", icon: <HourglassBottomIcon sx={{ fontSize: 17 }} /> },
      { index: 6, label: "Query Analyzer", icon: <QueryStatsIcon sx={{ fontSize: 17 }} /> },
      { index: 7, label: "Index Advisor", icon: <BoltIcon sx={{ fontSize: 17 }} /> },
      { index: 8, label: "Rules", icon: <GavelIcon sx={{ fontSize: 17 }} /> },
    ],
  },
  {
    title: "AI & CONFIGURATION",
    items: [
      { index: 9, label: "Ask VeloxDiag", icon: <ChatIcon sx={{ fontSize: 17 }} /> },
      { index: 10, label: "Business Context", icon: <DescriptionIcon sx={{ fontSize: 17 }} /> },
      { index: 11, label: "Settings", icon: <SettingsIcon sx={{ fontSize: 17 }} /> },
    ],
  },
];

const DRAWER_WIDTH = 248;

function LogoMark() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 2.5,
        py: 2,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)",
          flexShrink: 0,
        }}
      >
        <BoltIcon sx={{ fontSize: 18 }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 15.5,
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          VeloxDiag
        </Typography>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "#94A3B8",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            lineHeight: 1,
            mt: 0.3,
          }}
        >
          Performance Intelligence
        </Typography>
      </Box>
    </Box>
  );
}

function SidebarContent({ activeIndex, onSelect }) {
  const userEmail = window.__veloxdiagCurrentEmail || "";

  const handleLogout = () => {
    if (window.__veloxdiagSignOut) window.__veloxdiagSignOut();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <LogoMark />
      <Divider sx={{ borderColor: "#F1F5F9", mx: 2 }} />

      {/* Nav */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        {menuGroups.map((group) => (
          <Box key={group.title} sx={{ mb: 3 }}>
            <Typography
              sx={{
                px: 1.5,
                mb: 0.75,
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "#B0BFCE",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const isSelected = activeIndex === item.index;
                return (
                  <ListItemButton
                    key={item.label}
                    selected={isSelected}
                    onClick={() => onSelect(item.index)}
                    sx={{
                      borderRadius: "9px",
                      mb: 0.5,
                      py: 0.9,
                      px: 1.5,
                      position: "relative",
                      color: isSelected ? "#1D4ED8" : "#64748B",
                      bgcolor: isSelected ? "#EFF6FF" : "transparent",
                      "&.Mui-selected": {
                        bgcolor: "#EFF6FF",
                        color: "#1D4ED8",
                        "&:hover": { bgcolor: "#DBEAFE" },
                      },
                      "&:hover": {
                        bgcolor: isSelected ? "#DBEAFE" : "#F1F5F9",
                        color: isSelected ? "#1D4ED8" : "#0F172A",
                      },
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Active indicator bar */}
                    {isSelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: "18%",
                          height: "64%",
                          width: 3,
                          bgcolor: "#2563EB",
                          borderRadius: "0 3px 3px 0",
                        }}
                      />
                    )}
                    <ListItemIcon
                      sx={{
                        minWidth: 30,
                        color: isSelected ? "#2563EB" : "#94A3B8",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 13.5,
                            fontWeight: isSelected ? 700 : 500,
                            letterSpacing: "-0.01em",
                            color: "inherit",
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: "1px solid #F1F5F9",
          p: 1.5,
          bgcolor: "#FAFBFC",
        }}
      >
        {userEmail && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              px: 1.5,
              py: 0.75,
              bgcolor: "#F8FAFC",
              borderRadius: "8px",
              border: "1px solid #F1F5F9",
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PersonIcon sx={{ fontSize: 14 }} />
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#475569",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {userEmail}
            </Typography>
          </Box>
        )}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: "9px",
            py: 0.85,
            px: 1.5,
            color: "#64748B",
            "&:hover": {
              bgcolor: "#FEF2F2",
              color: "#DC2626",
              "& .MuiListItemIcon-root": { color: "#DC2626" },
            },
            transition: "all 0.15s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 30, color: "inherit", transition: "color 0.15s ease" }}>
            <LogoutIcon sx={{ fontSize: 17 }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            slotProps={{
              primary: {
                sx: { fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.01em", color: "inherit" },
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

function Sidebar({ activeIndex, onSelect, mobileOpen, onMobileClose }) {
  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    bgcolor: "#FFFFFF",
    borderRight: "1px solid #E9EEF4",
    boxShadow: "none",
  };

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <SidebarContent activeIndex={activeIndex} onSelect={onSelect} />
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <SidebarContent activeIndex={activeIndex} onSelect={onSelect} />
      </Drawer>
    </>
  );
}

export default Sidebar;
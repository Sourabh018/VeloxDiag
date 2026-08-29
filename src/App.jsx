import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import LoginGate from "./components/LoginGate";
import AppGate from "./components/AppGate";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Recommendations from "./pages/Recommendations";
import Telemetry from "./pages/Telemetry";
import SlowQueries from "./pages/SlowQueries";
import QueryAnalyzer from "./pages/QueryAnalyzer";
import IndexAdvisor from "./pages/IndexAdvisor";
import Rules from "./pages/Rules";
import ChatPage from "./pages/ChatPage";
import Fixes from "./pages/Fixes";
import ImpactReport from "./pages/ImpactReport";
import Settings from "./pages/Settings";
import { AppProvider } from "./contexts/AppContext";

const pages = [
  Dashboard,
  Diagnosis,
  Recommendations,
  Fixes,
  Telemetry,
  SlowQueries,
  QueryAnalyzer,
  IndexAdvisor,
  Rules,
  ChatPage,
  Settings,
  ImpactReport, // index 11 — appended, not inserted, so existing Sidebar indices (0-10) don't shift
];

const TOKEN_KEY = "veloxdiag_session_token";

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Skip landing entirely if already logged in — go straight into the app.
  const [showLanding, setShowLanding] = useState(
    () => !localStorage.getItem(TOKEN_KEY)
  );
  const ActivePage = pages[activeIndex] ?? Dashboard;

  const handleMobileMenuToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  if (showLanding) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LandingPage onEnter={() => setShowLanding(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginGate>
        <AppGate>
          <AppProvider>
            <Sidebar
              activeIndex={activeIndex}
              onSelect={(index) => {
                setActiveIndex(index);
                setMobileOpen(false);
              }}
              mobileOpen={mobileOpen}
              onMobileClose={() => setMobileOpen(false)}
            />
            <ActivePage onMobileMenuToggle={handleMobileMenuToggle} />
          </AppProvider>
        </AppGate>
      </LoginGate>
    </ThemeProvider>
  );
}

export default App;
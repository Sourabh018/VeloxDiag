import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import LoginGate from "./components/LoginGate";
import AppGate from "./components/AppGate";
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
import BusinessContext from "./pages/BusinessContext";
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
  BusinessContext,
  Settings,
];

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ActivePage = pages[activeIndex] ?? Dashboard;

  const handleMobileMenuToggle = () => {
    setMobileOpen((prev) => !prev);
  };

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
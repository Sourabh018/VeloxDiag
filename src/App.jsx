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

// Sidebar order: Dashboard, Diagnosis, Recommendations, Fixes, Telemetry, Slow
// Queries, Query Analyzer, Index Advisor, Rules, Ask VeloxDiag, Business
// Context, Settings — must match Sidebar.jsx's menu array order exactly,
// since activeIndex is a plain array index into both.
const pages = [Dashboard, Diagnosis, Recommendations, Fixes, Telemetry, SlowQueries, QueryAnalyzer, IndexAdvisor, Rules, ChatPage, BusinessContext, Settings];

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ActivePage = pages[activeIndex] ?? Dashboard;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoginGate>
        <AppGate>
          <AppProvider>
            <Sidebar activeIndex={activeIndex} onSelect={setActiveIndex} />
            <ActivePage />
          </AppProvider>
        </AppGate>
      </LoginGate>
    </ThemeProvider>
  );
}

export default App;
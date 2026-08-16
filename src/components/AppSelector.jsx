import { useEffect, useState } from "react";
import { Select, MenuItem, FormControl } from "@mui/material";
import apiClient from "../api/client";
import { useSelectedApp } from "../contexts/AppContext";

function AppSelector() {
  const { selectedApp, setSelectedApp } = useSelectedApp();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    apiClient
      .get("/api/applications")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data.map((a) => a.name) : [];
        setApps(list);
        if (list.length > 0 && (!selectedApp || selectedApp === "all" || !list.includes(selectedApp))) {
          setSelectedApp(list[0]);
        }
      })
      .catch((err) => console.error("Fetch applications failed:", err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormControl size="small" sx={{ minWidth: 170 }}>
      <Select
        value={apps.includes(selectedApp) ? selectedApp : ""}
        onChange={(e) => setSelectedApp(e.target.value)}
        displayEmpty
        sx={{
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          fontSize: 13.5,
          fontWeight: 600,
          borderRadius: "8px",
          height: 36,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563EB" },
        }}
      >
        {apps.length === 0 && (
          <MenuItem value="" disabled>
            Loading apps...
          </MenuItem>
        )}
        {apps.map((name) => (
          <MenuItem key={name} value={name} sx={{ fontSize: 13.5, fontWeight: 500, color: "#0F172A" }}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default AppSelector;
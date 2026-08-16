import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Fetches real dashboard data from the VeloxDiag server.
 * Polls on an interval so the dashboard stays live.
 * Waits for a real applicationName before fetching at all — firing a request
 * with no app filter while it's still null would pull unfiltered/global data
 * (a flash of another app's real numbers) right before the correctly-filtered
 * fetch overwrites it with this app's actual (possibly empty) data.
 */
export default function useDashboardMetrics({ intervalMs = 15000, applicationName } = {}) {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [errors, setErrors] = useState([]);
  const [slowEndpoints, setSlowEndpoints] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!applicationName) {
      // No app selected yet — don't fetch unfiltered data, just wait.
      return;
    }

    try {
      const appParam = { applicationName };

      const [summaryRes, recentRes, errorsRes, slowRes, trendsRes] = await Promise.all([
        apiClient.get("/api/dashboard/summary", { params: appParam }),
        apiClient.get("/api/dashboard/recent", { params: { limit: 20, ...appParam } }),
        apiClient.get("/api/dashboard/errors", { params: { limit: 20, ...appParam } }),
        apiClient.get("/api/dashboard/slow-endpoints", { params: { limit: 10, ...appParam } }),
        apiClient.get("/api/dashboard/trends", { params: { hours: 24, ...appParam } }),
      ]);

      setSummary(summaryRes.data);
      setRecent(recentRes.data);
      setErrors(errorsRes.data);
      setSlowEndpoints(slowRes.data);
      setTrends(trendsRes.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch failed:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [applicationName]);

  useEffect(() => {
    if (!applicationName) {
      // Stay in loading state until we actually know which app to fetch.
      setLoading(true);
      return;
    }
    fetchAll();
    const id = setInterval(fetchAll, intervalMs);
    return () => clearInterval(id);
  }, [fetchAll, intervalMs, applicationName]);

  return { summary, recent, errors, slowEndpoints, trends, loading, error, refetch: fetchAll };
}
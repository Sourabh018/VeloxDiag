import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Wires up the two Phase 2.5 pipelines that already exist server-side —
 * JvmMetricsController (/api/jvm-metrics) and ConnectionPoolMetricsController
 * (/api/connection-pool-metrics) — but never had a dashboard consumer.
 * Both expose the same /latest + /history?applicationName= shape, so one
 * hook fetches both in parallel rather than duplicating the pattern twice.
 *
 * Uses Promise.allSettled, not Promise.all: an app with a starter version
 * that predates one of these two pipelines should still show the metrics
 * it does report, not go blank because the other 404s/empty-arrays.
 */
export default function useSystemHealth(applicationName) {
  const [jvmLatest, setJvmLatest] = useState(null);
  const [jvmHistory, setJvmHistory] = useState([]);
  const [poolLatest, setPoolLatest] = useState(null);
  const [poolHistory, setPoolHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!applicationName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = { applicationName };

    const [jvmLatestRes, jvmHistoryRes, poolLatestRes, poolHistoryRes] = await Promise.allSettled([
      apiClient.get("/api/jvm-metrics/latest", { params }),
      apiClient.get("/api/jvm-metrics/history", { params }),
      apiClient.get("/api/connection-pool-metrics/latest", { params }),
      apiClient.get("/api/connection-pool-metrics/history", { params }),
    ]);

    setJvmLatest(jvmLatestRes.status === "fulfilled" ? jvmLatestRes.value.data : null);
    setJvmHistory(
      jvmHistoryRes.status === "fulfilled" && Array.isArray(jvmHistoryRes.value.data)
        ? jvmHistoryRes.value.data
        : []
    );
    setPoolLatest(poolLatestRes.status === "fulfilled" ? poolLatestRes.value.data : null);
    setPoolHistory(
      poolHistoryRes.status === "fulfilled" && Array.isArray(poolHistoryRes.value.data)
        ? poolHistoryRes.value.data
        : []
    );

    // Only surface an error banner if every single call failed — one or
    // two 404s just means that pipeline has no data yet for this app,
    // which the empty states already handle gracefully.
    const allFailed = [jvmLatestRes, jvmHistoryRes, poolLatestRes, poolHistoryRes].every(
      (r) => r.status === "rejected"
    );
    setError(allFailed ? jvmLatestRes.reason || poolLatestRes.reason : null);
    setLoading(false);
  }, [applicationName]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    jvmLatest,
    jvmHistory,
    poolLatest,
    poolHistory,
    loading,
    error,
    refetch: fetchAll,
  };
}
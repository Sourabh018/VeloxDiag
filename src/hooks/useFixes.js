import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Manages the "Fixes" page: real before/after comparisons backed by
 * FixSnapshot on the backend. markFixed() freezes current metrics as the
 * baseline; fetchComparisons() recomputes the after-side live every time
 * it's called — no polling needed, the page just re-fetches on demand
 * (e.g. a manual refresh button) since improvement only shows up once
 * fresh traffic has flowed post-fix anyway.
 */
export default function useFixes(applicationName) {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [markError, setMarkError] = useState(null);

  const fetchComparisons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/fixes", {
        params: applicationName ? { applicationName } : {},
      });
      setComparisons(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Fixes fetch failed:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [applicationName]);

  const markFixed = useCallback(async (endpoint, ruleType, note) => {
    if (!applicationName || !endpoint || !ruleType) return { ok: false };
    setMarking(true);
    setMarkError(null);
    try {
      await apiClient.post("/api/fixes", null, {
        params: { applicationName, endpoint, ruleType, note },
      });
      await fetchComparisons();
      return { ok: true };
    } catch (err) {
      console.error("Mark as fixed failed:", err.message);
      setMarkError(err);
      return { ok: false, error: err };
    } finally {
      setMarking(false);
    }
  }, [applicationName, fetchComparisons]);

  const deleteFix = useCallback(async (endpoint, ruleType) => {
    if (!applicationName || !endpoint || !ruleType) return { ok: false };
    try {
      await apiClient.delete("/api/fixes", {
        params: { applicationName, endpoint, ruleType },
      });
      await fetchComparisons();
      return { ok: true };
    } catch (err) {
      console.error("Delete fix failed:", err.message);
      return { ok: false, error: err };
    }
  }, [applicationName, fetchComparisons]);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  return { comparisons, loading, error, marking, markError, markFixed, deleteFix, refetch: fetchComparisons };
}
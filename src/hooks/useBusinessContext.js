import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Manages the owner-written "what does this endpoint do for the business"
 * notes (EndpointBusinessContext on the backend). These get fed into the
 * AI narrative prompt so explanations can tie a technical root cause to a
 * real user/business consequence instead of describing the pattern alone.
 */
export default function useBusinessContext(applicationName) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchEntries = useCallback(async () => {
    if (!applicationName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get("/api/settings/business-context", {
        params: { applicationName },
      });
      setEntries(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Business context fetch failed:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [applicationName]);

  const saveEntry = useCallback(async (endpoint, description) => {
    if (!applicationName || !endpoint) return { ok: false };
    setSaving(true);
    setSaveError(null);
    try {
      await apiClient.put("/api/settings/business-context", { description }, {
        params: { applicationName, endpoint },
      });
      await fetchEntries();
      return { ok: true };
    } catch (err) {
      console.error("Business context save failed:", err.message);
      setSaveError(err);
      return { ok: false, error: err };
    } finally {
      setSaving(false);
    }
  }, [applicationName, fetchEntries]);

  const deleteEntry = useCallback(async (endpoint) => {
    if (!applicationName || !endpoint) return { ok: false };
    try {
      await apiClient.delete("/api/settings/business-context", {
        params: { applicationName, endpoint },
      });
      await fetchEntries();
      return { ok: true };
    } catch (err) {
      console.error("Business context delete failed:", err.message);
      return { ok: false, error: err };
    }
  }, [applicationName, fetchEntries]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, saving, saveError, saveEntry, deleteEntry, refetch: fetchEntries };
}
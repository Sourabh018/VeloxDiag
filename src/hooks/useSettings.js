import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Fetches and updates the Diagnosis Engine's configurable thresholds for a
 * single application. No polling — settings only change when the user
 * explicitly saves, or when applicationName changes (new fetch for the
 * newly-selected app).
 */
export default function useSettings(applicationName) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const fetchSettings = useCallback(async () => {
    // Guard: no app selected yet (e.g. app list still loading) — skip
    // the request entirely rather than hitting the endpoint with an
    // empty applicationName.
    if (!applicationName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get("/api/settings", {
        params: { applicationName },
      });
      setSettings(res.data);
      setError(null);
    } catch (err) {
      console.error("Settings fetch failed:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [applicationName]);

  const saveSettings = useCallback(async (updated) => {
    if (!applicationName) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const res = await apiClient.put("/api/settings", updated, {
        params: { applicationName },
      });
      setSettings(res.data);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Settings save failed:", err.message);
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  }, [applicationName]);

  // Self-service reset — hits the owner-scoped endpoint on ApplicationController
  // (login + ownership check, same as delete) instead of the admin-token-gated
  // one. Any user can reset their own app's data now; no admin token param
  // needed for the normal case anymore.
  const resetApplication = useCallback(async (targetApplicationName) => {
    setResetting(true);
    setResetError(null);
    setResetSuccess(null);
    try {
      const res = await apiClient.delete(
        `/api/applications/${encodeURIComponent(targetApplicationName)}/data`
      );
      setResetSuccess(res.data);
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Reset failed:", err.message);
      setResetError(err);
      return { ok: false, error: err };
    } finally {
      setResetting(false);
    }
  }, []);

  // Re-fetch whenever the selected application changes.
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    saveError,
    saveSuccess,
    saveSettings,
    refetch: fetchSettings,
    resetting,
    resetError,
    resetSuccess,
    resetApplication,
  };
}
import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * CRUD against the custom rule engine (RuleDefinitionController). Unlike most
 * other hooks in this app, rules are NOT scoped by selectedApp — a
 * RuleDefinitionEntity has no applicationName column, rules are global and
 * apply to every application's diagnosis run alike (see RuleDefinitionEntity
 * javadoc / RuleEngineService).
 */
export default function useRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/rules");
      setRules(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Rules fetch failed:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (rule) => {
      setSaving(true);
      try {
        await apiClient.post("/api/rules", rule);
        await fetchRules();
        return { ok: true };
      } catch (err) {
        console.error("Create rule failed:", err.message);
        return { ok: false, error: err.response?.data?.message || err.message };
      } finally {
        setSaving(false);
      }
    },
    [fetchRules]
  );

  const updateRule = useCallback(
    async (id, rule) => {
      setSaving(true);
      try {
        await apiClient.put(`/api/rules/${id}`, rule);
        await fetchRules();
        return { ok: true };
      } catch (err) {
        console.error("Update rule failed:", err.message);
        return { ok: false, error: err.response?.data?.message || err.message };
      } finally {
        setSaving(false);
      }
    },
    [fetchRules]
  );

  const deleteRule = useCallback(
    async (id) => {
      setSaving(true);
      try {
        await apiClient.delete(`/api/rules/${id}`);
        await fetchRules();
        return { ok: true };
      } catch (err) {
        console.error("Delete rule failed:", err.message);
        return { ok: false, error: err.response?.data?.message || err.message };
      } finally {
        setSaving(false);
      }
    },
    [fetchRules]
  );

  const toggleEnabled = useCallback(
    async (rule) => {
      return updateRule(rule.id, { ...rule, enabled: !rule.enabled });
    },
    [updateRule]
  );

  return { rules, loading, error, saving, createRule, updateRule, deleteRule, toggleEnabled, refetch: fetchRules };
}
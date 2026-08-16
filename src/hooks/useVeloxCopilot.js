import { useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Manages chat messages and AI copilot communication for VeloxDiag.
 * Sends messages to the backend AI chat endpoint and accumulates the conversation.
 */
export default function useVeloxCopilot(applicationName) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(
    async (text) => {
      const userMsg = { sender: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const appParam = applicationName ? { applicationName } : {};
        const res = await apiClient.post("/api/chat", {
          question: text,
          ...appParam,
        });

        const reply = res.data?.answer ?? "No response from AI.";
        setMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
      } catch (err) {
        console.error("Chat error:", err.message);
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "I couldn't reach the VeloxDiag backend. Please check your connection and try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [applicationName]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, loading, sendMessage, resetChat };
}
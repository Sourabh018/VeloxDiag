import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Header from "../components/Header";
import useVeloxCopilot from "../hooks/useVeloxCopilot";
import { useSelectedApp } from "../contexts/AppContext";

const SUGGESTED_PROMPTS = [
  "What are the top performance bottlenecks right now?",
  "Explain why /api/students is slow",
  "Which database queries are missing an index?",
  "Give me recommendations to reduce server response time",
];

function MessageBubble({ msg }) {
  const isUser = msg.sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2.5,
        alignItems: "flex-start",
        gap: 1.5,
      }}
    >
      {!isUser && (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: "#7C3AED",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)",
            mt: 0.5,
          }}
        >
          <AutoAwesomeIcon fontSize="small" />
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          p: "14px 18px",
          maxWidth: "75%",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          bgcolor: isUser ? "#2563EB" : "#FFFFFF",
          color: isUser ? "#FFFFFF" : "#0F172A",
          border: isUser ? "none" : "1px solid #E2E8F0",
          boxShadow: isUser
            ? "0 2px 8px rgba(37, 99, 235, 0.2)"
            : "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            fontWeight: 400,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {msg.text}
        </Typography>
      </Paper>

      {isUser && (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: "#EFF6FF",
            color: "#2563EB",
            border: "1px solid #BFDBFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          <PersonIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
}

function ChatPage({ onMobileMenuToggle }) {
  const { selectedApp } = useSelectedApp();
  const { messages, loading, sendMessage, resetChat } = useVeloxCopilot(selectedApp);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const isFirstMessage = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = (text) => {
    const msg = typeof text === "string" ? text : input.trim();
    if (!msg || loading) return;
    sendMessage(msg);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Header onMobileMenuToggle={onMobileMenuToggle} />
      <Box
        component="main"
        sx={{
          marginLeft: { xs: 0, md: "248px" },
          marginTop: "64px",
          bgcolor: "#F8FAFC",
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Page header */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3, md: 4 },
            py: 2,
            borderBottom: "1px solid #E9EEF4",
            bgcolor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                }}
              >
                Ask VeloxDiag
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
                AI-powered performance copilot ·{" "}
                <span style={{ color: "#0F172A", fontWeight: 700 }}>
                  {selectedApp || "All applications"}
                </span>
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            onClick={resetChat}
            startIcon={<RestartAltIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#64748B",
              textTransform: "none",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              px: 1.5,
              py: 0.6,
              "&:hover": { bgcolor: "#F1F5F9", color: "#0F172A" },
            }}
          >
            New chat
          </Button>
        </Box>

        {/* Messages area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2.5, sm: 3, md: 4 },
            py: 3,
          }}
        >
          {/* Welcome state */}
          {isFirstMessage && (
            <Box sx={{ textAlign: "center", py: { xs: 4, md: 6 }, mb: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  color: "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.02em",
                  mb: 0.5,
                }}
              >
                How can I help you today?
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: "#64748B", maxWidth: 420, mx: "auto" }}>
                Ask me anything about your application's performance, slow endpoints, database
                queries, or optimization strategies.
              </Typography>
            </Box>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}

          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "#7C3AED",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)",
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              </Box>
              <Paper
                elevation={0}
                sx={{
                  p: "10px 16px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px 16px 16px 4px",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} sx={{ color: "#7C3AED" }} />
                  <Typography sx={{ fontSize: 14, color: "#64748B" }}>Thinking…</Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Suggested prompts (only on first render) */}
        {isFirstMessage && (
          <Box
            sx={{
              px: { xs: 2.5, sm: 3, md: 4 },
              pb: 1.5,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outlined"
                size="small"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                sx={{
                  fontSize: 12,
                  color: "#475569",
                  borderColor: "#E2E8F0",
                  bgcolor: "#FFFFFF",
                  borderRadius: "20px",
                  textTransform: "none",
                  px: 1.5,
                  py: 0.5,
                  "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1", color: "#0F172A" },
                }}
              >
                {prompt}
              </Button>
            ))}
          </Box>
        )}

        {/* Input bar */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3, md: 4 },
            py: 2,
            borderTop: "1px solid #E9EEF4",
            bgcolor: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              size="small"
              multiline
              maxRows={4}
              placeholder="e.g. why is /api/exams slow today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#F8FAFC",
                  fontSize: 14,
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366F1" },
                },
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: "#6366F1",
                color: "#FFFFFF",
                width: 40,
                height: 40,
                borderRadius: "12px",
                flexShrink: 0,
                "&:hover": { bgcolor: "#4F46E5" },
                "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                transition: "all 0.15s",
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default ChatPage;
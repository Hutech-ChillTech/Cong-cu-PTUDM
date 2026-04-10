import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/ChatBox.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

interface Message {
  sender: "user" | "ai" | "system";
  text: string;
  timestamp?: Date;
}

const ChatBox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Show welcome message when first opening
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: Message = {
        sender: "system",
        text: "👋 Xin chào! Tôi là AI Tutor. Tôi có thể giúp gì cho bạn hôm nay?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open]);

  const toggleChat = () => setOpen(!open);

  const clearChat = () => {
    setMessages([]);
    const welcomeMessage: Message = {
      sender: "system",
      text: "👋 Xin chào! Tôi là AI Tutor. Tôi có thể giúp gì cho bạn hôm nay?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Sử dụng Groq Chat API endpoint
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          language: "vi",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const aiMessage: Message = {
        sender: "ai",
        text: data.success
          ? data.answer
          : data.error || "Có lỗi xảy ra khi gọi API",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat API Error:", err);
      const errorMessage: Message = {
        sender: "ai",
        text:
          "⚠️ Không thể kết nối tới server AI. Vui lòng kiểm tra:\n• Server đang chạy tại " +
          API_URL +
          "\n• GROQ_API_KEY đã được cấu hình trong .env\n• Container đã rebuild với code mới nhất",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text: string) => {
    // Simple markdown-like formatting
    return text.split("\n").map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        {idx < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Nút bật/tắt chat */}
      <div
        className={styles.chatIcon}
        onClick={toggleChat}
        role="button"
        aria-label="Toggle AI Chat"
        tabIndex={0}
      >
        <img src="/images/ChatBox_Logo.png" alt="AI Chat" />
        {!open && messages.length > 1 && (
          <div className={styles.notificationBadge}>{messages.length - 1}</div>
        )}
      </div>

      {/* Chatbox */}
      {open && (
        <div
          className={styles.chatBox}
          role="dialog"
          aria-label="AI Tutor Chat"
        >
          <div className={styles.chatHeader}>
            <span>🤖 AI Tutor</span>
            <div className={styles.headerActions}>
              <button
                onClick={clearChat}
                className={styles.clearButton}
                title="Xóa lịch sử chat"
                aria-label="Clear chat history"
              >
                🗑️
              </button>
              <button
                onClick={toggleChat}
                className={styles.closeButton}
                title="Đóng chat"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === "user"
                    ? styles.userMessage
                    : msg.sender === "system"
                      ? styles.systemMessage
                      : styles.aiMessage
                }
              >
                <div className={styles.messageContent}>
                  {formatMessage(msg.text)}
                </div>
                {msg.timestamp && (
                  <div className={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className={styles.aiMessage}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              aria-label="Message input"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className={styles.sendButton}
            >
              {loading ? "⏳" : "📤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;

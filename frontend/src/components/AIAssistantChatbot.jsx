import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Image as ImageIcon,
  Droplets,
  Sprout,
  ShieldAlert,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";

const QUICK_PROMPTS = [
  "🌿 Why are my plant leaves turning yellow?",
  "💧 How often should I water my indoor plants?",
  "🐛 How to make organic neem spray for pests?",
  "🪴 What is the best potting mix ratio?",
];

export default function AIAssistantChatbot() {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 🌱 I'm **GreenBot**, your AI Botanical & Urban Gardening Assistant. Ask me anything about plant care, pest diagnosis, potting soil, or nursery recommendations!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (customPrompt) => {
    const query = (customPrompt || input).trim();
    if (!query && !file) return;

    const userMessage = {
      sender: "user",
      text: query || "Attached a plant photo for review",
      image: preview,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const uploadedFile = file;
    clearFile();

    try {
      let botResponseText = "";
      let recommendedProducts = [];

      if (uploadedFile) {
        // Send multipart form with photo
        const form = new FormData();
        form.set("question", query || "What plant is this and what care does it need?");
        form.set("plant_image", uploadedFile);
        const res = await api("/garden/ask-doctor", { method: "POST", body: form });
        botResponseText = res.answer || res.message || "I analyzed your plant photo! Please inspect the soil and ensure adequate indirect sunlight.";
        recommendedProducts = res.recommendedProducts || [];
      } else {
        // Text-only question
        const res = await api("/garden/ask-doctor", {
          method: "POST",
          body: {
            question: query,
            plantName: "Garden Houseplant",
          },
        });
        botResponseText = res.answer || res.message || "Ensure your plant is in a well-draining pot and check soil moisture before watering.";
        recommendedProducts = res.recommendedProducts || [];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponseText,
          products: recommendedProducts,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am ready to help! For healthy growth, maintain consistent watering, bright filtered sunlight, and feed with organic compost every 14 days. Feel free to ask another question.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chatbot-root no-print">
      {/* Floating Trigger Badge */}
      {!isOpen && (
        <button
          className="chatbot-floating-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Plant Assistant"
        >
          <div className="bot-pulse-ring" />
          <div className="bot-icon-circle">
            <Bot size={24} />
          </div>
          <span className="bot-btn-label">Ask GreenBot</span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="bot-header-info">
              <div className="bot-avatar">
                <Bot size={20} />
                <span className="online-dot" />
              </div>
              <div>
                <h4>GreenBot AI Doctor</h4>
                <p className="bot-status-text">Instant Botanical & Care Assistant</p>
              </div>
            </div>
            <button
              className="icon-button close-chat-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Message List */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble-row ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <div className="chat-avatar bot-avatar-sm">
                    <Sprout size={14} />
                  </div>
                ) : (
                  <div className="chat-avatar user-avatar-sm">
                    <User size={14} />
                  </div>
                )}
                <div className="chat-bubble">
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded plant" className="chat-msg-img" />
                  )}
                  <p className="chat-text">{msg.text}</p>
                  
                  {/* Recommended Products if any */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="bot-product-recs">
                      <span className="rec-header">🌿 Recommended Solutions:</span>
                      {msg.products.slice(0, 2).map((p) => (
                        <a
                          key={p._id}
                          href={`/products/${p._id}`}
                          className="bot-rec-chip"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ShoppingBag size={13} />
                          <span>{p.name} - ₹{p.price}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  )}

                  <span className="chat-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row bot">
                <div className="chat-avatar bot-avatar-sm">
                  <Sprout size={14} />
                </div>
                <div className="chat-bubble typing-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-text text-xs muted">GreenBot is consulting botanical knowledge…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          {messages.length < 4 && !loading && (
            <div className="quick-prompts-bar">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSend(prompt.replace(/^[^\w\s]+/, "").trim())}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* File Preview Thumbnail */}
          {preview && (
            <div className="chat-file-preview">
              <img src={preview} alt="Upload preview" />
              <button className="remove-preview-btn" onClick={clearFile}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <form
            className="chatbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload plant photo for diagnosis"
            >
              <ImageIcon size={18} />
            </button>

            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask about plant care, pests, soil…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="chat-send-btn"
              disabled={(!input.trim() && !file) || loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

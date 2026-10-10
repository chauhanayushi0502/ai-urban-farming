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
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { compressAndOptimizeImage } from "../lib/image-optimizer.js";
import { formatNameByLanguage, imageSource, money } from "../lib/format.js";

const QUICK_PROMPTS_BY_LANG = {
  en: [
    "🌿 Why are my plant leaves turning yellow?",
    "💧 Golden watering rules for containers",
    "🐛 How to make organic neem spray",
    "🪴 Ideal 40:30:20:10 potting mix ratio",
    "🍅 Tomato high-yield tips",
    "🌿 Holy Tulsi care and pruning",
  ],
  gu: [
    "🌿 પાંદડા કેમ પીળા પડી રહ્યા છે?",
    "💧 છોડને પાણી આપવાનો સુવર્ણ નિયમ",
    "🐛 ઓર્ગેનિક લીમડાના તેલનો સ્પ્રે કેવી રીતે બનાવવો?",
    "🪴 કુંડા માટે 40:30:20:10 માટીનું મિશ્રણ",
    "🍅 ટામેટાના છોડની બમ્પર ઉપજ માટેની ટિપ્સ",
    "🌿 પવિત્ર તુલસીના છોડની વિશેષ કાળજી",
  ],
  hi: [
    "🌿 पत्तियां पीली क्यों पड़ रही हैं?",
    "💧 पौधों को पानी देने का सही नियम क्या है?",
    "🐛 ऑर्गेनिक नीम तेल स्प्रे कैसे बनाएं?",
    "🪴 गमले के लिए 40:30:20:10 मिट्टी का अनुपात",
    "🍅 टमाटर के पौधे की भरपूर पैदावार के लिए टिप्स",
    "🌿 पवित्र तुलसी के पौधे की विशेष देखभाल",
  ],
};

function FormattedChatText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="chat-text-container">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} style={{ height: 6 }} />;
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lIdx} className="chat-text-line">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistantChatbot() {
  const { user, settings, syncCart, notify } = useApp();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState(new Set());

  const getGreeting = () => {
    if (language === "gu") {
      return "નમસ્તે! 🌱 હું **ગ્રીનબોટ (GreenBot)**, તમારો AI બોટનિકલ અને અર્બન ગાર્ડનિંગ આસિસ્ટન્ટ છું. છોડની કાળજી, પીળા પાંદડા, કીટકોના ઓર્ગેનિક ઉપાય, માટીનું મિશ્રણ અથવા નર્સરી ખાતર વિશે મને કંઈપણ પૂછો!";
    }
    if (language === "hi") {
      return "नमस्ते! 🌱 मैं **ग्रीनबॉट (GreenBot)**, आपका AI बॉटनिकल व गार्डनिंग सहायक हूँ। पौधों की देखभाल, पीली पत्तियां, जैविक कीटनाशक, गमले की मिट्टी या खाद के बारे में मुझसे कुछ भी पूछें!";
    }
    return "Hello! 🌱 I'm **GreenBot**, your AI Botanical & Urban Gardening Assistant. Ask me anything about plant care, pest remedies, potting soil formulas, or nursery care products!";
  };

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: getGreeting(),
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
  }, [messages, isOpen, loading]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === "bot") {
        return [
          {
            sender: "bot",
            text: getGreeting(),
            time: prev[0].time,
          },
        ];
      }
      return prev;
    });
  }, [language]);

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

  // Speech-To-Text (Voice Input)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify(
        language === "gu"
          ? "તમારા બ્રાઉઝરમાં માઇક્રોફોન સ્પીચ ઇનપુટ ઉપલબ્ધ નથી."
          : language === "hi"
          ? "आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।"
          : "Voice recognition is not supported in this browser.",
        "warning"
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Text-To-Speech (Voice Playback)
  const handleSpeak = (text, index) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text
      .replace(/[*_#`~]/g, "")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  // Add Product to Cart directly from Chat Card
  const handleAddToCart = async (product) => {
    try {
      await api("/cart/items", { method: "POST", body: { productId: product._id, quantity: 1 } });
      await syncCart();
      setAddedProductIds((prev) => new Set([...prev, product._id]));
      notify(
        language === "gu"
          ? `${formatNameByLanguage(product.name, language)} કાર્ટમાં ઉમેરાઈ ગયું!`
          : language === "hi"
          ? `${formatNameByLanguage(product.name, language)} कार्ट में जोड़ दिया गया!`
          : `${product.name} added to cart!`
      );
    } catch (err) {
      notify(err.message || "Failed to add to cart", "error");
    }
  };

  // Clear Chat History
  const handleClearChat = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setMessages([
      {
        sender: "bot",
        text: getGreeting(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSend = async (customPrompt) => {
    const query = (customPrompt || input).trim();
    if (!query && !file) return;

    const userMessage = {
      sender: "user",
      text: query || (language === "gu" ? "તપાસ માટે છોડનો ફોટો જોડ્યો" : "Attached a plant photo for review"),
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
        // Compress image before upload for ultra-fast response
        const optimizedFile = await compressAndOptimizeImage(uploadedFile, 800, 0.82);
        const form = new FormData();
        form.set("question", query || "What plant is this and what care does it need?");
        form.set("plant_image", optimizedFile);
        form.set("language", language);
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
            language,
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
          text:
            language === "gu"
              ? "હું હંમેશા મદદ માટે તૈયાર છું! છોડના સ્વસ્થ વિકાસ માટે પૂરતો સવારનો સૂર્યપ્રકાશ આપો, માટી સૂકી હોય ત્યારે જ પાણી આપો અને દર 15 દિવસે વર્મીકમ્પોસ્ટ ખાતર આપો. તમે અન્ય પ્રશ્ન પણ પૂછી શકો છો."
              : language === "hi"
              ? "मैं हमेशा आपकी सहायता के लिए तैयार हूँ! पौधों के स्वस्थ विकास के लिए सुबह की हल्की धूप दें, मिट्टी सूखने पर ही पानी दें और हर 15 दिन में वर्मीकंपोस्ट खाद डालें। आप दूसरा प्रश्न भी पूछ सकते हैं।"
              : "I am ready to help! For healthy growth, maintain consistent morning sunlight, check soil before watering, and feed with organic vermicompost every 15 days.",
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
          aria-label={t("ask_greenbot", "Ask GreenBot")}
        >
          <div className="bot-pulse-ring" />
          <div className="bot-icon-circle">
            <Bot size={24} />
          </div>
          <span className="bot-btn-label">
            {language === "gu" ? "ગ્રીનબોટ AI ડોક્ટર" : language === "hi" ? "ग्रीनबॉट AI डॉक्टर" : t("ask_greenbot", "Ask GreenBot")}
          </span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className={`chatbot-window ${isExpanded ? "expanded" : ""}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="bot-header-info">
              <div className="bot-avatar">
                <Bot size={20} />
                <span className="online-dot" />
              </div>
              <div>
                <h4>{language === "gu" ? "ગ્રીનબોટ AI પ્લાન્ટ ડોક્ટર" : language === "hi" ? "ग्रीनबॉट AI प्लांट डॉक्टर" : t("bot_title", "GreenBot AI Doctor")}</h4>
                <p className="bot-status-text">
                  {language === "gu" ? "ઝડપી બોટનિકલ અને કેર સહાયક • ઓનલાઇન" : language === "hi" ? "त्वरित बॉटनिकल केयर सहायक • ऑनलाइन" : t("bot_sub", "Instant Botanical & Care Assistant • Online")}
                </p>
              </div>
            </div>

            <div className="chatbot-header-actions">
              {/* Clear Chat Button */}
              <button
                className="chat-header-btn"
                onClick={handleClearChat}
                title={language === "gu" ? "ચેટ સાફ કરો" : language === "hi" ? "चैट साफ़ करें" : "Reset conversation"}
                aria-label="Clear chat"
              >
                <RotateCcw size={16} />
              </button>

              {/* Maximize / Expand Toggle */}
              <button
                className="chat-header-btn"
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? "Collapse" : "Maximize view"}
                aria-label={isExpanded ? "Collapse" : "Maximize"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close Button */}
              <button
                className="chat-header-btn"
                onClick={() => {
                  setIsOpen(false);
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  setSpeakingIndex(null);
                }}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
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

                  <FormattedChatText text={msg.text} />

                  {/* Bot Product Recommendations */}
                  {msg.sender === "bot" && msg.products && msg.products.length > 0 && (
                    <div className="bot-product-recs">
                      <span className="rec-header">
                        {language === "gu"
                          ? "🌿 ભલામણ કરેલ ઓર્ગેનિક ઉત્પાદનો:"
                          : language === "hi"
                          ? "🌿 अनुशंसित जैविक उत्पाद:"
                          : "🌿 Recommended Care Products:"}
                      </span>
                      {msg.products.slice(0, 3).map((prod) => {
                        const isAdded = addedProductIds.has(prod._id);
                        return (
                          <div key={prod._id} className="bot-product-card">
                            <img src={imageSource(prod.image)} alt={prod.name} />
                            <div className="bot-product-info">
                              <h5 className="bot-product-title">{formatNameByLanguage(prod.name, language)}</h5>
                              <p className="bot-product-price">{money(prod.price, settings?.currency || "₹")}</p>
                            </div>
                            <button
                              type="button"
                              className={`bot-add-cart-btn ${isAdded ? "added" : ""}`}
                              onClick={() => handleAddToCart(prod)}
                              disabled={isAdded}
                              title={isAdded ? "Already in cart" : "Add to cart"}
                            >
                              {isAdded ? (
                                <>
                                  <CheckCircle size={12} />
                                  <span>{language === "gu" ? "ઉમેરાઈ ગયું!" : language === "hi" ? "जुड़ गया!" : "Added!"}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={12} />
                                  <span>{language === "gu" ? "કાર્ટમાં ઉમેરો" : language === "hi" ? "कार्ट में जोड़ें" : "Add to Cart"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions Bar (Voice TTS Playback + Time) */}
                  <div className="bot-msg-actions">
                    {msg.sender === "bot" ? (
                      <button
                        type="button"
                        className={`bot-speak-btn ${speakingIndex === index ? "speaking" : ""}`}
                        onClick={() => handleSpeak(msg.text, index)}
                        title={speakingIndex === index ? "Stop voice playback" : "Read aloud"}
                      >
                        {speakingIndex === index ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>
                          {speakingIndex === index
                            ? (language === "gu" ? "રોકો" : language === "hi" ? "रोकें" : "Stop")
                            : (language === "gu" ? "સાંભળો" : language === "hi" ? "सुनें" : "Listen")}
                        </span>
                      </button>
                    ) : <span />}
                    <span className="chat-time">{msg.time}</span>
                  </div>
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
                  <span className="typing-text text-xs muted">
                    {language === "gu"
                      ? "ગ્રીનબોટ બોટનિકલ જ્ઞાન ચકાસી રહ્યો છે…"
                      : language === "hi"
                      ? "ग्रीनबॉट बॉटनिकल ज्ञान की जांच कर रहा है…"
                      : t("bot_typing", "GreenBot is consulting botanical knowledge…")}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          {messages.length < 5 && !loading && (
            <div className="quick-prompts-bar">
              {(QUICK_PROMPTS_BY_LANG[language] || QUICK_PROMPTS_BY_LANG.en).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSend(prompt.replace(/^[^\w\s\u0A80-\u0AFF\u0900-\u097F]+/, "").trim())}
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
              <button className="remove-preview-btn" onClick={clearFile} aria-label="Remove photo">
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

            {/* Photo Upload Button */}
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title={language === "gu" ? "છોડનો ફોટો જોડો" : language === "hi" ? "पौधे का फोटो जोड़ें" : "Upload plant photo for diagnosis"}
            >
              <ImageIcon size={18} />
            </button>

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              className={`chat-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
              title={
                isListening
                  ? (language === "gu" ? "સાંભળી રહ્યું છે... બોલો" : language === "hi" ? "सुन रहा है... बोलिए" : "Listening...")
                  : (language === "gu" ? "અવાજથી બોલીને પ્રશ્ન પૂછો" : language === "hi" ? "बोलकर पूछें" : "Speak your question")
              }
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              className="chat-text-input"
              placeholder={
                isListening
                  ? (language === "gu" ? "સાંભળી રહ્યું છે..." : language === "hi" ? "सुन रहा है..." : "Listening...")
                  : (language === "gu"
                      ? "પીળા પાંદડા, ખાતર, પાણી કે કીટકો વિશે પૂછો…"
                      : language === "hi"
                      ? "पीली पत्तियां, खाद, पानी या कीड़ों के बारे में पूछें…"
                      : t("bot_input_placeholder", "Ask about plant care, pests, soil…"))
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />

            {/* Send Button */}
            <button
              type="submit"
              className="chat-send-btn"
              disabled={(!input.trim() && !file) || loading}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

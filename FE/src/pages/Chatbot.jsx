import React, { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    const inputToSend = userInput;
    setUserInput("");

    try {
      const response = await fetch("http://127.0.0.1:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputToSend }),
      });

      const data = await response.json();
      const reply = data.reply || "Xin lỗi, hệ thống đang bảo trì";

      const botMessage = {
        sender: "bot",
        text: reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi gửi yêu cầu:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-200 to-white flex flex-col items-center py-6 px-4">
      <h2 className="text-4xl font-extrabold text-gray-700 mb-6 drop-shadow">
        💬 Chatbot AI Bán Hàng
      </h2>

      <div
        ref={chatContainerRef}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 px-5 py-3 rounded-2xl text-base sm:text-lg leading-relaxed max-w-[85%] break-words shadow-md ${
              msg.sender === "user"
                ? "bg-blue-100 text-blue-900 ml-auto text-right"
                : "bg-gray-100 text-gray-800 mr-auto text-left"
            }`}
            dangerouslySetInnerHTML={{
              __html: `
                <div class="flex items-start gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }">
                  <span class="font-bold text-lg">${
                    msg.sender === "user" ? "👤 Bạn:" : "🤖 Bot:"
                  }</span>
                  <div class="inline-block p-3 rounded-xl text-base leading-relaxed shadow 
                    ${
                      msg.sender === "user"
                        ? "bg-blue-200 text-black"
                        : "bg-gray-100 text-black"
                    }">
                    ${formatText(msg.text)}
                  </div>
                </div>
              `,
            }}
          />
        ))}
      </div>

      <div className="mt-6 w-full max-w-3xl flex items-center gap-3">
        <input
          type="text"
          placeholder="Nhập câu hỏi của bạn..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-5 py-3 text-lg border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-full shadow-md hover:bg-blue-700 transition duration-200"
        >
          🚀 Gửi
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

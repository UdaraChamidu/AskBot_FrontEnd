import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { v4 as uuidv4 } from "uuid";
import "./App.css"; // Use your own CSS here

function App() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    // Load chat sessions from localStorage
    const saved = JSON.parse(localStorage.getItem("askbot-sessions")) || [];
    setSessions(saved);
    if (saved.length > 0) setActiveId(saved[0].id);
  }, []);

  useEffect(() => {
    // Save chat sessions to localStorage on every update
    localStorage.setItem("askbot-sessions", JSON.stringify(sessions));
  }, [sessions]);

  const handleNewChat = () => {
    const newId = uuidv4();
    const newSession = { id: newId, title: "New Chat", messages: [] };
    setSessions([newSession, ...sessions]);
    setActiveId(newId);
  };

  const handleSelectChat = (id) => {
    // ✅ Only change the active chat ID. Don't fetch from backend.
    setActiveId(id);
  };

  const handleDeleteChat = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeId === id && updated.length > 0) setActiveId(updated[0].id);
    else if (updated.length === 0) setActiveId(null);
  };

  const handleSend = async ({ text, image }) => {
    const userMessage = { text, image };

    // Optimistically add the user message
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeId
          ? {
              ...s,
              messages: [...s.messages, { role: "user", content: userMessage }],
            }
          : s
      )
    );

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeId,
          user_message: text,
          image_data: image,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      const data = await res.json();

      // Append the assistant message
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  { role: "assistant", content: { text: data.reply } },
                ],
              }
            : s
        )
      );
    } catch (err) {
      alert("Error contacting AskBot server.");
      console.error(err);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeId);

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelect={handleSelectChat}
        onDelete={handleDeleteChat}
      />
      <ChatWindow
        messages={activeSession?.messages || []}
        onSend={handleSend}
      />
    </div>
  );
}

export default App;

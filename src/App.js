import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { v4 as uuidv4 } from "uuid";
import "./App.css"; // Use your own CSS here

function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("askbot-sessions")) || [];
    setSessions(saved);
    if (saved.length > 0) setActiveId(saved[0].id);
  }, []);

  useEffect(() => {
    localStorage.setItem("askbot-sessions", JSON.stringify(sessions));
  }, [sessions]);

  const handleNewChat = () => {
    const newId = uuidv4();
    const newSession = { id: newId, title: "New Chat", messages: [] };
    setSessions([newSession, ...sessions]);
    setActiveId(newId);
  };

  const handleSelectChat = async (id) => {
    setActiveId(id);

    try {
      const res = await fetch(`http://localhost:8000/history?session_id=${id}`);
      const data = await res.json();

      const updatedSessions = sessions.map((s) =>
        s.id === id ? { ...s, messages: data.messages } : s
      );
      setSessions(updatedSessions);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleDeleteChat = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeId === id && updated.length > 0) setActiveId(updated[0].id);
    else if (updated.length === 0) setActiveId(null);
  };

  const handleSend = async ({ text, image }) => {
    const userMessage = { text, image };

    const newSessions = sessions.map((s) =>
      s.id === activeId
        ? {
            ...s,
            messages: [...s.messages, { role: "user", content: userMessage }],
          }
        : s
    );
    setSessions(newSessions);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeId,
          user_message: text,
          image_data: image,
        }),
      });
      const data = await res.json();
      const updatedSessions = sessions.map((s) =>
        s.id === activeId
          ? {
              ...s,
              messages: [
                ...s.messages,
                { role: "user", content: userMessage },
                { role: "assistant", content: { text: data.reply } },
              ],
            }
          : s
      );
      setSessions(updatedSessions);
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

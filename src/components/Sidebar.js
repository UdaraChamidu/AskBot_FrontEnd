import React from "react";

export function Sidebar({ sessions, activeId, onNewChat, onSelect, onDelete }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>AskBot</h2>
        <button onClick={onNewChat}>+ New Chat</button>
      </div>
      <ul className="session-list">
        {sessions.map((s) => (
          <li key={s.id} className={s.id === activeId ? "active" : ""}>
            <span onClick={() => onSelect(s.id)}>{s.title || "Untitled"}</span>
            <button onClick={() => onDelete(s.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

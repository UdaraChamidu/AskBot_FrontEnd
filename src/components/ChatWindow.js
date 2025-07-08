import React, { useState } from "react";

export function ChatWindow({ messages, onSend }) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "" && !image) return;

    const reader = new FileReader();
    if (image) {
      reader.onloadend = () => {
        onSend({ text: input, image: reader.result });
        setInput("");
        setImage(null);
      };
      reader.readAsDataURL(image);
    } else {
      onSend({ text: input });
      setInput("");
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.content.text}
            {msg.content.image && (
              <img
                src={msg.content.image}
                alt="user input"
                style={{ maxWidth: "200px", marginTop: "5px" }}
              />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />

        <button type="submit">Send</button>
      </form>
    </div>
  );
}

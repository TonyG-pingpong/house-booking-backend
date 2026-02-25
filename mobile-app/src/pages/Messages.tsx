import { useEffect, useState } from 'react';
import * as api from '../api';
import type { Message } from '../types';
import './Messages.css';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMessages()
      .then(setMessages)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="messages-loading">Loading messages…</p>;
  if (error) return <p className="messages-error">{error}</p>;

  return (
    <div className="messages-page">
      <h1 className="messages-title">Messages</h1>
      {messages.length === 0 ? (
        <p className="messages-empty">No messages yet.</p>
      ) : (
        <ul className="messages-list">
          {messages.map((m) => (
            <li key={m.id} className="messages-card">
              <div className="messages-meta">
                {m.sender ? (
                  <span className="messages-from">{m.sender.email}</span>
                ) : (
                  <span className="messages-from">User #{m.senderId}</span>
                )}
                <span className="messages-date">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="messages-content">{m.content}</p>
              {m.listing && (
                <span className="messages-listing">Re: {m.listing.title}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

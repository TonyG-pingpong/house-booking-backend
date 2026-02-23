import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getMessages, createMessage } from '../api';
import { useAuth } from '../AuthContext';
import { usePolling } from '../hooks/usePolling';
import type { Message } from '../types';

const INSTANT_CHAT_POLL_INTERVAL_MS = 5000;

type ComposeState = {
  receiverId: number;
  receiverEmail?: string;
  listingId?: number;
  listingTitle?: string;
};

/** Thread = messages with the same other party and same listing (or both no listing). */
function groupMessagesByThread(messages: Message[], myUserId: number): Map<string, Message[]> {
  const threadKey = (msg: Message) => {
    const otherId = msg.senderId === myUserId ? msg.receiverId : msg.senderId;
    const listingId = msg.listingId ?? 0;
    return `${otherId}-${listingId}`;
  };
  const map = new Map<string, Message[]>();
  for (const msg of messages) {
    const key = threadKey(msg);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(msg);
  }
  // Sort messages within each thread by date (oldest first)
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return map;
}

/** Return threads sorted by latest message first (most recent at top). */
function getSortedThreads(threadMap: Map<string, Message[]>): Message[][] {
  return [...threadMap.values()].sort(
    (a, b) =>
      new Date(b[b.length - 1].createdAt).getTime() -
      new Date(a[a.length - 1].createdAt).getTime()
  );
}

export function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compose, setCompose] = useState<ComposeState | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const composeRef = useRef<HTMLDivElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMessages()
      .then(setMessages)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user]);

  // Instant chat: poll for new messages every 5s when user is logged in
  usePolling(load, INSTANT_CHAT_POLL_INTERVAL_MS, !!user);

  // Pre-fill compose from "Contact host" navigation state
  useEffect(() => {
    const state = location.state as {
      receiverId?: number;
      listingId?: number;
      listingTitle?: string;
    } | null;
    if (state?.receiverId) {
      setCompose({
        receiverId: state.receiverId,
        listingId: state.listingId,
        listingTitle: state.listingTitle,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // When compose opens: scroll it into view and focus the textarea
  useEffect(() => {
    if (!compose) return;
    const t = setTimeout(() => {
      composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      replyTextareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [compose]);

  const closeCompose = () => {
    setCompose(null);
    setReplyContent('');
    setSendError('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compose || !replyContent.trim()) return;
    setSendError('');
    setSending(true);
    try {
      await createMessage({
        content: replyContent.trim(),
        receiverId: compose.receiverId,
        listingId: compose.listingId,
      });
      closeCompose();
      load();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const otherParty = (msg: Message) =>
    msg.senderId === user!.userId ? msg.receiver : msg.sender;
  const isFromMe = (msg: Message) => msg.senderId === user!.userId;

  const threads = useMemo(
    () => getSortedThreads(groupMessagesByThread(messages, user!.userId)),
    [messages, user]
  );

  const openReplyToThread = (thread: Message[]) => {
    const first = thread[0];
    const otherId = first.senderId === user!.userId ? first.receiverId : first.senderId;
    const otherEmail = first.senderId === user!.userId
      ? first.receiver?.email
      : first.sender?.email;
    setCompose({
      receiverId: otherId,
      receiverEmail: otherEmail,
      listingId: first.listingId ?? undefined,
      listingTitle: first.listing?.title,
    });
    setReplyContent('');
    setSendError('');
  };

  if (!user) {
    return (
      <div className="page-message">
        <p>Log in to view your messages.</p>
        <p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Listings
          </Link>
        </p>
      </div>
    );
  }
  if (loading) return <div className="page-loading">Loading messages…</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="messages-page">
      <h1 className="messages-page-title">
        Messages
        <span className="messages-live-badge" title="New messages load automatically">
          <span className="messages-live-dot" aria-hidden />
          Live
        </span>
      </h1>

      {compose && (
        <div className="messages-compose card" ref={composeRef}>
          <h3>
            {compose.receiverEmail
              ? `Message ${compose.receiverEmail}`
              : compose.listingTitle
                ? `Message host about "${compose.listingTitle}"`
                : 'New message'}
          </h3>
          {compose.listingTitle && (
            <p className="messages-compose-context">
              About: <Link to={`/listings/${compose.listingId}`}>{compose.listingTitle}</Link>
            </p>
          )}
          <form onSubmit={handleSend}>
            <label>
              Message
              <textarea
                ref={replyTextareaRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your message…"
                rows={3}
                required
              />
            </label>
            {sendError && <p className="form-error">{sendError}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending…' : 'Send'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeCompose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="messages-threads">
        {threads.map((thread) => {
          const first = thread[0];
          const other = otherParty(first);
          const lastMsg = thread[thread.length - 1];
          return (
            <div key={`thread-${first.id}-${thread.length}`} className="message-thread card">
              <div className="message-thread-header">
                <div className="message-thread-title">
                  <span className="message-thread-with">
                    {other?.email ?? 'User'}
                  </span>
                  {first.listing && (
                    <span className="message-thread-listing">
                      · About <Link to={`/listings/${first.listing.id}`}>{first.listing.title}</Link>
                    </span>
                  )}
                </div>
                <span className="message-thread-date">
                  Last: {new Date(lastMsg.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="message-thread-messages">
                {thread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${isFromMe(msg) ? 'from-me' : 'from-them'}`}
                  >
                    <p className="message-bubble-content">{msg.content}</p>
                    <span className="message-bubble-time">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="message-thread-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openReplyToThread(thread)}
                >
                  Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {messages.length === 0 && !compose && (
        <p className="empty-state">
          No messages yet. Go to a listing and use <strong>Contact host</strong> to start a conversation.
        </p>
      )}
    </div>
  );
}

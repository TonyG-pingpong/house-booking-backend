import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getMessages, createMessage, deleteMessageThread } from '../api';
import { useAuth } from '../AuthContext';
import { usePolling } from '../hooks/usePolling';
import type { Message } from '../types';

const INSTANT_CHAT_POLL_INTERVAL_MS = 5000;

/** When user arrives via "Contact host", we show an inline compose for that recipient until they send. */
type PendingNewThread = {
  receiverId: number;
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
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingThreadKey, setSendingThreadKey] = useState<string | null>(null);
  const [sendError, setSendError] = useState('');
  const [pendingNewThread, setPendingNewThread] = useState<PendingNewThread | null>(null);
  const [deletingThreadKey, setDeletingThreadKey] = useState<string | null>(null);
  const threadContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const firstThreadRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

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

  // From "Contact host": show inline compose for that recipient (no thread yet)
  useEffect(() => {
    const state = location.state as {
      receiverId?: number;
      listingId?: number;
      listingTitle?: string;
    } | null;
    if (state?.receiverId) {
      setPendingNewThread({
        receiverId: state.receiverId,
        listingId: state.listingId,
        listingTitle: state.listingTitle,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const sendMessage = async (
    e: React.FormEvent,
    threadKey: string,
    payload: { receiverId: number; listingId?: number }
  ) => {
    e.preventDefault();
    const content = replyDrafts[threadKey]?.trim();
    if (!content) return;
    setSendError('');
    setSendingThreadKey(threadKey);
    try {
      await createMessage({
        content,
        receiverId: payload.receiverId,
        listingId: payload.listingId,
      });
      setReplyDrafts((d) => ({ ...d, [threadKey]: '' }));
      if (threadKey.startsWith('new-')) setPendingNewThread(null);
      load();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSendingThreadKey(null);
    }
  };

  const handleComposeKeyDown = (
    e: React.KeyboardEvent,
    threadKey: string,
    payload: { receiverId: number; listingId?: number }
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = replyDrafts[threadKey]?.trim();
      if (content) {
        sendMessage(
          { preventDefault: () => {} } as React.FormEvent,
          threadKey,
          payload
        );
      }
    }
  };

  const handleDeleteThread = async (threadKey: string, otherUserId: number, listingId?: number | null) => {
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return;
    setDeletingThreadKey(threadKey);
    try {
      await deleteMessageThread(otherUserId, listingId);
      load();
    } catch {
      setError('Failed to delete thread');
    } finally {
      setDeletingThreadKey(null);
    }
  };

  const otherParty = (msg: Message) =>
    msg.senderId === user!.userId ? msg.receiver : msg.sender;
  const isFromMe = (msg: Message) => msg.senderId === user!.userId;

  const threads = useMemo(
    () => getSortedThreads(groupMessagesByThread(messages, user!.userId)),
    [messages, user]
  );

  // Auto-scroll each thread's message list to bottom so new messages are visible
  useEffect(() => {
    threadContainerRefs.current.forEach((el) => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  // When new messages arrive, scroll the thread with latest activity into view
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      firstThreadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      prevMessageCountRef.current = messages.length;
    } else {
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  /** Stable key for a thread (same other party + listing). */
  const getThreadKey = (first: Message) => {
    const otherId = first.senderId === user!.userId ? first.receiverId : first.senderId;
    return `${otherId}-${first.listingId ?? 0}`;
  };

  /** Inline chat row: textarea + Send. Enter sends, Shift+Enter newline. */
  const renderChatInput = (
    threadKey: string,
    payload: { receiverId: number; listingId?: number },
    placeholder = 'Type a message…'
  ) => {
    const isSending = sendingThreadKey === threadKey;
    return (
      <form
        className="message-thread-compose"
        onSubmit={(e) => sendMessage(e, threadKey, payload)}
      >
        <textarea
          className="message-thread-compose-input"
          placeholder={placeholder}
          value={replyDrafts[threadKey] ?? ''}
          onChange={(e) =>
            setReplyDrafts((d) => ({ ...d, [threadKey]: e.target.value }))
          }
          onKeyDown={(e) => handleComposeKeyDown(e, threadKey, payload)}
          rows={1}
          aria-label="Message"
          disabled={isSending}
        />
        <button
          type="submit"
          className="btn btn-primary message-thread-compose-send"
          disabled={isSending || !(replyDrafts[threadKey]?.trim())}
          aria-label="Send"
        >
          {isSending ? '…' : 'Send'}
        </button>
      </form>
    );
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

      {pendingNewThread && (
        <div className="message-thread card message-thread-new">
          <div className="message-thread-header">
            <div className="message-thread-title">
              {pendingNewThread.listingTitle
                ? `Message host about "${pendingNewThread.listingTitle}"`
                : 'New message'}
            </div>
          </div>
          {pendingNewThread.listingId && (
            <p className="messages-compose-context" style={{ padding: '0 1.25rem' }}>
              About: <Link to={`/listings/${pendingNewThread.listingId}`}>{pendingNewThread.listingTitle}</Link>
            </p>
          )}
          {sendError && <p className="form-error" style={{ margin: '0 1.25rem' }}>{sendError}</p>}
          {renderChatInput(
            `new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}`,
            {
              receiverId: pendingNewThread.receiverId,
              listingId: pendingNewThread.listingId,
            }
          )}
        </div>
      )}

      <div className="messages-threads">
        {threads.map((thread, index) => {
          const first = thread[0];
          const other = otherParty(first);
          const lastMsg = thread[thread.length - 1];
          const threadKey = getThreadKey(first);
          const setThreadMessagesRef = (el: HTMLDivElement | null) => {
            if (el) threadContainerRefs.current.set(threadKey, el);
            else threadContainerRefs.current.delete(threadKey);
          };
          return (
            <div
              key={`thread-${threadKey}`}
              ref={index === 0 ? firstThreadRef : undefined}
              className="message-thread card"
            >
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
                <div className="message-thread-header-right">
                  <span className="message-thread-date">
                    Last: {new Date(lastMsg.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary message-thread-delete"
                    onClick={() => handleDeleteThread(threadKey, first.senderId === user!.userId ? first.receiverId : first.senderId, first.listingId ?? undefined)}
                    disabled={deletingThreadKey === threadKey}
                    aria-label="Delete conversation"
                    title="Delete this conversation"
                  >
                    {deletingThreadKey === threadKey ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
              <div
                className="message-thread-messages"
                ref={setThreadMessagesRef}
                role="log"
                aria-label="Conversation"
              >
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
              {sendError && sendingThreadKey === threadKey && (
                <p className="form-error message-thread-compose-error">{sendError}</p>
              )}
              {renderChatInput(threadKey, {
                receiverId: first.senderId === user!.userId ? first.receiverId : first.senderId,
                listingId: first.listingId ?? undefined,
              })}
            </div>
          );
        })}
      </div>

      {messages.length === 0 && !pendingNewThread && (
        <p className="empty-state">
          No messages yet. Go to a listing and use <strong>Contact host</strong> to start a conversation.
        </p>
      )}
    </div>
  );
}

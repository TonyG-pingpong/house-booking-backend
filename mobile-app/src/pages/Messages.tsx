import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types';
import './Messages.css';

type PendingNewThread = {
  receiverId: number;
  listingId?: number;
  listingTitle?: string;
};

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
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return map;
}

function getSortedThreads(threadMap: Map<string, Message[]>): Message[][] {
  return [...threadMap.values()].sort(
    (a, b) =>
      new Date(b[b.length - 1].createdAt).getTime() -
      new Date(a[a.length - 1].createdAt).getTime()
  );
}

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingThreadKey, setSendingThreadKey] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingNewThread, setPendingNewThread] = useState<PendingNewThread | null>(null);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .getMessages()
      .then(setMessages)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

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
    setSendError(null);
    setSendingThreadKey(threadKey);
    try {
      await api.createMessage({
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

  const otherParty = (msg: Message) =>
    msg.senderId === user!.userId ? msg.receiver : msg.sender;
  const isFromMe = (msg: Message) => msg.senderId === user!.userId;

  const threads = useMemo(
    () => (user ? getSortedThreads(groupMessagesByThread(messages, user.userId)) : []),
    [messages, user]
  );

  const getThreadKey = (first: Message) => {
    const otherId = first.senderId === user!.userId ? first.receiverId : first.senderId;
    return `${otherId}-${first.listingId ?? 0}`;
  };

  if (!user) {
    return (
      <div className="messages-page">
        <p className="messages-empty">Log in to view messages.</p>
      </div>
    );
  }
  if (loading) return <p className="messages-loading">Loading messages…</p>;
  if (error) return <p className="messages-error">{error}</p>;

  return (
    <div className="messages-page">
      <h1 className="messages-title">Messages</h1>

      {pendingNewThread && (
        <div className="messages-thread messages-thread-new">
          <div className="messages-thread-header">
            {pendingNewThread.listingTitle
              ? `Message host about "${pendingNewThread.listingTitle}"`
              : 'New message'}
          </div>
          {pendingNewThread.listingId && (
            <p className="messages-thread-context">
              About: <Link to={`/listings/${pendingNewThread.listingId}`}>{pendingNewThread.listingTitle}</Link>
            </p>
          )}
          {sendError && <p className="messages-send-error">{sendError}</p>}
          <form
            className="messages-compose"
            onSubmit={(e) =>
              sendMessage(e, `new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}`, {
                receiverId: pendingNewThread.receiverId,
                listingId: pendingNewThread.listingId,
              })
            }
          >
            <textarea
              className="messages-compose-input"
              placeholder="Type a message…"
              value={replyDrafts[`new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}`] ?? ''}
              onChange={(e) =>
                setReplyDrafts((d) => ({
                  ...d,
                  [`new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}`]: e.target.value,
                }))
              }
              rows={2}
            />
            <button
              type="submit"
              className="messages-compose-btn"
              disabled={
                sendingThreadKey === `new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}` ||
                !(replyDrafts[`new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}`]?.trim())
              }
            >
              {sendingThreadKey === `new-${pendingNewThread.receiverId}-${pendingNewThread.listingId ?? 0}` ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}

      <div className="messages-threads">
        {threads.map((thread) => {
          const first = thread[0];
          const other = otherParty(first);
          const threadKey = getThreadKey(first);
          const receiverId = first.senderId === user.userId ? first.receiverId : first.senderId;
          const listingId = first.listingId ?? undefined;
          return (
            <div key={`thread-${threadKey}`} className="messages-thread">
              <div className="messages-thread-header">
                <span className="messages-thread-with">{other?.email ?? 'User'}</span>
                {first.listing && (
                  <span className="messages-thread-listing">
                    · About <Link to={`/listings/${first.listing.id}`}>{first.listing.title}</Link>
                  </span>
                )}
              </div>
              <div className="messages-thread-list">
                {thread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`messages-bubble ${isFromMe(msg) ? 'messages-bubble-me' : 'messages-bubble-them'}`}
                  >
                    <p className="messages-bubble-content">{msg.content}</p>
                    <span className="messages-bubble-time">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {sendError && sendingThreadKey === threadKey && (
                <p className="messages-send-error">{sendError}</p>
              )}
              <form
                className="messages-compose"
                onSubmit={(e) => sendMessage(e, threadKey, { receiverId, listingId })}
              >
                <textarea
                  className="messages-compose-input"
                  placeholder="Type a message…"
                  value={replyDrafts[threadKey] ?? ''}
                  onChange={(e) => setReplyDrafts((d) => ({ ...d, [threadKey]: e.target.value }))}
                  rows={2}
                />
                <button
                  type="submit"
                  className="messages-compose-btn"
                  disabled={sendingThreadKey === threadKey || !(replyDrafts[threadKey]?.trim())}
                >
                  {sendingThreadKey === threadKey ? '…' : 'Send'}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {messages.length === 0 && !pendingNewThread && (
        <p className="messages-empty">
          No messages yet. Open a listing and tap <strong>Contact host</strong> to start a conversation.
        </p>
      )}
    </div>
  );
}

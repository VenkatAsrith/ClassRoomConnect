import React, { useEffect, useState, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { api } from '../../services/api.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { Send, Hash, CornerDownLeft } from 'lucide-react';

export const ChannelView: React.FC = () => {
  const { channelId, workspaceId } = useParams<{ channelId: string; workspaceId: string }>();
  const { user } = useAuthStore();
  const { socket } = useOutletContext<{ socket: Socket | null }>();

  const [channel, setChannel] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any | null>(null);

  // Fetch Channel Details & History
  useEffect(() => {
    if (!channelId) return;
    setLoading(true);

    const fetchHistory = async () => {
      try {
        const chanRes = await api.get(`/channels/workspace/${workspaceId}`);
        const activeChan = chanRes.data.channels.find((c: any) => c._id === channelId);
        setChannel(activeChan);

        const msgRes = await api.get(`/channels/${channelId}/messages`);
        setMessages(msgRes.data.messages);
      } catch (err) {
        console.error('Error loading channel data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [channelId, workspaceId]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time Message listener & Typing listener
  useEffect(() => {
    if (!channelId) return;

    // Listener for new messages dispatched from layout
    const handleNewMessage = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      setMessages(prev => {
        // Prevent duplicate appends if HTTP post returns and socket fires
        if (prev.some(m => m._id === msg._id)) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    window.addEventListener(`socket-msg:${channelId}`, handleNewMessage);

    // Bind direct typing socket listener if socket exists
    if (socket) {
      const handleTypingEvent = (data: { channelId: string; userId: string; name: string; isTyping: boolean }) => {
        if (data.channelId !== channelId) return;
        if (data.userId === user?._id) return;

        setTypingUsers(prev => {
          if (data.isTyping) {
            return prev.includes(data.name) ? prev : [...prev, data.name];
          } else {
            return prev.filter(name => name !== data.name);
          }
        });
      };

      socket.on('channel:typing', handleTypingEvent);

      return () => {
        window.removeEventListener(`socket-msg:${channelId}`, handleNewMessage);
        socket.off('channel:typing', handleTypingEvent);
      };
    }

    return () => {
      window.removeEventListener(`socket-msg:${channelId}`, handleNewMessage);
    };
  }, [channelId, socket, user?._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !workspaceId || !user) return;

    // Emit Typing State
    socket.emit('channel:typing', {
      workspaceId,
      channelId,
      name: user.name,
      isTyping: true
    });

    // Clear previous timeout and set typing stop after 2s of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('channel:typing', {
        workspaceId,
        channelId,
        name: user.name,
        isTyping: false
      });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const body = inputText;
    setInputText('');

    // Clear typing indicator
    if (socket && workspaceId && user) {
      socket.emit('channel:typing', {
        workspaceId,
        channelId,
        name: user.name,
        isTyping: false
      });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    try {
      const res = await api.post(`/channels/${channelId}/messages`, { body });
      const newMsg = res.data.message;
      setMessages(prev => {
        if (prev.some(m => m._id === newMsg._id)) {
          return prev;
        }
        return [...prev, newMsg];
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-[#121214] rounded-3xl border border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 flex items-center gap-2">
        <Hash className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            {channel?.name}
          </h2>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize font-medium block mt-0.5">
            Channel Category: {channel?.type}
          </span>
        </div>
      </div>

      {/* Messages Stream Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg._id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-150 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-250 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {msg.authorId?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {msg.authorId?.name}
                </span>
                <span className="px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded text-[8px] font-bold uppercase tracking-wider capitalize">
                  {msg.authorId?.role}
                </span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-normal whitespace-pre-wrap">
                {msg.body}
              </p>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-20 text-xs text-zinc-400 italic">
            Start of channel discussion history. Post a message to join the conversation.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer message composer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/30">
        
        {/* Typing Indicator */}
        <div className="h-5 text-[10px] text-zinc-400 dark:text-zinc-500 italic pl-2 mb-1">
          {typingUsers.length > 0 && (
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={`Message #${channel?.name || 'channel'}...`}
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
            />
            <div className="absolute right-3.5 top-2.5 flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 rounded px-1 hidden md:flex select-none">
              <span>Enter</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </div>
          </div>
          
          <button
            type="submit"
            className="p-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-zinc-950 rounded-full shadow transition-all hover:scale-105 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
export default ChannelView;

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Types
interface Message {
  id: string;
  user: string;
  content: string;
  created_at: string;
}

interface ChatRoomProps {
  isAdmin?: boolean;
}

// Create Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const ChatRoom: React.FC<ChatRoomProps> = ({ isAdmin = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load username from localStorage on initial render
  useEffect(() => {
    const savedUsername = localStorage.getItem('seedChatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setShowUsernameModal(false);
    }
  }, []);

  // Fetch messages on component mount and set up real-time listener
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        () => {
          console.log('Messages deleted, refreshing...');
          fetchMessages();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages...');
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        setErrorMessage('Failed to load messages: ' + error.message);
      } else {
        console.log('Messages fetched:', data?.length || 0);
        setMessages(data || []);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setErrorMessage('An unexpected error occurred while fetching messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setLoading(true);
      console.log('Sending message:', { user: username, content: newMessage });
      
      const { error } = await supabase
        .from('messages')
        .insert([
          { user: username, content: newMessage }
        ]);
      
      if (error) {
        console.error('Error sending message:', error);
        setErrorMessage('Failed to send message: ' + error.message);
      } else {
        console.log('Message sent successfully');
        setNewMessage('');
        setErrorMessage(null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setErrorMessage('An unexpected error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!isAdmin) {
      console.log('Only admins can clear chat');
      return;
    }
    
    if (window.confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
      try {
        setLoading(true);
        console.log('Admin is clearing all messages...');
        
        const { error } = await supabase
          .from('messages')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // This is a trick to delete all rows
        
        if (error) {
          console.error('Error clearing messages:', error);
          setErrorMessage('Failed to clear messages: ' + error.message);
        } else {
          console.log('Messages cleared successfully');
          setMessages([]);
          setErrorMessage(null);
        }
      } catch (err) {
        console.error('Failed to clear messages:', err);
        setErrorMessage('An unexpected error occurred while clearing messages.');
      } finally {
        setLoading(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Save username to localStorage for future visits
      localStorage.setItem('seedChatUsername', username);
      setShowUsernameModal(false);
    }
  };

  const handleChangeUsername = () => {
    setShowUsernameModal(true);
  };

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="header">
        <a href="/" className="logo-link">
          <img 
            src="https://cdn.prod.website-files.com/65dbffd382bf1cd63f76a135/65dbffd382bf1cd63f76a179_logo.svg" 
            width="150" 
            alt="The Seed" 
            className="logo-image"
          />
        </a>
        <div className="header-controls">
          {!showUsernameModal && (
            <button 
              onClick={handleChangeUsername} 
              className="username-button"
            >
              Change Name
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={handleClearChat} 
              className="clear-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Clear Chat'}
            </button>
          )}
        </div>
      </div>
      
      {/* Error message display */}
      {errorMessage && (
        <div style={{ backgroundColor: '#991b1b', padding: '8px 16px', color: 'white' }}>
          <p>{errorMessage}</p>
          <button 
            onClick={() => setErrorMessage(null)} 
            style={{ backgroundColor: 'transparent', border: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Admin indicator */}
      {isAdmin && (
        <div style={{ backgroundColor: '#064e3b', padding: '8px 16px', color: 'white' }}>
          <p>You are logged in as an admin. You can clear all messages.</p>
        </div>
      )}
      
      {/* User indicator */}
      {!showUsernameModal && (
        <div style={{ backgroundColor: '#1f2937', padding: '8px 16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>You are chatting as: <strong>{username}</strong></p>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="messages-container">
        {loading && messages.length === 0 ? (
          <div className="empty-state">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Be the first to send one!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.user === username ? 'message-own' : ''}`}>
              <div className="message-header">
                <span className="message-user">{message.user}</span>
                <span className="message-time">{formatTime(message.created_at)}</span>
              </div>
              <p className="message-content">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your activities or location..."
            className="message-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={loading || !newMessage.trim()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Username modal */}
      {showUsernameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img 
                src="https://cdn.prod.website-files.com/65dbffd382bf1cd63f76a135/65dbffd382bf1cd63f76a179_logo.svg" 
                width="150" 
                alt="The Seed" 
              />
            </div>
            <h2 className="modal-title">Welcome to The Seed</h2>
            <p className="modal-text">Please enter your name to join the guest chat:</p>
            <form onSubmit={handleSetUsername}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="form-input"
              />
              <button
                type="submit"
                className="form-button"
                disabled={!username.trim()}
              >
                Join Chat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
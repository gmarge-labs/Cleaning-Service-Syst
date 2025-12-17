import { useState, useRef, useEffect } from 'react';
import { Send, User, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BottomNavigation } from './BottomNavigation';
import { CleanerView } from './CleanerApp';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  text: string;
  sender: 'cleaner' | 'admin' | 'supervisor';
  senderName: string;
  timestamp: Date;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: 'Admin' | 'Supervisor';
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

interface CleanerMessagesProps {
  currentView: CleanerView;
  onNavigate: (view: CleanerView) => void;
}

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: 'CONV-001',
    name: 'Admin Team',
    role: 'Admin',
    avatar: 'AT',
    lastMessage: 'Your weekly earnings have been processed.',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 2,
    messages: [
      {
        id: 'MSG-001',
        text: 'Hi Maria! We noticed you completed 5 jobs this week. Great work!',
        sender: 'admin',
        senderName: 'Admin Team',
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: 'MSG-002',
        text: 'Thank you! I really enjoy working with the team.',
        sender: 'cleaner',
        senderName: 'Maria Garcia',
        timestamp: new Date(Date.now() - 82800000),
      },
      {
        id: 'MSG-003',
        text: 'We have updated our safety protocols. Please ensure you wear protective gloves when handling chemical cleaners.',
        sender: 'admin',
        senderName: 'Admin Team',
        timestamp: new Date(Date.now() - 7200000),
        isRead: false,
      },
      {
        id: 'MSG-004',
        text: 'Your weekly earnings have been processed and will be deposited within 24 hours. Total: $1,247.50',
        sender: 'admin',
        senderName: 'Admin Team',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false,
      },
    ],
  },
  {
    id: 'CONV-002',
    name: 'Sarah Thompson',
    role: 'Supervisor',
    avatar: 'ST',
    lastMessage: 'Keep up the amazing work!',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    messages: [
      {
        id: 'MSG-005',
        text: 'Hi Maria, I wanted to personally thank you for the excellent work at the Johnson residence!',
        sender: 'supervisor',
        senderName: 'Sarah Thompson',
        timestamp: new Date(Date.now() - 172800000),
      },
      {
        id: 'MSG-006',
        text: 'Thank you so much Sarah! The customers were very kind too.',
        sender: 'cleaner',
        senderName: 'Maria Garcia',
        timestamp: new Date(Date.now() - 169200000),
      },
      {
        id: 'MSG-007',
        text: 'They left a 5-star review and specifically mentioned your attention to detail. Keep up the amazing work!',
        sender: 'supervisor',
        senderName: 'Sarah Thompson',
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
  },
  {
    id: 'CONV-003',
    name: 'Michael Davis',
    role: 'Supervisor',
    avatar: 'MD',
    lastMessage: 'See you Monday at 9 AM!',
    lastMessageTime: new Date(Date.now() - 259200000),
    unreadCount: 0,
    messages: [
      {
        id: 'MSG-008',
        text: 'Reminder: Training session next Monday at 9 AM covering new eco-friendly products.',
        sender: 'supervisor',
        senderName: 'Michael Davis',
        timestamp: new Date(Date.now() - 345600000),
      },
      {
        id: 'MSG-009',
        text: 'Thanks for the reminder! I\'ll be there.',
        sender: 'cleaner',
        senderName: 'Maria Garcia',
        timestamp: new Date(Date.now() - 259200000),
      },
      {
        id: 'MSG-010',
        text: 'Perfect! See you Monday at 9 AM!',
        sender: 'supervisor',
        senderName: 'Michael Davis',
        timestamp: new Date(Date.now() - 259200000),
      },
    ],
  },
];

export function CleanerMessages({ currentView, onNavigate }: CleanerMessagesProps) {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      text: newMessage,
      sender: 'cleaner',
      senderName: 'Maria Garcia',
      timestamp: new Date(),
    };

    // Update conversation with new message
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: newMessage,
      lastMessageTime: new Date(),
    };

    setSelectedConversation(updatedConversation);
    setNewMessage('');
    
    toast.success('Message sent!', {
      duration: 2000,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // List View
  if (!selectedConversation) {
    return (
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-sm text-white/80">
                {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up!'}
              </p>
            </div>
            {totalUnread > 0 && (
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="font-bold">{totalUnread}</span>
              </div>
            )}
          </div>
        </header>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className="w-full bg-white rounded-xl border border-neutral-200 p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">{conversation.name}</h3>
                      <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                        {conversation.role}
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-neutral-500 whitespace-nowrap">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-red-600 text-white h-5 min-w-5 flex items-center justify-center px-1.5">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 truncate">{conversation.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation 
          currentView={currentView} 
          onNavigate={onNavigate}
          unreadMessages={totalUnread}
        />
      </div>
    );
  }

  // Chat View
  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Chat Header */}
      <header className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {selectedConversation.avatar}
          </div>
          <div className="flex-1">
            <h2 className="font-bold">{selectedConversation.name}</h2>
            <p className="text-xs text-white/80">{selectedConversation.role}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {selectedConversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'cleaner' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${message.sender === 'cleaner' ? 'order-2' : 'order-1'}`}>
              {message.sender !== 'cleaner' && (
                <div className="text-xs text-neutral-600 mb-1 ml-1">{message.senderName}</div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'cleaner'
                    ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-br-sm'
                    : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <div className={`text-xs text-neutral-500 mt-1 ${message.sender === 'cleaner' ? 'text-right mr-1' : 'ml-1'}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-neutral-200 p-4 mb-16">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-sm"
              style={{ maxHeight: '100px' }}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentView={currentView} 
        onNavigate={onNavigate}
        unreadMessages={totalUnread}
      />
    </div>
  );
}
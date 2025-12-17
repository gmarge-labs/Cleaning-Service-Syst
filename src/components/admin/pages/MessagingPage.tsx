import { useState } from 'react';
import { Send, Search, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';

// Mock data
const conversations = [
  {
    id: 1,
    name: 'Maria Garcia',
    role: 'Cleaner',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    lastMessage: 'I can take the 2 PM slot tomorrow',
    time: '5 min ago',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Customer',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    lastMessage: 'Thank you for the great service!',
    time: '1 hour ago',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'John Smith',
    role: 'Cleaner',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    lastMessage: 'Running 10 minutes late',
    time: '2 hours ago',
    unread: 1,
    online: true,
  },
];

const messages = [
  {
    id: 1,
    sender: 'Maria Garcia',
    text: 'Hi! I wanted to check about tomorrow\'s booking at 123 Main St.',
    time: '10:30 AM',
    isOwn: false,
  },
  {
    id: 2,
    sender: 'You',
    text: 'Hello Maria! Yes, it\'s confirmed for 10 AM. The customer requested deep cleaning.',
    time: '10:32 AM',
    isOwn: true,
  },
  {
    id: 3,
    sender: 'Maria Garcia',
    text: 'Perfect! I have all the supplies ready. Should I bring any special equipment?',
    time: '10:33 AM',
    isOwn: false,
  },
  {
    id: 4,
    sender: 'You',
    text: 'They also requested carpet cleaning, so please bring the carpet cleaner.',
    time: '10:35 AM',
    isOwn: true,
  },
  {
    id: 5,
    sender: 'Maria Garcia',
    text: 'Got it! I can take the 2 PM slot tomorrow',
    time: '10:36 AM',
    isOwn: false,
  },
];

export function MessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Internal Messaging</h1>
        <p className="text-neutral-600 mt-1">Communicate with cleaners and team members</p>
      </div>

      {/* Messaging Interface */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-[calc(100vh-250px)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-neutral-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-neutral-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-neutral-200 hover:bg-neutral-50 transition-colors text-left ${
                  selectedConversation.id === conv.id ? 'bg-secondary-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.photo}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-semibold text-neutral-900">{conv.name}</div>
                        <Badge variant="secondary" className="text-xs">
                          {conv.role}
                        </Badge>
                      </div>
                      <span className="text-xs text-neutral-500">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-600 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <div className="ml-2 w-5 h-5 rounded-full bg-secondary-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                          {conv.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedConversation.photo}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-neutral-900">{selectedConversation.name}</div>
                <div className="text-sm text-neutral-600">
                  {selectedConversation.online ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md ${
                    message.isOwn
                      ? 'bg-secondary-500 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  } rounded-2xl px-4 py-2`}
                >
                  {!message.isOwn && (
                    <div className="text-sm font-medium mb-1">{message.sender}</div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.isOwn ? 'text-secondary-100' : 'text-neutral-500'
                    }`}
                  >
                    {message.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSendMessage}
                className="bg-secondary-500 hover:bg-secondary-600 flex-shrink-0"
                disabled={!messageText.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Broadcast Announcement</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Send to
            </label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All Cleaners</Button>
              <Button variant="outline" size="sm">All Customers</Button>
              <Button variant="outline" size="sm">All Staff</Button>
            </div>
          </div>
          <Textarea
            placeholder="Type your announcement..."
            rows={3}
          />
          <Button className="bg-secondary-500 hover:bg-secondary-600">
            Send Announcement
          </Button>
        </div>
      </div>
    </div>
  );
}

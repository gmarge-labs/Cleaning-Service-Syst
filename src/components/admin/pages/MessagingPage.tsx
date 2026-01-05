import { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, Smile, MoreVertical, Phone, Video, UserPlus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { useSocket } from '../../../hooks/useSocket';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

export function MessagingPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('MessagingPage user:', user);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('Important Announcement from Sparkleville');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'cleaners' | 'customers' | 'staff'>('all');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const { socket, sendMessage, broadcastMessage } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchContacts();
      // Mark message notifications as read when page opens
      markMessageNotificationsAsRead();
    }
  }, [user?.id]);

  const markMessageNotificationsAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await fetch(`/api/notifications/${user.id}/read-all-by-type?type=MESSAGE_RECEIVED`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Failed to mark message notifications as read:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data: any) => {
        console.log('Socket event received:', data);
        if (selectedConversation && (data.senderId === selectedConversation.id || data.receiverId === selectedConversation.id)) {
          console.log('Updating chat messages for current conversation');
          setChatMessages((prev) => [
            ...prev,
            {
              id: data.id || Date.now(),
              senderId: data.senderId,
              text: data.text,
              createdAt: data.createdAt || new Date().toISOString(),
            },
          ]);
        } else {
          console.log('Message received for different conversation or no conversation selected');
        }
        // Refresh conversations list to update last message and unread count
        fetchConversations();
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('message_sent', handleReceiveMessage);

      socket.on('broadcast_received', (data) => {
        toast.info(`Broadcast to ${data.target}`, {
          description: data.text,
        });
      });

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('message_sent', handleReceiveMessage);
        socket.off('broadcast_received');
      };
    }
  }, [socket, selectedConversation]);

  const fetchConversations = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetchConversations');
      return;
    }
    try {
      setIsLoading(true);
      console.log('Fetching conversations for user:', user.id);
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'x-user-id': user.id
        }
      });
      const data = await response.json();
      console.log('Conversations received:', data.length);
      if (response.ok) {
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } else {
        console.error('Fetch conversations failed:', data);
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/messages/${partnerId}`, {
        headers: {
          'x-user-id': user.id
        }
      });
      const data = await response.json();
      if (response.ok) {
        setChatMessages(data);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const fetchContacts = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetchContacts');
      return;
    }
    try {
      setIsContactsLoading(true);
      console.log('Fetching contacts for user:', user.id);
      const response = await fetch('/api/messages/contacts', {
        headers: {
          'x-user-id': user.id
        }
      });
      const data = await response.json();
      console.log('Contacts received:', data.length);
      if (response.ok) {
        setContacts(data);
      } else {
        console.error('Fetch contacts failed:', data);
      }
    } catch (error) {
      console.error('Fetch contacts error:', error);
    } finally {
      setIsContactsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      console.log(`Sending message to ${selectedConversation.id}: ${messageText}`);
      sendMessage(selectedConversation.id, messageText);
      setMessageText('');
    }
  };

  const handleStartConversation = (contact: any) => {
    setSelectedConversation({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      online: false
    });
    setShowContactsModal(false);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendBroadcast = () => {
    if (broadcastText.trim()) {
      broadcastMessage(broadcastTarget, broadcastText, broadcastSubject);
      toast.success(`Broadcast sent to ${broadcastTarget}`);
      setBroadcastText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Internal Messaging</h1>
          <p className="text-neutral-600 mt-1">Communicate with cleaners and team members</p>
        </div>
        <Button 
          onClick={() => {
            fetchContacts();
            setShowContactsModal(true);
          }}
          className="bg-secondary-500 hover:bg-secondary-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          New Message
        </Button>
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
            {isLoading ? (
              <div className="p-4 text-center text-neutral-500">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4">
                <div className="text-sm font-medium text-neutral-500 mb-4 px-2">Available Contacts</div>
                {isContactsLoading ? (
                  <div className="text-center text-neutral-500 py-4">Loading contacts...</div>
                ) : (
                  <>
                    {contacts
                      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleStartConversation(contact)}
                          className={`w-full p-3 flex items-center gap-3 hover:bg-neutral-50 rounded-lg transition-colors text-left ${
                            selectedConversation?.id === contact.id ? 'bg-secondary-50' : ''
                          }`}
                        >
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-neutral-900">{contact.name}</div>
                            <div className="text-xs text-neutral-500 uppercase">{contact.role}</div>
                          </div>
                        </button>
                      ))}
                    {contacts.length === 0 && (
                      <div className="text-center text-neutral-500 py-4">No contacts found</div>
                    )}
                  </>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-neutral-200 hover:bg-neutral-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-secondary-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=random`}
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
                        <span className="text-xs text-neutral-500">
                          {new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
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
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.name)}&background=random`}
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
                {chatMessages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md ${
                          isOwn
                            ? 'bg-secondary-500 text-white'
                            : 'bg-neutral-100 text-neutral-900'
                        } rounded-2xl px-4 py-2`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-secondary-100' : 'text-neutral-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[500px] flex flex-col">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Message</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowContactsModal(false)}>
                <MoreVertical className="w-5 h-5 rotate-45" />
              </Button>
            </div>
            <div className="p-4 border-b border-neutral-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input placeholder="Search contacts..." className="pl-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {isContactsLoading ? (
                <div className="text-center text-neutral-500 py-8">Loading contacts...</div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleStartConversation(contact)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">{contact.name}</div>
                      <div className="text-xs text-neutral-500 uppercase">{contact.role}</div>
                    </div>
                  </button>
                ))
              )}
              {!isContactsLoading && contacts.length === 0 && (
                <div className="text-center text-neutral-500 py-8">No contacts found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Broadcast Announcement</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Send to
            </label>
            <div className="flex gap-2">
              <Button 
                variant={broadcastTarget === 'cleaners' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBroadcastTarget('cleaners')}
              >
                All Cleaners
              </Button>
              <Button 
                variant={broadcastTarget === 'customers' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBroadcastTarget('customers')}
              >
                All Customers
              </Button>
              <Button 
                variant={broadcastTarget === 'staff' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBroadcastTarget('staff')}
              >
                All Staff
              </Button>
              <Button 
                variant={broadcastTarget === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setBroadcastTarget('all')}
              >
                Everyone
              </Button>
            </div>
          </div>
          <Input
            placeholder="Announcement Subject"
            value={broadcastSubject}
            onChange={(e) => setBroadcastSubject(e.target.value)}
          />
          <Textarea
            placeholder="Type your announcement..."
            rows={3}
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
          />
          <Button 
            className="bg-secondary-500 hover:bg-secondary-600"
            onClick={handleSendBroadcast}
            disabled={!broadcastText.trim()}
          >
            Send Announcement
          </Button>
        </div>
      </div>
    </div>
  );
}

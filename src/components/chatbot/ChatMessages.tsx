import { Message } from './EllaChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  onQuickReply: (value: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, isTyping, onQuickReply, messagesEndRef }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          onQuickReply={onQuickReply}
        />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

import { useState } from 'react';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Simulate voice input
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setMessage('I need a deep cleaning for my apartment');
      }, 2000);
    }
  };

  return (
    <div className="bg-white border-t border-neutral-200 p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            className="resize-none pr-24 min-h-[60px]"
            rows={2}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className={`h-8 w-8 ${
                isListening 
                  ? 'text-red-600 hover:text-red-700 animate-pulse' 
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={!message.trim()}
          className="w-full bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </form>
      {isListening && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Listening...
        </div>
      )}
    </div>
  );
}

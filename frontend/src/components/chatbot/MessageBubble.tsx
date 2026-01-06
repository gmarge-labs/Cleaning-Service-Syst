import { Sparkles, User, CheckCircle, DollarSign } from 'lucide-react';
import { Message } from './EllaChat';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MessageBubbleProps {
  message: Message;
  onQuickReply: (value: string) => void;
}

export function MessageBubble({ message, onQuickReply }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-secondary-50 text-secondary-700 px-4 py-2 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-secondary-500 text-white rounded-br-sm'
              : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm shadow-sm'
          }`}
        >
          <p className="whitespace-pre-line">{message.content}</p>
        </div>

        {/* Service Card */}
        {message.serviceCard && (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-md w-full max-w-sm">
            <img 
              src={message.serviceCard.image} 
              alt={message.serviceCard.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                {message.serviceCard.name}
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                {message.serviceCard.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-neutral-900">
                    ${message.serviceCard.price}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  {message.serviceCard.duration}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {message.bookingSummary && (
          <div className="bg-gradient-to-br from-secondary-50 to-accent-50 border-2 border-secondary-200 rounded-xl p-4 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-lg text-neutral-900">Booking Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Service:</span>
                <span className="font-medium text-neutral-900">{message.bookingSummary.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Date:</span>
                <span className="font-medium text-neutral-900">{message.bookingSummary.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Time:</span>
                <span className="font-medium text-neutral-900">{message.bookingSummary.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Address:</span>
                <span className="font-medium text-neutral-900">{message.bookingSummary.address}</span>
              </div>
              <div className="border-t border-secondary-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-neutral-900">Total:</span>
                <span className="text-xl font-bold text-secondary-500">
                  ${message.bookingSummary.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onQuickReply(reply.value)}
                className="rounded-full border-2 border-secondary-200 hover:bg-secondary-50 hover:border-secondary-300"
              >
                {reply.label}
              </Button>
            ))}
          </div>
        )}

        <p className="text-xs text-neutral-400 px-2">
          {message.timestamp.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-neutral-600" />
        </div>
      )}
    </div>
  );
}

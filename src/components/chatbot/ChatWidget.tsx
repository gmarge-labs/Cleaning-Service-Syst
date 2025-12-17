import { useState } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import { EllaChat } from './EllaChat';
import { Badge } from '../ui/badge';

interface ChatWidgetProps {
  onBookingComplete?: () => void;
}

export function ChatWidget({ onBookingComplete }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window - Centered */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="w-full max-w-md h-[500px] my-8 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 animate-in zoom-in-95 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <EllaChat 
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
              onBookingComplete={onBookingComplete}
            />
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {hasUnread && (
              <Badge className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center p-0 bg-red-600 text-white border-2 border-white">
                1
              </Badge>
            )}
          </>
        )}
      </button>

      {/* Welcome Tooltip */}
      {!isOpen && hasUnread && (
        <div className="fixed bottom-24 right-6 bg-white rounded-xl shadow-xl p-4 z-40 max-w-xs border border-neutral-200 animate-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900 mb-1">Hi! I'm Ella 👋</div>
              <p className="text-sm text-neutral-600">
                Need help booking a cleaning? I'm here to assist you!
              </p>
            </div>
            <button
              onClick={() => setHasUnread(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
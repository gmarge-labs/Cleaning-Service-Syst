import React, { useState, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { socketService } from '../../../api/socket.service';

interface MessageModalProps {
  isOpen: boolean;
  cleaner: any;
  user: any;
  onClose: () => void;
}

function MessageModalComponent({ isOpen, cleaner, user, onClose }: MessageModalProps) {
  const [messageText, setMessageText] = useState('');

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (messageText.trim() && cleaner?.id && user?.id) {
      socketService.sendMessage(
        cleaner.id,
        messageText,
        user.id,
        user.name || 'Admin'
      );
      toast.success(`Message sent to ${cleaner.name}!`);
      setMessageText('');
      onClose();
    } else {
      toast.error('Message or cleaner information is missing');
    }
  }, [messageText, cleaner, user, onClose]);

  const handleClose = useCallback(() => {
    setMessageText('');
    onClose();
  }, [onClose]);

  // Move conditional check AFTER all hooks
  if (!isOpen || !cleaner) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-neutral-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Send Message</h2>
            <p className="text-sm text-neutral-600">Send a direct message to {cleaner.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg mb-4">
            <img
              src={cleaner.profileImage || cleaner.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaner.name)}&background=random`}
              alt={cleaner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-medium text-neutral-900">{cleaner.name}</div>
              <div className="text-sm text-neutral-600">{cleaner.email || 'N/A'}</div>
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Message
            </label>
            <textarea
              autoFocus
              className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 min-h-[150px] resize-none"
              placeholder="Type your message here..."
              value={messageText}
              onChange={handleMessageChange}
            />
            <p className="text-xs text-neutral-500 mt-1">{messageText.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use custom comparison to prevent re-renders unless isOpen actually changes
export const MessageModal = React.memo(
  MessageModalComponent,
  (prevProps, nextProps) => {
    // Only re-render if isOpen status changes
    return prevProps.isOpen === nextProps.isOpen;
  }
);

import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { EllaChat } from './EllaChat';

interface ChatPageProps {
  onBack: () => void;
  onBookingComplete?: () => void;
}

export function ChatPage({ onBack, onBookingComplete }: ChatPageProps) {
  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg text-neutral-900">Chat with Ella</h1>
          <p className="text-sm text-neutral-600">Your AI cleaning assistant</p>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full">
          <EllaChat onBookingComplete={onBookingComplete} />
        </div>
      </div>
    </div>
  );
}

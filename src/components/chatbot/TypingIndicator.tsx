import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

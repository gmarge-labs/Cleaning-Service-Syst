import { Sparkles, Minimize2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import logo from '../../images/logo/Sparkleville1(2).png';

interface ChatHeaderProps {
  onMinimize?: () => void;
  onClose?: () => void;
}

export function ChatHeader({ onMinimize, onClose }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Ella" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">Ella</h2>
            <Badge className="bg-white/20 text-white border-0 text-xs">AI Assistant</Badge>
          </div>
          <p className="text-xs text-white/80">Usually replies instantly</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="text-white hover:bg-white/20"
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

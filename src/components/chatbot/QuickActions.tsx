import { Calendar, DollarSign, HelpCircle, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { icon: Sparkles, label: 'Book Now', value: 'book', color: 'from-secondary-500 to-accent-500' },
    { icon: Calendar, label: 'Availability', value: 'availability', color: 'from-purple-500 to-pink-500' },
    { icon: DollarSign, label: 'Pricing', value: 'pricing', color: 'from-green-500 to-emerald-500' },
    { icon: HelpCircle, label: 'Help', value: 'help', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="bg-white border-b border-neutral-200 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {actions.map((action) => (
          <button
            key={action.value}
            onClick={() => onAction(action.value)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-shadow`}
          >
            <action.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function ProgressIndicator(props: ProgressIndicatorProps) {
  const { currentStep, steps } = props;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          let circleClasses = 'w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs ';
          if (isCompleted) {
            circleClasses += 'bg-secondary-500 text-white';
          } else if (isCurrent) {
            circleClasses += 'bg-secondary-100 text-secondary-500 ring-2 ring-secondary-200';
          } else {
            circleClasses += 'bg-neutral-200 text-neutral-500';
          }
          
          let labelClasses = 'mt-1.5 text-xs font-medium hidden lg:block text-center w-16 leading-tight truncate ';
          if (isCurrent) {
            labelClasses += 'text-secondary-500';
          } else {
            labelClasses += 'text-neutral-600';
          }
          
          const lineClasses = isCompleted 
            ? 'h-0.5 flex-1 mx-1 transition-all bg-secondary-500'
            : 'h-0.5 flex-1 mx-1 transition-all bg-neutral-200';
          
          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={circleClasses}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="font-semibold text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={labelClasses}>
                  {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={lineClasses} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

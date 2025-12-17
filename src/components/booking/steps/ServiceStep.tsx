import { Button } from '../../ui/button';
import { BookingData } from '../BookingFlow';
import { Home, Sparkles, Building2, Hammer, Check } from 'lucide-react';

interface ServiceStepProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

const services = [
  {
    id: 'Standard Cleaning',
    icon: Home,
    name: 'Standard Cleaning',
    description: 'Regular maintenance cleaning for your home',
    price: 89,
    color: 'from-secondary-500 to-secondary-600',
    popular: false,
  },
  {
    id: 'Deep Cleaning',
    icon: Sparkles,
    name: 'Deep Cleaning',
    description: 'Thorough top-to-bottom detailed clean',
    price: 159,
    color: 'from-purple-500 to-purple-600',
    popular: true,
  },
  {
    id: 'Move In/Out',
    icon: Building2,
    name: 'Move In/Out',
    description: 'Perfect for empty properties and relocations',
    price: 199,
    color: 'from-accent-500 to-accent-600',
    popular: false,
  },
  {
    id: 'Post-Construction',
    icon: Hammer,
    name: 'Post-Construction',
    description: 'Heavy-duty cleanup after renovations',
    price: 249,
    color: 'from-orange-500 to-orange-600',
    popular: false,
  },
];

export function ServiceStep({ data, onUpdate, onNext, onBack }: ServiceStepProps) {
  const selectedService = data.serviceType;

  const handleSelect = (serviceName: string) => {
    onUpdate({ serviceType: serviceName });
  };

  const handleContinue = () => {
    if (selectedService) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Choose Your Service</h2>
          <p className="text-neutral-600">Select the type of cleaning service you need</p>
        </div>

        {/* Service List */}
        <div className="space-y-3">
          {!selectedService ? (
            // Show all services when nothing is selected
            services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  onClick={() => handleSelect(service.id)}
                  className="relative rounded-xl border-2 border-neutral-200 hover:border-secondary-300 bg-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Radio Button */}
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center flex-shrink-0 transition-all">
                    </div>

                    {/* Service Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900">{service.name}</h3>
                        {service.popular && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">{service.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-neutral-900">${service.price}+</div>
                      <div className="text-xs text-neutral-500">per visit</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Show only selected service
            services.filter(service => service.id === selectedService).map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  onClick={() => handleSelect('')}
                  className="relative rounded-xl border-2 border-secondary-500 bg-secondary-50 shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Radio Button */}
                    <div className="w-5 h-5 rounded-full border-2 border-secondary-500 bg-secondary-500 flex items-center justify-center flex-shrink-0 transition-all">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    {/* Service Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900">{service.name}</h3>
                        {service.popular && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">{service.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-neutral-900">${service.price}+</div>
                      <div className="text-xs text-neutral-500">per visit</div>
                    </div>

                    {/* Check indicator */}
                    <Check className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
          <p className="text-sm text-secondary-900">
            💡 <strong>Note:</strong> Final pricing will be calculated based on your property size and selected add-ons.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedService}
          className="bg-secondary-500 hover:bg-secondary-600 px-8"
        >
          Continue to Property Details
        </Button>
      </div>
    </div>
  );
}
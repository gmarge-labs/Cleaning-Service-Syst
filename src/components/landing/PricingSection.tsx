import { Button } from '../ui/button';
import { Check, Home, Sparkles, Building2, Hammer } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../ui/scroll-reveal';

interface PricingSectionProps {
  onGetQuote: () => void;
}

const pricingPlans = [
  {
    icon: Home,
    name: 'Standard Cleaning',
    description: 'Perfect for regular maintenance',
    startingPrice: 89,
    popular: false,
    features: [
      'Dusting all surfaces',
      'Vacuum & mop floors',
      'Kitchen cleaning',
      'Bathroom sanitizing',
      'Trash removal',
      'Making beds',
    ],
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    icon: Sparkles,
    name: 'Deep Cleaning',
    description: 'Thorough top-to-bottom clean',
    startingPrice: 159,
    popular: true,
    features: [
      'Everything in Standard',
      'Inside cabinets',
      'Inside appliances',
      'Baseboards & trim',
      'Window sills',
      'Light fixtures',
    ],
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Building2,
    name: 'Move In/Out',
    description: 'For empty properties',
    startingPrice: 199,
    popular: false,
    features: [
      'Everything in Deep',
      'Inside closets',
      'Detailed bathroom scrub',
      'Kitchen deep clean',
      'Garage (if applicable)',
      'Patio cleaning',
    ],
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: Hammer,
    name: 'Post-Construction',
    description: 'After renovation cleanup',
    startingPrice: 249,
    popular: false,
    features: [
      'Dust & debris removal',
      'Heavy-duty scrubbing',
      'Paint splatter removal',
      'Window cleaning',
      'Final polish',
      'Inspection ready',
    ],
    color: 'from-orange-500 to-orange-600',
  },
];

export function PricingSection({ onGetQuote }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-12 px-2 sm:px-4 lg:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-neutral-600">
            Pricing varies based on your home size and specific needs. Get an instant quote in seconds.
          </p>
        </ScrollReveal>

        {/* Pricing Cards */}
        <ScrollRevealStagger staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <ScrollRevealItem key={index} variant="fade-up">
                <div
                  className={`relative rounded-2xl border-2 p-8 bg-white transition-all duration-300 hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-purple-500 shadow-xl scale-105' 
                      : 'border-neutral-200 hover:border-secondary-300'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      Most Popular
                    </Badge>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Plan Info */}
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-neutral-600">Starting from</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-neutral-900">${plan.startingPrice}</span>
                      <span className="text-neutral-600">per visit</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    onClick={onGetQuote}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-neutral-900 hover:bg-neutral-800'
                    }`}
                  >
                    Get Instant Quote
                  </Button>
                </div>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealStagger>

        {/* Additional Info */}
        <ScrollReveal variant="fade-up" delay={0.3} className="mt-12 text-center">
          <p className="text-neutral-600">
            Need a custom quote for a larger property or special requirements?{' '}
            <button className="text-secondary-500 hover:underline font-medium">
              Contact us directly
            </button>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
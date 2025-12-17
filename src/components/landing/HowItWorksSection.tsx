import { Search, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../ui/scroll-reveal';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Choose Service',
    description: 'Select from standard cleaning, deep cleaning, move-in/out, or custom services.',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    icon: Calendar,
    number: '02',
    title: 'Schedule',
    description: 'Pick a time that works for you. Next-day bookings available when slots are open.',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: CheckCircle2,
    number: '03',
    title: 'Payment',
    description: 'Review your booking and pay for the service.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Sparkles,
    number: '04',
    title: 'Enjoy Your Clean Home',
    description: 'Our professional cleaner arrives on time and transforms your space.',
    color: 'from-pink-500 to-pink-600',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 px-2 sm:px-4 lg:px-6 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-neutral-600">
            Getting professional cleaning is easier than ever. Here's how simple it is.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-secondary-200 via-accent-200 via-primary-200 to-accent-300" />

          <ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollRevealItem key={index} variant="scale">
                  <div className="relative flex flex-col items-center text-center">
                    {/* Icon Circle */}
                    <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 z-10 hover:scale-110 hover:shadow-2xl transition-all duration-300 animate-float`}
                      style={{ animationDelay: `${index * 500}ms` }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Number Badge */}
                    <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center font-bold text-sm text-neutral-700 hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealStagger>
        </div>

        {/* CTA */}
        <ScrollReveal variant="fade-up" delay={0.4} className="text-center mt-16">
          <p className="text-lg text-neutral-600 mb-6">
            Ready to experience effortless cleaning?
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Get Started</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
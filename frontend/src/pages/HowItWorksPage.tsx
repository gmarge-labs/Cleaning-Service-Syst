import { Button } from '../components/ui/button';
import { 
  MessageCircle,
  Calendar,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Star,
  ArrowRight,
  Clock,
  Shield,
  CreditCard,
  FileCheck,
  Users,
  HeadphonesIcon,
  AlertCircle,
  Lock,
  Award,
  TrendingUp
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState } from 'react';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

interface HowItWorksPageProps {
  onGetStarted: () => void;
}

export function HowItWorksPage({ onGetStarted }: HowItWorksPageProps) {
  const steps = [
    {
      number: 1,
      title: 'Chat & Book',
      description: 'Start by chatting with our AI manager Ella or fill out our simple online booking form. Tell us about your space, cleaning needs, and preferences.',
      details: [
        'Chat with Ella 24/7 for instant quotes',
        'Choose your cleaning type and frequency',
        'Specify special requirements or areas of focus',
        'Get an instant price estimate'
      ],
      image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHNlcnZpY2UlMjBjaGF0fGVufDF8fHx8MTc2NDQyMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      icon: MessageCircle,
      color: 'blue'
    },
    {
      number: 2,
      title: 'Schedule Your Service',
      description: 'Pick a date and time that works best for you. We offer flexible scheduling including next-day service, evenings, and weekends.',
      details: [
        'Choose from available time slots',
        'Next-day booking available',
        'Flexible rescheduling options',
        'Automatic calendar reminders'
      ],
      image: 'https://images.unsplash.com/photo-1484981184820-2e84ea0af397?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMHNjaGVkdWxpbmd8ZW58MXx8fHwxNzY0NDI2OTE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      icon: Calendar,
      color: 'teal'
    },
    {
      number: 3,
      title: 'Meet Your Cleaning Team',
      description: "We'll assign a vetted, professional cleaning team to your job. You'll receive their profiles, photos, and ratings before they arrive.",
      details: [
        'Background-checked professionals',
        'View cleaner profiles and ratings',
        'Same team for recurring bookings',
        'Direct communication with your team'
      ],
      image: 'https://images.unsplash.com/photo-1752250301247-94222c5a1850?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmluZyUyMHRlYW18ZW58MXx8fHwxNzY0MzUwMjIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      icon: UserCheck,
      color: 'purple'
    },
    {
      number: 4,
      title: 'We Clean Your Space',
      description: 'Our team arrives on time with all necessary supplies and equipment. They follow a detailed checklist to ensure every area is thoroughly cleaned.',
      details: [
        'Professional-grade cleaning supplies included',
        'Detailed cleaning checklist followed',
        'Real-time progress updates via app',
        'Respectful of your home and belongings'
      ],
      image: 'https://images.unsplash.com/photo-1605108222700-0d605d9ebafe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMGFwcHxlbnwxfHx8fDE3NjQzNzczNjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      icon: Sparkles,
      color: 'yellow'
    },
    {
      number: 5,
      title: 'Quality Check',
      description: 'Before leaving, our team conducts a thorough quality check. We also follow up with you to ensure complete satisfaction with the service.',
      details: [
        'Pre-departure quality inspection',
        'Photo documentation available',
        'Satisfaction survey sent to you',
        'Free re-clean if not 100% satisfied'
      ],
      image: 'https://images.unsplash.com/photo-1646065564594-7c35eac37c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWFsaXR5JTIwaW5zcGVjdGlvbnxlbnwxfHx8fDE3NjQ0MjY5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      number: 6,
      title: 'Enjoy Your Clean Space',
      description: 'Relax and enjoy your sparkling clean home! Rate your experience, and easily schedule your next cleaning with just a few clicks.',
      details: [
        'Rate and review your cleaning team',
        'Schedule recurring services',
        'Earn loyalty rewards',
        'Priority booking for repeat customers'
      ],
      image: 'https://images.unsplash.com/photo-1580709510343-94c4027ac9b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGN1c3RvbWVyJTIwaG9tZXxlbnwxfHx8fDE3NjQzNzg0NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      icon: Star,
      color: 'orange'
    }
  ];

  const colorClasses = {
    blue: {
      gradient: 'from-secondary-500 to-secondary-600',
      bg: 'bg-secondary-500',
      text: 'text-secondary-500',
      lightBg: 'bg-secondary-50',
      ring: 'ring-secondary-500'
    },
    teal: {
      gradient: 'from-accent-500 to-accent-600',
      bg: 'bg-accent-500',
      text: 'text-accent-500',
      lightBg: 'bg-accent-50',
      ring: 'ring-accent-500'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      ring: 'ring-purple-500'
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      lightBg: 'bg-yellow-50',
      ring: 'ring-yellow-500'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-500',
      text: 'text-green-600',
      lightBg: 'bg-green-50',
      ring: 'ring-green-500'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      lightBg: 'bg-orange-50',
      ring: 'ring-orange-500'
    }
  };

  const features = [
    {
      icon: Clock,
      title: 'Next-Day Service',
      description: 'Need cleaning soon? We offer next-day booking based on availability.',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Insured & Bonded',
      description: 'All our services are fully insured and bonded for your peace of mind.',
      color: 'green'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Pay securely online with credit card, debit card, or digital wallets.',
      color: 'purple'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Our customer support team is available around the clock to assist you.',
      color: 'teal'
    }
  ];

  const faqs = [
    {
      question: 'Do I need to be home during the cleaning?',
      answer: "No, you don't need to be home. Many customers provide access via lockbox, garage code, or building concierge. We'll communicate with you before and after the service."
    },
    {
      question: 'What if I need to reschedule or cancel?',
      answer: 'You can reschedule or cancel up to 24 hours before your appointment with no fee. Simply use our app or contact customer support.'
    },
    {
      question: 'Do you bring your own cleaning supplies?',
      answer: 'Yes! We bring all professional-grade cleaning supplies and equipment. If you prefer us to use your products, just let us know when booking.'
    },
    {
      question: 'How long does a typical cleaning take?',
      answer: 'It depends on the size of your space and type of service. A standard clean for a 2-bedroom apartment typically takes 2-3 hours. Deep cleaning takes longer.'
    },
    {
      question: 'What if I\'m not satisfied with the cleaning?',
      answer: 'We offer a 100% satisfaction guarantee. If you\'re not happy with any part of the service, contact us within 24 hours and we\'ll re-clean those areas for free.'
    },
    {
      question: 'Are your cleaners background checked?',
      answer: 'Absolutely. All our cleaning professionals undergo thorough background checks, reference verification, and professional training before joining our team.'
    }
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Sparkleville Works
            </h1>
            <p className="text-xl text-secondary-100 mb-8">
              From booking to sparkling clean, we've made the entire process simple, transparent, and stress-free. Here's your step-by-step guide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-5 h-5" />
                <span>Book in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
                <span>Vetted Professionals</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => {
              const colors = colorClasses[step.color as keyof typeof colorClasses];
              const isEven = index % 2 === 0;
              
              return (
                <ScrollReveal
                  key={step.number}
                  variant={isEven ? 'fade-right' : 'fade-left'}
                  delay={index * 0.1}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
                >
                  {/* Image Side */}
                  <div className="flex-1 w-full">
                    <div className="bg-white rounded-2xl p-2 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                      <div className="relative rounded-xl overflow-hidden aspect-[4/3] group">
                        <ImageWithFallback
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-20`}></div>
                        
                        {/* Step Number Overlay */}
                        <div className={`absolute top-6 left-6 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 ${colors.ring}`}>
                          <span className={`text-2xl font-bold ${colors.text}`}>
                            {step.number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 w-full">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900">
                          {step.title}
                        </h2>
                      </div>
                      
                      <p className="text-lg text-neutral-700 mb-6">
                        {step.description}
                      </p>

                      <ul className="space-y-3">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full ${colors.lightBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <CheckCircle2 className={`w-4 h-4 ${colors.text}`} />
                            </div>
                            <span className="text-neutral-700">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose Sparkleville?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We've built our service around convenience, trust, and exceptional quality
            </p>
          </ScrollReveal>

          <ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const colors = colorClasses[feature.color as keyof typeof colorClasses];
              return (
                <ScrollRevealItem
                  key={index}
                  variant="scale"
                  className="text-center p-6 rounded-xl bg-neutral-50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {feature.description}
                  </p>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Your Trust & Safety Matter
            </h2>
            <p className="text-lg text-neutral-600">
              We go the extra mile to ensure your complete peace of mind
            </p>
          </ScrollReveal>

          <ScrollRevealStagger staggerDelay={0.2} className="grid md:grid-cols-3 gap-8">
            <ScrollRevealItem variant="fade-up" className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-3">
                Background Checks
              </h3>
              <p className="text-neutral-600">
                Every cleaner undergoes comprehensive background screening, reference checks, and identity verification before joining our team.
              </p>
            </ScrollRevealItem>

            <ScrollRevealItem variant="fade-up" className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-3">
                Insurance & Bonding
              </h3>
              <p className="text-neutral-600">
                All our services are fully insured and bonded. Your property and belongings are protected throughout the cleaning process.
              </p>
            </ScrollRevealItem>

            <ScrollRevealItem variant="fade-up" className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-3">
                Satisfaction Guarantee
              </h3>
              <p className="text-neutral-600">
                Not happy with the cleaning? We'll return within 24 hours to re-clean at no extra charge. Your satisfaction is guaranteed.
              </p>
            </ScrollRevealItem>
          </ScrollRevealStagger>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to know about how our service works
            </p>
          </ScrollReveal>

          <ScrollRevealStagger staggerDelay={0.1} className="space-y-4">
            {faqs.map((faq, index) => (
              <ScrollRevealItem
                key={index}
                variant="fade-up"
                className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                    <span className="font-semibold text-neutral-900">
                      {faq.question}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      openFaqIndex === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-4 gap-8 text-center">
            <ScrollRevealItem variant="scale">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-accent-300" />
              </div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-secondary-200">Happy Customers</div>
            </ScrollRevealItem>
            <ScrollRevealItem variant="scale">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-accent-300" />
              </div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-secondary-200">Professional Cleaners</div>
            </ScrollRevealItem>
            <ScrollRevealItem variant="scale">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-8 h-8 text-accent-300" />
              </div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-secondary-200">Average Rating</div>
            </ScrollRevealItem>
            <ScrollRevealItem variant="scale">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-accent-300" />
              </div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-secondary-200">Satisfaction Rate</div>
            </ScrollRevealItem>
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <ScrollReveal variant="zoom" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Join thousands of satisfied customers who trust Sparkleville for their cleaning needs. Book your first service today!
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white hover:opacity-90 px-8 py-6 h-auto"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </ScrollReveal>
      </section>
    </div>
  );
}
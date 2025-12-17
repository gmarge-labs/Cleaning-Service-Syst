import { Button } from '../components/ui/button';
import { 
  Check, 
  X, 
  Star, 
  Home, 
  Building2, 
  Crown,
  ArrowRight,
  Clock,
  Users,
  Calendar,
  Sparkles,
  Shield,
  HelpCircle,
  TrendingDown,
  DollarSign,
  Square,
  Repeat,
  Zap,
  Package,
  Hammer,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

interface PricingPageProps {
  onGetQuote: () => void;
}

export function PricingPage({ onGetQuote }: PricingPageProps) {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'recurring'>('recurring');

  const pricingPlans = [
    {
      id: 'standard',
      name: 'Standard Clean',
      icon: Home,
      tagline: 'Perfect for regular maintenance',
      description: 'Essential cleaning for everyday upkeep',
      oneTimePrice: 89,
      recurringPrice: 79,
      image: 'https://images.unsplash.com/photo-1742483359033-13315b247c74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmVyJTIwZHVzdGluZyUyMGhvbWV8ZW58MXx8fHwxNzY0NDgyMDM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      bestFor: 'Up to 2,000 sq ft • 1-3 bedrooms',
      features: [
        'Dust all surfaces & furniture',
        'Vacuum & mop all floors',
        'Kitchen surface cleaning',
        'Bathroom sanitizing',
        'Empty trash & replace liners',
        'Make beds & tidy rooms'
      ],
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100',
      popular: false
    },
    {
      id: 'deep',
      name: 'Deep Clean',
      icon: Sparkles,
      tagline: 'Thorough top-to-bottom clean',
      description: 'Comprehensive cleaning for a fresh start',
      oneTimePrice: 159,
      recurringPrice: 139,
      image: 'https://images.unsplash.com/photo-1714058973555-a255930b9a39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwY2xlYW5pbmclMjBraXRjaGVufGVufDF8fHx8MTc2NDM5NDU1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      bestFor: 'Up to 2,500 sq ft • 2-4 bedrooms',
      features: [
        'Everything in Standard Clean +',
        'Inside cabinets & drawers',
        'Inside refrigerator & oven',
        'Baseboards & trim wiping',
        'Window sills & light fixtures',
        'Behind movable furniture'
      ],
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      popular: true
    },
    {
      id: 'move-in-out',
      name: 'Move In/Out',
      icon: Building2,
      tagline: 'For empty properties',
      description: 'Complete cleaning for moving transitions',
      oneTimePrice: 199,
      recurringPrice: 179,
      image: 'https://images.unsplash.com/photo-1587522239983-fb38b834d740?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGFwYXJ0bWVudCUyMGNsZWFuaW5nfGVufDF8fHx8MTc2NDQ4MjAzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      bestFor: 'Any size • Empty property',
      features: [
        'Everything in Deep Clean +',
        'Inside all closets',
        'Detailed bathroom & kitchen scrub',
        'All interior windows',
        'Garage & patio cleaning',
        'Wall spot cleaning'
      ],
      gradient: 'from-accent-500 to-accent-600',
      bgGradient: 'from-accent-50 to-accent-100',
      popular: false
    },
    {
      id: 'post-construction',
      name: 'Post-Construction',
      icon: Hammer,
      tagline: 'After renovation cleanup',
      description: 'Specialized cleaning for construction sites',
      oneTimePrice: 249,
      recurringPrice: 229,
      image: 'https://images.unsplash.com/photo-1740660457308-e4fb36eb866a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBkdXN0JTIwY2xlYW51cHxlbnwxfHx8fDE3NjQ0ODIwMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bestFor: 'Any size • Post-renovation',
      features: [
        'Heavy-duty dust removal',
        'Debris & material cleanup',
        'Paint splatter removal',
        'Window cleaning (inside & out)',
        'Adhesive removal & final polish',
        'Inspection-ready finish'
      ],
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      popular: false
    }
  ];

  const additionalServices = [
    {
      name: 'Eco-Friendly Products',
      price: '+$20',
      description: 'All-natural, non-toxic cleaning products safe for kids and pets'
    },
    {
      name: 'Interior Windows',
      price: '+$35',
      description: 'All interior windows cleaned to crystal clear perfection'
    },
    {
      name: 'Laundry Service',
      price: '+$40',
      description: 'We wash, dry, and fold your laundry during the cleaning session'
    }
  ];

  const faqs = [
    {
      question: 'How is pricing calculated?',
      answer: 'Our pricing is based on the size of your home, number of rooms, and frequency of service. Recurring bookings receive a discount compared to one-time cleanings.'
    },
    {
      question: 'Do you offer discounts for recurring services?',
      answer: 'Yes! Weekly and bi-weekly services receive up to 15% off compared to one-time cleaning rates. The more frequently you book, the more you save.'
    },
    {
      question: 'What if my home is larger than listed?',
      answer: 'No problem! Our Premium plan covers any size home. For extra-large properties over 5,000 sq ft, we can provide a custom quote tailored to your specific needs.'
    },
    {
      question: 'Are cleaning supplies included?',
      answer: 'Yes! All cleaning supplies and equipment are included in our pricing. We bring professional-grade products and tools to every job.'
    },
    {
      question: 'Can I customize my cleaning package?',
      answer: 'Absolutely! While our plans cover the most common needs, you can add or remove services. Just let us know your specific requirements when booking.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'You can cancel or reschedule up to 24 hours before your appointment with no charge. Cancellations within 24 hours may incur a fee.'
    }
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - Sticky (below main header) */}
      <section className="sticky top-20 z-40 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800 text-white py-6 shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Transparent Pricing for Every Home
            </h1>
            <p className="text-lg text-secondary-100 mb-6">
              No hidden fees. No surprises. Just sparkling clean homes at prices that fit your budget.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex bg-white/20 backdrop-blur-sm rounded-full p-1 border border-white/30">
              <button
                onClick={() => setBillingCycle('one-time')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === 'one-time'
                    ? 'bg-white text-primary-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                One-Time
              </button>
              <button
                onClick={() => setBillingCycle('recurring')}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === 'recurring'
                    ? 'bg-white text-primary-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Recurring
                <span className="ml-2 text-xs bg-accent-500 text-white px-2 py-1 rounded-full">
                  Save 15%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Pricing Breakdown */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <ScrollReveal variant="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary-50 text-secondary-600 px-4 py-2 rounded-full mb-4">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">Pricing Breakdown</span>
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              How Our Pricing Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Understanding what goes into your cleaning service quote. We break down every factor that influences your final price.
            </p>
          </ScrollReveal>

          {/* Service Type Pricing */}
          <div className="mb-16">
            <ScrollReveal variant="fade-right" delay={0.2}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900">Service Type Comparison</h3>
                  <p className="text-neutral-600">Choose the level of clean that fits your needs</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollRevealStagger staggerDelay={0.1} className="grid md:grid-cols-4 gap-6">
              {pricingPlans.map((service, index) => {
                const ServiceIcon = service.icon;
                const displayPrice = billingCycle === 'recurring' ? service.recurringPrice : service.oneTimePrice;
                return (
                  <ScrollRevealItem
                    key={index}
                    variant="scale"
                    className="bg-white rounded-xl border-2 border-neutral-200 p-6 hover:border-secondary-300 hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-2"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <ServiceIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-neutral-900 mb-2">{service.name}</h4>
                    <div className="mb-4">
                      <div className="text-xs text-neutral-500 mb-1">Starting from</div>
                      <div className="text-2xl font-bold text-secondary-500">
                        ${displayPrice}
                        <span className="text-sm text-neutral-500">+</span>
                      </div>
                      {billingCycle === 'recurring' && (
                        <div className="text-xs text-accent-500 font-semibold mt-1 animate-slide-in-bottom">
                          Save ${service.oneTimePrice - service.recurringPrice}
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {service.features.slice(0, 4).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollRevealItem>
                );
              })}
            </ScrollRevealStagger>
          </div>

          {/* Cost Factors */}
          <ScrollReveal variant="fade-up" delay={0.3}>
            <div className="bg-gradient-to-br from-secondary-50 to-accent-50 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">Additional Cost Factors</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    icon: Clock, 
                    title: 'Property Condition', 
                    description: 'Homes requiring extra attention due to extended time since last cleaning may incur a small surcharge.',
                    impact: '+$20-50'
                  },
                  { 
                    icon: Users, 
                    title: 'Number of Cleaners', 
                    description: 'Larger homes get multiple cleaners to complete the job efficiently and quickly.',
                    impact: 'Team size varies'
                  },
                  { 
                    icon: Package, 
                    title: 'Add-On Services', 
                    description: 'Customize with extras like eco-friendly products, laundry service, or window cleaning.',
                    impact: '+$20-75 each'
                  }
                ].map((factor, index) => {
                  const FactorIcon = factor.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-6">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                          <FactorIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 mb-2">{factor.title}</h4>
                          <p className="text-sm text-neutral-600 mb-2">{factor.description}</p>
                          <div className="inline-block bg-accent-100 text-accent-700 text-xs px-3 py-1 rounded-full font-semibold">
                            {factor.impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Price Guarantee */}
          <div className="mt-12 text-center bg-white rounded-2xl border-2 border-secondary-200 p-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              Price Lock Guarantee
            </h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-4">
              Your quoted price is locked in. No surprise charges, no hidden fees. If we quoted it, that's what you pay.
            </p>
            <Button onClick={onGetQuote} className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:opacity-90 text-white">
              Get Your Instant Quote
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Add-On Services
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Customize your cleaning experience with our additional services designed to meet your unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-neutral-900">
                    {service.name}
                  </h3>
                  <span className="text-accent-500 font-bold text-lg">
                    {service.price}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              What's Included in Every Clean
            </h2>
            <p className="text-lg text-neutral-600">
              Every SparkleVille service comes with these premium benefits at no extra cost
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Users className="w-8 h-8 text-accent-500" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">
                Vetted Professionals
              </h3>
              <p className="text-sm text-neutral-600">
                Background-checked and trained cleaning experts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">
                Premium Supplies
              </h3>
              <p className="text-sm text-neutral-600">
                Professional-grade products and equipment included
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">
                Easy Booking
              </h3>
              <p className="text-sm text-neutral-600">
                Book online 24/7 with next-day availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Pricing Questions Answered
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to know about our pricing and services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Policy Section */}
      <section id="refund-policy" className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary-50 text-secondary-600 px-4 py-2 rounded-full mb-4">
              <RefreshCcw className="w-5 h-5" />
              <span className="font-semibold">Our Commitment to You</span>
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Refund & Cancellation Policy
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Your satisfaction is our priority. We stand behind our service with a comprehensive refund and cancellation policy designed to protect you.
            </p>
          </div>

          {/* Main Policy Card */}
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-secondary-50 to-accent-50 rounded-2xl p-6 md:p-8 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">100% Satisfaction Guarantee</h3>
                <p className="text-neutral-600">If you're not completely satisfied, we make it right</p>
              </div>
            </div>
            <p className="text-neutral-700 leading-relaxed">
              At SparkleVille, we're committed to delivering exceptional cleaning services. If you're not completely satisfied with your cleaning, we'll work with you to resolve the issue.
            </p>
          </div>

          {/* Refund Scenarios */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">When You're Eligible for a Refund</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-neutral-900">Service Not Completed</h4>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  If our cleaners fail to show up or don't complete the scheduled service without prior notice, you receive a <span className="font-semibold text-green-600">100% full refund</span>.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800 font-semibold">Refund: 100% • Processing: Instant</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-secondary-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-secondary-600" />
                  </div>
                  <h4 className="font-bold text-neutral-900">Quality Issues</h4>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  If you're not satisfied with the quality, report within <span className="font-semibold text-secondary-600">24 hours</span>. We'll send our team back to <span className="font-semibold text-secondary-600">re-clean for free</span>.
                </p>
                <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
                  <p className="text-xs text-secondary-800 font-semibold">Free Re-clean • Response: Within 24 hours</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-accent-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent-600" />
                  </div>
                  <h4 className="font-bold text-neutral-900">Early Cancellation</h4>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Cancel <span className="font-semibold text-accent-600">24+ hours</span> before your appointment for a <span className="font-semibold text-accent-600">100% refund</span>. Within 24 hours: 50% refund.
                </p>
                <div className="bg-accent-50 border border-accent-200 rounded-lg p-3">
                  <p className="text-xs text-accent-800 font-semibold">Refund: 50-100% • Processing: 3-5 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Timeline */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Cancellation & Refund Timeline</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">24+ Hours Before</h4>
                <p className="text-sm text-neutral-600 mb-3">Cancel or reschedule anytime</p>
                <div className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                  100% Refund
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">12-24 Hours</h4>
                <p className="text-sm text-neutral-600 mb-3">Late cancellation fee applies</p>
                <div className="inline-block bg-secondary-100 text-secondary-700 text-xs px-3 py-1 rounded-full font-semibold">
                  50% Refund
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">Less Than 12 Hours</h4>
                <p className="text-sm text-neutral-600 mb-3">No refund available</p>
                <div className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                  No Refund
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <RefreshCcw className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">After Service</h4>
                <p className="text-sm text-neutral-600 mb-3">Report issues within 24 hours</p>
                <div className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                  Free Re-clean Only
                </div>
              </div>
            </div>
          </div>

          {/* How to Request Refund */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 md:p-12">
            <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">How to Request a Refund</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">Contact Us</h4>
                <p className="text-sm text-neutral-600">
                  Reach out via phone (555) 123-4567, email hello@sparkleville.com, or through your customer dashboard within 24 hours of service.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">Provide Details</h4>
                <p className="text-sm text-neutral-600">
                  Share your booking number and details about the issue. Photos are helpful but not required for most refund requests.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">Get Resolved</h4>
                <p className="text-sm text-neutral-600">
                  We'll review your request immediately. Most refunds are processed within 3-5 business days to your original payment method.
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-secondary-50 to-white rounded-xl border border-secondary-200 p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-secondary-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2">Payment Protection</h4>
                  <p className="text-sm text-neutral-600">
                    All payments are processed securely. Refunds return to your original payment method within 3-5 business days after approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl border border-accent-200 p-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-accent-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2">Recurring Subscriptions</h4>
                  <p className="text-sm text-neutral-600">
                    Cancel recurring services anytime without penalty. You'll continue to receive service through the end of your paid period.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-gradient-to-br from-primary-900 to-accent-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">
              Questions About Our Refund Policy?
            </h3>
            <p className="text-lg text-secondary-100 mb-6 max-w-2xl mx-auto">
              Our customer support team is here to help. We're committed to making things right.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/contact')}
                size="lg"
                className="bg-white text-primary-900 hover:bg-secondary-50"
              >
                Contact Support
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={onGetQuote}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Book Your Cleaning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-secondary-100 mb-8">
            Book your first cleaning today and experience the Sparkle Ville difference. No contracts, no commitments.
          </p>
          <Button
            onClick={() => navigate('/contact')}
            size="lg"
            className="bg-white text-primary-900 hover:bg-secondary-50 px-8 py-6 h-auto"
          >
            Chat with Our Manager
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
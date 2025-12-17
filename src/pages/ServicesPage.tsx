import { Button } from '../components/ui/button';
import { 
  Home, 
  Sparkles, 
  Building2, 
  Leaf, 
  TruckIcon, 
  HardHat,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

interface ServicesPageProps {
  onGetQuote: () => void;
}

export function ServicesPage({ onGetQuote }: ServicesPageProps) {
  const navigate = useNavigate();
  const services = [
    {
      id: 'standard',
      title: 'Standard Cleaning',
      icon: Home,
      tagline: 'Regular maintenance for a consistently clean home',
      description: 'Our standard cleaning service is perfect for maintaining a clean and healthy living environment. We focus on the essentials to keep your home fresh and inviting on a regular basis.',
      image: 'https://images.unsplash.com/photo-1725042893312-5ec0dea9e369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGVhbiUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzY0NDAwOTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'Dusting all surfaces and furniture',
        'Vacuuming carpets and mopping floors',
        'Kitchen cleaning (counters, appliances, sink)',
        'Bathroom cleaning (toilet, sink, shower/tub)',
        'Trash removal and recycling',
        'Making beds and tidying rooms'
      ],
      pricing: 'Starting at $89',
      duration: 'Starts from 3 hours',
      frequency: 'Weekly or Bi-weekly',
      color: 'from-secondary-600 to-secondary-500'
    },
    {
      id: 'deep',
      title: 'Deep Cleaning',
      icon: Sparkles,
      tagline: 'Thorough cleaning for every corner of your home',
      description: 'Our deep cleaning service goes beyond the surface to tackle dirt and grime in hard-to-reach areas. Perfect for seasonal cleaning, special occasions, or when your home needs extra attention.',
      image: 'https://images.unsplash.com/photo-1714058973555-a255930b9a39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwY2xlYW5pbmclMjBraXRjaGVufGVufDF8fHx8MTc2NDM5NDU1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'All standard cleaning tasks included',
        'Detailed baseboards and crown molding cleaning',
        'Interior window washing',
        'Deep appliance cleaning (oven, refrigerator)',
        'Grout and tile scrubbing',
        'Light fixture and ceiling fan cleaning',
        'Behind furniture cleaning',
        'Cabinet front and door cleaning'
      ],
      pricing: 'Starting at $189',
      duration: 'Starts from 5 hours',
      frequency: 'Monthly or Quarterly',
      color: 'from-accent-600 to-accent-500'
    },
    {
      id: 'move',
      title: 'Move In/Out Cleaning',
      icon: TruckIcon,
      tagline: 'Make your move stress-free with our comprehensive cleaning',
      description: 'Moving is stressful enough. Let us handle the cleaning! Our move in/out service ensures your old or new home is spotless, helping you get your deposit back or start fresh in a pristine space.',
      image: 'https://images.unsplash.com/photo-1758523671413-cd178a883d6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpbmclMjBib3hlcyUyMGhvbWV8ZW58MXx8fHwxNzY0MzIxMDE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'Complete deep cleaning of entire property',
        'All cabinets and drawers cleaned inside and out',
        'All appliances cleaned thoroughly',
        'Walls wiped down and spot cleaned',
        'All floors thoroughly cleaned',
        'Bathroom sanitization',
        'Closet and storage area cleaning',
        'Light switches and outlet cleaning'
      ],
      pricing: 'Starting at $249',
      duration: 'Starts from 6 hours',
      frequency: 'One-time service',
      color: 'from-purple-600 to-purple-500'
    },
    {
      id: 'construction',
      title: 'Post-Construction Cleaning',
      icon: HardHat,
      tagline: 'Transform construction chaos into move-in ready',
      description: 'Renovation or new construction complete? Our specialized post-construction cleaning removes all dust, debris, and residue, making your space ready for occupancy or showcase.',
      image: 'https://images.unsplash.com/photo-1617617558346-d157b6ae0aeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzY0NDI1ODI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'Complete dust and debris removal',
        'Window washing (inside and out)',
        'Paint and sticker removal',
        'Floor cleaning and polishing',
        'Fixture and hardware cleaning',
        'HVAC vent and filter cleaning',
        'Detailed surface sanitization',
        'Final walkthrough inspection'
      ],
      pricing: 'Starting at $299',
      duration: '6-10 hours',
      frequency: 'One-time service',
      color: 'from-orange-600 to-orange-500'
    },
    {
      id: 'office',
      title: 'Office Cleaning',
      icon: Building2,
      tagline: 'Professional workspace cleaning for productivity',
      description: 'A clean office is a productive office. Our commercial cleaning services keep your workplace spotless, hygienic, and professional, creating a positive impression for clients and employees alike.',
      image: 'https://images.unsplash.com/photo-1622126977176-bf029dbf6ed0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB3b3Jrc3BhY2UlMjBjbGVhbmluZ3xlbnwxfHx8fDE3NjQ0MjU4Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'Desk and workspace sanitization',
        'Common area cleaning and organizing',
        'Kitchen and break room cleaning',
        'Restroom sanitization and restocking',
        'Trash removal and recycling',
        'Floor care (vacuum, mop, polish)',
        'Window and glass cleaning',
        'Conference room preparation'
      ],
      pricing: 'Custom pricing',
      duration: 'Flexible',
      frequency: 'Daily, Weekly, or Custom',
      color: 'from-primary-600 to-primary-500'
    },
    {
      id: 'eco',
      title: 'Eco-Friendly Cleaning',
      icon: Leaf,
      tagline: 'Green cleaning solutions for a healthier home',
      description: 'Care about the environment? So do we! Our eco-friendly cleaning uses only non-toxic, biodegradable products that are safe for your family, pets, and the planet while delivering exceptional results.',
      image: 'https://images.unsplash.com/photo-1650964336783-fd8c0c241b13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBmcmllbmRseSUyMGNsZWFuaW5nfGVufDF8fHx8MTc2NDM5MTQwNHww&ixlib=rb-4.1.0&q=80&w=1080',
      features: [
        'All-natural, non-toxic cleaning products',
        'Biodegradable and eco-friendly supplies',
        'Safe for children and pets',
        'Reduces environmental impact',
        'All standard or deep cleaning tasks',
        'Allergen and chemical-free methods',
        'Sustainable cleaning practices',
        'Green certification compliance'
      ],
      pricing: 'Starting at $99',
      duration: '2-4 hours',
      frequency: 'Any schedule',
      color: 'from-green-600 to-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Cleaning Services
            </h1>
            <p className="text-xl text-secondary-100">
              Professional cleaning solutions tailored to your needs. From regular maintenance to specialized deep cleaning, we've got you covered.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Our Professional Services
            </h2>
            <p className="text-xl text-neutral-600">
              Choose the cleaning service that fits your needs perfectly.
            </p>
          </ScrollReveal>

          {/* Cards Grid */}
          <ScrollRevealStagger staggerDelay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <ScrollRevealItem key={service.id} variant="fade-up">
                  <div
                    className="group relative bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-500 ease-out overflow-hidden hover:-translate-y-2"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Image Section */}
                    <div className="relative h-[250px] w-full overflow-hidden">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/50 transition-all duration-500"></div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 pb-16">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-secondary-600 transition-colors duration-300">
                        {service.title}
                      </h3>
                      
                      {/* Pricing */}
                      <div className="mb-3">
                        <p className="text-secondary-500 font-bold text-lg">
                          {service.pricing}
                        </p>
                      </div>
                      
                      <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      
                      {/* Learn More Link */}
                      <button 
                        onClick={onGetQuote}
                        className="flex items-center gap-2 text-secondary-500 hover:text-secondary-600 transition-all duration-300 font-semibold text-sm group/btn"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>

                    {/* Circular Icon Badge */}
                    <div className={`absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.25)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.35)] group-hover:scale-110 transition-all duration-500`}>
                      <Icon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                  </div>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose SparkleVille?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We're committed to delivering exceptional cleaning services with professionalism, reliability, and care.
            </p>
          </ScrollReveal>

          <ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            <ScrollRevealItem variant="scale">
              <div className="text-center p-6 hover:-translate-y-2 transition-all duration-300 rounded-xl hover:bg-primary-50/50">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Fully Insured & Bonded</h3>
                <p className="text-neutral-600">
                  All our cleaners are background-checked, insured, and bonded for your peace of mind.
                </p>
              </div>
            </ScrollRevealItem>

            <ScrollRevealItem variant="scale">
              <div className="text-center p-6 hover:-translate-y-2 transition-all duration-300 rounded-xl hover:bg-primary-50/50">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Satisfaction Guaranteed</h3>
                <p className="text-neutral-600">
                  Not happy with our service? We'll come back and re-clean at no extra charge.
                </p>
              </div>
            </ScrollRevealItem>

            <ScrollRevealItem variant="scale">
              <div className="text-center p-6 hover:-translate-y-2 transition-all duration-300 rounded-xl hover:bg-primary-50/50">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Flexible Scheduling</h3>
                <p className="text-neutral-600">
                  Book online in 60 seconds with next-day availability and flexible timing options.
                </p>
              </div>
            </ScrollRevealItem>
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal variant="fade-up">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Sparkling Clean?
            </h2>
            <p className="text-xl text-secondary-100 mb-8">
              Get your free quote today and see why thousands of customers trust SparkleVille.
            </p>
            <Button 
              onClick={() => navigate('/contact')}
              size="lg"
              className="bg-white text-primary-900 hover:bg-secondary-50 px-8 py-6 h-auto"
            >
              Chat with Our Manager
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
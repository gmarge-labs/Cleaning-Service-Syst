import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '../ui/scroll-reveal';

const features = [
  {
    image: 'https://images.unsplash.com/photo-1586523903177-854b166f4514?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmVyJTIwdGFibGV0JTIwc2NoZWR1bGluZ3xlbnwxfHx8fDE3NjQ0MDgyMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Instant Booking',
    description: 'No phone calls required. Real-time availability.',
  },
  {
    image: 'https://images.unsplash.com/photo-1579141132886-e86d831034ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmluZyUyMHNlcnZpY2UlMjB0ZWFtfGVufDF8fHx8MTc2NDQwODIxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Professional Cleaners',
    description: 'Background-checked, trained, and insured professionals you can trust.',
  },
  {
    image: 'https://images.unsplash.com/photo-1648475235027-21cd0ed83671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG1vZGVybiUyMGhvbWUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjQzMzk4MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Satisfaction Guarantee',
    description: 'Not happy? We\'ll re-clean for free or give you a full refund.',
  },
  {
    image: 'https://images.unsplash.com/photo-1746558780335-3321e34d88b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY28lMjBjbGVhbmluZyUyMHByb2R1Y3RzJTIwc3ByYXl8ZW58MXx8fHwxNzY0NDA4MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Eco-Friendly Products',
    description: 'Safe, non-toxic cleaning supplies that are gentle on your family and pets.',
  },
  {
    image: 'https://images.unsplash.com/photo-1761641428582-b85a085340d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjBwcm9mZXNzaW9uYWwlMjB3b3JrfGVufDF8fHx8MTc2NDQwODIxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    title: '24/7 Support',
    description: 'Questions? Our friendly support team is always here to help you.',
  },
];

export function FeaturesSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate card width based on screen size
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (window.innerWidth < 640) {
          setCardWidth(containerWidth - 32); // 1 card
        } else if (window.innerWidth < 1024) {
          setCardWidth((containerWidth - 48) / 2); // 2 cards with gaps
        } else {
          setCardWidth((containerWidth - 64) / 3); // 3 cards with gaps
        }
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  // Continuous auto-scroll animation
  useEffect(() => {
    if (isPaused || cardWidth === 0) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        // Reset when we've scrolled past one full set
        if (Math.abs(newOffset) >= (cardWidth + 24) * features.length) {
          return 0;
        }
        return newOffset;
      });
    }, 20); // Smooth 50fps animation

    return () => clearInterval(interval);
  }, [isPaused, cardWidth]);

  const handleNext = () => {
    setOffset((prev) => {
      const newOffset = prev - (cardWidth + 24);
      if (Math.abs(newOffset) >= (cardWidth + 24) * features.length) {
        return 0;
      }
      return newOffset;
    });
  };

  const handlePrev = () => {
    setOffset((prev) => {
      const newOffset = prev + (cardWidth + 24);
      if (newOffset > 0) {
        return -((cardWidth + 24) * (features.length - 1));
      }
      return newOffset;
    });
  };

  // Triple the features array for seamless infinite scroll
  const extendedFeatures = [...features, ...features, ...features];

  return (
    <section id="services" className="py-12 px-2 sm:px-4 lg:px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Why Choose SparkleVille?
          </h2>
          <p className="text-xl text-neutral-600">
            We've reimagined cleaning services to be simple, reliable, and stress-free.
          </p>
        </ScrollReveal>

        {/* Carousel Container */}
        <ScrollReveal variant="fade-up" delay={0.2}>
          <div className="relative px-4 sm:px-12">
            {/* Custom Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-secondary-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-neutral-200"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-secondary-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-neutral-200"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slider */}
            <div 
              ref={containerRef}
              className="overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <motion.div
                className="flex gap-6"
                style={{
                  x: offset,
                }}
                transition={{
                  type: "tween",
                  ease: "linear",
                  duration: 0
                }}
              >
                {extendedFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex-shrink-0"
                    style={{
                      width: cardWidth || 'auto'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: (index % features.length) * 0.1 }}
                  >
                    <div className="group rounded-2xl border border-neutral-200 hover:border-secondary-300 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden h-full">
                      {/* Image Section */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <ImageWithFallback
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Text Section */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-neutral-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setOffset(-(cardWidth + 24) * index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    Math.abs(Math.round(offset / (cardWidth + 24))) % features.length === index
                      ? 'bg-secondary-500 w-8' 
                      : 'bg-secondary-500/30 hover:bg-secondary-500/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
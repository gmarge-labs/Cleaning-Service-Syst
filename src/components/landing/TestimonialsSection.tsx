import { Star, Quote } from 'lucide-react';
import { ScrollReveal } from '../ui/scroll-reveal';
import { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  booking: {
    guestName?: string;
    user: {
      name: string;
      city?: string;
    } | null;
  }
}

const fallbackTestimonials = [
  {
    name: 'Sarah Johnson',
    city: 'New York',
    date: '2024-11-28',
    rating: 5,
    text: 'Sparkleville has been a game-changer for me. The booking process is incredibly easy, and the cleaners are always professional and thorough. My home has never looked better!',
  },
  {
    name: 'Michael Chen',
    city: 'Brooklyn',
    date: '2024-11-26',
    rating: 5,
    text: 'I use Sparkleville for both my home and office. The consistency and quality of service is outstanding. Their eco-friendly products are a huge plus for our team.',
  },
  {
    name: 'Emily Rodriguez',
    city: 'Manhattan',
    date: '2024-11-25',
    rating: 5,
    text: 'As a new parent, I barely have time to breathe, let alone clean. Sparkleville gives me peace of mind knowing my home is spotless and safe for my baby. Worth every penny!',
  },
];

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews/published');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const formattedReviews = data.map((r: Review) => ({
              name: r.booking.user?.name || r.booking.guestName || 'Guest',
              city: r.booking.user?.city || 'Customer',
              date: r.createdAt,
              rating: r.rating,
              text: r.comment
            }));
            setReviews(formattedReviews);
          } else {
            setReviews(fallbackTestimonials);
          }
        } else {
          setReviews(fallbackTestimonials);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Duplicate testimonials for seamless infinite scroll
  const displayTestimonials = reviews.length > 0 ? reviews : fallbackTestimonials;
  const duplicatedTestimonials = [...displayTestimonials, ...displayTestimonials];

  return (
    <section className="py-12 px-2 sm:px-4 lg:px-6 bg-gradient-to-b from-white to-neutral-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Loved by Thousands
          </h2>
          <p className="text-xl text-neutral-600">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
        </ScrollReveal>

        {/* Testimonials Slider */}
        <ScrollReveal variant="fade-up" delay={0.2}>
          <div className="relative">
            {/* Gradient Overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none"></div>

            <div className="testimonials-slider-container">
              <div className="testimonials-slider">
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="testimonial-card group relative bg-white rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 border border-neutral-100 hover:border-secondary-200 hover:-translate-y-2 flex-shrink-0"
                    style={{ width: '320px' }}
                  >
                    {/* Quote Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-secondary-100 to-accent-100 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <Quote className="w-5 h-5 text-secondary-500" />
                    </div>

                    {/* Author - Moved to Top */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-primary-600 flex items-center justify-center text-white font-semibold ring-2 ring-secondary-100 group-hover:ring-secondary-300 transition-all duration-300">
                          {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900">{testimonial.name}</span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-500">{new Date(testimonial.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="text-xs text-neutral-600">
                          {testimonial.city}
                        </div>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-neutral-700 leading-relaxed text-sm">
                      "{testimonial.text}"
                    </p>

                    {/* Decorative gradient border on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-secondary-200 via-accent-200 to-secondary-200 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Animation Styles */}
      <style>{`
        .testimonials-slider-container {
          overflow: hidden;
          padding: 10px 0;
        }

        .testimonials-slider {
          display: flex;
          gap: 24px;
          animation: slideTestimonials 40s linear infinite;
          width: fit-content;
        }

        .testimonials-slider:hover {
          animation-play-state: paused;
        }

        @keyframes slideTestimonials {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-320px * 3 - 72px));
          }
        }

        @keyframes starPop {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .counter-stat {
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .counter-stat:nth-child(2) {
          animation-delay: 0.7s;
        }

        .counter-stat:nth-child(3) {
          animation-delay: 0.8s;
        }

        .counter-stat:nth-child(4) {
          animation-delay: 0.9s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .testimonial-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF1493, #FF69B4, #FF1493);
          background-size: 200% 100%;
          border-radius: 12px 12px 0 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .testimonial-card:hover::before {
          opacity: 1;
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  );
}
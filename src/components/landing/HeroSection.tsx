import { Button } from '../ui/button';
import { ScrollReveal } from '../ui/scroll-reveal';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onStartBooking: () => void;
}

export function HeroSection({ onStartBooking }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-screen pt-20 pb-12 px-4 overflow-hidden">
      {/* Background Video */}
      <div className="absolute top-20 left-0 right-0 bottom-0 w-full">
        {/* 
            TODO: To use an image instead of the video:
            1. Place your image in public/images/ (e.g., public/images/hero-bg.jpg)
            2. Comment out or remove the <video> tag below
            3. Uncomment the <img> tag below and update the src
        */}
        {/* <img 
            src="/images/hero-bg.jpg" 
            alt="Hero Background" 
            className="absolute top-0 left-0 w-full h-full object-cover"
        /> */}
        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764487819/Sparkle_Cleaning_Vid_nelqai.mp4"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end min-h-[calc(100vh-8rem)] pb-16">
          {/* Content */}
          <div className="space-y-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button
                onClick={onStartBooking}
                size="lg"
                className="bg-secondary-500 hover:bg-secondary-600 px-8 py-6 h-auto shadow-2xl hover:shadow-secondary-500/50 transition-all duration-300 hover:scale-105 active:scale-98 animate-pulse-soft"
              >
                Book a Cleaning
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
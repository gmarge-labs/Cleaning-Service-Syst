import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { ImageSlider } from '../ui/image-slider';
import image1 from '../../images/heroimages/image1.jpg';
import image2 from '../../images/heroimages/image2.JPG';
import image3 from '../../images/heroimages/image3.jpg';

interface HeroSectionProps {
  onStartBooking: () => void;
}

export function HeroSection({ onStartBooking }: HeroSectionProps) {
  const heroImages = [image1, image2, image3];

  return (
    <section id="home" className="relative min-h-screen pt-20 pb-12 px-4 overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute top-20 left-0 right-0 bottom-0 w-full">
        <ImageSlider 
          images={heroImages}
          autoPlayInterval={6000}
          showControls={true}
          showIndicators={true}
          className="w-full h-full"
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
                className="bg-secondary-500 hover:bg-secondary-600 px-8 py-6 h-auto shadow-2xl hover:shadow-secondary-500/50  "
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
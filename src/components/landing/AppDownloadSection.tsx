import { Smartphone } from 'lucide-react';
import { ScrollReveal } from '../ui/scroll-reveal';

interface AppDownloadSectionProps {
  onDownload?: () => void;
}

export function AppDownloadSection({ onDownload }: AppDownloadSectionProps) {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-accent-500 py-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <ScrollReveal variant="fade-right" className="flex-1 text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-pulse-soft">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm font-medium">Join Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Download the Cleaner App
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-xl">
              Are you a professional cleaner? Download our mobile app to start accepting jobs, 
              manage your schedule, and grow your business with SparkleVille.
            </p>
            <ul className="space-y-3 text-white/90 mb-8">
              <li className="flex items-center gap-3 justify-center lg:justify-start animate-slide-in-left stagger-1">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Flexible work schedule on your terms</span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start animate-slide-in-left stagger-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Competitive pay with instant payments</span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start animate-slide-in-left stagger-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Easy-to-use GPS navigation & job tracking</span>
              </li>
            </ul>
          </ScrollReveal>

          {/* Right Content - Download Buttons */}
          <ScrollReveal variant="fade-left" delay={0.2} className="flex flex-col gap-4">
            <button
              onClick={onDownload}
              className="flex items-center gap-4 px-8 py-4 bg-black hover:bg-neutral-900 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-4 px-8 py-4 bg-black hover:bg-neutral-900 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-80">GET IT ON</div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </button>
            <p className="text-center text-white/80 text-sm mt-2">
              Available for iOS 14+ and Android 8+
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
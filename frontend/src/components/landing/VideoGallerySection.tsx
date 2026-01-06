import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const videos = [
  {
    videoUrl: 'https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764487819/Sparkle_Cleaning_Vid_nelqai.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1679137315174-ff25263f2e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmVyJTIwdW5pZm9ybSUyMHdvcmt8ZW58MXx8fHwxNzY0NDE2OTk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Professional Home Cleaning',
    description: 'Watch our expert cleaners transform your living space with attention to detail',
  },
  {
    videoUrl: 'https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764489617/018d0649-aaf6-40c3-a293-b45deff526bb_ao8mwx.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1705990787785-3ca3eb668131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjB0ZWFtJTIwb2ZmaWNlfGVufDF8fHx8MTc2NDQxNjk5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Office Cleaning',
    description: 'Our team delivers spotless office environments for a productive workspace',
  },
  {
    videoUrl: 'https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764489617/018d0649-aaf6-40c3-a293-b45deff526bb_ao8mwx.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1556037843-347ddff9f4b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGNsZWFuaW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjQ0MTY5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Kitchen Sanitization',
    description: 'From countertops to appliances, we ensure your kitchen sparkles',
  },
  {
    videoUrl: 'https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764487819/Sparkle_Cleaning_Vid_nelqai.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1722935437914-dc77c2c93641?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmluZyUyMGJhdGhyb29tfGVufDF8fHx8MTc2NDQxNjk5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Bathroom Detailing',
    description: 'Experience hospital-grade cleanliness in your bathroom',
  },
  {
    videoUrl: 'https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764489617/018d0649-aaf6-40c3-a293-b45deff526bb_ao8mwx.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1695709389386-959e1e6887e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2NDQxNjk5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Living Room Refresh',
    description: 'See how we restore comfort and cleanliness to your living spaces',
  },
  {
    videoUrl: 'https://res.cloudinary.com/dwwa5bzo4/video/upload/v1764487819/Sparkle_Cleaning_Vid_nelqai.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1761689502577-0013be84f1bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBjbGVhbmluZyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjQ0MTcwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Window & Glass Care',
    description: 'Crystal clear windows with streak-free professional results',
  },
];

/* 
  TODO: To use images instead of videos in the gallery:
  1. Place your images in public/images/
  2. Update the 'videos' array above or create a new 'images' array
  3. Update the rendering logic below to use <img> tags instead of <video> tags
  
  Example structure for images:
  const images = [
    {
      imageUrl: '/images/gallery-1.jpg',
      title: 'Title',
      description: 'Description'
    },
    // ...
  ];
*/

export function VideoGallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-advance carousel after 20 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % videos.length);
      setIsVideoPlaying(false);
    }, 20000); // 20 seconds per video

    return () => clearTimeout(timer);
  }, [currentIndex, isAutoPlaying]);

  // Auto-play video when carousel changes
  useEffect(() => {
    if (videoRef.current && isAutoPlaying) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Auto-play was prevented, user needs to interact first
        setIsVideoPlaying(false);
      });
      setIsVideoPlaying(true);
    }
  }, [currentIndex, isAutoPlaying]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setIsVideoPlaying(false);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsVideoPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1200 : -1200,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1200 : -1200,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <section className="py-20 px-2 sm:px-4 lg:px-6 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              See Our Team in Action
            </h2>
            <p className="text-xl text-neutral-600">
              Watch our professionally trained cleaners deliver exceptional results in custom Sparkleville uniforms
            </p>
          </motion.div>
        </div>

        {/* Video Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-secondary-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-neutral-200"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-secondary-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-neutral-200"
            aria-label="Next video"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Auto-play Toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-secondary-500 hover:text-white transition-all duration-300 flex items-center gap-2 border border-neutral-200"
            aria-label={isAutoPlaying ? 'Pause autoplay' : 'Play autoplay'}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Play</span>
              </>
            )}
          </button>

          {/* Video Container */}
          <div className="relative h-[600px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                className="absolute inset-0 flex items-center justify-center px-16"
              >
                <div className="w-full max-w-4xl">
                  {/* Video Card */}
                  <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-neutral-900">
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black">
                      <video
                        key={currentIndex}
                        ref={videoRef}
                        poster={videos[currentIndex].thumbnail}
                        src={videos[currentIndex].videoUrl}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        onEnded={() => setIsVideoPlaying(false)}
                      />

                      {/* Video Controls Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-transparent to-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Center Play/Pause Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePlayPause}
                            className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl hover:bg-secondary-500 hover:text-white transition-all duration-300"
                            aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-10 h-10" />
                            ) : (
                              <Play className="w-10 h-10 ml-1" />
                            )}
                          </motion.button>
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <button
                            onClick={toggleMute}
                            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-secondary-500 hover:text-white transition-all duration-300"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Brand Badge */}
                      <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold shadow-lg">
                        Sparkleville
                      </div>

                      {/* Playing Indicator */}
                      {isVideoPlaying && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-8 bg-white">
                      <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                        {videos[currentIndex].title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {videos[currentIndex].description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Navigation */}
          <div className="mt-8 flex justify-center gap-3 px-4 overflow-x-auto pb-4">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden transition-all duration-300 ${index === currentIndex
                    ? 'ring-4 ring-secondary-500 scale-110'
                    : 'opacity-50 hover:opacity-100 hover:scale-105'
                  }`}
              >
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-secondary-500/20"></div>
                )}
              </button>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'bg-secondary-500 w-12'
                    : 'bg-neutral-300 w-6 hover:bg-neutral-400'
                  }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
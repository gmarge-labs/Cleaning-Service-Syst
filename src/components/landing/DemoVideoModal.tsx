import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden@1.1.0';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black" aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>SparkleVille Demo Video</DialogTitle>
        </VisuallyHidden.Root>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close video"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Container */}
        <div className="relative w-full pt-[56.25%]">
          {/* 16:9 Aspect Ratio */}
          {/* 
              TODO: To use an image instead of the video iframe:
              1. Place your image in public/images/
              2. Comment out the <iframe> below
              3. Uncomment the <img> tag below and update the src
          */}
          {/* <img 
              src="/images/demo-preview.jpg" 
              alt="Demo Preview" 
              className="absolute top-0 left-0 w-full h-full object-cover"
          /> */}
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
            title="SparkleVille Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
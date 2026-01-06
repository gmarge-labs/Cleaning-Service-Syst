import { useState } from 'react';
import { ArrowLeft, Camera, X, CheckCircle, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Job } from './CleanerApp';

interface JobCompletionProps {
  job: Job;
  onSubmit: () => void;
  onBack: () => void;
}

export function JobCompletion({ job, onSubmit, onBack }: JobCompletionProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [issues, setIssues] = useState('');
  const [supplies, setSupplies] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const mockPhotos = [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=400&fit=crop',
    ];
    setPhotos([...photos, ...mockPhotos.slice(0, 1)]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 1500);
  };

  const canSubmit = photos.length >= 2 && notes.trim().length > 0;

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Complete Job</h1>
            <p className="text-sm text-white/80">{job.customer} - {job.id}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Upload Photos */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-secondary-500" />
                Job Photos
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Upload at least 2 photos (before/after recommended)
              </p>
            </div>
            <span className="text-sm font-medium text-secondary-500">
              {photos.length}/10
            </span>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Job photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-2"
            onClick={handlePhotoUpload}
            disabled={photos.length >= 10}
          >
            <Upload className="w-5 h-5 mr-2" />
            {photos.length === 0 ? 'Upload Photos' : 'Add More Photos'}
          </Button>
        </div>

        {/* Completion Notes */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <Label htmlFor="notes" className="text-neutral-900 mb-2 block">
            Completion Notes <span className="text-red-600">*</span>
          </Label>
          <p className="text-sm text-neutral-600 mb-3">
            Describe what was completed and any highlights
          </p>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Example: Completed deep cleaning of kitchen and bathrooms. All surfaces sanitized. Floors mopped and vacuumed."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Issues or Concerns */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <Label htmlFor="issues" className="text-neutral-900 mb-2 block flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Issues or Concerns
          </Label>
          <p className="text-sm text-neutral-600 mb-3">
            Report any problems encountered (optional)
          </p>
          <Textarea
            id="issues"
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            placeholder="Example: Broken light fixture in bathroom. Customer was notified."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Supplies Used */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <Label htmlFor="supplies" className="text-neutral-900 mb-2 block">
            Supplies Used
          </Label>
          <p className="text-sm text-neutral-600 mb-3">
            List any supplies that need restocking (optional)
          </p>
          <Textarea
            id="supplies"
            value={supplies}
            onChange={(e) => setSupplies(e.target.value)}
            placeholder="Example: Used 2 bottles of all-purpose cleaner, 1 pack of microfiber cloths"
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Job Summary */}
        <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-4">
          <h3 className="font-semibold text-secondary-900 mb-3">Job Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-700">Service Type:</span>
              <span className="font-medium text-secondary-900">{job.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-700">Duration:</span>
              <span className="font-medium text-secondary-900">{job.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-700">Payment:</span>
              <span className="font-medium text-secondary-900">${job.payment.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Requirements Check */}
        {!canSubmit && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Requirements
            </h3>
            <ul className="space-y-2 text-sm text-orange-800">
              {photos.length < 2 && (
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-400" />
                  Upload at least 2 photos
                </li>
              )}
              {notes.trim().length === 0 && (
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-400" />
                  Add completion notes
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border-t border-neutral-200 p-4 space-y-3">
        <Button
          className={`w-full h-14 text-lg font-semibold ${
            canSubmit
              ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Submit Job Completion
            </>
          )}
        </Button>
        <p className="text-xs text-center text-neutral-600">
          Once submitted, payment will be processed and added to your earnings
        </p>
      </div>
    </div>
  );
}

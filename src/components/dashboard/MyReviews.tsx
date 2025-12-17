import { useState } from 'react';
import { Star, Plus, Edit2, Trash2, ThumbsUp, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface Review {
  id: string;
  serviceType: string;
  bookingDate: string;
  rating: number;
  comment: string;
  submittedDate: string;
  cleanerName?: string;
  helpful?: number;
}

interface ReviewFormData {
  serviceType: string;
  rating: number;
  comment: string;
}

export function MyReviews() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    serviceType: '',
    rating: 0,
    comment: '',
  });

  // Mock data - replace with real data from API/state management
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      serviceType: 'Deep Cleaning',
      bookingDate: '2024-11-15',
      rating: 5,
      comment: 'Absolutely amazing service! The team was professional, thorough, and left my home spotless. I\'m extremely satisfied with the deep cleaning and will definitely book again.',
      submittedDate: '2024-11-16',
      cleanerName: 'Sarah Johnson',
      helpful: 12,
    },
    {
      id: '2',
      serviceType: 'Standard Cleaning',
      bookingDate: '2024-10-28',
      rating: 4,
      comment: 'Great job overall. The cleaner was punctual and did a thorough job. Only minor issue was missing one bathroom mirror, but everything else was perfect!',
      submittedDate: '2024-10-29',
      cleanerName: 'Michael Chen',
      helpful: 8,
    },
    {
      id: '3',
      serviceType: 'Move-Out Cleaning',
      bookingDate: '2024-09-10',
      rating: 5,
      comment: 'Exceptional work! They made my old apartment look brand new. Got my full security deposit back thanks to their meticulous cleaning.',
      submittedDate: '2024-09-11',
      cleanerName: 'Emma Williams',
      helpful: 15,
    },
  ]);

  const handleSubmitReview = () => {
    if (formData.rating === 0 || !formData.serviceType || !formData.comment) {
      alert('Please fill in all fields');
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      serviceType: formData.serviceType,
      bookingDate: new Date().toISOString().split('T')[0],
      rating: formData.rating,
      comment: formData.comment,
      submittedDate: new Date().toISOString().split('T')[0],
      helpful: 0,
    };

    if (editingReview) {
      setReviews(reviews.map(r => r.id === editingReview.id ? { ...newReview, id: editingReview.id } : r));
    } else {
      setReviews([newReview, ...reviews]);
    }

    // Reset form
    setFormData({ serviceType: '', rating: 0, comment: '' });
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setFormData({
      serviceType: review.serviceType,
      rating: review.rating,
      comment: review.comment,
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const handleCancelForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setFormData({ serviceType: '', rating: 0, comment: '' });
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-neutral-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Reviews</h2>
          <p className="text-neutral-600 mt-1">
            Share your experience and help others make informed decisions
          </p>
        </div>
        {!showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-secondary-500 hover:bg-secondary-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Write Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h3>

          <div className="space-y-6">
            {/* Service Type */}
            <div>
              <label className="block font-medium text-neutral-900 mb-2">
                Service Type
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors"
              >
                <option value="">Select a service</option>
                <option value="Standard Cleaning">Standard Cleaning</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
                <option value="Move-In/Out Cleaning">Move-In/Out Cleaning</option>
                <option value="Post-Construction">Post-Construction Cleaning</option>
                <option value="Office Cleaning">Office Cleaning</option>
                <option value="Carpet Cleaning">Carpet Cleaning</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block font-medium text-neutral-900 mb-2">
                Rating
              </label>
              {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
              {formData.rating > 0 && (
                <p className="text-sm text-neutral-600 mt-2">
                  {formData.rating === 5 && '⭐ Excellent!'}
                  {formData.rating === 4 && '👍 Very Good'}
                  {formData.rating === 3 && '✓ Good'}
                  {formData.rating === 2 && '👎 Fair'}
                  {formData.rating === 1 && '😞 Poor'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block font-medium text-neutral-900 mb-2">
                Your Review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience with this service. What did you like? What could be improved?"
                rows={6}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors resize-none"
              />
              <p className="text-sm text-neutral-500 mt-2">
                {formData.comment.length} characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReview}
                className="bg-secondary-500 hover:bg-secondary-600 flex-1"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
              <Button
                onClick={handleCancelForm}
                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="text-3xl font-bold text-secondary-500">{reviews.length}</div>
          <div className="text-neutral-600 mt-1">Total Reviews</div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-yellow-500">
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
            </div>
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="text-neutral-600 mt-1">Average Rating</div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="text-3xl font-bold text-primary-500">
            {reviews.reduce((acc, r) => acc + (r.helpful || 0), 0)}
          </div>
          <div className="text-neutral-600 mt-1">Helpful Votes</div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Star className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No Reviews Yet</h3>
          <p className="text-neutral-600 mb-6">
            You haven't written any reviews yet. Share your experience with our services!
          </p>
          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-secondary-500 hover:bg-secondary-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Write Your First Review
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-neutral-900">{review.serviceType}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Verified Purchase
                    </span>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Edit review"
                  >
                    <Edit2 className="w-5 h-5 text-neutral-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Review Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>Service Date: {new Date(review.bookingDate).toLocaleDateString()}</span>
                </div>
                {review.cleanerName && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Cleaner: {review.cleanerName}</span>
                  </div>
                )}
              </div>

              {/* Review Comment */}
              <p className="text-neutral-700 leading-relaxed mb-4">
                {review.comment}
              </p>

              {/* Review Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <p className="text-sm text-neutral-500">
                  Submitted on {new Date(review.submittedDate).toLocaleDateString()}
                </p>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:text-secondary-500 hover:bg-neutral-50 rounded-lg transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpful || 0} people found this helpful</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Star, 
  Eye,
  CheckCircle, 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  bookingId: string | null;
  booking?: {
    id: string;
    serviceType: string;
    guestName?: string;
    guestEmail?: string;
    user: {
      name: string;
      email: string;
    } | null;
  } | null;
}

export function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [publishedCurrentPage, setPublishedCurrentPage] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        toast.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('An error occurred while fetching reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === id ? { ...review, status: 'PUBLISHED' } : review
        ));
        toast.success('Review published successfully!');
      } else {
        toast.error('Failed to publish review');
      }
    } catch (error) {
      console.error('Error publishing review:', error);
      toast.error('An error occurred');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING' })
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === id ? { ...review, status: 'PENDING' } : review
        ));
        toast.success('Review unpublished successfully!');
      } else {
        toast.error('Failed to unpublish review');
      }
    } catch (error) {
      console.error('Error unpublishing review:', error);
      toast.error('An error occurred');
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    
    try {
      const response = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText })
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === id ? { 
            ...review, 
            adminReply: replyText,
            repliedAt: new Date().toISOString(),
          } : review
        ));
        
        if (selectedReview?.id === id) {
          setSelectedReview({
            ...selectedReview,
            adminReply: replyText,
            repliedAt: new Date().toISOString(),
          });
        }
        
        setReplyText('');
        toast.success('Reply sent successfully!');
      } else {
        toast.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('An error occurred');
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setReplyText('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => 
    (review.booking?.user?.name || review.booking?.guestName || 'Guest').toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.booking?.serviceType || 'General Service').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingReviews = filteredReviews.filter(r => r.status === 'PENDING');
  const publishedReviews = filteredReviews.filter(r => r.status === 'PUBLISHED');

  const totalPages = Math.ceil(pendingReviews.length / itemsPerPage);
  const publishedTotalPages = Math.ceil(publishedReviews.length / itemsPerPage);

  const currentReviews = pendingReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentPublishedReviews = publishedReviews.slice(
    (publishedCurrentPage - 1) * itemsPerPage,
    publishedCurrentPage * itemsPerPage
  );

  const ReviewModal = () => {
    if (!selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">Review Details</h2>
            <button
              onClick={() => setSelectedReview(null)}
              className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="text-sm text-neutral-600 mb-2">Customer</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold text-lg">
                    {(selectedReview.booking?.user?.name || selectedReview.booking?.guestName || 'G')[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{selectedReview.booking?.user?.name || selectedReview.booking?.guestName || 'Guest'}</div>
                    <div className="text-sm text-neutral-600">{selectedReview.booking?.user?.email || selectedReview.booking?.guestEmail || 'No email'}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm text-neutral-600 mb-2">Service</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{selectedReview.booking?.serviceType || 'General Service'}</div>
                    <div className="text-sm text-neutral-600">Job ID: {(selectedReview.booking?.id || selectedReview.bookingId || 'N/A').slice(-8)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                {renderStars(selectedReview.rating)}
                <div className="text-sm text-neutral-500">
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-neutral-700 leading-relaxed italic">
                "{selectedReview.comment}"
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                <MessageSquare className="w-5 h-5" />
                <h3>Admin Reply</h3>
              </div>

              {selectedReview.adminReply ? (
                <div className="bg-secondary-50 border border-secondary-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-secondary-900">Admin</div>
                    <div className="text-xs text-secondary-600">
                      {new Date(selectedReview.repliedAt!).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-secondary-800 text-sm leading-relaxed">
                    {selectedReview.adminReply}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your reply to the customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleReply(selectedReview.id)}
                      disabled={!replyText.trim()}
                      className="bg-secondary-600 hover:bg-secondary-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedReview.status !== 'PUBLISHED' && (
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedReview(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePublish(selectedReview.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Publish
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-secondary-500 animate-spin mb-4" />
        <p className="text-neutral-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Customer Reviews</h1>
          <p className="text-neutral-600">Manage and respond to customer feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-neutral-100 p-1">
          <TabsTrigger value="pending" className="px-6">
            Pending Approval
            <Badge className="ml-2 bg-secondary-100 text-secondary-700 border-none">
              {pendingReviews.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="published" className="px-6">
            Published
            <Badge className="ml-2 bg-green-100 text-green-700 border-none">
              {publishedReviews.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Customer</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Service</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Rating</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Review</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentReviews.length > 0 ? (
                    currentReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold">
                              {(review.booking?.user?.name || review.booking?.guestName || 'G')[0]}
                            </div>
                            <div>
                              <div className="font-medium text-neutral-900">{review.booking?.user?.name || review.booking?.guestName || 'Guest'}</div>
                              <div className="text-xs text-neutral-500">{review.booking?.user?.email || review.booking?.guestEmail || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900">{review.booking?.serviceType || 'General Service'}</div>
                          <div className="text-xs text-neutral-500">ID: {(review.booking?.id || review.bookingId || 'N/A').slice(-8)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-neutral-600 line-clamp-2 max-w-[300px]">
                            {review.comment}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReview(review)}
                              className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(review.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                        No pending reviews found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, pendingReviews.length)} of {pendingReviews.length} reviews
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'bg-secondary-600 text-white' : ''}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Customer</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Service</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Rating</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Review</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-neutral-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentPublishedReviews.length > 0 ? (
                    currentPublishedReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold">
                              {(review.booking?.user?.name || review.booking?.guestName || 'G')[0]}
                            </div>
                            <div>
                              <div className="font-medium text-neutral-900">{review.booking?.user?.name || review.booking?.guestName || 'Guest'}</div>
                              <div className="text-xs text-neutral-500">{review.booking?.user?.email || review.booking?.guestEmail || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900">{review.booking?.serviceType || 'General Service'}</div>
                          <div className="text-xs text-neutral-500">ID: {(review.booking?.id || review.bookingId || 'N/A').slice(-8)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-neutral-600 line-clamp-2 max-w-[300px]">
                            {review.comment}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {review.adminReply ? (
                            <Badge className="bg-blue-100 text-blue-700 border-none">Replied</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-none">Published</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReview(review)}
                              className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnpublish(review.id)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              Unpublish
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                        No published reviews found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {publishedTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Showing {(publishedCurrentPage - 1) * itemsPerPage + 1} to {Math.min(publishedCurrentPage * itemsPerPage, publishedReviews.length)} of {publishedReviews.length} reviews
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPublishedCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={publishedCurrentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: publishedTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={publishedCurrentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPublishedCurrentPage(page)}
                        className={publishedCurrentPage === page ? 'bg-secondary-600 text-white' : ''}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPublishedCurrentPage(prev => Math.min(publishedTotalPages, prev + 1))}
                    disabled={publishedCurrentPage === publishedTotalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ReviewModal />
    </div>
  );
}

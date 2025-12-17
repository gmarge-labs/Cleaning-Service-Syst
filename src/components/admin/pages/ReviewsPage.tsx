import { useState } from 'react';
import { 
  Star, 
  Eye,
  CheckCircle, 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Send
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner@2.0.3';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerPhoto: string;
  customerCity: string;
  cleanerId: string;
  cleanerName: string;
  cleanerPhoto: string;
  jobId: string;
  service: string;
  rating: number;
  reviewText: string;
  date: string;
  isPublished: boolean;
  adminReply?: string;
  adminReplyDate?: string;
  adminName?: string;
}

export function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [publishedCurrentPage, setPublishedCurrentPage] = useState(1);
  const [replyText, setReplyText] = useState('');
  const itemsPerPage = 10;

  // Mock data - replace with API call
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'REV-001',
      customerId: 'CUST-001',
      customerName: 'Sarah Williams',
      customerPhoto: 'https://i.pravatar.cc/150?img=1',
      customerCity: 'New York',
      cleanerId: 'CLN-001',
      cleanerName: 'Maria Garcia',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=5',
      jobId: 'JOB-2024-156',
      service: 'Deep Cleaning',
      rating: 5,
      reviewText: 'Absolutely fantastic service! Maria was professional, thorough, and left my home sparkling clean. She paid attention to every detail and even cleaned areas I didn\'t expect. Highly recommend!',
      date: '2024-11-28',
      isPublished: false
    },
    {
      id: 'REV-002',
      customerId: 'CUST-002',
      customerName: 'John Smith',
      customerPhoto: 'https://i.pravatar.cc/150?img=12',
      customerCity: 'Brooklyn',
      cleanerId: 'CLN-002',
      cleanerName: 'Jennifer Lee',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=9',
      jobId: 'JOB-2024-157',
      service: 'Standard Cleaning',
      rating: 4,
      reviewText: 'Great job overall. The cleaning was thorough and professional. Only minor issue was they arrived 15 minutes late, but the quality of work made up for it.',
      date: '2024-11-27',
      isPublished: true,
      adminReply: 'Thank you for your feedback, John! We apologize for the slight delay and appreciate your understanding. We\'re glad Jennifer provided excellent service and we\'ll continue working on our punctuality. Looking forward to serving you again!',
      adminReplyDate: '2024-11-27T14:30:00',
      adminName: 'John Doe'
    },
    {
      id: 'REV-003',
      customerId: 'CUST-003',
      customerName: 'Emily Chen',
      customerPhoto: 'https://i.pravatar.cc/150?img=20',
      customerCity: 'Manhattan',
      cleanerId: 'CLN-003',
      cleanerName: 'Sarah Johnson',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=47',
      jobId: 'JOB-2024-158',
      service: 'Move-Out Cleaning',
      rating: 5,
      reviewText: 'Best cleaning service I\'ve ever used! Sarah was amazing - very friendly, efficient, and the results were outstanding. My landlord was impressed and I got my full deposit back!',
      date: '2024-11-26',
      isPublished: true
    },
    {
      id: 'REV-004',
      customerId: 'CUST-004',
      customerName: 'Michael Brown',
      customerPhoto: 'https://i.pravatar.cc/150?img=14',
      customerCity: 'Queens',
      cleanerId: 'CLN-001',
      cleanerName: 'Maria Garcia',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=5',
      jobId: 'JOB-2024-159',
      service: 'Office Cleaning',
      rating: 3,
      reviewText: 'Service was okay. The cleaner did a decent job but missed some spots in the bathroom and didn\'t vacuum under the desks. Would have expected more attention to detail.',
      date: '2024-11-25',
      isPublished: false
    },
    {
      id: 'REV-005',
      customerId: 'CUST-005',
      customerName: 'Lisa Anderson',
      customerPhoto: 'https://i.pravatar.cc/150?img=25',
      customerCity: 'Bronx',
      cleanerId: 'CLN-004',
      cleanerName: 'Amanda White',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=32',
      jobId: 'JOB-2024-160',
      service: 'Deep Cleaning',
      rating: 5,
      reviewText: 'Outstanding work! Amanda exceeded all expectations. She was punctual, professional, and my home has never looked better. Will definitely book again!',
      date: '2024-11-24',
      isPublished: true
    },
    {
      id: 'REV-006',
      customerId: 'CUST-006',
      customerName: 'David Martinez',
      customerPhoto: 'https://i.pravatar.cc/150?img=33',
      customerCity: 'Staten Island',
      cleanerId: 'CLN-002',
      cleanerName: 'Jennifer Lee',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=9',
      jobId: 'JOB-2024-161',
      service: 'Standard Cleaning',
      rating: 2,
      reviewText: 'Not satisfied with this service. Several areas were not cleaned properly and I had to redo some of the work myself. Expected much better quality for the price.',
      date: '2024-11-23',
      isPublished: false
    },
    {
      id: 'REV-007',
      customerId: 'CUST-007',
      customerName: 'Rachel Green',
      customerPhoto: 'https://i.pravatar.cc/150?img=45',
      customerCity: 'Jersey City',
      cleanerId: 'CLN-005',
      cleanerName: 'Patricia Davis',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=38',
      jobId: 'JOB-2024-162',
      service: 'Deep Cleaning',
      rating: 5,
      reviewText: 'Excellent service from start to finish! Patricia was incredibly thorough and professional. She even gave me some helpful tips for maintaining cleanliness between visits.',
      date: '2024-11-22',
      isPublished: false
    },
    {
      id: 'REV-008',
      customerId: 'CUST-008',
      customerName: 'Thomas Wilson',
      customerPhoto: 'https://i.pravatar.cc/150?img=52',
      customerCity: 'Hoboken',
      cleanerId: 'CLN-003',
      cleanerName: 'Sarah Johnson',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=47',
      jobId: 'JOB-2024-163',
      service: 'Office Cleaning',
      rating: 4,
      reviewText: 'Very pleased with the service. The office looks great and the team was respectful of our equipment and workspace. Will use again for sure.',
      date: '2024-11-21',
      isPublished: false
    },
    {
      id: 'REV-009',
      customerId: 'CUST-009',
      customerName: 'Jennifer Taylor',
      customerPhoto: 'https://i.pravatar.cc/150?img=28',
      customerCity: 'New York',
      cleanerId: 'CLN-001',
      cleanerName: 'Maria Garcia',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=5',
      jobId: 'JOB-2024-164',
      service: 'Standard Cleaning',
      rating: 5,
      reviewText: 'Maria is absolutely wonderful! She has been cleaning my apartment for months now and I couldn\'t be happier. Always on time, always thorough, and always friendly.',
      date: '2024-11-20',
      isPublished: true
    },
    {
      id: 'REV-010',
      customerId: 'CUST-010',
      customerName: 'Robert Johnson',
      customerPhoto: 'https://i.pravatar.cc/150?img=15',
      customerCity: 'Brooklyn',
      cleanerId: 'CLN-004',
      cleanerName: 'Amanda White',
      cleanerPhoto: 'https://i.pravatar.cc/150?img=32',
      jobId: 'JOB-2024-165',
      service: 'Deep Cleaning',
      rating: 4,
      reviewText: 'Good service overall. The deep cleaning was comprehensive and Amanda was professional throughout. Would recommend to others.',
      date: '2024-11-19',
      isPublished: true
    }
  ]);

  const handlePublish = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, isPublished: true } 
        : review
    ));
    setSelectedReview(null);
    setReplyText('');
    toast.success('Review published successfully!');
  };

  const handleUnpublish = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, isPublished: false } 
        : review
    ));
    toast.success('Review unpublished successfully!');
  };

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            adminReply: replyText,
            adminReplyDate: new Date().toISOString(),
            adminName: 'John Doe' // This would come from auth context
          } 
        : review
    ));
    
    // Update selectedReview to show the new reply immediately
    if (selectedReview) {
      setSelectedReview({
        ...selectedReview,
        adminReply: replyText,
        adminReplyDate: new Date().toISOString(),
        adminName: 'John Doe'
      });
    }
    
    setReplyText('');
    toast.success('Reply sent successfully!');
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setReplyText('');
  };

  // Filter reviews
  const pendingReviews = reviews.filter(review => !review.isPublished);
  const publishedReviews = reviews.filter(review => review.isPublished);

  const filteredPendingReviews = pendingReviews.filter(review => 
    review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.cleanerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublishedReviews = publishedReviews.filter(review => 
    review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.cleanerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPendingPages = Math.ceil(filteredPendingReviews.length / itemsPerPage);
  const totalPublishedPages = Math.ceil(filteredPublishedReviews.length / itemsPerPage);

  const paginatedPendingReviews = filteredPendingReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedPublishedReviews = filteredPublishedReviews.slice(
    (publishedCurrentPage - 1) * itemsPerPage,
    publishedCurrentPage * itemsPerPage
  );

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

  const ReviewModal = () => {
    if (!selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">Review Details</h2>
            <button
              onClick={() => {
                setSelectedReview(null);
                setReplyText('');
              }}
              className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer & Cleaner Info */}
            <div className="flex items-start gap-6">
              {/* Customer */}
              <div className="flex-1">
                <div className="text-sm text-neutral-600 mb-2">Customer</div>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedReview.customerPhoto}
                    alt={selectedReview.customerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">{selectedReview.customerName}</div>
                    <div className="text-sm text-neutral-600">{selectedReview.customerCity}</div>
                  </div>
                </div>
              </div>

              {/* Cleaner */}
              <div className="flex-1">
                <div className="text-sm text-neutral-600 mb-2">Cleaner</div>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedReview.cleanerPhoto}
                    alt={selectedReview.cleanerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">{selectedReview.cleanerName}</div>
                    <div className="text-sm text-neutral-600">Cleaner</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Job ID</div>
                <div className="font-medium text-neutral-900">{selectedReview.jobId}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Service Type</div>
                <div className="font-medium text-neutral-900">{selectedReview.service}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Date</div>
                <div className="font-medium text-neutral-900">
                  {new Date(selectedReview.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Rating</div>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-medium text-neutral-900">({selectedReview.rating}/5)</span>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <div className="text-sm text-neutral-600 mb-2">Feedback</div>
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <p className="text-neutral-900 leading-relaxed">{selectedReview.reviewText}</p>
              </div>
            </div>

            {/* Admin Reply Section */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-secondary-500" />
                <h3 className="font-semibold text-neutral-900">Admin Reply</h3>
              </div>

              {selectedReview.adminReply ? (
                <div className="space-y-4">
                  {/* Existing Reply */}
                  <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {selectedReview.adminName?.split(' ').map(n => n[0]).join('') || 'AD'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{selectedReview.adminName || 'Admin'}</div>
                          <div className="text-xs text-neutral-600">
                            {selectedReview.adminReplyDate && new Date(selectedReview.adminReplyDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-secondary-200 text-secondary-700 border-0">
                        Replied
                      </Badge>
                    </div>
                    <p className="text-neutral-900 leading-relaxed">{selectedReview.adminReply}</p>
                  </div>
                  
                  {/* Option to edit/add new reply */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyText(selectedReview.adminReply || '')}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Edit Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-600">Send a reply to {selectedReview.customerName}</p>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleReply(selectedReview.id)}
                      className="bg-secondary-500 hover:bg-secondary-600 gap-2"
                      disabled={!replyText.trim()}
                    >
                      <Send className="w-4 h-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}

              {/* Show reply form when editing */}
              {replyText && selectedReview.adminReply && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-neutral-600">Update your reply</div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setReplyText('')}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleReply(selectedReview.id)}
                      className="bg-secondary-500 hover:bg-secondary-600 gap-2"
                      size="sm"
                      disabled={!replyText.trim()}
                    >
                      <Send className="w-4 h-4" />
                      Update Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {!selectedReview.isPublished && (
              <div className="flex justify-end pt-4 border-t border-neutral-200">
                <Button
                  onClick={() => handlePublish(selectedReview.id)}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish Review
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
        <div className="text-sm text-neutral-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Reviews Management</h1>
          <p className="text-neutral-600 mt-1">Moderate and publish customer reviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="text-sm text-neutral-600 mb-1">Total Reviews</div>
          <div className="text-2xl font-bold text-neutral-900">{reviews.length}</div>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="text-sm text-orange-700 mb-1">Pending</div>
          <div className="text-2xl font-bold text-orange-900">{pendingReviews.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">Published</div>
          <div className="text-2xl font-bold text-green-900">{publishedReviews.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            placeholder="Search reviews, customers, cleaners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Reviews ({filteredPendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published Reviews ({filteredPublishedReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Table */}
        <TabsContent value="pending">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Cleaner</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Service</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Rating</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Date</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPendingReviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Star className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-neutral-900 mb-2">No pending reviews</h3>
                        <p className="text-sm text-neutral-600">All reviews have been processed</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPendingReviews.map((review) => (
                      <tr key={review.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={review.customerPhoto}
                              alt={review.customerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-neutral-900">{review.customerName}</div>
                              <div className="text-sm text-neutral-600">{review.customerCity}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={review.cleanerPhoto}
                              alt={review.cleanerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-neutral-900">{review.cleanerName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900">{review.service}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900">
                            {new Date(review.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => handleViewReview(review)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPendingPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </TabsContent>

        {/* Published Reviews Table */}
        <TabsContent value="published">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Cleaner</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Service</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Rating</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPublishedReviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Star className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-neutral-900 mb-2">No published reviews</h3>
                        <p className="text-sm text-neutral-600">Start publishing reviews to see them here</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedPublishedReviews.map((review) => (
                      <tr key={review.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={review.customerPhoto}
                              alt={review.customerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-neutral-900">{review.customerName}</div>
                              <div className="text-sm text-neutral-600">{review.customerCity}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={review.cleanerPhoto}
                              alt={review.cleanerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-neutral-900">{review.cleanerName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900">{review.service}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderStars(review.rating)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-neutral-900">
                            {new Date(review.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            Published
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleViewReview(review)}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                            <Button
                              onClick={() => handleUnpublish(review.id)}
                              variant="outline"
                              size="sm"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                              Unpublish
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={publishedCurrentPage}
              totalPages={totalPublishedPages}
              onPageChange={setPublishedCurrentPage}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <ReviewModal />
    </div>
  );
}

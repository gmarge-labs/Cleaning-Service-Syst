import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Search, Eye, X, CheckCircle, Users, Wrench, FileText, User, Star, Phone, Mail, Send, Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { ManualBookingFlow } from '../ManualBookingFlow';
import { toast } from 'sonner';
import { Pagination } from '../../ui/pagination';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Tab = 'unpublished' | 'published';

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('unpublished');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState<any>(null);
  const [editJobModal, setEditJobModal] = useState<any>(null);
  const [viewCleanersModal, setViewCleanersModal] = useState<any>(null);
  const [selectedCleanerProfile, setSelectedCleanerProfile] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination state
  const [unpublishedPage, setUnpublishedPage] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);
  const itemsPerPage = 10;

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const unpublishedBookings = bookings
    .filter(b => b.status === 'PENDING' || b.status === 'BOOKED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      ...b,
      customer: b.guestName || 'Unknown Customer',
      service: b.serviceType,
      date: new Date(b.date),
      total: parseFloat(b.totalAmount),
    }));

  const publishedJobs = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'RESCHEDULED' || b.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      ...b,
      customer: b.guestName || 'Unknown Customer',
      service: b.serviceType,
      date: new Date(b.date),
      total: parseFloat(b.totalAmount),
      claimedBy: [], // Placeholder until assignments are implemented
      requiredCleaners: b.bedrooms > 2 ? 2 : 1, // Simple logic for now
    }));

  const filteredUnpublishedBookings = unpublishedBookings.filter((booking) =>
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublishedJobs = publishedJobs.filter((job) =>
    job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated data
  const paginatedUnpublished = filteredUnpublishedBookings.slice(
    (unpublishedPage - 1) * itemsPerPage,
    unpublishedPage * itemsPerPage
  );

  const paginatedPublished = filteredPublishedJobs.slice(
    (publishedPage - 1) * itemsPerPage,
    publishedPage * itemsPerPage
  );

  const unpublishedTotalPages = Math.ceil(filteredUnpublishedBookings.length / itemsPerPage);
  const publishedTotalPages = Math.ceil(filteredPublishedJobs.length / itemsPerPage);

  const handleCompleteBooking = () => {
    setShowManualBooking(false);
  };

  const handlePublishJob = (jobData: any) => {
    toast.success(`Job ${jobData.bookingId} has been published successfully!`);
    setEditJobModal(null);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('booking-details-content');
    if (!element || !viewDetailsModal) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Aggressively remove ALL existing stylesheets to prevent html2canvas from parsing oklch/oklab
          const styleSheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styleSheets.forEach(s => s.remove());

          // 2. Inject a comprehensive, safe CSS with hex fallbacks
          const styleTag = clonedDoc.createElement('style');
          styleTag.innerHTML = `
            :root {
              --primary: #009688 !important;
              --secondary: #20c997 !important;
              --neutral-50: #fafbfc !important;
              --neutral-100: #f5f7fa !important;
              --neutral-200: #e8eaf0 !important;
              --neutral-500: #64748b !important;
              --neutral-800: #1e293b !important;
              --neutral-900: #0f172a !important;
              --white: #ffffff !important;
            }
            * {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }
            #booking-details-content {
              background-color: #ffffff !important;
              color: #0f172a !important;
              width: 800px !important;
              padding: 40px !important;
            }
            .bg-white { background-color: #ffffff !important; }
            .bg-neutral-900 { background-color: #0f172a !important; }
            .bg-neutral-50 { background-color: #fafbfc !important; }
            .bg-neutral-50\\/30 { background-color: #fcfdfe !important; }
            .bg-neutral-50\\/50 { background-color: #f9fafb !important; }
            .bg-secondary-50 { background-color: #f0fdfa !important; }
            .bg-secondary-500 { background-color: #20c997 !important; }
            .bg-secondary-500\\/10 { background-color: rgba(32, 201, 151, 0.1) !important; }
            .text-neutral-900 { color: #0f172a !important; }
            .text-neutral-800 { color: #1e293b !important; }
            .text-neutral-700 { color: #334155 !important; }
            .text-neutral-600 { color: #475569 !important; }
            .text-neutral-500 { color: #64748b !important; }
            .text-neutral-400 { color: #94a3b8 !important; }
            .text-secondary-600 { color: #059669 !important; }
            .text-secondary-500 { color: #10b981 !important; }
            .text-secondary-400 { color: #34d399 !important; }
            .text-white { color: #ffffff !important; }
            .border { border: 1px solid #e8eaf0 !important; }
            .border-neutral-100 { border-color: #f1f5f9 !important; }
            .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1) !important; }
            .rounded-3xl { border-radius: 24px !important; }
            .rounded-2xl { border-radius: 16px !important; }
            .rounded-xl { border-radius: 12px !important; }
            .rounded-lg { border-radius: 8px !important; }
            .rounded-full { border-radius: 9999px !important; }
            .grid { display: table !important; width: 100% !important; border-spacing: 20px !important; }
            .grid > div { display: table-cell !important; vertical-align: top !important; }
            .grid-cols-2 > div { width: 50% !important; }
            .grid-cols-3 > div { width: 33.33% !important; }
            .grid-cols-4 > div { width: 25% !important; }
            .flex { display: block !important; }
            .flex-row { display: table !important; width: 100% !important; }
            .flex-row > div { display: table-cell !important; vertical-align: middle !important; }
            .items-center { vertical-align: middle !important; }
            .justify-between { width: 100% !important; }
            .p-8 { padding: 32px !important; }
            .p-6 { padding: 24px !important; }
            .p-4 { padding: 16px !important; }
            .p-3 { padding: 12px !important; }
            .mb-8 { margin-bottom: 32px !important; }
            .mb-6 { margin-bottom: 24px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mt-10 { margin-top: 40px !important; }
            .space-y-12 > * + * { margin-top: 48px !important; }
            .space-y-4 > * + * { margin-top: 16px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .font-black { font-weight: 900 !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .text-4xl { font-size: 36px !important; }
            .text-2xl { font-size: 24px !important; }
            .text-xl { font-size: 20px !important; }
            .text-lg { font-size: 18px !important; }
            .text-sm { font-size: 14px !important; }
            .text-xs { font-size: 12px !important; }
            .tracking-tight { letter-spacing: -0.025em !important; }
            .tracking-widest { letter-spacing: 0.1em !important; }
            .uppercase { text-transform: uppercase !important; }
            .italic { font-style: italic !important; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
            .relative { position: relative !important; }
            .absolute { position: absolute !important; }
            .overflow-hidden { overflow: hidden !important; }
            .z-10 { z-index: 10 !important; }
          `;
          clonedDoc.head.appendChild(styleTag);

          // 3. Explicitly set background color for gradients and remove oklch
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const style = el.getAttribute('style');
            if (style && (style.includes('oklch') || style.includes('oklab'))) {
              el.setAttribute('style', style.replace(/oklch\([^)]+\)/g, '#000000').replace(/oklab\([^)]+\)/g, '#000000'));
            }

            // Fix for background-image gradients
            if (el.classList.contains('bg-neutral-900')) {
              el.style.setProperty('background-image', 'none', 'important');
              el.style.setProperty('background-color', '#0f172a', 'important');
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`booking-${viewDetailsModal.id}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // View Details Modal (for unpublished bookings)
  const ViewDetailsModal = () => {
    if (!viewDetailsModal) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setViewDetailsModal(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between z-20">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Booking Details</h2>
              <p className="text-sm text-neutral-600">Booking ID: {viewDetailsModal.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="hidden sm:flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </Button>
              <button
                onClick={() => setViewDetailsModal(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div id="booking-details-content" className="p-6 space-y-6">
            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary-500" />
                Customer Information
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="font-medium text-neutral-900 mb-2">{viewDetailsModal.customer}</p>
                <div className="space-y-1 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{viewDetailsModal.guestEmail || viewDetailsModal.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{viewDetailsModal.guestPhone || viewDetailsModal.user?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">{viewDetailsModal.service}</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.time}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.estimatedDuration || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{viewDetailsModal.frequency || 'One-time'}</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Property Details</h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Property Type:</span>
                  <span className="font-medium text-neutral-900">{viewDetailsModal.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bedrooms:</span>
                  <span className="font-medium text-neutral-900">{viewDetailsModal.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bathrooms:</span>
                  <span className="font-medium text-neutral-900">{viewDetailsModal.bathrooms}</span>
                </div>
                {viewDetailsModal.toilets !== undefined && viewDetailsModal.toilets !== null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Toilets:</span>
                    <span className="font-medium text-neutral-900">{viewDetailsModal.toilets}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary-500" />
                Service Location
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-neutral-700">{viewDetailsModal.address}</p>
              </div>
            </div>

            {/* Additional Rooms */}
            {viewDetailsModal.rooms && Object.keys(viewDetailsModal.rooms).length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Additional Rooms</h4>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                  {typeof viewDetailsModal.rooms === 'object' && !Array.isArray(viewDetailsModal.rooms) ? (
                    Object.entries(viewDetailsModal.rooms).map(([room, count]: [string, any]) => 
                      count > 0 && (
                        <div key={room} className="flex justify-between">
                          <span className="text-neutral-600 capitalize">{room.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ')}:</span>
                          <span className="font-medium text-neutral-900">x{count}</span>
                        </div>
                      )
                    )
                  ) : null}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {viewDetailsModal.addOns && viewDetailsModal.addOns.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Add-ons & Services</h4>
                <div className="flex flex-wrap gap-2">
                  {viewDetailsModal.addOns.map((addon: any, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                      {typeof addon === 'string' ? addon : addon.name}
                      {addon.quantity && addon.quantity > 1 && ` x${addon.quantity}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Kitchen Add-ons */}
            {viewDetailsModal && viewDetailsModal.kitchenAddOns && (
              <>
                {Object.keys(viewDetailsModal.kitchenAddOns).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Kitchen Add-ons</h4>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                      {Object.entries(viewDetailsModal.kitchenAddOns).map(([kitchenIndex, addons]: [string, any]) => (
                        addons && addons.length > 0 && (
                          <div key={kitchenIndex} className="border-b border-neutral-200 pb-3 last:border-b-0">
                            <p className="text-sm font-medium text-neutral-600 mb-2">Kitchen #{parseInt(kitchenIndex) + 1}</p>
                            <div className="flex flex-wrap gap-2">
                              {addons.map((addon: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-white border-secondary-200 text-secondary-700">
                                  {addon}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Laundry Room Details */}
            {viewDetailsModal && viewDetailsModal.laundryRoomDetails && (
              <>
                {Object.keys(viewDetailsModal.laundryRoomDetails).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Laundry Room Details</h4>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                      {Object.entries(viewDetailsModal.laundryRoomDetails).map(([laundryIndex, details]: [string, any]) => (
                        details && (
                          <div key={laundryIndex} className="border-b border-neutral-200 pb-3 last:border-b-0">
                            <p className="text-sm font-medium text-neutral-600 mb-2">Laundry Room #{parseInt(laundryIndex) + 1}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Baskets:</span>
                                <span className="font-medium text-neutral-900">{details.baskets}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Rounds:</span>
                                <span className="font-medium text-neutral-900">{details.rounds}</span>
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pets Information */}
            {viewDetailsModal.hasPet && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Pets Information</h4>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                  <div className="flex gap-2">
                    {viewDetailsModal.petDetails?.dog && <Badge className="bg-neutral-900 text-white">Dogs</Badge>}
                    {viewDetailsModal.petDetails?.cat && <Badge className="bg-neutral-900 text-white">Cats</Badge>}
                    {viewDetailsModal.petDetails?.other && <Badge className="bg-neutral-900 text-white">Other Pets</Badge>}
                  </div>
                  {viewDetailsModal.petDetails?.customPets && viewDetailsModal.petDetails.customPets.length > 0 && (
                    <div className="text-sm text-neutral-700">
                      <strong>Other pet types:</strong> {viewDetailsModal.petDetails.customPets.join(', ')}
                    </div>
                  )}
                  <div className="text-sm text-neutral-700">
                    <strong>Pet presence:</strong> {viewDetailsModal.petDetails?.petPresent ? 'Pets will be home during cleaning' : 'Pets will be away during cleaning'}
                  </div>
                  {viewDetailsModal.petDetails?.petInstructions && (
                    <div className="text-sm text-neutral-700 italic border-l-2 border-secondary-500 pl-3">
                      "{viewDetailsModal.petDetails.petInstructions}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {viewDetailsModal.specialInstructions && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Special Instructions</h4>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-neutral-700 italic">"{viewDetailsModal.specialInstructions}"</p>
                </div>
              </div>
            )}

            {/* Pricing & Status */}
            <div className="border-t border-neutral-200 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                <span className="text-3xl font-bold text-neutral-900">${viewDetailsModal.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Payment Method</span>
                <span className="font-medium text-neutral-700">{viewDetailsModal.paymentMethod || 'Credit Card'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Status</span>
                <Badge className="bg-secondary-500 text-white border-none px-4 py-2 text-sm font-semibold">
                  {viewDetailsModal.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Job Modal (for setting job parameters before publishing)
  const EditJobModal = () => {
    if (!editJobModal) return null;

    const [jobData, setJobData] = useState({
      bookingId: editJobModal.id,
      requiredCleaners: 1,
      paymentPerHour: 25,
      toolsRequired: '',
      specialInstructions: '',
    });

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setEditJobModal(null)}
      >
        <div
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Set Job Parameters</h2>
              <p className="text-sm text-neutral-600">Configure and publish job {editJobModal.id}</p>
            </div>
            <button
              onClick={() => setEditJobModal(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-4">
              <div className="font-semibold text-neutral-900 mb-1">{editJobModal.service}</div>
              <div className="text-sm text-neutral-600">{editJobModal.customer}</div>
              <div className="text-sm text-neutral-600">
                {editJobModal.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} at {editJobModal.time}
              </div>
            </div>

            {/* Number of Cleaners and Payment per Hour - Same Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                  <Users className="w-5 h-5 text-secondary-500" />
                  Number of Cleaners Needed
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={jobData.requiredCleaners}
                  onChange={(e) => setJobData({ ...jobData, requiredCleaners: parseInt(e.target.value) || 1 })}
                  placeholder="Enter number of cleaners"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                  <DollarSign className="w-5 h-5 text-secondary-500" />
                  Payment per Hour
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={jobData.paymentPerHour}
                  onChange={(e) => setJobData({ ...jobData, paymentPerHour: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 25.00"
                />
              </div>
            </div>

            {/* Tools Required */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                <Wrench className="w-5 h-5 text-secondary-500" />
                Tools Required
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                rows={3}
                value={jobData.toolsRequired}
                onChange={(e) => setJobData({ ...jobData, toolsRequired: e.target.value })}
                placeholder="e.g., Vacuum, Mop, Disinfectant, Microfiber Cloths"
              />
              <p className="text-xs text-neutral-500 mt-1">Separate items with commas</p>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                <FileText className="w-5 h-5 text-secondary-500" />
                Special Instructions
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                rows={4}
                value={jobData.specialInstructions}
                onChange={(e) => setJobData({ ...jobData, specialInstructions: e.target.value })}
                placeholder="Add any special instructions for the cleaners..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditJobModal(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                onClick={() => handlePublishJob(jobData)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View Cleaners Modal (for published jobs)
  const ViewCleanersModal = () => {
    if (!viewCleanersModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setViewCleanersModal(null)}
      >
        <div
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Cleaner Profiles</h2>
              <p className="text-sm text-neutral-600">Job ID: {viewCleanersModal.id}</p>
            </div>
            <button
              onClick={() => setViewCleanersModal(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {viewCleanersModal.claimedBy.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600">No cleaners have claimed this job yet</p>
              </div>
            ) : (
              viewCleanersModal.claimedBy.map((cleaner: any) => (
                <div key={cleaner.id} className="bg-neutral-50 rounded-lg p-4 flex items-center gap-4">
                  <img
                    src={cleaner.photo}
                    alt={cleaner.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{cleaner.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                      <span className="flex items-center gap-1">
                        ⭐ {cleaner.rating}
                      </span>
                      <span>{cleaner.completedJobs} jobs completed</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCleanerProfile(cleaner);
                    }}
                  >
                    View Full Profile
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Cleaner Profile Modal
  const CleanerProfileModal = () => {
    if (!selectedCleanerProfile) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
        onClick={() => setSelectedCleanerProfile(null)}
      >
        <div
          className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Cleaner Full Profile</h2>
              <p className="text-sm text-neutral-600">Complete cleaner information</p>
            </div>
            <button
              onClick={() => setSelectedCleanerProfile(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
              <img
                src={selectedCleanerProfile.photo}
                alt={selectedCleanerProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900">{selectedCleanerProfile.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{selectedCleanerProfile.rating}</span>
                  </div>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-600">{selectedCleanerProfile.completedJobs} jobs completed</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-700">{selectedCleanerProfile.completedJobs}</div>
                <div className="text-sm text-green-600 mt-1">Jobs Completed</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-700">{selectedCleanerProfile.rating}</div>
                <div className="text-sm text-yellow-600 mt-1">Average Rating</div>
              </div>
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-secondary-700">98%</div>
                <div className="text-sm text-secondary-600 mt-1">On-Time Rate</div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Contact Information</h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Phone Number</div>
                    <div className="font-medium text-neutral-900">(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Email Address</div>
                    <div className="font-medium text-neutral-900">{selectedCleanerProfile.name.toLowerCase().replace(' ', '.')}@example.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Address</div>
                    <div className="font-medium text-neutral-900">123 Main St, New York, NY 10001</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  Deep Cleaning
                </Badge>
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  Standard Cleaning
                </Badge>
                <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                  Move In/Out
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-neutral-200">
              <Button variant="outline" className="flex-1" onClick={() => setShowSchedule(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                View Schedule
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowMessage(true)}>
                <Send className="w-4 h-4 mr-2" />
                Message Cleaner
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Schedule Modal
  const ScheduleModal = () => {
    if (!showSchedule || !selectedCleanerProfile) return null;

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {
      Monday: [{ time: '9:00 AM - 12:00 PM', job: 'Deep Cleaning - 123 Main St' }, { time: '2:00 PM - 5:00 PM', job: 'Standard Cleaning - 456 Oak Ave' }],
      Tuesday: [{ time: '10:00 AM - 1:00 PM', job: 'Move In/Out - 789 Pine Rd' }],
      Wednesday: [{ time: '9:00 AM - 12:00 PM', job: 'Post-Construction - 321 Elm St' }],
      Thursday: [{ time: '1:00 PM - 4:00 PM', job: 'Deep Cleaning - 555 Maple Dr' }],
      Friday: [{ time: '9:00 AM - 3:00 PM', job: 'Standard Cleaning - 888 Cedar Ln' }],
      Saturday: [],
      Sunday: [],
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
        onClick={() => setShowSchedule(false)}
      >
        <div
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Weekly Schedule</h2>
              <p className="text-sm text-neutral-600">{selectedCleanerProfile.name}'s work schedule</p>
            </div>
            <button
              onClick={() => setShowSchedule(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {weekDays.map((day) => {
                const daySchedule = schedule[day as keyof typeof schedule];
                const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <div
                    key={day}
                    className={`border rounded-lg p-4 ${isToday ? 'border-secondary-500 bg-secondary-50' : 'border-neutral-200'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${isToday ? 'text-secondary-700' : 'text-neutral-900'}`}>
                        {day}
                        {isToday && <span className="ml-2 text-xs bg-secondary-500 text-white px-2 py-1 rounded-full">Today</span>}
                      </h3>
                      <span className="text-sm text-neutral-600">{daySchedule.length} {daySchedule.length === 1 ? 'job' : 'jobs'}</span>
                    </div>

                    {daySchedule.length === 0 ? (
                      <div className="text-sm text-neutral-500 italic">No jobs scheduled</div>
                    ) : (
                      <div className="space-y-2">
                        {daySchedule.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-neutral-200">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-secondary-500" />
                              <span className="font-medium text-neutral-900">{item.time}</span>
                            </div>
                            <div className="text-sm text-neutral-600 mt-1 ml-6">{item.job}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Message Modal
  const MessageModal = () => {
    if (!showMessage || !selectedCleanerProfile) return null;

    const handleSendMessage = () => {
      if (messageText.trim()) {
        toast.success(`Message sent to ${selectedCleanerProfile.name}!`);
        setMessageText('');
        setShowMessage(false);
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
        onClick={() => setShowMessage(false)}
      >
        <div
          className="bg-white rounded-xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Send Message</h2>
              <p className="text-sm text-neutral-600">Send a direct message to {selectedCleanerProfile.name}</p>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Recipient Info */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg mb-4">
              <img
                src={selectedCleanerProfile.photo}
                alt={selectedCleanerProfile.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-neutral-900">{selectedCleanerProfile.name}</div>
                <div className="text-sm text-neutral-600">{selectedCleanerProfile.name.toLowerCase().replace(' ', '.')}@example.com</div>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Message
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 min-h-[150px]"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowMessage(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showManualBooking) {
    return (
      <ManualBookingFlow
        onComplete={handleCompleteBooking}
        onCancel={() => setShowManualBooking(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">All Bookings</h1>
          <p className="text-neutral-600 mt-1">Manage and monitor all cleaning bookings</p>
        </div>
        <Button
          onClick={() => setShowManualBooking(true)}
          className="bg-secondary-500 hover:bg-secondary-600"
        >
          + Create Manual Booking
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{unpublishedBookings.length}</div>
          <div className="text-sm text-neutral-600">UnClaimed</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{publishedJobs.filter(j => j.status === 'Open').length}</div>
          <div className="text-sm text-neutral-600">Open Jobs</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-secondary-500">{publishedJobs.filter(j => j.status === 'In Progress').length}</div>
          <div className="text-sm text-neutral-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-green-600">{publishedJobs.filter(j => j.status === 'Assigned').length}</div>
          <div className="text-sm text-neutral-600">Assigned</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('unpublished')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'unpublished'
                ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Unclaimed ({unpublishedBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'published'
                ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Claimed ({publishedJobs.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500 mb-4"></div>
            <p className="text-neutral-500">Loading bookings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Booking ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Date</th>
              
                  {activeTab === 'published' && (
                    <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Cleaners</th>
                  )}
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Total Charge</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Cleaner pay</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Expenses</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Profit</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {activeTab === 'unpublished' ? (
                  paginatedUnpublished.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-500">
                        No unpublished bookings found.
                      </td>
                    </tr>
                  ) : (
                    paginatedUnpublished.map((booking) => (
                      <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono font-semibold text-secondary-500">{booking.id}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-neutral-900">{booking.customer}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-neutral-900">{booking.service}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-neutral-900">
                              <Calendar className="w-4 h-4" />
                              {booking.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1 text-neutral-600">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            {booking.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                        <span className="text-sm text-neutral-900">""</span>
                        </td>
                        <td className="py-4 px-6">
                        <span className="text-sm text-neutral-900">""</span>
                        </td>
                        <td className="py-4 px-6">
                        <span className="text-sm text-neutral-900">""</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewDetailsModal(booking)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditJobModal(booking)}
                              className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Publish
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  paginatedPublished.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        No published jobs found.
                      </td>
                    </tr>
                  ) : (
                    paginatedPublished.map((job) => (
                      <tr key={job.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono font-semibold text-secondary-500">{job.id}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-neutral-900">{job.customer}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-neutral-900">{job.service}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-neutral-900">
                              <Calendar className="w-4 h-4" />
                              {job.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1 text-neutral-600">
                              <Clock className="w-4 h-4" />
                              {job.time}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className={`font-semibold ${job.claimedBy.length >= job.requiredCleaners
                              ? 'text-green-600'
                              : job.claimedBy.length > 0
                                ? 'text-orange-600'
                                : 'text-red-600'
                              }`}>
                              {job.claimedBy.length}/{job.requiredCleaners}
                            </span>
                            <span className="text-xs text-neutral-600">claimed</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            {job.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                        <span className="text-sm text-neutral-900">""</span>
                        </td>
                        <td className="py-4 px-6">
                        <span className="text-sm text-neutral-900">""</span>
                        </td>
                        <td className="py-4 px-6">
                        <span className="text-sm text-neutral-900">""</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewCleanersModal(job)}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Cleaners
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewDetailsModal(job)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={activeTab === 'unpublished' ? unpublishedPage : publishedPage}
              totalPages={activeTab === 'unpublished' ? unpublishedTotalPages : publishedTotalPages}
              onPageChange={activeTab === 'unpublished' ? setUnpublishedPage : setPublishedPage}
              itemsPerPage={itemsPerPage}
              totalItems={activeTab === 'unpublished' ? filteredUnpublishedBookings.length : filteredPublishedJobs.length}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {viewDetailsModal && <ViewDetailsModal />}
      {editJobModal && <EditJobModal />}
      {viewCleanersModal && <ViewCleanersModal />}
      {selectedCleanerProfile && <CleanerProfileModal />}
      {showSchedule && <ScheduleModal />}
      {showMessage && <MessageModal />}
    </div>
  );
}
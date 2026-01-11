import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, MapPin, DollarSign, Search, Eye, X, CheckCircle, Users, Wrench, FileText, User, Star, Phone, Mail, Send, Download, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { ManualBookingFlow } from '../ManualBookingFlow';
import { toast } from 'sonner';
import { Pagination } from '../../ui/pagination';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDisplayHours } from '../../../utils/bookingUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { socketService } from '../../../api/socket.service';
import { MessageModal } from '../modals/MessageModal';
import { api } from '../../../utils/api';

type Tab = 'unclaimed' | 'claimed' | 'completed';

export function BookingsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  
  const [activeTab, setActiveTab] = useState<Tab>('unclaimed');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState<any>(null);
  const [editJobModal, setEditJobModal] = useState<any>(null);
  const [viewCleanersModal, setViewCleanersModal] = useState<any>(null);
  const [selectedCleanerProfile, setSelectedCleanerProfile] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [cleanerActiveJob, setCleanerActiveJob] = useState<any>(null);
  const [cleanerClaimedJobs, setCleanerClaimedJobs] = useState<any[]>([]);

  // Pagination state
  const [unclaimedPage, setUnclaimedPage] = useState(1);
  const [claimedPage, setClaimedPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const itemsPerPage = 10;

  const [bookings, setBookings] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
    fetchSettings();
    
    // Mark booking notifications as read when page opens
    if (user?.id) {
      markBookingNotificationsAsRead();
    }
    
    // Initialize socket connection
    if (user?.id) {
      socketService.connect(user.id, 'admin');
      
      // Listen for cleaner's active job
      socketService.onCleanerActiveJob((data: any) => {
        setCleanerActiveJob(data);
      });
      
      // Listen for cleaner's claimed jobs
      socketService.onCleanerClaimedJobs((data: any) => {
        setCleanerClaimedJobs(data.jobs || []);
      });
    }
    
    return () => {
      // Cleanup on unmount
      socketService.disconnect();
    };
  }, [user?.id]);

  const markBookingNotificationsAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await api.patch(`/api/notifications/${user.id}/read-all-by-type?type=BOOKING_CREATED`);
    } catch (error) {
      console.error('Failed to mark booking notifications as read:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const unclaimedBookings = bookings
    .filter(b => (b.status === 'BOOKED' || b.status === 'CONFIRMED' || b.status === 'RESCHEDULED' || b.status === 'PENDING') && (b.claimedBy?.length || 0) < (b.cleanerCount || 1))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      ...b,
      customer: b.guestName || 'Unknown Customer',
      service: b.serviceType,
      date: new Date(b.date),
      total: parseFloat(b.totalAmount),
      requiredCleaners: b.cleanerCount || 1,
      claimedCount: b.claimedBy?.length || 0,
      customerAccepted: b.isAccepted,
    }));

  const claimedJobs = bookings
    .filter(b => ((b.claimedBy?.length || 0) >= (b.cleanerCount || 1) || b.status === 'CONFIRMED' || b.status === 'ARRIVED' || b.status === 'IN_PROGRESS') && b.status !== 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      ...b,
      customer: b.guestName || 'Unknown Customer',
      service: b.serviceType,
      date: new Date(b.date),
      total: parseFloat(b.totalAmount),
      requiredCleaners: b.cleanerCount || 1,
      claimedCount: b.claimedBy?.length || 0,
      customerAccepted: b.isAccepted,
    }));

  const completedBookings = bookings
    .filter(b => b.status === 'COMPLETED')
    .sort((a, b) => new Date(b.endTime || b.updatedAt).getTime() - new Date(a.endTime || a.updatedAt).getTime())
    .map(b => ({
      ...b,
      customer: b.guestName || 'Unknown Customer',
      service: b.serviceType,
      date: new Date(b.date),
      total: parseFloat(b.totalAmount),
      requiredCleaners: b.cleanerCount || 1,
      claimedCount: b.claimedBy?.length || 0,
      customerAccepted: b.isAccepted,
    }));

  const filteredUnclaimedBookings = unclaimedBookings.filter((booking) =>
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaimedJobs = claimedJobs.filter((job) =>
    job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompletedBookings = completedBookings.filter((booking) =>
    booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated data
  const paginatedUnclaimed = filteredUnclaimedBookings.slice(
    (unclaimedPage - 1) * itemsPerPage,
    unclaimedPage * itemsPerPage
  );

  const paginatedClaimed = filteredClaimedJobs.slice(
    (claimedPage - 1) * itemsPerPage,
    claimedPage * itemsPerPage
  );

  const paginatedCompleted = filteredCompletedBookings.slice(
    (completedPage - 1) * itemsPerPage,
    completedPage * itemsPerPage
  );

  const unclaimedTotalPages = Math.ceil(filteredUnclaimedBookings.length / itemsPerPage);
  const claimedTotalPages = Math.ceil(filteredClaimedJobs.length / itemsPerPage);
  const completedTotalPages = Math.ceil(filteredCompletedBookings.length / itemsPerPage);

  const handleCompleteBooking = () => {
    setShowManualBooking(false);
  };

  const handlePublishJob = async (jobData: any) => {
    try {
      const response = await fetch(`/api/bookings/${jobData.bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          cleanerCount: jobData.requiredCleaners,
          paymentPerHour: jobData.paymentPerHour,
          toolsRequired: jobData.toolsRequired,
          specialInstructions: jobData.specialInstructions,
        }),
      });

      if (response.ok) {
        toast.success(`Job ${jobData.bookingId} has been published successfully!`);
        setEditJobModal(null);
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to publish job');
      }
    } catch (error) {
      console.error('Publish job error:', error);
      toast.error('An error occurred while publishing the job');
    }
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
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
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
            {/* Verification Codes (Only for Arrived/In Progress) */}
            {(viewDetailsModal.status === 'ARRIVED' || viewDetailsModal.status === 'IN_PROGRESS') && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Identity Verification
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-xs text-neutral-500 block mb-1">Expected Code</span>
                    <span className="text-xl font-bold text-secondary-500 tracking-wider">
                      {viewDetailsModal.securityCode || '----'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-xs text-neutral-500 block mb-1">Cleaner Provided</span>
                    <span className={`text-xl font-bold tracking-wider ${
                      viewDetailsModal.cleanerProvidedCode === viewDetailsModal.securityCode 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {viewDetailsModal.cleanerProvidedCode || 'Waiting...'}
                    </span>
                  </div>
                </div>
                {viewDetailsModal.cleanerProvidedCode && viewDetailsModal.cleanerProvidedCode !== viewDetailsModal.securityCode && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Warning: Provided code does not match expected code.
                  </p>
                )}
              </div>
            )}

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
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-neutral-900">{viewDetailsModal.service}</h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-secondary-600">
                    ${viewDetailsModal.total.toFixed(2)}
                  </div>
                  <Badge variant="outline" className="bg-white/50 border-secondary-200 text-secondary-700">
                    {viewDetailsModal.status}
                  </Badge>
                </div>
              </div>
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
                  <div className="flex flex-col">
                    <span>
                      Total Duration: {Math.floor((viewDetailsModal.estimatedDuration || 0) / 60)}h {(viewDetailsModal.estimatedDuration || 0) % 60}m
                    </span>
                    <span className="text-xs text-secondary-500 font-medium">
                      ({formatDisplayHours((viewDetailsModal.estimatedDuration || 0) / 60, viewDetailsModal.cleanerCount || 1, false)}h clock time)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Users className="w-4 h-4 text-secondary-500" />
                  <span>Staff Required: {viewDetailsModal.cleanerCount || 1}</span>
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

            {/* Job Parameters (if published) */}
            {(viewDetailsModal.paymentPerHour || viewDetailsModal.toolsRequired || viewDetailsModal.specialInstructions) && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-secondary-500" />
                  Job Parameters
                </h4>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-3 text-sm">
                  {isAdmin && viewDetailsModal.paymentPerHour && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Payment per Hour:</span>
                      <span className="font-medium text-neutral-900">${viewDetailsModal.paymentPerHour}</span>
                    </div>
                  )}
                  {viewDetailsModal.toolsRequired && (
                    <div>
                      <span className="text-neutral-600 block mb-1">Tools Required:</span>
                      <div className="flex flex-wrap gap-2">
                        {viewDetailsModal.toolsRequired.split(',').map((tool: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-white">{tool.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewDetailsModal.specialInstructions && (
                    <div>
                      <span className="text-neutral-600 block mb-1">Special Instructions:</span>
                      <p className="text-neutral-900 bg-white p-3 rounded border border-neutral-200 italic">
                        "{viewDetailsModal.specialInstructions}"
                      </p>
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

            {/* Job Completion Details */}
            {viewDetailsModal.status === 'COMPLETED' && (
              <div className="border-t border-neutral-200 pt-6 space-y-4">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Job Completion Details
                </h4>
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600 block">Arrival Time:</span>
                      <span className="font-medium text-neutral-900">
                        {viewDetailsModal.startTime ? new Date(viewDetailsModal.startTime).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 block">Completion Time:</span>
                      <span className="font-medium text-neutral-900">
                        {viewDetailsModal.endTime ? new Date(viewDetailsModal.endTime).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 block">Actual Duration:</span>
                      <span className="font-medium text-neutral-900">
                        {(() => {
                          if (!viewDetailsModal.startTime || !viewDetailsModal.endTime) return 'N/A';
                          const start = new Date(viewDetailsModal.startTime);
                          const end = new Date(viewDetailsModal.endTime);
                          const diffMs = end.getTime() - start.getTime();
                          const diffHrs = Math.floor(diffMs / 3600000);
                          const diffMins = Math.round((diffMs % 3600000) / 60000);
                          return `${diffHrs}h ${diffMins}m`;
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 block">Customer Acceptance:</span>
                      <span className={`font-medium ${viewDetailsModal.customerAccepted ? 'text-green-600' : 'text-yellow-600'}`}>
                        {viewDetailsModal.customerAccepted ? 'Accepted' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {viewDetailsModal.completionNotes && (
                    <div>
                      <span className="text-neutral-600 block text-sm mb-1">Completion Notes:</span>
                      <p className="text-neutral-900 bg-white p-3 rounded border border-green-200 text-sm italic">
                        "{viewDetailsModal.completionNotes}"
                      </p>
                    </div>
                  )}

                  {viewDetailsModal.completionIssues && (
                    <div>
                      <span className="text-neutral-600 block text-sm mb-1 text-red-600">Reported Issues:</span>
                      <p className="text-neutral-900 bg-white p-3 rounded border border-red-200 text-sm italic">
                        "{viewDetailsModal.completionIssues}"
                      </p>
                    </div>
                  )}

                  {viewDetailsModal.completionPhotos && viewDetailsModal.completionPhotos.length > 0 && (
                    <div>
                      <span className="text-neutral-600 block text-sm mb-2">Completion Photos:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {viewDetailsModal.completionPhotos.map((photo: string, i: number) => (
                          <div 
                            key={i} 
                            className="aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <img 
                              src={photo} 
                              alt={`Completion ${i + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Photo+Error';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing & Status */}
            <div className="border-t border-neutral-200 pt-6 space-y-4">
              {isAdmin && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                    <span className="text-3xl font-bold text-neutral-900">${viewDetailsModal.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-neutral-900">Estimated Cleaner Pay</span>
                    <span className="text-xl font-bold text-neutral-700">
                      ${(formatDisplayHours(viewDetailsModal.estimatedDuration / 60, viewDetailsModal.cleanerCount || 1, false) * (viewDetailsModal.cleanerCount || 1) * (settings?.cleanerPay?.level1 || 18)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
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
      requiredCleaners: editJobModal.cleanerCount || 1,
      paymentPerHour: 25,
      toolsRequired: '',
      specialInstructions: '',
    });

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
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
              <div className="flex justify-between items-start">
                <div>
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
                <div className="text-right">
                  <div className="text-sm font-medium text-secondary-600">
                    Estimated: {Math.floor((editJobModal.estimatedDuration || 0) / 60)}h {(editJobModal.estimatedDuration || 0) % 60}m
                  </div>
                  <div className="text-xs text-neutral-500">
                    Calculated Staff: {editJobModal.cleanerCount || 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Number of Cleaners and Payment per Hour - Same Row */}
            <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
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
              {isAdmin && (
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
              )}
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
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
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
                    src={cleaner.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaner.name)}&background=random`}
                    alt={cleaner.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{cleaner.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                      <span className="flex items-center gap-1">
                        ⭐ {cleaner.rating || '5.0'}
                      </span>
                      <span>{cleaner.completedJobs || 0} jobs completed</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCleanerProfile({
                        ...cleaner,
                        photo: cleaner.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaner.name)}&background=random`,
                        rating: cleaner.rating || '5.0',
                        completedJobs: cleaner.completedJobs || 0,
                        bio: cleaner.bio || 'Professional cleaner at Sparkleville.',
                        skills: cleaner.skills || ['Residential Cleaning', 'Deep Cleaning'],
                        joinedDate: cleaner.createdAt || new Date().toISOString()
                      });
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

    // Fetch cleaner's schedule when profile is opened
    useEffect(() => {
      if (selectedCleanerProfile?.id && showSchedule) {
        socketService.getCleanerClaimedJobs(selectedCleanerProfile.id);
        socketService.getCleanerActiveJob(selectedCleanerProfile.id);
      }
    }, [showSchedule, selectedCleanerProfile?.id]);

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
                src={selectedCleanerProfile.profileImage || selectedCleanerProfile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCleanerProfile.name)}&background=random`}
                alt={selectedCleanerProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900">{selectedCleanerProfile.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">ID: {selectedCleanerProfile.id}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{selectedCleanerProfile.rating || '0.0'}</span>
                  </div>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-600">{selectedCleanerProfile.completedJobs || 0} jobs completed</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-700">{selectedCleanerProfile.completedJobs || 0}</div>
                <div className="text-sm text-green-600 mt-1">Jobs Completed</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-700">{selectedCleanerProfile.rating || '0.0'}</div>
                <div className="text-sm text-yellow-600 mt-1">Average Rating</div>
              </div>
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-secondary-700">{selectedCleanerProfile.hourlyRate || '$0'}
/hr</div>
                <div className="text-sm text-secondary-600 mt-1">Hourly Rate</div>
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
                    <div className="font-medium text-neutral-900">{selectedCleanerProfile.phone || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Email Address</div>
                    <div className="font-medium text-neutral-900">{selectedCleanerProfile.email || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  <div className="flex-1">
                    <div className="text-xs text-neutral-600">Address</div>
                    <div className="font-medium text-neutral-900">{selectedCleanerProfile.address || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {selectedCleanerProfile.specialties && selectedCleanerProfile.specialties.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCleanerProfile.specialties.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="bg-secondary-100 text-secondary-700">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
              <h2 className="text-2xl font-bold text-neutral-900">Cleaner Schedule</h2>
              <p className="text-sm text-neutral-600">{selectedCleanerProfile.name}'s jobs and availability</p>
            </div>
            <button
              onClick={() => setShowSchedule(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Active Job Section */}
            {cleanerActiveJob && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-3">Currently Active</h3>
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="text-sm font-medium text-neutral-900">{cleanerActiveJob.serviceType || 'Job'}</div>
                  <div className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary-500" />
                    Status: <span className="font-medium text-orange-600">IN PROGRESS</span>
                  </div>
                  <div className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-secondary-500" />
                    {cleanerActiveJob.address}
                  </div>
                </div>
              </div>
            )}

            {/* Claimed Jobs Section */}
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Claimed Jobs ({cleanerClaimedJobs.length})</h3>
              {cleanerClaimedJobs.length === 0 ? (
                <div className="text-sm text-neutral-500 italic bg-neutral-50 p-4 rounded-lg">
                  No claimed jobs scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {cleanerClaimedJobs.map((job: any) => (
                    <div key={job.id} className="bg-white rounded-lg p-4 border border-neutral-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-neutral-900">{job.serviceType}</div>
                          <div className="text-sm text-neutral-600 mt-1">{job.guestName} - {job.address}</div>
                        </div>
                        <Badge className={`${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          job.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                          job.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-neutral-600 flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-secondary-500" />
                        {new Date(job.date).toLocaleDateString()} at {job.time}
                      </div>
                      <div className="text-sm text-neutral-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-secondary-500" />
                        Estimated: {job.estimatedDuration || 2} hours
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Message Modal
  const handleCloseMessage = useCallback(() => {
    setShowMessage(false);
  }, []);

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
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{unclaimedBookings.length}</div>
          <div className="text-sm text-neutral-600">Unclaimed Jobs</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-2xl font-bold text-secondary-500">{claimedJobs.length}</div>
          <div className="text-sm text-neutral-600">Claimed Jobs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('unclaimed')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'unclaimed'
                ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Unclaimed ({unclaimedBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('claimed')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'claimed'
                ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Claimed ({claimedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === 'completed'
                ? 'text-secondary-500 border-b-2 border-secondary-500 bg-secondary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Completed ({completedBookings.length})
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
                  {activeTab === 'completed' ? (
                    <>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Arrival/Completion</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Duration</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Photos</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Acceptance</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">
                        {activeTab === 'claimed' ? 'Duration (per cleaner)' : 'Duration'}
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Cleaners</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">
                        Cleaner pay (per person)
                      </th>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Total Charge</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Expenses</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Profit</th>
                    </>
                  )}
                  
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {(() => {
                  const currentData = 
                    activeTab === 'unclaimed' ? paginatedUnclaimed :
                    activeTab === 'claimed' ? paginatedClaimed :
                    paginatedCompleted;
                  
                  if (currentData.length === 0) {
                    return (
                      <tr>
                        <td colSpan={isAdmin ? 11 : 8} className="p-8 text-center text-neutral-500">
                          No {activeTab} bookings found.
                        </td>
                      </tr>
                    );
                  }

                  return currentData.map((booking: any) => (
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
                      
                      {activeTab === 'completed' ? (
                        <>
                          <td className="py-4 px-6">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1 text-neutral-900">
                                <span className="font-semibold w-8">Arr:</span>
                                {booking.startTime ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-neutral-600">
                                <span className="font-semibold w-8">End:</span>
                                {booking.endTime ? new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-medium text-neutral-900">
                              {(() => {
                                if (!booking.startTime || !booking.endTime) return 'N/A';
                                const start = new Date(booking.startTime);
                                const end = new Date(booking.endTime);
                                const diffMs = end.getTime() - start.getTime();
                                const diffHrs = Math.floor(diffMs / 3600000);
                                const diffMins = Math.round((diffMs % 3600000) / 60000);
                                return `${diffHrs}h ${diffMins}m`;
                              })()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <div className="bg-neutral-100 px-2 py-1 rounded text-xs font-medium text-neutral-600">
                                {booking.completionPhotos?.length || 0} photos
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.customerAccepted 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.customerAccepted ? 'Accepted' : 'Pending'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
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
                            <div className="text-sm text-neutral-600">
                              {activeTab === 'claimed' 
                                ? `${formatDisplayHours((booking.estimatedDuration || 0) / 60, booking.cleanerCount || 1, false)}h`
                                : (
                                  <div className="flex flex-col">
                                    <span>{Math.floor((booking.estimatedDuration || 0) / 60)}h {(booking.estimatedDuration || 0) % 60}m</span>
                                    <span className="text-xs text-secondary-500 font-medium">
                                      ({formatDisplayHours((booking.estimatedDuration || 0) / 60, booking.cleanerCount || 1, false)}h clock time)
                                    </span>
                                  </div>
                                )
                              }
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className={`font-semibold ${booking.claimedCount >= booking.requiredCleaners
                                ? 'text-green-600'
                                : booking.claimedCount > 0
                                  ? 'text-orange-600'
                                  : 'text-red-600'
                                }`}>
                                {booking.claimedCount}/{booking.requiredCleaners}
                              </span>
                              <span className="text-xs text-neutral-600">claimed</span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-neutral-900">
                              <DollarSign className="w-4 h-4" />
                              {(() => {
                                const hoursPerCleaner = formatDisplayHours((booking.estimatedDuration || 0) / 60, booking.cleanerCount || 1, false);
                                const rate = booking.paymentPerHour || settings?.cleanerPay?.level1 || 18;
                                // Always show pay per person as requested
                                return (hoursPerCleaner * rate).toFixed(2);
                              })()}
                            </div>
                          </td>
                        </>
                      )}
                      
                      {isAdmin && (
                        <>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-neutral-900 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              {booking.total.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-neutral-900">
                              <DollarSign className="w-4 h-4" />
                              {(() => {
                                const hoursPerCleaner = formatDisplayHours((booking.estimatedDuration || 0) / 60, booking.cleanerCount || 1, false);
                                const rate = booking.paymentPerHour || settings?.cleanerPay?.level1 || 18;
                                return (hoursPerCleaner * (booking.cleanerCount || 1) * rate).toFixed(2);
                              })()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              {(() => {
                                const hoursPerCleaner = formatDisplayHours((booking.estimatedDuration || 0) / 60, booking.cleanerCount || 1, false);
                                const rate = booking.paymentPerHour || settings?.cleanerPay?.level1 || 18;
                                const totalCleanerPay = hoursPerCleaner * (booking.cleanerCount || 1) * rate;
                                return (booking.total - totalCleanerPay).toFixed(2);
                              })()}
                            </div>
                          </td>
                        </>
                      )}
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewCleanersModal(booking)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Cleaners
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewDetailsModal(booking)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={
                activeTab === 'unclaimed' ? unclaimedPage :
                activeTab === 'claimed' ? claimedPage :
                completedPage
              }
              totalPages={
                activeTab === 'unclaimed' ? unclaimedTotalPages :
                activeTab === 'claimed' ? claimedTotalPages :
                completedTotalPages
              }
              onPageChange={
                activeTab === 'unclaimed' ? setUnclaimedPage :
                activeTab === 'claimed' ? setClaimedPage :
                setCompletedPage
              }
              itemsPerPage={itemsPerPage}
              totalItems={
                activeTab === 'unclaimed' ? filteredUnclaimedBookings.length :
                activeTab === 'claimed' ? filteredClaimedJobs.length :
                filteredCompletedBookings.length
              }
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
      <MessageModal 
        isOpen={showMessage} 
        cleaner={selectedCleanerProfile} 
        user={user}
        onClose={handleCloseMessage}
      />

      {/* Photo Viewer Modal - Using Portal to render outside of modal hierarchy */}
      {selectedPhoto && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8 text-white" />
          </button>
          <img 
            src={selectedPhoto} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
}
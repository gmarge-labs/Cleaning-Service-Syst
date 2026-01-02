// Socket Service for Admin-Cleaner Real-Time Communication
// Location: src/api/socket.service.ts

/**
 * The socketService provides real-time communication between the admin dashboard and cleaners.
 * It handles:
 * - Direct messaging from admin to cleaners
 * - Cleaner active job tracking
 * - Cleaner claimed jobs display
 * - Real-time status updates
 */

Key Features Implemented:
========================

1. REAL CLEANER PROFILE DATA
   - Displays actual cleaner information from the database:
     * Profile image
     * Name, email, phone
     * Address
     * Completed jobs count
     * Rating
     * Hourly rate
     * Specialties
   - Falls back to generated avatars if no profile image exists
   - All data is fetched from the cleaner object in the booking data

2. VIEW SCHEDULE FUNCTIONALITY
   - Shows cleaner's currently active job (if any) in a prominent orange box
   - Displays all claimed jobs with:
     * Service type
     * Customer name and address
     * Booking date and time
     * Estimated duration
     * Current status (COMPLETED, IN_PROGRESS, CONFIRMED, etc.)
   - Real-time updates via socket.io

3. MESSAGE CLEANER FUNCTIONALITY
   - Admin can send direct messages to cleaners via socket.io
   - Uses the socketService.sendMessage() method
   - Messages are sent with:
     * Cleaner ID (recipient)
     * Admin ID (sender)
     * Admin name
     * Message content
     * Timestamp
   - Real-time delivery through WebSocket connection
   - Toast notifications confirm successful delivery

Socket.io Emitted Events:
========================

For Admin -> Cleaner:
- 'admin-to-cleaner-message' - Send message to a specific cleaner
- 'get-cleaner-active-job' - Request cleaner's current active job
- 'get-cleaner-claimed-jobs' - Request all claimed jobs for a cleaner

For Cleaner -> Admin (Listening):
- 'cleaner-to-admin-message' - Receive messages from cleaners
- 'cleaner-active-job' - Receive active job status
- 'cleaner-claimed-jobs' - Receive list of claimed jobs

Usage in BookingsPage:
=======================

When viewing cleaner profile in the booking table:
1. Click "View Full Profile" button to open the modal
2. Profile shows all real cleaner data from the booking.claimedBy array
3. Click "View Schedule" to see:
   - Current active job (if working)
   - All claimed jobs with details
4. Click "Message Cleaner" to:
   - Send direct message via socket.io
   - Message delivers in real-time
   - Cleaner receives notification in their app

Integration Points:
===================

- BookingsPage.tsx: Admin interface to view cleaners and send messages
- socket.service.ts: WebSocket communication layer
- Server-side handlers: Handle socket events and broadcast to cleaners
- Mobile cleaner app: Receives messages and job updates

Note: Socket connection is automatically initialized when the admin logs in.
Cleanup is handled on component unmount to prevent memory leaks.

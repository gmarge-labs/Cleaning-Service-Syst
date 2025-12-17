# SparkleClean Platform - Navigation Guide

## 🎯 How to Access Different Parts of the Platform

### 1. **Customer Web App** (Default View)
- **Starting Point:** Landing page loads by default
- **Features:**
  - Browse services and pricing
  - Read testimonials
  - View how it works

### 2. **Book a Cleaning**
- **From Landing Page:** Click "Book Now" button (header or hero section)
- **Flow:** 7-step booking wizard
  1. Account Setup
  2. Service Selection
  3. Property Details
  4. Add-ons
  5. Scheduling
  6. Payment
  7. Confirmation

### 3. **Customer Dashboard**
- **From Landing Page:** 
  - Click "Login" dropdown → Select "Customer"
  - Or complete a booking → Redirects to dashboard
- **Features:**
  - Overview tab with stats
  - Upcoming bookings
  - Booking history
  - Profile settings
- **Return to Landing:** Click "SparkleClean" logo or use logout

### 4. **Admin Back-Office** ⭐
- **From Landing Page:** 
  - Click **"Login"** dropdown in header (top-right)
  - Select **"Admin"** from the menu (🛡️ Shield icon)
- **Alternative:** Click "Logout" from TopBar to return to landing page
- **Features:**
  - Switch between 3 roles (Management/Supervisor/Support)
  - Access 7 different admin pages
  - View analytics and reports
  - Manage all operations

### 5. **Mobile Cleaner App** 📱
- **From Landing Page:** 
  - Click **"Login"** dropdown in header (top-right)
  - Select **"Cleaner"** from the menu (📱 Smartphone icon)
- **Features:**
  - Today's job schedule
  - Job details with navigation
  - Clock in/out functionality
  - Job completion with photos
  - Earnings tracker
  - Real-time messaging
- **Return to Landing:** Click "Logout" icon in header

### 6. **Ella - AI Chatbot** 🤖 NEW!
- **From Landing Page (Widget):** 
  - Look for **floating chat button** (💬 icon) in bottom-right corner
  - Click to open chat window
  - Minimizable and dismissible
- **From Landing Page (Full Page):**
  - Click **"Chat"** button in header (green button)
  - Opens full-page chat interface
- **Features:**
  - Conversational booking assistance
  - Natural language understanding
  - Quick action buttons
  - Service recommendations with cards
  - Real-time booking summary
  - Voice input capability (UI mockup)
  - Price quotes and availability checks
  - FAQ and help support
- **Return to Landing:** Click back arrow (full page) or close (widget)

## 🔄 Navigation Flow

```
Landing Page
    ↓
    ├─→ Book Now → Booking Flow (7 steps) → Customer Dashboard
    │
    ├─→ Login Dropdown
    │   ├─→ Customer → Customer Dashboard → Logout → Landing
    │   ├─→ Admin → Admin Dashboard → Logout → Landing
    │   └─→ Cleaner → Mobile Cleaner App → Logout → Landing
    │
    ├─→ Chat Button (Header) → Full Page Chat → Back → Landing
    │
    └─→ Chat Widget (Floating) → Mini Chat Window → Close/Minimize
                                      ↓
                                  (Can complete booking through chat)
```

## 🎨 Visual Indicators

### Landing Page
- **Header:** Sticky navigation with "Login ▼" dropdown, "Book Now", and "Chat" buttons
- **Login Menu:** 3 options with colored icons
  - 🔵 Customer (blue User icon)
  - 🟣 Admin (purple Shield icon)
  - 🟢 Cleaner (teal Smartphone icon)
- **Chat Widget:** Floating button (bottom-right) with gradient background
  - Shows unread badge (red dot with number)
  - Welcome tooltip appears on first visit
- **Chat Button:** Green button in header for full-page chat

### Customer Dashboard
- **Header:** Shows "SparkleClean" logo and "Logout" button
- **Tabs:** Overview, Upcoming, History, Profile

### Admin Dashboard
- **Sidebar:** Dark sidebar with navigation menu
- **TopBar:** Search bar, notifications, user profile, logout
- **Role Switcher:** In sidebar under profile (Demo mode)

### Mobile Cleaner App
- **Header:** Gradient header with profile and logout
- **Bottom Nav:** Schedule, Earnings, Messages, Profile tabs
- **Job Cards:** Today, Upcoming, Completed sections
- **Mobile-First:** Optimized for phone screens (max-width: 448px)

### Ella Chat Interface
- **Widget Mode:** 
  - Floating circle button (bottom-right)
  - Mini window (600px height)
  - Minimizable header
- **Full Page Mode:**
  - Max-width container (4xl)
  - Back button in top nav
  - Full screen height
- **Chat Design:**
  - Gradient header (blue → teal)
  - Message bubbles (user = blue, Ella = white)
  - Quick action buttons
  - Service cards with images
  - Booking summary cards
  - Typing indicator (animated dots)
  - Voice input button (red when active)

## 🚀 Quick Access Tips

1. **For Customers:**
   - Direct booking: Click any "Book Now" button
   - AI assistance: Use chat widget or chat button
   - View dashboard: Login → Customer
   - Return home: Click logo or logout

2. **For Admins:**
   - Access admin panel: Header → Login → Admin
   - Switch views: Use sidebar menu
   - Change role: Use role buttons in sidebar (Demo)
   - Exit admin: Click logout button in TopBar

3. **For Cleaners:**
   - Access mobile app: Header → Login → Cleaner
   - View today's jobs: Default tab on dashboard
   - Start a job: Click "Start Job" → Clock in
   - Complete job: Upload photos and notes
   - Check earnings: View stats in header
   - Exit app: Click logout icon in header

4. **For Ella Chat:** 🆕
   - Quick access: Click floating button (bottom-right)
   - Full screen: Click "Chat" button in header
   - Voice input: Click microphone icon in input field
   - Quick actions: Use pre-defined action buttons
   - Natural conversation: Type freely, Ella understands
   - Complete booking: Follow conversation flow
   - Get help: Ask any question about services

## 📱 Responsive Navigation

### Desktop
- **Login Dropdown:** Hover/click "Login" to see 3 role options
- **Rich Menu:** Icons + role names + descriptions
- **Quick Access:** One-click to any platform section
- **Chat Widget:** Floating button + tooltip
- **Chat Button:** Visible in header next to "Book Now"

### Mobile
- **Hamburger Menu:** Tap ≡ icon for full menu
- **Login Submenu:** Shows all 3 login options as separate buttons
- **Touch Optimized:** Large tap targets, clear icons
- **Chat Widget:** Responsive to screen size
- **Chat Window:** Full screen on mobile devices

## 🔐 Demo Mode

Currently, the platform runs in demo mode:
- **Customer Login:** Instant access, no credentials needed
- **Admin Login:** Direct access to admin panel
- **Cleaner Login:** Demo account (Maria Garcia) pre-filled
- **Ella Chat:** AI-powered conversational flow with simulated responses
- **Role Switching:** Available in sidebar for demo purposes
- **Data:** All data is mock/sample data for demonstration

## 💡 Pro Tips

- **Lost?** Click the "SparkleClean" logo to return to landing page
- **Quick Login:** Header → Login dropdown → Select your role
- **Visual Cues:** Each role has a unique colored icon
  - Customer = Blue (User)
  - Admin = Purple (Shield)
  - Cleaner = Teal (Smartphone)
  - Chat = Green (MessageCircle)
- **Quick Booking:** "Book Now" button available throughout the site
- **AI Help:** Ella chat widget is always available on landing page
- **Dashboard Access:** Login dropdown switches to "Dashboard" when logged in
- **Mobile Testing:** Resize browser to mobile width for cleaner app optimal view
- **Chat Widget:** Can be minimized while browsing the site

## 🎯 Login Menu Details

When you click **"Login"** in the header, you'll see:

```
┌─────────────────────────────────┐
│ Login As                        │
├─────────────────────────────────┤
│ 🔵 Customer                     │
│    Book and manage cleanings    │
├─────────────────────────────────┤
│ 🟣 Admin                        │
│    Back-office system           │
├─────────────────────────────────┤
│ 🟢 Cleaner                      │
│    Mobile field app             │
└─────────────────────────────────┘
```

**One dropdown menu** → **Access all three platforms** 🚀

## 💬 Ella Chat Features

### **Chat Widget (Floating):**
- Always visible on landing page
- Unread indicator (red badge)
- Welcome tooltip on first visit
- Minimizable chat window
- Continues conversation when reopened

### **Full Page Chat:**
- Accessed via header "Chat" button
- More space for conversation
- Back button to return to landing
- Same features as widget mode

### **Conversational Flow:**
1. Greeting with quick action buttons
2. Service type selection
3. Address input (with location option)
4. Date and time scheduling
5. Booking summary with pricing
6. Confirmation and next steps

### **Smart Features:**
- Natural language understanding
- Context-aware responses
- Quick reply buttons for common choices
- Service cards with images and pricing
- Booking summary preview
- Voice input capability (UI)
- Typing indicator during responses
- Emoji support and friendly tone

**One AI assistant** → **Complete booking through conversation** 🤖✨
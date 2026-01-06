import { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';

export interface Message {
  id: string;
  type: 'user' | 'ella' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  serviceCard?: ServiceCard;
  bookingSummary?: BookingSummary;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface ServiceCard {
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

export interface BookingSummary {
  service: string;
  date: string;
  time: string;
  address: string;
  total: number;
}

interface EllaChatProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  onBookingComplete?: () => void;
}

// Booking state tracker
interface BookingState {
  step: 'idle' | 'account' | 'login' | 'service' | 'property-type' | 'bedrooms' | 'bathrooms' | 'rooms' | 'room-quantities' | 'addons' | 'date' | 'time' | 'frequency' | 'pets' | 'pet-selection' | 'pet-present' | 'special-instructions' | 'payment' | 'tip' | 'confirm';
  data: {
    accountType?: 'create' | 'login' | 'guest';
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    serviceType?: string;
    servicePrice?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    rooms?: string[];
    roomQuantities?: Record<string, number>;
    currentRoomForQuantity?: string;
    addOns?: Array<{ name: string; price: number }>;
    date?: string;
    time?: string;
    frequency?: string;
    hasPet?: boolean;
    selectedPets?: string[];
    petPresent?: boolean;
    specialInstructions?: string;
    paymentMethod?: string;
    tipAmount?: number;
  };
}

export function EllaChat({ isMinimized = false, onMinimize, onClose, onBookingComplete }: EllaChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ella',
      content: "Hi! I'm Ella, your AI cleaning assistant. 👋 How can I help you today?",
      timestamp: new Date(),
      quickReplies: [
        { label: '🏠 Book a Cleaning', value: 'book' },
        { label: '💬 Ask a Question', value: 'question' },
        { label: '📅 Check Availability', value: 'availability' },
        { label: '💰 Get a Quote', value: 'quote' },
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({ step: 'idle', data: {} });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);

    // Simulate Ella typing
    setIsTyping(true);
    setTimeout(() => {
      handleEllaResponse(content);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (value: string) => {
    handleSendMessage(value);
  };

  const calculateTotal = () => {
    const basePrice = bookingState.data.servicePrice || 0;
    const addOnsTotal = bookingState.data.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    const tip = bookingState.data.tipAmount || 0;
    
    // Apply frequency discount
    let discount = 0;
    if (bookingState.data.frequency === 'weekly') discount = 0.10;
    else if (bookingState.data.frequency === 'bi-weekly') discount = 0.05;
    else if (bookingState.data.frequency === 'monthly') discount = 0.15;
    
    const subtotal = basePrice + addOnsTotal;
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount + tip;
    
    return { basePrice, addOnsTotal, discount: discountAmount, tip, total };
  };

  const handleEllaResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    let ellaMessage: Message;
    let newBookingState = { ...bookingState };

    // IDLE STATE - Initial interactions
    if (bookingState.step === 'idle') {
      if (input.includes('book') || input === 'book') {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Perfect! Let's get you scheduled for a sparkling clean space! ✨ First, do you have an account with us?",
          timestamp: new Date(),
          quickReplies: [
            { label: '✅ Yes, I have an account', value: 'login' },
            { label: '🆕 No, create account', value: 'create account' },
            { label: '👤 Continue as guest', value: 'guest' },
          ],
        };
        newBookingState.step = 'account';
      }
      // Questions
      else if (input.includes('question') || input.includes('help')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "I'm here to help! What would you like to know?",
          timestamp: new Date(),
          quickReplies: [
            { label: '💰 Pricing Info', value: 'pricing' },
            { label: '⏰ Service Hours', value: 'hours' },
            { label: '🧴 Products Used', value: 'products' },
            { label: '🔄 Cancellation Policy', value: 'cancellation' },
          ],
        };
      }
      // Pricing
      else if (input.includes('pricing') || input.includes('price') || input.includes('quote')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Our pricing is transparent and competitive:\n\n• Standard Cleaning: $89 (2 hrs)\n• Deep Cleaning: $159 (3-4 hrs)\n• Move In/Out: $249 (5-6 hrs)\n\nAll services include eco-friendly products and satisfaction guarantee! 💚",
          timestamp: new Date(),
          quickReplies: [
            { label: '📅 Book Now', value: 'book' },
            { label: '💬 More Questions', value: 'question' },
          ],
        };
      }
      // Availability
      else if (input.includes('availability') || input.includes('available')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "We're available 7 days a week, 8 AM - 8 PM! 🗓️ Most time slots are available within 24-48 hours. Would you like to book a cleaning?",
          timestamp: new Date(),
          quickReplies: [
            { label: '✅ Yes, Book Now', value: 'book' },
            { label: '📅 Check Specific Date', value: 'check date' },
          ],
        };
      }
      // Cancellation Policy
      else if (input.includes('cancellation')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Our cancellation policy is fair and flexible:\n\n• Free cancellation up to 24 hours before service\n• 50% charge for cancellations within 24 hours\n• 100% charge for no-shows\n\nWe want to make sure you're completely satisfied! 😊",
          timestamp: new Date(),
          quickReplies: [
            { label: '📅 Book Cleaning', value: 'book' },
            { label: '💬 More Questions', value: 'question' },
          ],
        };
      }
      // Hours
      else if (input.includes('hours') || input.includes('service hours')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "We're here for you 7 days a week!\n\n⏰ Service Hours: 8:00 AM - 8:00 PM\n📞 Customer Support: 8:00 AM - 10:00 PM\n\nFlexible scheduling to fit your busy life! 🌟",
          timestamp: new Date(),
          quickReplies: [
            { label: '📅 Book Now', value: 'book' },
            { label: '💬 Ask Another Question', value: 'question' },
          ],
        };
      }
      // Products
      else if (input.includes('products') || input.includes('product')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "We use only eco-friendly, non-toxic cleaning products! 🌿\n\n✅ Safe for kids & pets\n✅ Environmentally friendly\n✅ Highly effective\n\nYour health and the planet matter to us! 💚",
          timestamp: new Date(),
          quickReplies: [
            { label: '📅 Book Cleaning', value: 'book' },
            { label: '💬 More Info', value: 'question' },
          ],
        };
      }
      // Default
      else {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "I'm here to help! You can ask me about our services, pricing, availability, or start booking a cleaning. What would you like to do?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🏠 Book a Cleaning', value: 'book' },
            { label: '💰 Get Pricing', value: 'pricing' },
            { label: '📅 Check Availability', value: 'availability' },
          ],
        };
      }
    }
    
    // ACCOUNT STEP
    else if (bookingState.step === 'account') {
      if (input.includes('login') || input.includes('yes')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Great! Please enter your email address:",
          timestamp: new Date(),
        };
        newBookingState.step = 'login';
        newBookingState.data.accountType = 'login';
      } else if (input.includes('create') || input.includes('new')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Awesome! Let's create your account. What's your full name?",
          timestamp: new Date(),
        };
        newBookingState.step = 'login';
        newBookingState.data.accountType = 'create';
      } else if (input.includes('guest')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "No problem! What type of cleaning service do you need?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🧹 Standard Cleaning - $89', value: 'standard cleaning' },
            { label: '✨ Deep Cleaning - $159', value: 'deep cleaning' },
            { label: '🏠 Move In/Out - $249', value: 'move in out' },
          ],
        };
        newBookingState.step = 'service';
        newBookingState.data.accountType = 'guest';
      }
    }
    
    // LOGIN STEP
    else if (bookingState.step === 'login') {
      if (bookingState.data.accountType === 'create' && !bookingState.data.name) {
        // Collecting name
        newBookingState.data.name = userInput;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: `Nice to meet you, ${userInput}! 😊 What's your email address?`,
          timestamp: new Date(),
        };
      } else if (bookingState.data.accountType === 'create' && !bookingState.data.email) {
        // Collecting email
        newBookingState.data.email = userInput;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Great! What's your phone number?",
          timestamp: new Date(),
        };
      } else if (bookingState.data.accountType === 'create' && !bookingState.data.phone) {
        // Collecting phone
        newBookingState.data.phone = userInput;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Perfect! Create a password for your account:",
          timestamp: new Date(),
        };
      } else if (bookingState.data.accountType === 'create' && !bookingState.data.password) {
        // Password created, account setup complete
        newBookingState.data.password = '••••••••';
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "🎉 Account created successfully! Now, what type of cleaning service do you need?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🧹 Standard Cleaning - $89', value: 'standard cleaning' },
            { label: '✨ Deep Cleaning - $159', value: 'deep cleaning' },
            { label: '🏠 Move In/Out - $249', value: 'move in out' },
          ],
        };
        newBookingState.step = 'service';
      } else if (bookingState.data.accountType === 'login' && !bookingState.data.email) {
        // Login flow - collecting email
        newBookingState.data.email = userInput;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Thanks! Now enter your password:",
          timestamp: new Date(),
        };
      } else if (bookingState.data.accountType === 'login' && !bookingState.data.password) {
        // Login complete
        newBookingState.data.password = '••••••••';
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "✅ Logged in successfully! Welcome back! What type of cleaning service do you need?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🧹 Standard Cleaning - $89', value: 'standard cleaning' },
            { label: '✨ Deep Cleaning - $159', value: 'deep cleaning' },
            { label: '🏠 Move In/Out - $249', value: 'move in out' },
          ],
        };
        newBookingState.step = 'service';
      }
    }
    
    // SERVICE STEP
    else if (bookingState.step === 'service') {
      if (input.includes('standard')) {
        newBookingState.data.serviceType = 'Standard Cleaning';
        newBookingState.data.servicePrice = 89;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Perfect choice! Standard Cleaning selected. What type of property is this?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🏠 House', value: 'house' },
            { label: '🏢 Apartment', value: 'apartment' },
            { label: '🏗️ Condo', value: 'condo' },
            { label: '🏪 Office', value: 'office' },
          ],
        };
        newBookingState.step = 'property-type';
      } else if (input.includes('deep')) {
        newBookingState.data.serviceType = 'Deep Cleaning';
        newBookingState.data.servicePrice = 159;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Excellent! Deep Cleaning selected. What type of property is this?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🏠 House', value: 'house' },
            { label: '🏢 Apartment', value: 'apartment' },
            { label: '🏗️ Condo', value: 'condo' },
            { label: '🏪 Office', value: 'office' },
          ],
        };
        newBookingState.step = 'property-type';
      } else if (input.includes('move')) {
        newBookingState.data.serviceType = 'Move In/Out Cleaning';
        newBookingState.data.servicePrice = 249;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Great choice! Move In/Out Cleaning selected. What type of property is this?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🏠 House', value: 'house' },
            { label: '🏢 Apartment', value: 'apartment' },
            { label: '🏗️ Condo', value: 'condo' },
            { label: '🏪 Office', value: 'office' },
          ],
        };
        newBookingState.step = 'property-type';
      }
    }
    
    // PROPERTY TYPE STEP
    else if (bookingState.step === 'property-type') {
      newBookingState.data.propertyType = userInput.charAt(0).toUpperCase() + userInput.slice(1);
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Got it! How many bedrooms?",
        timestamp: new Date(),
        quickReplies: [
          { label: 'Studio', value: '0' },
          { label: '1 Bedroom', value: '1' },
          { label: '2 Bedrooms', value: '2' },
          { label: '3 Bedrooms', value: '3' },
          { label: '4+ Bedrooms', value: '4' },
        ],
      };
      newBookingState.step = 'bedrooms';
    }
    
    // BEDROOMS STEP
    else if (bookingState.step === 'bedrooms') {
      const bedrooms = parseInt(input);
      newBookingState.data.bedrooms = bedrooms;
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Perfect! How many bathrooms?",
        timestamp: new Date(),
        quickReplies: [
          { label: '1 Bathroom', value: '1 bathroom' },
          { label: '1.5 Bathrooms', value: '1.5 bathrooms' },
          { label: '2 Bathrooms', value: '2 bathrooms' },
          { label: '2.5 Bathrooms', value: '2.5 bathrooms' },
          { label: '3+ Bathrooms', value: '3 bathrooms' },
        ],
      };
      newBookingState.step = 'bathrooms';
    }
    
    // BATHROOMS STEP
    else if (bookingState.step === 'bathrooms') {
      const bathrooms = parseFloat(input.split(' ')[0]);
      newBookingState.data.bathrooms = bathrooms;
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Great! Which rooms would you like cleaned? (Select all that apply)",
        timestamp: new Date(),
        quickReplies: [
          { label: '🍳 Kitchen', value: 'kitchen' },
          { label: '🛋️ Living Room', value: 'living room' },
          { label: '🛏️ Bedroom', value: 'bedroom' },
          { label: '🚿 Bathroom', value: 'bathroom' },
          { label: '✅ Done selecting', value: 'done rooms' },
        ],
      };
      newBookingState.step = 'rooms';
      newBookingState.data.rooms = [];
    }
    
    // ROOMS STEP
    else if (bookingState.step === 'rooms') {
      if (input.includes('done')) {
        // Check if any rooms need quantities
        const roomsNeedingQuantity = newBookingState.data.rooms?.filter(room => 
          room.toLowerCase() === 'kitchen' || room.toLowerCase() === 'living room'
        ) || [];
        
        if (roomsNeedingQuantity.length > 0 && !newBookingState.data.roomQuantities) {
          // Start collecting quantities
          newBookingState.data.roomQuantities = {};
          newBookingState.data.currentRoomForQuantity = roomsNeedingQuantity[0];
          ellaMessage = {
            id: Date.now().toString(),
            type: 'ella',
            content: `How many ${roomsNeedingQuantity[0]}s do you have?`,
            timestamp: new Date(),
            quickReplies: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
            ],
          };
          newBookingState.step = 'room-quantities';
        } else {
          // No quantities needed, move to add-ons
          ellaMessage = {
            id: Date.now().toString(),
            type: 'ella',
            content: "Perfect! Would you like to add any extra services?",
            timestamp: new Date(),
            quickReplies: [
              { label: '🪟 Inside Windows - $35', value: 'windows' },
              { label: '❄️ Inside Fridge - $25', value: 'fridge' },
              { label: '🔥 Inside Oven - $25', value: 'oven' },
              { label: '🧺 Laundry - $30', value: 'laundry' },
              { label: '✅ No add-ons', value: 'no addons' },
            ],
          };
          newBookingState.step = 'addons';
          newBookingState.data.addOns = [];
        }
      } else {
        // Add room to list
        const room = input.charAt(0).toUpperCase() + input.slice(1);
        const currentRooms = newBookingState.data.rooms || [];
        if (!currentRooms.includes(room)) {
          newBookingState.data.rooms = [...currentRooms, room];
        }
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: `${room} added! Select more rooms or click "Done selecting"`,
          timestamp: new Date(),
          quickReplies: [
            { label: '🍳 Kitchen', value: 'kitchen' },
            { label: '🛋️ Living Room', value: 'living room' },
            { label: '🛏️ Bedroom', value: 'bedroom' },
            { label: '🚿 Bathroom', value: 'bathroom' },
            { label: '✅ Done selecting', value: 'done rooms' },
          ],
        };
      }
    }
    
    // ROOM QUANTITIES STEP
    else if (bookingState.step === 'room-quantities') {
      const quantity = parseInt(input);
      const currentRoom = newBookingState.data.currentRoomForQuantity!;
      newBookingState.data.roomQuantities = {
        ...newBookingState.data.roomQuantities,
        [currentRoom]: quantity,
      };
      
      // Check if more rooms need quantities
      const allRooms = newBookingState.data.rooms || [];
      const roomsNeedingQuantity = allRooms.filter(room => 
        (room.toLowerCase() === 'kitchen' || room.toLowerCase() === 'living room') &&
        !newBookingState.data.roomQuantities?.[room]
      );
      
      if (roomsNeedingQuantity.length > 0) {
        newBookingState.data.currentRoomForQuantity = roomsNeedingQuantity[0];
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: `Got it! How many ${roomsNeedingQuantity[0]}s do you have?`,
          timestamp: new Date(),
          quickReplies: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
          ],
        };
      } else {
        // All quantities collected, move to add-ons
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Perfect! Would you like to add any extra services?",
          timestamp: new Date(),
          quickReplies: [
            { label: '🪟 Inside Windows - $35', value: 'windows' },
            { label: '❄️ Inside Fridge - $25', value: 'fridge' },
            { label: '🔥 Inside Oven - $25', value: 'oven' },
            { label: '🧺 Laundry - $30', value: 'laundry' },
            { label: '✅ No add-ons', value: 'no addons' },
          ],
        };
        newBookingState.step = 'addons';
        newBookingState.data.addOns = [];
      }
    }
    
    // ADD-ONS STEP
    else if (bookingState.step === 'addons') {
      if (input.includes('no addons') || input.includes('done addons')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Great! When would you like your cleaning scheduled?",
          timestamp: new Date(),
          quickReplies: [
            { label: '📅 Tomorrow', value: 'tomorrow' },
            { label: '📅 This Weekend', value: 'this weekend' },
            { label: '📅 Next Week', value: 'next week' },
            { label: '📆 Specific Date', value: 'specific date' },
          ],
        };
        newBookingState.step = 'date';
      } else {
        // Add the add-on
        let addonName = '';
        let addonPrice = 0;
        
        if (input.includes('window')) {
          addonName = 'Inside Windows';
          addonPrice = 35;
        } else if (input.includes('fridge')) {
          addonName = 'Inside Fridge';
          addonPrice = 25;
        } else if (input.includes('oven')) {
          addonName = 'Inside Oven';
          addonPrice = 25;
        } else if (input.includes('laundry')) {
          addonName = 'Laundry';
          addonPrice = 30;
        }
        
        const currentAddOns = newBookingState.data.addOns || [];
        if (!currentAddOns.some(a => a.name === addonName)) {
          newBookingState.data.addOns = [...currentAddOns, { name: addonName, price: addonPrice }];
        }
        
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: `${addonName} added! Add more or continue to scheduling:`,
          timestamp: new Date(),
          quickReplies: [
            { label: '🪟 Inside Windows - $35', value: 'windows' },
            { label: '❄️ Inside Fridge - $25', value: 'fridge' },
            { label: '🔥 Inside Oven - $25', value: 'oven' },
            { label: '🧺 Laundry - $30', value: 'laundry' },
            { label: '✅ Done with add-ons', value: 'done addons' },
          ],
        };
      }
    }
    
    // DATE STEP
    else if (bookingState.step === 'date') {
      if (input.includes('tomorrow')) {
        newBookingState.data.date = 'Tomorrow';
      } else if (input.includes('weekend')) {
        newBookingState.data.date = 'This Saturday';
      } else if (input.includes('next week')) {
        newBookingState.data.date = 'Next Monday';
      } else if (input.includes('specific')) {
        newBookingState.data.date = 'December 10, 2025';
      } else {
        newBookingState.data.date = userInput;
      }
      
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: `Perfect! What time works best on ${newBookingState.data.date}?`,
        timestamp: new Date(),
        quickReplies: [
          { label: '🌅 Morning (8-11 AM)', value: 'morning' },
          { label: '☀️ Afternoon (12-3 PM)', value: 'afternoon' },
          { label: '🌆 Evening (4-7 PM)', value: 'evening' },
        ],
      };
      newBookingState.step = 'time';
    }
    
    // TIME STEP
    else if (bookingState.step === 'time') {
      if (input.includes('morning')) {
        newBookingState.data.time = '9:00 AM';
      } else if (input.includes('afternoon')) {
        newBookingState.data.time = '1:00 PM';
      } else if (input.includes('evening')) {
        newBookingState.data.time = '5:00 PM';
      } else {
        newBookingState.data.time = userInput;
      }
      
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Great! How often would you like this service?",
        timestamp: new Date(),
        quickReplies: [
          { label: '🔁 One-time only', value: 'one-time' },
          { label: '📅 Weekly (10% off)', value: 'weekly' },
          { label: '📅 Bi-weekly (5% off)', value: 'bi-weekly' },
          { label: '📅 Monthly (15% off)', value: 'monthly' },
        ],
      };
      newBookingState.step = 'frequency';
    }
    
    // FREQUENCY STEP
    else if (bookingState.step === 'frequency') {
      if (input.includes('one-time')) {
        newBookingState.data.frequency = 'One-time';
      } else if (input.includes('weekly')) {
        newBookingState.data.frequency = 'Weekly';
      } else if (input.includes('bi-weekly')) {
        newBookingState.data.frequency = 'Bi-weekly';
      } else if (input.includes('monthly')) {
        newBookingState.data.frequency = 'Monthly';
      }
      
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Perfect! Do you have any pets?",
        timestamp: new Date(),
        quickReplies: [
          { label: '🐕 Yes, I have pets', value: 'yes pets' },
          { label: '🚫 No pets', value: 'no pets' },
        ],
      };
      newBookingState.step = 'pets';
    }
    
    // PETS STEP
    else if (bookingState.step === 'pets') {
      if (input.includes('no')) {
        newBookingState.data.hasPet = false;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Got it! Any special instructions for our cleaner?",
          timestamp: new Date(),
          quickReplies: [
            { label: '✅ No special instructions', value: 'no instructions' },
          ],
        };
        newBookingState.step = 'special-instructions';
      } else {
        newBookingState.data.hasPet = true;
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Great! What type of pets do you have? (You can select multiple)",
          timestamp: new Date(),
          quickReplies: [
            { label: '🐕 Dog', value: 'dog' },
            { label: '🐈 Cat', value: 'cat' },
            { label: '🐦 Bird', value: 'bird' },
            { label: '🐠 Fish', value: 'fish' },
            { label: '✅ Done selecting', value: 'done pets' },
          ],
        };
        newBookingState.step = 'pet-selection';
        newBookingState.data.selectedPets = [];
      }
    }
    
    // PET SELECTION STEP
    else if (bookingState.step === 'pet-selection') {
      if (input.includes('done')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "Will your pets be present during the cleaning?",
          timestamp: new Date(),
          quickReplies: [
            { label: '✅ Yes, they will be home', value: 'pets present' },
            { label: '🚫 No, they will be away', value: 'pets away' },
          ],
        };
        newBookingState.step = 'pet-present';
      } else {
        const pet = input.charAt(0).toUpperCase() + input.slice(1);
        const currentPets = newBookingState.data.selectedPets || [];
        if (!currentPets.includes(pet)) {
          newBookingState.data.selectedPets = [...currentPets, pet];
        }
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: `${pet} noted! Select more or click "Done selecting"`,
          timestamp: new Date(),
          quickReplies: [
            { label: '🐕 Dog', value: 'dog' },
            { label: '🐈 Cat', value: 'cat' },
            { label: '🐦 Bird', value: 'bird' },
            { label: '🐠 Fish', value: 'fish' },
            { label: '✅ Done selecting', value: 'done pets' },
          ],
        };
      }
    }
    
    // PET PRESENT STEP
    else if (bookingState.step === 'pet-present') {
      newBookingState.data.petPresent = input.includes('present') || input.includes('yes');
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Perfect! Any special instructions for our cleaner?",
        timestamp: new Date(),
        quickReplies: [
          { label: '✅ No special instructions', value: 'no instructions' },
        ],
      };
      newBookingState.step = 'special-instructions';
    }
    
    // SPECIAL INSTRUCTIONS STEP
    else if (bookingState.step === 'special-instructions') {
      if (!input.includes('no')) {
        newBookingState.data.specialInstructions = userInput;
      }
      
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Almost done! How would you like to pay?",
        timestamp: new Date(),
        quickReplies: [
          { label: '💳 Credit Card', value: 'credit card' },
          { label: '💳 Debit Card', value: 'debit card' },
          { label: '💰 Apple Pay', value: 'apple pay' },
          { label: '💰 Google Pay', value: 'google pay' },
        ],
      };
      newBookingState.step = 'payment';
    }
    
    // PAYMENT STEP
    else if (bookingState.step === 'payment') {
      newBookingState.data.paymentMethod = userInput;
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "Great! Would you like to add a tip for your cleaner?",
        timestamp: new Date(),
        quickReplies: [
          { label: '⭐ 10% ($' + ((bookingState.data.servicePrice || 0) * 0.1).toFixed(0) + ')', value: 'tip 10' },
          { label: '⭐ 15% ($' + ((bookingState.data.servicePrice || 0) * 0.15).toFixed(0) + ')', value: 'tip 15' },
          { label: '⭐ 20% ($' + ((bookingState.data.servicePrice || 0) * 0.2).toFixed(0) + ')', value: 'tip 20' },
          { label: '🚫 No tip', value: 'no tip' },
        ],
      };
      newBookingState.step = 'tip';
    }
    
    // TIP STEP
    else if (bookingState.step === 'tip') {
      if (input.includes('no')) {
        newBookingState.data.tipAmount = 0;
      } else if (input.includes('10')) {
        newBookingState.data.tipAmount = (bookingState.data.servicePrice || 0) * 0.1;
      } else if (input.includes('15')) {
        newBookingState.data.tipAmount = (bookingState.data.servicePrice || 0) * 0.15;
      } else if (input.includes('20')) {
        newBookingState.data.tipAmount = (bookingState.data.servicePrice || 0) * 0.2;
      }
      
      // Calculate final totals
      const totals = calculateTotal();
      
      // Build summary message
      let summary = "🎉 Perfect! Here's your booking summary:\n\n";
      summary += `📋 Service: ${newBookingState.data.serviceType}\n`;
      summary += `🏠 Property: ${newBookingState.data.propertyType}\n`;
      summary += `🛏️ ${newBookingState.data.bedrooms} bed, ${newBookingState.data.bathrooms} bath\n`;
      summary += `📅 Date: ${newBookingState.data.date}\n`;
      summary += `⏰ Time: ${newBookingState.data.time}\n`;
      summary += `🔁 Frequency: ${newBookingState.data.frequency}\n`;
      
      if (newBookingState.data.addOns && newBookingState.data.addOns.length > 0) {
        summary += `\n➕ Add-ons:\n`;
        newBookingState.data.addOns.forEach(addon => {
          summary += `  • ${addon.name} - $${addon.price}\n`;
        });
      }
      
      summary += `\n💰 Base Price: $${totals.basePrice}\n`;
      if (totals.addOnsTotal > 0) {
        summary += `💰 Add-ons: $${totals.addOnsTotal}\n`;
      }
      if (totals.discount > 0) {
        summary += `💚 Discount: -$${totals.discount.toFixed(2)}\n`;
      }
      if (totals.tip > 0) {
        summary += `⭐ Tip: $${totals.tip.toFixed(2)}\n`;
      }
      summary += `\n💳 TOTAL: $${totals.total.toFixed(2)}`;
      
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: summary,
        timestamp: new Date(),
        quickReplies: [
          { label: '✅ Confirm & Pay', value: 'confirm payment' },
          { label: '✏️ Make Changes', value: 'make changes' },
        ],
      };
      newBookingState.step = 'confirm';
    }
    
    // CONFIRM STEP
    else if (bookingState.step === 'confirm') {
      if (input.includes('confirm')) {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "🎊 Booking confirmed! Your payment has been processed. You'll receive a confirmation email shortly with all the details.\n\nThank you for choosing Sparkleville! ✨",
          timestamp: new Date(),
          quickReplies: [
            { label: '📱 View Dashboard', value: 'dashboard' },
            { label: '📅 Book Another', value: 'book another' },
            { label: '💬 Ask a Question', value: 'question' },
          ],
        };
        
        // Reset booking state
        newBookingState = { step: 'idle', data: {} };
        
        if (onBookingComplete) {
          setTimeout(() => onBookingComplete(), 2000);
        }
      } else {
        ellaMessage = {
          id: Date.now().toString(),
          type: 'ella',
          content: "No problem! What would you like to change? Let's start over from the beginning.",
          timestamp: new Date(),
          quickReplies: [
            { label: '🏠 Book a Cleaning', value: 'book' },
            { label: '💬 Ask a Question', value: 'question' },
          ],
        };
        newBookingState = { step: 'idle', data: {} };
      }
    }
    
    // Fallback
    else {
      ellaMessage = {
        id: Date.now().toString(),
        type: 'ella',
        content: "I'm not sure I understood that. Could you try again or use one of the quick replies?",
        timestamp: new Date(),
        quickReplies: [
          { label: '🏠 Start Booking', value: 'book' },
          { label: '💬 Ask Question', value: 'question' },
        ],
      };
    }

    setMessages(prev => [...prev, ellaMessage]);
    setBookingState(newBookingState);
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      <ChatHeader onMinimize={onMinimize} onClose={onClose} />
      <ChatMessages 
        messages={messages} 
        isTyping={isTyping}
        onQuickReply={handleQuickReply}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
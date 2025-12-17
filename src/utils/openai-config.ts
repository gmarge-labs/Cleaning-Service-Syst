// OpenAI Configuration
// IMPORTANT: Replace 'YOUR_OPENAI_API_KEY_HERE' with your actual OpenAI API key
// Get your API key from: https://platform.openai.com/api-keys

export const OPENAI_CONFIG = {
  apiKey: 'YOUR_OPENAI_API_KEY_HERE',
  model: 'gpt-4o-mini', // or 'gpt-4' for better responses
  maxTokens: 500,
  temperature: 0.7,
};

// Knowledge Base for RAG (Retrieval-Augmented Generation)
// This contains information about SparkleClean services
export const KNOWLEDGE_BASE = [
  {
    category: 'Services',
    content: `SparkleClean offers six main cleaning services:
    
    1. Standard Cleaning - Regular maintenance for a consistently clean home. Starting at $89, takes 2-3 hours. Includes dusting, vacuuming, mopping, kitchen and bathroom cleaning, trash removal, and bed making. Available weekly or bi-weekly.
    
    2. Deep Cleaning - Thorough cleaning for every corner. Starting at $189, takes 4-6 hours. Includes all standard tasks plus baseboards, window washing, deep appliance cleaning, grout scrubbing, light fixture cleaning, and behind furniture cleaning. Recommended monthly or quarterly.
    
    3. Move In/Out Cleaning - Complete property cleaning for moves. Starting at $249, takes 5-8 hours. Includes complete deep cleaning, all cabinets and drawers, all appliances, walls, floors, bathrooms, and closets. One-time service.
    
    4. Office Cleaning - Professional workspace cleaning. Custom pricing, flexible duration. Includes desk sanitization, common areas, kitchen/break room, restroom sanitization, trash removal, floor care, windows, and conference rooms. Available daily, weekly, or custom schedules.
    
    5. Eco-Friendly Cleaning - Green cleaning solutions. Starting at $99, takes 2-4 hours. Uses all-natural, non-toxic, biodegradable products safe for children and pets. All standard or deep cleaning tasks available on any schedule.
    
    6. Post-Construction Cleaning - Transform construction sites to move-in ready. Starting at $299, takes 6-10 hours. Includes dust/debris removal, window washing, paint removal, floor cleaning/polishing, fixture cleaning, HVAC cleaning, and final inspection. One-time service.`,
  },
  {
    category: 'Pricing',
    content: `SparkleClean pricing:
    - Standard Cleaning: Starting at $89
    - Deep Cleaning: Starting at $189
    - Move In/Out: Starting at $249
    - Office Cleaning: Custom pricing based on space and frequency
    - Eco-Friendly: Starting at $99 (premium for green products)
    - Post-Construction: Starting at $299
    
    All prices vary based on home size, condition, and location. We offer package discounts for recurring services and seasonal promotions.`,
  },
  {
    category: 'Booking',
    content: `Booking with SparkleClean is easy:
    1. Choose your service type
    2. Provide property details (bedrooms, bathrooms, square footage)
    3. Select your preferred date and time
    4. Complete payment information
    
    We offer next-day availability for most services. Book online in 60 seconds or call (555) 123-4567. Our customer service team is available Mon-Fri 7am-8pm, Sat-Sun 8am-6pm.`,
  },
  {
    category: 'Company Info',
    content: `SparkleClean is a professional cleaning company committed to exceptional service. We are:
    - Fully insured and bonded
    - Background-checked cleaners
    - 100% satisfaction guaranteed
    - Eco-friendly options available
    - Next-day availability
    - Flexible scheduling
    - Professional and reliable
    
    Contact us:
    - Main Line: (555) 123-4567
    - Support Line: (555) 123-4568
    - Emergency 24/7: (555) 123-4569
    - Available for chat 24/7 with our AI Assistant Manager`,
  },
  {
    category: 'Guarantees',
    content: `SparkleClean guarantees:
    - 100% satisfaction or we'll re-clean at no charge
    - Fully insured and bonded services
    - Background-checked and trained professionals
    - Same-day availability
    - Flexible scheduling and rescheduling
    - Eco-friendly product options
    - No contracts required
    - Clear, upfront pricing
    - Professional customer service`,
  },
  {
    category: 'Add-ons',
    content: `Available add-on services:
    - Interior window cleaning
    - Refrigerator deep cleaning
    - Oven deep cleaning
    - Laundry service
    - Dish washing
    - Organization services
    - Carpet shampooing
    - Upholstery cleaning
    - Pet hair removal
    
    Add-ons can be included with any service for an additional fee.`,
  },
];
import { OPENAI_CONFIG, KNOWLEDGE_BASE } from './openai-config';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Simple text similarity function for RAG
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = new Set([...words1, ...words2]);
  
  return intersection.length / union.size;
}

// Retrieve relevant context from knowledge base (RAG)
export function retrieveRelevantContext(query: string): string {
  // Calculate similarity scores for each knowledge base entry
  const scoredEntries = KNOWLEDGE_BASE.map(entry => ({
    ...entry,
    score: calculateSimilarity(query, entry.content),
  }));

  // Sort by relevance and take top 2 most relevant entries
  const relevantEntries = scoredEntries
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  // Combine the relevant context
  const context = relevantEntries
    .map(entry => `${entry.category}:\n${entry.content}`)
    .join('\n\n');

  return context;
}

// Send message to OpenAI API
export async function sendMessageToOpenAI(
  messages: Message[],
  userMessage: string
): Promise<string> {
  // Check if API key is set
  if (OPENAI_CONFIG.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    // Return a helpful mock response when API key is not configured
    return getMockResponse(userMessage);
  }

  try {
    // Retrieve relevant context using RAG
    const relevantContext = retrieveRelevantContext(userMessage);

    // Create system message with context
    const systemMessage: Message = {
      role: 'system',
      content: `You are a helpful Assistant Manager for SparkleClean, a professional cleaning company. Your role is to assist customers with questions about our services, pricing, booking, and general inquiries. Be friendly, professional, and concise.

Here is relevant information from our knowledge base:

${relevantContext}

Use this information to answer the customer's question. If the question is not related to cleaning services or the information provided, politely redirect the conversation to how you can help with cleaning services.`,
    };

    // Prepare the full conversation
    const fullConversation = [
      systemMessage,
      ...messages,
      { role: 'user' as const, content: userMessage },
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: fullConversation,
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Return helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'I\'m currently unable to connect. Please make sure the OpenAI API key is configured correctly.';
      }
      return `I encountered an error: ${error.message}. Please try again or contact support at +12079007700.`;
    }
    
    return 'I apologize, but I encountered an unexpected error. Please try again or contact our support team.';
  }
}

// Mock response function for demonstration when API key is not set
function getMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Check for common keywords and provide relevant responses
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return 'Our pricing varies by service type:\n\n• Standard Cleaning: Starting at $89\n• Deep Cleaning: Starting at $189\n• Move In/Out: Starting at $249\n• Eco-Friendly: Starting at $99\n• Post-Construction: Starting at $299\n• Office Cleaning: Custom pricing\n\nPrices depend on your home size and specific needs. Would you like to get a personalized quote?';
  }

  if (lowerMessage.includes('service') || lowerMessage.includes('what do you')) {
    return 'We offer six professional cleaning services:\n\n1. **Standard Cleaning** - Regular home maintenance\n2. **Deep Cleaning** - Thorough, detailed cleaning\n3. **Move In/Out** - Complete property cleaning\n4. **Office Cleaning** - Professional workspace cleaning\n5. **Eco-Friendly** - Green cleaning solutions\n6. **Post-Construction** - Construction cleanup\n\nWhich service interests you most?';
  }

  if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
    return 'Booking with SparkleClean is quick and easy! You can:\n\n1. Use our online booking system (takes just 60 seconds)\n2. Call us at +12079007700\n3. Continue chatting with me to get started\n\nWe offer next-day availability and flexible scheduling. What works best for you?';
  }

  if (lowerMessage.includes('deep clean')) {
    return 'Our Deep Cleaning service is perfect for a thorough home refresh! It includes:\n\n• All standard cleaning tasks\n• Baseboards and crown molding\n• Interior window washing\n• Deep appliance cleaning\n• Grout and tile scrubbing\n• Light fixtures and ceiling fans\n• Behind furniture cleaning\n\nStarting at $189, takes 4-6 hours. Recommended monthly or quarterly. Would you like to book a deep cleaning?';
  }

  if (lowerMessage.includes('standard clean')) {
    return 'Our Standard Cleaning keeps your home fresh and inviting! Includes:\n\n• Dusting all surfaces\n• Vacuuming and mopping\n• Kitchen cleaning\n• Bathroom cleaning\n• Trash removal\n• Bed making\n\nStarting at $89, takes 2-3 hours. Perfect for weekly or bi-weekly service. Interested in setting up recurring cleanings?';
  }

  if (lowerMessage.includes('eco') || lowerMessage.includes('green') || lowerMessage.includes('pet')) {
    return 'Our Eco-Friendly Cleaning uses only natural, non-toxic products that are:\n\n• Safe for children and pets\n• Biodegradable and sustainable\n• Allergen and chemical-free\n• Environmentally responsible\n\nStarting at $99 for any standard or deep cleaning service. Great for families with kids and pets!';
  }

  if (lowerMessage.includes('move') || lowerMessage.includes('moving')) {
    return 'Our Move In/Out Cleaning ensures your property is spotless! Perfect for:\n\n• Getting your security deposit back\n• Preparing a new home\n• Real estate showings\n\nIncludes complete deep cleaning of the entire property, all cabinets, appliances, walls, and floors. Starting at $249, takes 5-8 hours. When is your move date?';
  }

  if (lowerMessage.includes('office') || lowerMessage.includes('commercial') || lowerMessage.includes('business')) {
    return 'Our Office Cleaning service keeps your workspace professional and productive! We offer:\n\n• Desk and workspace sanitization\n• Common area cleaning\n• Kitchen and restroom maintenance\n• Floor care and window cleaning\n• Flexible scheduling (daily, weekly, or custom)\n\nCustom pricing based on your space and needs. Tell me about your office, and I\'ll help create a cleaning plan!';
  }

  if (lowerMessage.includes('construction') || lowerMessage.includes('renovation')) {
    return 'Our Post-Construction Cleaning transforms construction chaos into move-in ready!\n\n• Complete dust and debris removal\n• Window washing (inside and out)\n• Paint and sticker removal\n• Floor cleaning and polishing\n• Final walkthrough inspection\n\nStarting at $299, takes 6-10 hours. Perfect after renovations or new construction. When do you need this service?';
  }

  if (lowerMessage.includes('guarantee') || lowerMessage.includes('insured') || lowerMessage.includes('safe')) {
    return 'SparkleClean offers complete peace of mind:\n\n✓ 100% satisfaction guarantee\n✓ Fully insured and bonded\n✓ Background-checked cleaners\n✓ Professional training\n✓ We\'ll re-clean free if you\'re not satisfied\n\nYour safety and satisfaction are our top priorities!';
  }

  if (lowerMessage.includes('time') || lowerMessage.includes('hours') || lowerMessage.includes('available')) {
    return 'We offer flexible scheduling to fit your needs:\n\n• Next-day availability for most services\n• 7 days a week\n• Morning, afternoon, or evening slots\n• Recurring schedules available\n\nCustomer service hours:\n• Mon-Fri: 7am - 8pm\n• Sat-Sun: 8am - 6pm\n• Emergency line: 24/7\n\nWhat time works best for you?';
  }

  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return 'You\'re very welcome! I\'m here anytime you need help with cleaning services. Is there anything else I can assist you with today? 😊';
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'Hello! Welcome to SparkleClean! 👋 I\'m your Assistant Manager, here to help with all your cleaning needs. What can I help you with today?';
  }

  // Default response for unrecognized queries
  return 'Thank you for your question! I\'m here to help you with:\n\n• Information about our cleaning services\n• Pricing and packages\n• Booking and scheduling\n• Service details and guarantees\n\nWhat would you like to know more about? Or call us at +12079007700 to speak with our team!';
}

// NOTE: To use real OpenAI API:
// 1. Go to https://platform.openai.com/api-keys
// 2. Create a new API key
// 3. Replace 'YOUR_OPENAI_API_KEY_HERE' in /utils/openai-config.ts with your key
// 4. The chat will automatically switch from mock responses to real AI responses
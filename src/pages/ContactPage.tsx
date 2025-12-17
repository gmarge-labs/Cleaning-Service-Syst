import { Button } from '../components/ui/button';
import { 
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  User,
  Sparkles,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Loader2,
  X
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState, useRef, useEffect } from 'react';
import { sendMessageToOpenAI, Message } from '../utils/openai-service';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

interface ContactPageProps {
  onStartChat: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ContactPage({ onStartChat }: ContactPageProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! Welcome to SparkleVille! 👋 I\'m your Assistant Manager. How can I help you today? Feel free to ask about our services, pricing, booking, or anything else!',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Mark conversation as started
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Convert chat messages to OpenAI format
      const messageHistory: Message[] = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get AI response
      const aiResponse = await sendMessageToOpenAI(messageHistory, userMessage);

      // Add AI response to chat
      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or call us at (555) 123-4567 for immediate assistance.',
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Have questions? We're here to help! Chat with our Assistant Manager, give us a call, or send us a message.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* AI Chat Section */}
            <ScrollReveal variant="scale" duration={0.8}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto">
                {!showChat ? (
                  // Initial View: Description + Image
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left Column: Description & Button */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-secondary-50 to-accent-50">
                      <div className="mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                          Meet Our Assistant Manager
                        </h2>
                        <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                          Get instant answers to all your cleaning service questions. Our AI-powered Assistant Manager is available 24/7 to help you with:
                        </p>
                        <ul className="space-y-3 mb-8">
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-1" />
                            <span className="text-neutral-700">Service information and recommendations</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-1" />
                            <span className="text-neutral-700">Pricing and package details</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-1" />
                            <span className="text-neutral-700">Booking assistance and scheduling</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-1" />
                            <span className="text-neutral-700">Answers to frequently asked questions</span>
                          </li>
                        </ul>
                        <Button
                          onClick={() => setShowChat(true)}
                          size="lg"
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90 px-8 py-6 h-auto w-full md:w-auto shadow-lg hover:shadow-xl transition-all"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Start Chatting Now
                        </Button>
                        <div className="text-sm text-neutral-600 mt-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Average response time: Under 2 seconds</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Manager Image */}
                    <div className="relative h-full min-h-[400px] md:min-h-[600px] bg-gradient-to-br from-secondary-100 to-accent-100">
                      <ImageWithFallback
                        src="https://res.cloudinary.com/dwwa5bzo4/image/upload/v1764492254/Generated_Image_November_30_2025_-_9_41AM_xinh9u.png"
                        alt="Assistant Manager"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                ) : (
                  // Chat Interface
                  <div className="flex flex-col">
                    {/* Manager Info Header */}
                    <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 px-4 py-3 text-white flex items-center justify-between border-b-2 border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <ImageWithFallback
                            src="https://images.unsplash.com/photo-1740153204804-200310378f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFzc2lzdGFudCUyMGF2YXRhcnxlbnwxfHx8fDE3NjQ0MzM1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Sarah Johnson"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-primary-600 animate-pulse"></div>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">
                            Sarah Johnson
                          </h2>
                          <div className="text-xs text-secondary-100 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <span>Online • Typically replies instantly</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowChat(false)}
                        variant="ghost"
                        className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Chat Messages */}
                    <div className={`bg-gradient-to-b from-neutral-50 to-white p-4 space-y-4 ${conversationStarted ? 'min-h-[400px]' : 'min-h-[100px]'} max-h-[600px] overflow-y-auto transition-all duration-300`}>
                      {chatMessages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          style={{ 
                            animation: 'slideInFromBottom 0.3s ease-out',
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'backwards'
                          }}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0">
                              <ImageWithFallback
                                src="https://images.unsplash.com/photo-1740153204804-200310378f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFzc2lzdGFudCUyMGF2YXRhcnxlbnwxfHx8fDE3NjQ0MzM1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                alt="Assistant"
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary-100"
                              />
                            </div>
                          )}
                          <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-tr-sm'
                                  : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-sm'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                            </div>
                            <span className={`text-xs mt-1.5 px-1 ${
                              message.role === 'user' ? 'text-neutral-500' : 'text-neutral-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3 justify-start" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                          <div className="flex-shrink-0">
                            <ImageWithFallback
                              src="https://images.unsplash.com/photo-1740153204804-200310378f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGFzc2lzdGFudCUyMGF2YXRhcnxlbnwxfHx8fDE3NjQ0MzM1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                              alt="Assistant"
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary-100"
                            />
                          </div>
                          <div className="bg-white text-neutral-800 border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-secondary-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out infinite' }}></div>
                                <div className="w-2 h-2 bg-accent-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.2s infinite' }}></div>
                                <div className="w-2 h-2 bg-secondary-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.4s infinite' }}></div>
                              </div>
                              <span className="text-sm text-neutral-600">Sarah is typing</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Section */}
                    <div className="bg-white border-t border-neutral-200 p-3 shadow-lg">
                      {isLoading && (
                        <div className="mb-3 px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl flex items-center gap-2" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out infinite' }}></div>
                            <div className="w-1.5 h-1.5 bg-accent-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.2s infinite' }}></div>
                            <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.4s infinite' }}></div>
                          </div>
                          <span className="text-sm text-secondary-600 font-medium">Sarah is typing...</span>
                        </div>
                      )}
                      <div className="flex gap-3 items-end mb-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            placeholder={isLoading ? "Waiting for response..." : "Type your message here..."}
                            disabled={isLoading}
                            className="w-full px-4 py-3 pr-12 border-2 border-neutral-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 shadow-sm disabled:bg-neutral-100 disabled:cursor-not-allowed transition-all"
                          />
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-secondary-400' : 'text-neutral-400'}`}>
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <MessageCircle className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl px-5 py-3 h-auto hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                          <span>AI-powered with OpenAI & RAG</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>24/7 Available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Contact Information */}
            {!showChat && (
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Call Us Directly Card */}
                <ScrollReveal variant="fade-right" duration={0.7}>
                  <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    {/* Phone Contact */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                          Call Us Directly
                        </h3>
                        <p className="text-neutral-600">
                          Speak with our customer service team for immediate assistance
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 flex-1">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <Phone className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm text-neutral-600">Main Line</div>
                          <a href="tel:5551234567" className="text-xl font-bold text-green-700 hover:text-green-800 block">
                            (555) 123-4567
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                        <Phone className="w-5 h-5 text-secondary-500" />
                        <div>
                          <div className="text-sm text-neutral-600">Support Line</div>
                          <a href="tel:5551234568" className="text-xl font-bold text-secondary-600 hover:text-secondary-700 block">
                            (555) 123-4568
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Business Hours</div>
                          <div className="font-semibold text-neutral-900">Mon-Fri: 7am - 8pm</div>
                          <div className="font-semibold text-neutral-900">Sat-Sun: 8am - 6pm</div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="pt-6 border-t border-neutral-200">
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        Follow Us
                      </h3>
                      <div className="flex gap-3">
                        <a
                          href="#"
                          className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 text-white"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a
                          href="#"
                          className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 text-white"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                        <a
                          href="#"
                          className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 text-white"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                        <a
                          href="#"
                          className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300 text-white"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Contact Form Card */}
                <ScrollReveal variant="fade-left" duration={0.7}>
                  <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    {/* Form Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                          Send Us a Message
                        </h3>
                        <p className="text-neutral-600">
                          Fill out the form and we'll get back to you within 24 hours
                        </p>
                      </div>
                    </div>

                    {/* Contact Form */}
                    <form className="space-y-4 mb-6 flex-1">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all resize-none"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90 px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </form>

                    {/* Additional Info */}
                    <div className="pt-6 border-t border-neutral-200">
                      <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        Email Us
                      </h3>
                      <a href="mailto:hello@sparkleville.com" className="text-secondary-600 hover:text-secondary-700 hover:underline">
                        hello@sparkleville.com
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Contact Us Section */}
      {!showChat && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal variant="fade-up" className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                We're Here to Help
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Our customer service team is dedicated to making your experience exceptional
              </p>
            </ScrollReveal>

            <ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
              <ScrollRevealItem variant="scale" className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Fast Response Times
                </h3>
                <p className="text-neutral-600">
                  Average response time under 2 minutes via chat, next-day for emails
                </p>
              </ScrollRevealItem>

              <ScrollRevealItem variant="scale" className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">
                  Expert Support
                </h3>
                <p className="text-neutral-600">
                  Knowledgeable team trained to answer all your cleaning questions
                </p>
              </ScrollRevealItem>

              <ScrollRevealItem variant="scale" className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">
                  Personalized Service
                </h3>
                <p className="text-neutral-600">
                  We take time to understand your unique needs and preferences
                </p>
              </ScrollRevealItem>
            </ScrollRevealStagger>
          </div>
        </section>
      )}

      {/* Emergency Contact */}
      {!showChat && (
        <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-200">
          <ScrollReveal variant="fade-up" duration={0.8}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Need Emergency Cleaning?</div>
                    <div className="text-sm text-neutral-600">24/7 urgent service available</div>
                  </div>
                </div>
                <a
                  href="tel:5551234569"
                  className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
                >
                  Call Emergency Line: (555) 123-4569
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}
    </div>
  );
}
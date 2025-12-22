import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ChevronDown, User, Shield, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { LoginModal } from './LoginModal';
import { motion } from 'motion/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface HeaderProps {
  onStartBooking: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
  onNavigateToDashboard: () => void;
  onAdminLogin?: () => void;
  onSupervisorLogin?: () => void;
  onSupportLogin?: () => void;
}

export function Header({ 
  onStartBooking, 
  onLogin, 
  isAuthenticated, 
  onNavigateToDashboard, 
  onAdminLogin,
  onSupervisorLogin,
  onSupportLogin
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { general } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle scrolling to sections when navigating with hash
  useEffect(() => {
    if (location.hash && location.pathname === '/') {
      // Give the page a moment to render
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const navLinks = [
    { label: 'Home', to: '/', type: 'route' as const },
    { label: 'Services', to: '/services', type: 'route' as const },
    { label: 'Pricing', to: '/pricing', type: 'route' as const },
    { label: 'How It Works', to: '/how-it-works', type: 'route' as const },
    { label: 'Careers', to: '/careers', type: 'route' as const },
    { label: 'Contact', to: '/contact', type: 'route' as const },
  ];

  const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // Navigate to home page with the hash
      navigate('/' + href);
    } else {
      // Already on home page, just scroll
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Determine if we should always show white background (on non-home pages)
  const isHomePage = location.pathname === '/';
  const showWhiteBg = !isHomePage || isScrolled;

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${ 
        showWhiteBg
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0 group" onClick={handleHomeClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="font-bold text-xl text-neutral-900">{general.companyName}</div>
              <div className="text-xs text-neutral-500">Professional Cleaning</div>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return link.type === 'route' ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`transition-colors ${
                    isActive 
                      ? 'text-secondary-500 font-semibold' 
                      : 'text-neutral-700 hover:text-secondary-500'
                  }`}
                  onClick={link.label === 'Home' ? handleHomeClick : undefined}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-neutral-700 hover:text-secondary-500 transition-colors"
                  onClick={(e) => handleScrollLink(e, link.href)}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <Button 
                onClick={onNavigateToDashboard} 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-6 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-6 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 ml-auto"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-neutral-900" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return link.type === 'route' ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`block px-4 py-2 rounded-lg ${
                    isActive 
                      ? 'bg-secondary-50 text-secondary-500 font-semibold' 
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={(e) => {
                    if (link.label === 'Home') {
                      handleHomeClick(e);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50 rounded-lg"
                  onClick={(e) => {
                    handleScrollLink(e, link.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-3 space-y-2">
              {isAuthenticated ? (
                <Button 
                  onClick={() => {
                    onNavigateToDashboard();
                    setIsMobileMenuOpen(false);
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }} 
                    variant="outline" 
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      onStartBooking();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                  >
                    Book Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onCustomerLogin={onLogin}
        onAdminLogin={onAdminLogin || (() => {})}
        onSupervisorLogin={onSupervisorLogin || (() => {})}
        onSupportLogin={onSupportLogin || (() => {})}
      />
    </motion.header>
  );
}
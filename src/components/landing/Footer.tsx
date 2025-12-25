import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import logo from '../../images/logo/Sparkleville1(2).png';

interface FooterProps {
  onAdminLogin?: () => void;
  onCleanerLogin?: () => void;
}

export function Footer({ onAdminLogin, onCleanerLogin }: FooterProps) {
  const navigate = useNavigate();
  const { general } = useSelector((state: RootState) => state.settings);

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/', scrollTo: 'about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/', scrollTo: 'testimonials' },
      { label: 'Blog', href: '/', scrollTo: 'how-it-works' },
    ],
    services: [
      { label: 'Standard Cleaning', href: '/services' },
      { label: 'Deep Cleaning', href: '/services' },
      { label: 'Move In/Out', href: '/services' },
      { label: 'Post-Construction', href: '/services' },
    ],
    support: [
      { label: 'Help Center', href: '/how-it-works' },
      { label: 'Safety', href: '/how-it-works' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/contact' },
      { label: 'Terms of Service', href: '/contact' },
      { label: 'Cookie Policy', href: '/contact' },
      { label: 'Refund Policy', href: '/pricing' },
    ],
  };

  const handleLinkClick = (e: React.MouseEvent, href: string, scrollTo?: string) => {
    e.preventDefault();
    navigate(href);
    
    if (scrollTo) {
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer id="contact" className="relative text-white overflow-hidden">
      {/* Background with Logo */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950">
        {/* Centered Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-4 opacity-20">
            <img src={logo} alt="" className="h-32 w-auto" />
            <div>
              <div className="font-bold text-xl text-white">{general.companyName}</div>
              <div className="text-xs text-neutral-400">Professional Cleaning</div>
            </div>
          </div>
        </div>
        {/* Navy-Pink gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-secondary-900/10 to-primary-800/15"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Sparkleville Logo" className="h-12 w-auto" />
              <div>
                <div className="font-bold text-xl text-white">{general.companyName}</div>
                <div className="text-xs text-neutral-400">Professional Cleaning</div>
              </div>
            </div>
            <p className="text-neutral-300 mb-6 leading-relaxed font-medium">
              Making professional cleaning accessible, reliable, and stress-free for everyone.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors font-medium">
                <Phone className="w-5 h-5" />
                <span>{general.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors font-medium">
                <Mail className="w-5 h-5" />
                <span>{general.email}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors font-medium">
                <MapPin className="w-5 h-5" />
                <span>{general.address}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.href, link.scrollTo)} className="text-neutral-300 hover:text-white transition-colors font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-neutral-300 hover:text-white transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-neutral-300 hover:text-white transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-neutral-300 hover:text-white transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-300 text-sm font-medium">
              © 2025 Sparkleville. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-secondary-500 flex items-center justify-center transition-colors group">
                <Facebook className="w-5 h-5 text-neutral-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-secondary-500 flex items-center justify-center transition-colors group">
                <Twitter className="w-5 h-5 text-neutral-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-secondary-500 flex items-center justify-center transition-colors group">
                <Instagram className="w-5 h-5 text-neutral-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-secondary-500 flex items-center justify-center transition-colors group">
                <Linkedin className="w-5 h-5 text-neutral-400 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
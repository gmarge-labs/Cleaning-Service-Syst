import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ScrollReveal } from '../components/ui/scroll-reveal';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <ScrollReveal variant="fade-up" className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                <p className="text-white/90 text-lg mt-2">Last updated: January 12, 2026</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <ScrollReveal variant="fade-up">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              
              {/* Introduction */}
              <div>
                <p className="text-neutral-700 leading-relaxed">
                  Sparkleville respects your privacy. This policy outlines how we collect, use, store, and protect your information.
                </p>
              </div>

              {/* 1. Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Information We Collect</h2>
                <p className="text-neutral-700 leading-relaxed mb-3">
                  We collect the following types of information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-700">
                  <li>Name, phone number, and email address</li>
                  <li>Physical address and property details</li>
                  <li>Billing and payment information</li>
                  <li>Booking history and service preferences</li>
                  <li>Device data, IP address, and cookies</li>
                </ul>
              </div>

              {/* 2. Use of Information */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Use of Information</h2>
                <p className="text-neutral-700 leading-relaxed mb-3">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-700">
                  <li>Schedule and deliver cleaning services</li>
                  <li>Improve our operations and customer experience</li>
                  <li>Communicate with you about bookings and updates</li>
                  <li>Send appointment reminders and notifications</li>
                  <li>Process payments and manage billing</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              {/* 3. Data Sharing */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Data Sharing</h2>
                <p className="text-neutral-700 leading-relaxed mb-3">
                  We share data with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-700">
                  <li>Payment processors to handle transactions</li>
                  <li>Independent contractors assigned to your service</li>
                  <li>Booking and scheduling tools we use</li>
                  <li>Legal authorities when required by law</li>
                </ul>
                <p className="text-neutral-700 leading-relaxed mt-3">
                  <strong>We do not sell your personal data.</strong>
                </p>
              </div>

              {/* 4. Data Retention */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Data Retention</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Information is retained as long as necessary for service delivery or to fulfill legal obligations. 
                  You may request deletion of your data at any time, subject to legal requirements.
                </p>
              </div>

              {/* 5. Security */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Security</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We use reasonable administrative, technical, and physical safeguards to protect your information. 
                  However, no system is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              {/* 6. Your Rights */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Your Rights</h2>
                <p className="text-neutral-700 leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-700">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Object to certain types of data processing</li>
                </ul>
                <p className="text-neutral-700 leading-relaxed mt-3">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>

              {/* 7. Cookies */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Cookies</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We may use cookies and similar technologies for analytics, functionality, and to improve user experience. 
                  You can control cookie settings through your browser preferences.
                </p>
              </div>

              {/* 8. Children's Privacy */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Children's Privacy</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We do not knowingly collect personal information from children under 13 years of age. 
                  If we discover that we have collected such information, we will delete it promptly.
                </p>
              </div>

              {/* 9. International Transfers */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. International Transfers</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Your data may be processed and stored in the United States or other countries where our service providers operate. 
                  By using our services, you consent to such transfers.
                </p>
              </div>

              {/* 10. Policy Updates */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Policy Updates</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. 
                  Continued use of our services after changes indicates your acceptance of the updated policy.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                </p>
                <div className="space-y-2 text-neutral-700">
                  <p><strong>Sparkleville</strong></p>
                  <p>Email: admin@sparkleville.co</p>
                  <p>Phone: +12079007700</p>
                </div>
              </div>

              {/* Back Button */}
              <div className="pt-8">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

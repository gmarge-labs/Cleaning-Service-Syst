import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ScrollReveal } from '../components/ui/scroll-reveal';

export function TermsPage() {
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
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
                  These Terms of Service ("Terms") govern your use of the services provided by Sparkleville ("Company," "we," "us," or "our"). 
                  By booking, purchasing, or using our services, you agree to be bound by these Terms. If you do not agree, do not use our services.
                </p>
              </div>

              {/* 1. Services Provided */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Services Provided</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Sparkleville provides residential and commercial cleaning services, including but not limited to standard cleaning, 
                  deep cleaning, move-in/move-out cleaning, post-construction cleaning, short-term rental cleaning, office cleaning, 
                  and specialty add-on services. We reserve the right to refuse service, update pricing, and subcontract cleaners.
                </p>
              </div>

              {/* 2. Booking and Scheduling */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Booking and Scheduling</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Appointments must be booked through approved Sparkleville channels. You must provide accurate information about your property. 
                  Quotes may change if conditions differ from the information provided.
                </p>
              </div>

              {/* 3. Access to Property */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Access to Property</h2>
                <p className="text-neutral-700 leading-relaxed">
                  You must ensure access to the property. Lockout situations will incur fees.
                </p>
              </div>

              {/* 4. Cancellations and Fees */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Cancellations and Fees</h2>
                <ul className="list-disc list-inside space-y-2 text-neutral-700">
                  <li>24+ hours notice: free changes</li>
                  <li>Less than 24 hours: up to 50% fee</li>
                  <li>Same day/lockout: 100% fee</li>
                </ul>
              </div>

              {/* 5. Refunds and Satisfaction Guarantee */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Refunds and Satisfaction Guarantee</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We offer a reclean guarantee within 24 hours of service complaint submission. Refunds are discretionary.
                </p>
              </div>

              {/* 6. Health and Safety */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Health and Safety</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We do not clean biohazards, human/animal waste, black mold, hoarding conditions, infestations, hazardous wastes, or crime scenes.
                </p>
              </div>

              {/* 7. Valuables and Breakage */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Valuables and Breakage</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Clients must secure valuables. Sparkleville is not responsible for preexisting damage or unstable items. 
                  Damage must be reported within 24 hours.
                </p>
              </div>

              {/* 8. Client Responsibilities */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Client Responsibilities</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Client must provide electricity, water, safe environment, disclose allergies and hazards, and secure pets.
                </p>
              </div>

              {/* 9. Payment Terms */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Payment Terms</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Payment is due at booking or completion. Chargebacks without cause may result in legal action.
                </p>
              </div>

              {/* 10. Third Party Contractors */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Third Party Contractors</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Sparkleville may use subcontractors. Clients agree not to hire cleaners privately for 12 months following last service.
                </p>
              </div>

              {/* 11. Liability Limitation */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">11. Liability Limitation</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Liability is limited to the amount paid for the disputed service. No liability for indirect or consequential damages.
                </p>
              </div>

              {/* 12. Photos and Marketing */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">12. Photos and Marketing</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Before and after images may be used for training or anonymous marketing unless client opts out in writing.
                </p>
              </div>

              {/* 13. Prohibited Uses */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">13. Prohibited Uses</h2>
                <p className="text-neutral-700 leading-relaxed">
                  Misrepresentation, harassment, endangerment, and illegal activity are prohibited.
                </p>
              </div>

              {/* 14. Governing Law and Dispute Resolution */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">14. Governing Law and Dispute Resolution</h2>
                <p className="text-neutral-700 leading-relaxed">
                  These terms are governed by applicable laws of your state. Arbitration may apply.
                </p>
              </div>

              {/* 15. Changes to Terms */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">15. Changes to Terms</h2>
                <p className="text-neutral-700 leading-relaxed">
                  We may modify these terms at any time. Continued use indicates acceptance.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
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

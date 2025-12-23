import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Calendar, 
  Award,
  Clock,
  Heart,
  TrendingUp,
  CheckCircle2,
  Upload,
  Sparkles,
  FileCheck,
  ShieldCheck,
  GraduationCap,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '../components/ui/scroll-reveal';

export function CareersPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    hasExperience: '',
    yearsOfExperience: '',
    previousEmployer: '',
    availability: [] as string[],
    transportation: '',
    preferredAreas: '',
    hasCriminalRecord: '',
    criminalRecordDetails: '',
    reference1Name: '',
    reference1Phone: '',
    reference1Relationship: '',
    reference2Name: '',
    reference2Phone: '',
    reference2Relationship: '',
    hasInsurance: '',
    agreedToBackgroundCheck: false,
    agreedToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Pay',
      description: 'Earn $18-$30/hour plus tips and bonuses',
    },
    {
      icon: Calendar,
      title: 'Flexible Schedule',
      description: 'Choose your own hours and work days',
    },
    {
      icon: Award,
      title: 'Career Growth',
      description: 'Training programs and advancement opportunities',
    },
    {
      icon: Users,
      title: 'Supportive Team',
      description: 'Join a friendly and professional community',
    },
    {
      icon: TrendingUp,
      title: 'Performance Bonuses',
      description: 'Earn extra with our customer satisfaction bonuses',
    },
    {
      icon: Briefcase,
      title: 'Reliable Workload',
      description: 'Get consistent job bookings so you can count on steady income every week',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: checked
        ? [...prev.availability, day]
        : prev.availability.filter(d => d !== day),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Application submitted successfully! We\'ll be in touch soon.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        dateOfBirth: '',
        hasExperience: '',
        yearsOfExperience: '',
        previousEmployer: '',
        availability: [],
        transportation: '',
        preferredAreas: '',
        hasCriminalRecord: '',
        criminalRecordDetails: '',
        reference1Name: '',
        reference1Phone: '',
        reference1Relationship: '',
        reference2Name: '',
        reference2Phone: '',
        reference2Relationship: '',
        hasInsurance: '',
        agreedToBackgroundCheck: false,
        agreedToTerms: false,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal variant="fade-up" className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm">Join Our Team</span>
            </div>
            <h1 className="text-4xl md:text-6xl mb-6">
              Start Your Career with <span className="text-accent-300">Sparkleville</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-100 mb-8">
              Join a growing team of professional cleaners and build a rewarding career
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-300" />
                <span>Flexible Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-300" />
                <span>Great Pay</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-300" />
                <span>Career Growth</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Join Sparkleville?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We believe in supporting our team members with competitive benefits and a positive work environment
            </p>
          </ScrollReveal>

          <ScrollRevealStagger staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <ScrollRevealItem
                  key={index}
                  variant="scale"
                  className="bg-neutral-50 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-neutral-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl mb-2">{benefit.title}</h3>
                  <p className="text-neutral-600">{benefit.description}</p>
                </ScrollRevealItem>
              );
            })}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Requirements Section - NEW */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal variant="fade-up" className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 rounded-full px-4 py-2 mb-4">
                <FileCheck className="w-4 h-4" />
                <span className="text-sm">Onboarding Requirements</span>
              </div>
              <h2 className="text-3xl md:text-4xl mb-4">What You'll Need to Join</h2>
              <p className="text-lg text-neutral-600">
                Here's what our onboarding process includes to get you started
              </p>
            </ScrollReveal>

            <ScrollRevealStagger staggerDelay={0.2} className="grid md:grid-cols-2 gap-6">
              {/* Requirement 1 */}
              <ScrollRevealItem variant="fade-up" className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-secondary-300 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-3">Personal Information & Contact Details</h3>
                    <ul className="space-y-2 text-neutral-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Full legal name and contact information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Current address and valid phone number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Emergency contact details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Professional references (minimum 2)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollRevealItem>

              {/* Requirement 2 */}
              <ScrollRevealItem variant="fade-up" className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-secondary-300 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-3">Background Check & Verification</h3>
                    <ul className="space-y-2 text-neutral-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Criminal background check (required)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Identity verification documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Employment eligibility verification (I-9)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Reference checks and verification</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollRevealItem>

              {/* Requirement 3 */}
              <ScrollRevealItem variant="fade-up" className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-secondary-300 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-3">Skills Assessment & Training</h3>
                    <ul className="space-y-2 text-neutral-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Cleaning skills evaluation and assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Company standards and procedures training</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Safety protocols and best practices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Customer service excellence training</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollRevealItem>

              {/* Requirement 4 */}
              <ScrollRevealItem variant="fade-up" className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-secondary-300 transition-all hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-3">Document Upload & Compliance</h3>
                    <ul className="space-y-2 text-neutral-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Valid government-issued photo ID</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Social Security card or tax documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Bank account info for direct deposit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary-500 mt-1 flex-shrink-0" />
                        <span>Signed employment agreements and policies</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollRevealItem>
            </ScrollRevealStagger>

            {/* Additional Info Banner */}
            <ScrollReveal variant="fade-up" delay={0.4}>
              <div className="mt-8 bg-gradient-to-br from-secondary-50 to-accent-50 rounded-2xl p-6 border border-secondary-200">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Don't Have Everything Ready?</h3>
                    <p className="text-neutral-700 mb-3">
                      No problem! You can start your application now and submit additional documents during the onboarding process. 
                      We'll guide you through each step and let you know exactly what's needed.
                    </p>
                    <p className="text-sm text-neutral-600">
                      <strong>Estimated onboarding time:</strong> 7-10 business days from application submission to first assignment
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Apply Now Button */}
            <div className="mt-12 text-center">
              <Button 
                onClick={() => navigate('/apply')}
                className="bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Apply Now
              </Button>
              <p className="text-sm text-neutral-600 mt-4">
                You'll be taken to our secure application form
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Next Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal variant="fade-up" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4">What Happens Next?</h2>
              <p className="text-lg text-neutral-600">
                Here's what you can expect after submitting your application
              </p>
            </ScrollReveal>

            <ScrollRevealStagger staggerDelay={0.15} className="space-y-6">
              <ScrollRevealItem variant="fade-left" className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="text-xl mb-2">Application Review</h3>
                  <p className="text-neutral-600">
                    Our team will review your application within 2-3 business days
                  </p>
                </div>
              </ScrollRevealItem>

              <ScrollRevealItem variant="fade-left" className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-xl mb-2">Phone Interview</h3>
                  <p className="text-neutral-600">
                    If selected, we'll schedule a brief phone interview to get to know you better
                  </p>
                </div>
              </ScrollRevealItem>

              <ScrollRevealItem variant="fade-left" className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="text-xl mb-2">Background Check & Training</h3>
                  <p className="text-neutral-600">
                    We'll complete a background check and provide comprehensive training
                  </p>
                </div>
              </ScrollRevealItem>

              <ScrollRevealItem variant="fade-left" className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center">
                  4
                </div>
                <div>
                  <h3 className="text-xl mb-2">Welcome Aboard!</h3>
                  <p className="text-neutral-600">
                    Start your first assignment and begin your journey with Sparkleville
                  </p>
                </div>
              </ScrollRevealItem>
            </ScrollRevealStagger>
          </div>
        </div>
      </section>
    </div>
  );
}
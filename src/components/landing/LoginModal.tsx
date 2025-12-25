import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, Mail, Lock, AlertCircle, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';
import logo from '../../images/logo/Sparkleville1(2).png';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerLogin: () => void;
  onAdminLogin: () => void;
  onSupervisorLogin: () => void;
  onSupportLogin: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onCustomerLogin,
  onAdminLogin,
  onSupervisorLogin,
  onSupportLogin
}: LoginModalProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'admin' | 'cleaner'>('customer');
  const [activeTab, setActiveTab] = useState('login');

  const getRoleFromEmail = (email: string): 'admin' | 'supervisor' | 'support' | 'customer' => {
    const emailLower = email.toLowerCase();
    if (emailLower.includes('@admin.com')) return 'admin';
    if (emailLower.includes('@supervisor.com')) return 'supervisor';
    if (emailLower.includes('@support.com')) return 'support';
    return 'customer';
  };

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Determine user role based on email domain or response data if available
      // For now, we'll stick to the email domain logic as a fallback or primary check
      // depending on what the backend returns. The backend returns `user` object.
      // Let's use the backend role if available, otherwise fallback to email check.

      const role = data.user.role?.toLowerCase() || getRoleFromEmail(loginEmail);

      // Dispatch to Redux
      dispatch(setCredentials({
        user: data.user,
        token: data.token || 'dummy-token' // Ensure backend returns token or handle it
      }));

      // Route to appropriate dashboard based on role
      switch (role) {
        case 'admin':
          onAdminLogin();
          break;
        case 'supervisor':
          onSupervisorLogin();
          break;
        case 'support':
          onSupportLogin();
          break;
        default:
          onCustomerLogin();
      }

      // Reset form and close modal
      setLoginEmail('');
      setLoginPassword('');
      toast.success('Login successful!');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    // Check if signing up with admin/supervisor/support email (requires admin approval)
    const roleToCheck = getRoleFromEmail(signupEmail);
    if (roleToCheck !== 'customer') {
      const msg = `${roleToCheck.charAt(0).toUpperCase() + roleToCheck.slice(1)} accounts require admin approval. Please contact your administrator.`;
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: 'CUSTOMER', // Default role for signup
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Success - Switch to login tab
      toast.success('Account created successfully! Please login.');

      // Pre-fill login email
      setLoginEmail(signupEmail);

      // Reset signup form
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');

      // Switch to login tab
      setActiveTab('login');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[420px] max-h-[90vh] my-4 md:my-8 lg:my-12 p-0 border-0 shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-primary-600 to-accent-500 p-6 pb-8 flex-shrink-0">
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="Sparkleville Logo" className="h-16 w-auto" />
          </div>
          <DialogTitle className="text-center text-white text-2xl mb-1">Welcome Back!</DialogTitle>
          <DialogDescription className="text-center text-white/90 text-sm">
            Sign in to continue or create a new account
          </DialogDescription>
        </div>

        {/* Content Area - Scrollable */}
        <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-100 p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-6 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Use @admin.com, @supervisor.com, or @support.com for staff access
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-secondary-500 focus:ring-secondary-500" />
                    <span className="text-neutral-600 group-hover:text-neutral-900">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-secondary-500 hover:text-secondary-600 font-medium hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      const role = getRoleFromEmail(loginEmail);
                      setUserType(role === 'customer' ? 'customer' : 'admin');
                      setForgotPasswordOpen(true);
                      onClose();
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-secondary-500 focus:ring-secondary-500 mt-0.5" required />
                  <label className="text-xs text-neutral-600 leading-relaxed">
                    I agree to the <a href="#" className="text-secondary-500 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-secondary-500 hover:underline font-medium">Privacy Policy</a>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-neutral-500">OR</span>
                  </div>
                </div>

                {/* Gmail Signup Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-2 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={() => {
                    // Gmail OAuth would be implemented here
                    console.log('Gmail signup clicked');
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-neutral-700 font-medium">Sign up with Gmail</span>
                </Button>

                {/* Staff Account Note */}
                <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong className="font-semibold">Staff Access:</strong> Accounts with @admin.com, @supervisor.com, or @support.com domains require administrator approval.
                    </p>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        userType={userType}
      />
    </Dialog>
  );
}
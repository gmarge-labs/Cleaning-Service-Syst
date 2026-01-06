import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType?: 'customer' | 'admin' | 'cleaner';
}

export function ForgotPasswordModal({ 
  isOpen, 
  onClose,
  userType = 'customer'
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'code' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('code');
      toast.success('Reset code sent!', {
        description: 'Check your email for the 6-digit verification code.',
      });
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      if (resetCode === '123456' || resetCode.length === 6) {
        setStep('reset');
        toast.success('Code verified!', {
          description: 'You can now reset your password.',
        });
      } else {
        toast.error('Invalid code', {
          description: 'Please check the code and try again.',
        });
      }
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password too short', {
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      toast.success('Password reset successful!', {
        description: 'You can now sign in with your new password.',
      });
    }, 1500);
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'admin':
        return 'Admin';
      case 'cleaner':
        return 'Cleaner';
      default:
        return 'Customer';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-primary-600 to-accent-500 p-6 pb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-white text-2xl mb-1">
            {step === 'success' ? 'Password Reset!' : 'Forgot Password?'}
          </DialogTitle>
          <DialogDescription className="text-center text-white/90 text-sm">
            {step === 'email' && `Reset your ${getUserTypeLabel().toLowerCase()} account password`}
            {step === 'code' && 'Enter the verification code we sent you'}
            {step === 'reset' && 'Create a new secure password'}
            {step === 'success' && 'Your password has been successfully reset'}
          </DialogDescription>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 focus:ring-2 focus:ring-secondary-500"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  We'll send a 6-digit verification code to this email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
              </Button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="mt-6 space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Code sent to {email}
                    </p>
                    <p className="text-xs text-blue-700">
                      Check your email inbox and spam folder
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-code" className="text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-11 text-center text-2xl tracking-widest font-semibold focus:ring-2 focus:ring-secondary-500"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-neutral-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || resetCode.length !== 6}
                className="w-full h-11 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-secondary-500 hover:text-secondary-600 font-medium hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 focus:ring-2 focus:ring-secondary-500"
                  required
                />
                <p className="text-xs text-neutral-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 focus:ring-2 focus:ring-secondary-500"
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          newPassword.length >= 12
                            ? 'w-full bg-green-500'
                            : newPassword.length >= 8
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-1/3 bg-red-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`font-medium ${
                        newPassword.length >= 12
                          ? 'text-green-600'
                          : newPassword.length >= 8
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {newPassword.length >= 12
                        ? 'Strong'
                        : newPassword.length >= 8
                        ? 'Good'
                        : 'Weak'}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('code')}
                className="w-full flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Password Successfully Reset!
                </h3>
                <p className="text-sm text-neutral-600 max-w-sm">
                  Your password has been changed. You can now sign in with your new password.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full h-11 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Return to Sign In
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

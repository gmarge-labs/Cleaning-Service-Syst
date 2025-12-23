import { useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';

interface CleanerLoginProps {
  onLogin: () => void;
}

export function CleanerLogin({ onLogin }: CleanerLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('maria.garcia@Sparkleville.com');
  const [password, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-600 to-accent-500 p-6">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mt-12 mb-16">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-white" />
        </div>
        <div className="text-white">
          <div className="text-2xl font-bold">Sparkleville</div>
          <div className="text-sm text-white/80">Cleaner App</div>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome Back!</h1>
          <p className="text-neutral-600">Sign in to start your day</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="space-y-6 flex-1">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-neutral-900 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="h-12 text-base"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-neutral-900 mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 text-base pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-secondary-500 hover:text-secondary-600 font-medium"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-lg font-semibold mt-6"
          >
            Sign In
          </Button>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-secondary-50 rounded-xl">
            <p className="text-sm text-center text-secondary-900">
              <span className="font-semibold">Demo Mode:</span> Click "Sign In" to continue
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-white/80 text-sm">
        <p>Need help? Contact support</p>
        <p className="text-white/60 mt-2">© 2025 Sparkleville</p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        userType="cleaner"
      />
    </div>
  );
}
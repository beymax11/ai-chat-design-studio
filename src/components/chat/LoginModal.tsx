import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: 'Google login failed',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    } else {
      // Google OAuth will redirect, so we don't need to close modal here
      // The auth state change will handle the UI update
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      onOpenChange(false);
      setEmail('');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-w-[95vw] mx-4 p-0 overflow-hidden border-0 shadow-2xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative bg-background/80 backdrop-blur-xl">
          <div className="relative p-6 sm:p-10">
            <DialogHeader className="space-y-3 mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome Back
                </DialogTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <DialogDescription className="text-center text-base text-muted-foreground leading-relaxed">
                  Sign in to unlock advanced features, file uploads, and personalized AI assistance
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className={cn(
                    "w-full h-14 rounded-xl border-2 relative overflow-hidden group",
                    "hover:bg-accent/50 hover:border-primary/50 transition-all duration-300",
                    "flex items-center justify-center gap-3",
                    "text-base font-medium shadow-sm hover:shadow-md"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {googleLoading ? (
                    <motion.div
                      className="h-5 w-5 border-2 border-foreground/30 border-t-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                      <span className="relative">Continue with Google</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* OR Separator with Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">
                  Or continue with email
                </span>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input with Icon */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="login-email" className="text-sm font-medium text-foreground/90">
                  Email address
                </Label>
                <div className="relative group">
                  <Mail className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
                    emailFocused ? "text-primary" : "text-muted-foreground"
                  )} />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    disabled={loading || googleLoading}
                    className={cn(
                      "h-14 pl-12 pr-4 text-base rounded-xl",
                      "border-2 transition-all duration-300",
                      "focus:border-primary focus:ring-4 focus:ring-primary/10",
                      "hover:border-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "bg-background/50 backdrop-blur-sm"
                    )}
                  />
                  <AnimatePresence>
                    {emailFocused && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Password Input with Icon */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="login-password" className="text-sm font-medium text-foreground/90">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
                    passwordFocused ? "text-primary" : "text-muted-foreground"
                  )} />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    disabled={loading || googleLoading}
                    className={cn(
                      "h-14 pl-12 pr-12 text-base rounded-xl",
                      "border-2 transition-all duration-300",
                      "focus:border-primary focus:ring-4 focus:ring-primary/10",
                      "hover:border-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "bg-background/50 backdrop-blur-sm"
                    )}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || googleLoading}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2",
                      "text-muted-foreground hover:text-foreground transition-colors",
                      "disabled:opacity-50 p-1 rounded-lg hover:bg-accent/50"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    tabIndex={-1}
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div
                          key="eye-off"
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeOff className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye"
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <AnimatePresence>
                    {passwordFocused && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Submit Button with Gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <motion.div
                  whileHover={{ scale: loading || googleLoading ? 1 : 1.02 }}
                  whileTap={{ scale: loading || googleLoading ? 1 : 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading || googleLoading}
                    className={cn(
                      "w-full h-14 rounded-xl relative overflow-hidden group",
                      "bg-gradient-to-r from-primary via-primary to-primary/80",
                      "hover:shadow-lg hover:shadow-primary/25",
                      "text-primary-foreground font-semibold text-base",
                      "transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "border-0"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {loading ? (
                      <span className="flex items-center gap-3 relative z-10">
                        <motion.div
                          className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Signing you in...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-2">
                        Continue
                        <LogIn className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            {/* Footer Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-6 text-center text-xs text-muted-foreground"
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </motion.p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


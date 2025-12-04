import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmEmail } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No confirmation token provided');
      return;
    }

    const handleConfirmation = async () => {
      const { error, success } = await confirmEmail(token);

      if (error) {
        setStatus('error');
        setMessage(error.message || 'Failed to confirm email');
        toast({
          title: 'Confirmation failed',
          description: error.message || 'Failed to confirm email',
          variant: 'destructive',
        });
      } else if (success) {
        setStatus('success');
        setMessage('Your email has been confirmed successfully!');
        toast({
          title: 'Email confirmed',
          description: 'Your email address has been verified successfully.',
        });
      }
    };

    handleConfirmation();
  }, [searchParams, confirmEmail, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto"
            >
              {status === 'loading' && (
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              )}
              {status === 'success' && (
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              )}
              {status === 'error' && (
                <XCircle className="h-16 w-16 text-destructive mx-auto" />
              )}
            </motion.div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Confirming your email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
            <CardDescription className="text-base">
              {message || 'Please wait while we verify your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Your email address has been successfully verified. You can now use all features of ChatBox.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/')}
                  className="w-full"
                  size="lg"
                >
                  Go to Chat
                </Button>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">
                    {message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Go to Home
                  </Button>
                  <Button
                    onClick={() => {
                      const token = searchParams.get('token');
                      if (token) {
                        window.location.href = `/confirm-email?token=${token}`;
                      }
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
            {status === 'loading' && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Please wait...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ConfirmEmail;


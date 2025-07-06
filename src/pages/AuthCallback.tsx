import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check URL parameters and hash fragments for auth state
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const type = urlParams.get('type') || hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Auth callback - URL:', window.location.href);
        console.log('Auth callback - search:', window.location.search);
        console.log('Auth callback - hash:', window.location.hash);
        console.log('Auth callback - type:', type, 'has tokens:', !!accessToken);
        
        if (type === 'recovery' || (accessToken && type)) {
          // This is a password reset callback
          if (accessToken && refreshToken) {
            // Set the session from the tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Error setting session:', error);
              toast({
                title: "Authentication Error",
                description: "Invalid reset link. Please try requesting a new password reset.",
                variant: "destructive",
              });
              navigate('/auth');
              return;
            }
          }
          
          toast({
            title: "Reset Link Verified",
            description: "Please enter your new password.",
          });
          navigate('/auth?mode=update-password');
          return;
        }
        
        // Handle regular email confirmation
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: "There was an error confirming your email. Please try again.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          toast({
            title: "Email Confirmed!",
            description: "Your email has been confirmed successfully. Welcome to Quizly Prep!",
          });
          navigate('/dashboard');
        } else {
          // If no session, redirect to auth
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Confirming your email...</p>
      </div>
    </div>
  );
}

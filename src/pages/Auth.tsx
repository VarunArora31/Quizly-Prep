import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";

// Email validation utility
const validateEmail = (email: string) => {
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email format. Please use format: user@example.com" };
  }

  // Check for common typos in popular domains FIRST
  const domain = email.split('@')[1]?.toLowerCase();
  const commonTypos = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmali.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmali.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };

  if (domain && commonTypos[domain]) {
    return { 
      isValid: false, 
      message: `Did you mean ${email.replace(domain, commonTypos[domain])}?`,
      suggestion: email.replace(domain, commonTypos[domain])
    };
  }

  // Common invalid patterns (checked after typos)
  const invalidPatterns = [
    { pattern: /^[^@]*@[^@]*\.(test|local|invalid|example)$/i, message: "Test domains are not allowed" },
    { pattern: /^[^@]*@[^@]*\.(.)$/, message: "Domain extension too short" },
    { pattern: /^[^@]*@[^@]*\..{10,}$/, message: "Domain extension too long" },
    { pattern: /\.\./, message: "Email contains consecutive dots" },
    { pattern: /^\.|\.$/, message: "Email cannot start or end with a dot" },
    { pattern: /@\./, message: "Invalid format: @ cannot be followed by a dot" },
    { pattern: /\.@/, message: "Invalid format: dot cannot be followed by @" },
  ];

  for (const { pattern, message } of invalidPatterns) {
    if (pattern.test(email)) {
      return { isValid: false, message };
    }
  }

  return { isValid: true, message: "" };
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUpdatePasswordMode = searchParams.get('mode') === 'update-password';

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email Address",
        description: emailValidation.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Provide appropriate feedback based on response
      if (data.user && data.user.email_confirmed_at) {
        // User was created and auto-confirmed
        toast({
          title: "Account Created!",
          description: "Your account has been created and confirmed successfully.",
        });
      } else if (data.user && !data.session) {
        // User was created but needs email confirmation
        toast({
          title: "Account Created!",
          description: `A confirmation email has been sent to ${email}. Please check your email (including spam folder) and click the confirmation link to activate your account.`,
        });
      } else if (data.user && data.session) {
        // User was created and signed in
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully. You are now signed in.",
        });
        navigate("/");
      } else {
        // Fallback message
        toast({
          title: "Sign Up Submitted",
          description: "If the email address is valid, you will receive a confirmation email shortly.",
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Sign Up Failed";
      
      // Handle specific Supabase error cases
      if (error.message.includes('User already registered')) {
        errorTitle = "Account Already Exists";
        errorMessage = "An account with this email already exists. Please sign in instead or use a different email address.";
      } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorTitle = "Account Already Exists";
        errorMessage = "This email is already registered. Please sign in instead or use a different email address.";
      } else if (error.message.includes('Invalid email')) {
        errorTitle = "Invalid Email Format";
        errorMessage = "Please enter a valid email address (e.g., user@example.com).";
      } else if (error.message.includes('Password should be at least')) {
        errorTitle = "Password Too Short";
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message.includes('weak password') || error.message.includes('password is too weak')) {
        errorTitle = "Weak Password";
        errorMessage = "Please choose a stronger password with a mix of letters, numbers, and special characters.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorTitle = "Invalid Credentials";
        errorMessage = "Invalid email or password format. Please check your input and try again.";
      } else if (error.message.includes('SMTP') || (error.message.includes('email') && error.message.includes('Error'))) {
        errorTitle = "Email Service Error";
        errorMessage = "There's an issue with our email service. Please try again later or contact support.";
      } else if (error.message.includes('rate limit')) {
        errorTitle = "Too Many Attempts";
        errorMessage = "Too many sign-up attempts. Please wait a few minutes before trying again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Email Address",
        description: emailValidation.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      navigate("/");
    } catch (error: any) {
      console.error('Signin error:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Sign In Failed";
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        errorTitle = "Invalid Credentials";
        errorMessage = "The email or password you entered is incorrect. Please check your credentials and try again.";
      } else if (error.message.includes('Email not confirmed')) {
        errorTitle = "Email Not Confirmed";
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('User not found')) {
        errorTitle = "Account Not Found";
        errorMessage = "No account found with this email address. Please sign up first.";
      } else if (error.message.includes('Too many requests')) {
        errorTitle = "Too Many Attempts";
        errorMessage = "Too many failed sign-in attempts. Please wait a few minutes before trying again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setUpdateLoading(true);
    
    try {
      // Check if user has a valid session for password reset
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("Session expired. Please request a new password reset link.");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully updated. You can now sign in with your new password.",
      });
      
      // Sign out after password reset to ensure fresh login
      await supabase.auth.signOut();
      
      // Clear form
      setNewPassword("");
      setConfirmPassword("");
      
      // Redirect to sign in
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (isUpdatePasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Quizly Prep</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Please enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput
                    id="new-password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updateLoading}>
                  {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Quizly Prep</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <PasswordInput
                      id="signin-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <PasswordInput
                      id="signup-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
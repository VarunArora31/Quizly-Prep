import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Email validation utility (copied from Auth.tsx)
const validateEmail = (email: string) => {
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email format. Please use format: user@example.com" };
  }

  // Common invalid patterns
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

  // Check for common typos in popular domains
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

  return { isValid: true, message: "" };
};

export function AuthErrorTest() {
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testScenarios = [
    {
      name: "Gmail Typo",
      email: "wrong@gmai.com",
      password: "test123456",
      description: "Should suggest gmail.com"
    },
    {
      name: "Test Domain",
      email: "test@test.test",
      password: "test123456",
      description: "Should block test domain"
    },
    {
      name: "Double Dots",
      email: "user..name@domain.com",
      password: "test123456",
      description: "Should catch consecutive dots"
    },
    {
      name: "Short Password",
      email: "test@example.com",
      password: "123",
      description: "Should require 6+ characters"
    },
    {
      name: "Invalid Format",
      email: "invalid-email",
      password: "test123456",
      description: "Should catch malformed email"
    },
    {
      name: "Empty Fields",
      email: "",
      password: "",
      description: "Should require all fields"
    }
  ];

  const runTest = async (scenario: typeof testScenarios[0]) => {
    setLoading(true);
    setTestEmail(scenario.email);
    setTestPassword(scenario.password);

    // Use the same validation logic as in Auth.tsx
    if (!scenario.email || !scenario.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Enhanced email validation
    const emailValidation = validateEmail(scenario.email);
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
    if (scenario.password.length < 6) {
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
        email: scenario.email,
        password: scenario.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast({
          title: "Check Your Email!",
          description: "We've sent you a confirmation link. Please check your email (including spam folder) and click the link to activate your account.",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully. Please check your email for the confirmation link.",
        });
      }
    } catch (error: any) {
      console.error('Test signup error:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Sign Up Failed";
      
      if (error.message.includes('User already registered')) {
        errorTitle = "Account Already Exists";
        errorMessage = "An account with this email already exists. Please sign in instead or use a different email address.";
      } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorTitle = "Account Already Exists";
        errorMessage = "This email is already registered. Please sign in instead or use a different email address.";
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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Error Testing</CardTitle>
          <CardDescription>
            Test different error scenarios to see improved error messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold text-sm mb-2">{scenario.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
                <div className="space-y-2 mb-3">
                  <div>
                    <Label className="text-xs">Email:</Label>
                    <div className="text-xs font-mono bg-muted p-1 rounded">
                      {scenario.email || "(empty)"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Password:</Label>
                    <div className="text-xs font-mono bg-muted p-1 rounded">
                      {scenario.password || "(empty)"}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => runTest(scenario)} 
                  size="sm" 
                  className="w-full"
                  disabled={loading}
                >
                  Test Scenario
                </Button>
              </Card>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Custom Test</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="custom-email">Email</Label>
                <Input
                  id="custom-email"
                  type="email"
                  placeholder="Enter test email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="custom-password">Password</Label>
                <Input
                  id="custom-password"
                  type="password"
                  placeholder="Enter test password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => runTest({ name: "Custom", email: testEmail, password: testPassword, description: "Custom test" })}
                disabled={loading}
                className="w-full"
              >
                Test Custom Values
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

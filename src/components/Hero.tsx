import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5" />
      
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-16 sm:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                Master Your{" "}
                <span className="heading-gradient">
                  Interview Skills
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Upload your resume and get personalized technical interview questions 
                tailored to your skills. Practice with AI-generated quizzes and ace 
                your next interview.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-hero" onClick={handleGetStarted}>
                {user ? "Go to Dashboard" : "Get Started Free"}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8">
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">10k+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Questions Generated</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-success">95%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-warning">50+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Tech Skills Covered</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-bounce-in order-first lg:order-last">
            <img 
              src={heroImage} 
              alt="Quizly Prep Platform Preview"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            
            {/* Floating Cards - Hidden on small screens to avoid clutter */}
            <Card className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 p-2 sm:p-4 bg-card/90 backdrop-blur-sm animate-bounce-in hidden sm:block">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Upload Resume</span>
              </div>
            </Card>
            
            <Card className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 p-2 sm:p-4 bg-card/90 backdrop-blur-sm animate-bounce-in hidden sm:block" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                <span className="text-xs sm:text-sm font-medium">Personalized Quizzes</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Preview - Hidden on mobile for cleaner design */}
      <div className="absolute bottom-8 sm:bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <Card className="skill-card text-center p-4 lg:p-6">
            <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-primary mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold mb-1 lg:mb-2 text-sm lg:text-base">Upload & Parse</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Drag & drop your resume. We'll extract your skills automatically.
            </p>
          </Card>
          
          <Card className="skill-card text-center p-4 lg:p-6">
            <Target className="w-6 h-6 lg:w-8 lg:h-8 text-warning mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold mb-1 lg:mb-2 text-sm lg:text-base">Generate Quizzes</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              AI creates personalized questions based on your experience.
            </p>
          </Card>
          
          <Card className="skill-card text-center p-4 lg:p-6">
            <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-success mx-auto mb-2 lg:mb-3" />
            <h3 className="font-semibold mb-1 lg:mb-2 text-sm lg:text-base">Track Progress</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Monitor your improvement and identify weak areas.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
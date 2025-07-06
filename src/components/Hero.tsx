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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-primary-accent/6" />
      <div className="absolute inset-0 bg-gradient-to-tr from-success/4 via-transparent to-warning/4" />
      
      {/* Hero Content */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-4 py-12 sm:py-16 lg:py-20 relative z-10 flex-1 flex items-center">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-slide-up">
                <span className="animate-text-focus">Master{" "}</span>
                <span className="heading-gradient animate-typewriter-complete">
                  Your Interview Skills
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 animate-slide-up stagger-2 leading-relaxed">
                Upload your resume and get personalized technical interview questions 
                tailored to your skills. Practice with AI-generated quizzes and ace 
                your next interview.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-3">
              <Button className="btn-hero button-ripple hover-lift" onClick={handleGetStarted}>
                {user ? "Go to Dashboard" : "Get Started Free"}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 pt-4 sm:pt-6 lg:pt-8">
              <div className="text-center animate-scale-in stagger-4 hover-lift p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-primary animate-bounce-subtle">10k+</div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  <span className="hidden sm:inline">Questions Generated</span>
                  <span className="sm:hidden">Questions</span>
                </div>
              </div>
              <div className="text-center animate-scale-in stagger-5 hover-lift p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-success animate-bounce-subtle">95%</div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  <span className="hidden sm:inline">Success Rate</span>
                  <span className="sm:hidden">Success</span>
                </div>
              </div>
              <div className="text-center animate-scale-in stagger-6 hover-lift p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-warning animate-bounce-subtle">50+</div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  <span className="hidden sm:inline">Tech Skills Covered</span>
                  <span className="sm:hidden">Skills</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-zoom-in order-first lg:order-last">
            <img 
              src={heroImage} 
              alt="Quizly Prep Platform Preview"
              className="w-full h-auto rounded-2xl shadow-2xl hover-tilt transition-all duration-500"
            />
            
            {/* Floating Cards - Hidden on small screens to avoid clutter */}
            <Card className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 p-2 sm:p-4 bg-card/90 backdrop-blur-sm animate-slide-down floating-animation hidden sm:block hover-glow">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-bounce-subtle" />
                <span className="text-xs sm:text-sm font-medium">Upload Resume</span>
              </div>
            </Card>
            
            <Card className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 p-2 sm:p-4 bg-card/90 backdrop-blur-sm animate-slide-up floating-animation hidden sm:block hover-glow" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success animate-spin-slow" />
                <span className="text-xs sm:text-sm font-medium">Personalized Quizzes</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Preview - Responsive for all devices */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-4 mt-8 sm:mt-12 lg:mt-16 xl:mt-20 relative z-10">
        <div className="grid grid-cols-1 tablet-grid md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
          <Card className="skill-card text-center p-3 sm:p-4 lg:p-6 animate-slide-up stagger-1 hover-lift card-mobile">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary mx-auto mb-2 lg:mb-3 animate-bounce-subtle" />
            <h3 className="font-semibold mb-1 lg:mb-2 text-xs sm:text-sm lg:text-base">Upload & Parse</h3>
            <p className="text-xs sm:text-xs lg:text-sm text-muted-foreground leading-tight">
              <span className="hidden sm:inline">Drag & drop your resume. We'll extract your skills automatically.</span>
              <span className="sm:hidden">Upload resume, extract skills automatically.</span>
            </p>
          </Card>
          
          <Card className="skill-card text-center p-3 sm:p-4 lg:p-6 animate-slide-up stagger-2 hover-lift card-mobile">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-warning mx-auto mb-2 lg:mb-3 animate-spin-slow" />
            <h3 className="font-semibold mb-1 lg:mb-2 text-xs sm:text-sm lg:text-base">Generate Quizzes</h3>
            <p className="text-xs sm:text-xs lg:text-sm text-muted-foreground leading-tight">
              <span className="hidden sm:inline">AI creates personalized questions based on your experience.</span>
              <span className="sm:hidden">AI creates personalized questions.</span>
            </p>
          </Card>
          
          <Card className="skill-card text-center p-3 sm:p-4 lg:p-6 animate-slide-up stagger-3 hover-lift card-mobile md:col-span-1">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-success mx-auto mb-2 lg:mb-3 animate-bounce-subtle" />
            <h3 className="font-semibold mb-1 lg:mb-2 text-xs sm:text-sm lg:text-base">Track Progress</h3>
            <p className="text-xs sm:text-xs lg:text-sm text-muted-foreground leading-tight">
              <span className="hidden sm:inline">Monitor your improvement and identify weak areas.</span>
              <span className="sm:hidden">Track improvement and weak areas.</span>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
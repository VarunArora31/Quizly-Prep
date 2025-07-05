import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ResumeUpload } from "@/components/ResumeUpload";

const Index = () => {
  const handleUploadComplete = (skills: string[]) => {
    console.log("Skills extracted:", skills);
    // In a full app, this would navigate to quiz generation or dashboard
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ResumeUpload onUploadComplete={handleUploadComplete} />
        
        {/* Coming Soon Sections */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 gradient-text">
              More Features Coming Soon
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="skill-card">
                <h3 className="font-semibold mb-2">Quiz Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Track your progress and view detailed analytics
                </p>
              </div>
              <div className="skill-card">
                <h3 className="font-semibold mb-2">AI-Powered Questions</h3>
                <p className="text-muted-foreground text-sm">
                  Personalized questions based on your skill level
                </p>
              </div>
              <div className="skill-card">
                <h3 className="font-semibold mb-2">Performance Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Identify strengths and areas for improvement
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

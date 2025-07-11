import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Trophy, BookOpen, Upload, Clock } from "lucide-react";
import { Quiz } from "@/components/Quiz";

interface QuizData {
  id: string;
  title: string;
  skills: string[];
  score: number | null;
  total_questions: number;
  completed_at: string | null;
  created_at: string;
  questions: any;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);

  const startQuiz = (quiz: QuizData) => {
    setCurrentQuiz(quiz);
  };

  const handleQuizComplete = async (score: number, answers: string[]) => {
    if (!currentQuiz) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          completed_at: new Date().toISOString(), 
          score
        })
        .eq('id', currentQuiz.id);

      if (error) throw error;

      toast({
        title: "Quiz completed!",
        description: `You scored ${score}/${currentQuiz.total_questions} (${Math.round((score / currentQuiz.total_questions) * 100)}%)`,
      });

      // Refresh quizzes and go back to dashboard
      setCurrentQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "There was an issue saving your quiz results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    setCurrentQuiz(null);
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If currently taking a quiz, show the quiz component
  if (currentQuiz) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <Quiz 
            quiz={currentQuiz} 
            onQuizComplete={handleQuizComplete} 
            onBack={handleBackToDashboard}
          />
        </main>
      </div>
    );
  }

  const completedQuizzes = quizzes.filter(q => q.completed_at && q.score !== null);
  const averageScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((acc, quiz) => acc + ((quiz.score || 0) / quiz.total_questions * 100), 0) / completedQuizzes.length)
    : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 leading-tight">
            Welcome back, <br className="sm:hidden" /><span className="gradient-text">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Track your progress and improve your interview skills
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 large-mobile-grid sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="card-mobile hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{quizzes.length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-mobile hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-success">{completedQuizzes.length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-mobile hover-lift large-mobile-grid md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-warning">{averageScore}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button 
            onClick={() => navigate("/")} 
            className="flex items-center justify-center gap-2 text-sm sm:text-base touch-target button-ripple hover-lift"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload New Resume</span>
            <span className="sm:hidden">Upload Resume</span>
          </Button>
        </div>

        {/* Quizzes List */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Your Quizzes</h2>
          
          {loadingQuizzes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <Card className="card-mobile">
              <CardContent className="text-center py-6 sm:py-8 p-4 sm:p-6">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No quizzes yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
                  Upload your resume to generate your first personalized quiz
                </p>
                <Button 
                  onClick={() => navigate("/")} 
                  className="text-sm sm:text-base touch-target button-ripple"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {quizzes.map((quiz) => (
              <Card key={quiz.id} className="card-mobile hover-lift">
                  <CardHeader className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <CardTitle className="text-sm sm:text-base lg:text-lg leading-tight flex-1">{quiz.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {quiz.completed_at ? (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(((quiz.score || 0) / quiz.total_questions) * 100)}% Score
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">In Progress</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </span>
                        <span>{quiz.total_questions} questions</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3 lg:mb-4 max-h-20 overflow-y-auto mobile-scroll">
                      {quiz.skills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {quiz.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">+{quiz.skills.length - 6}</Badge>
                      )}
                    </div>
                    {!quiz.completed_at && (
                      <Button 
                        size="sm" 
                        onClick={() => startQuiz(quiz)} 
                        className="text-xs sm:text-sm touch-target button-ripple w-full sm:w-auto"
                      >
                        Take Quiz
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
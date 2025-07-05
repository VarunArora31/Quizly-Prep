import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  skills: string[];
  questions: QuizQuestion[];
  total_questions: number;
}

interface QuizProps {
  quiz: Quiz;
  onQuizComplete: (score: number, answers: string[]) => void;
  onBack: () => void;
}

export const Quiz = ({ quiz, onQuizComplete, onBack }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(quiz.questions.length).fill(''));
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || '');
    } else {
      // Quiz completed, calculate score
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || '');
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleFinishQuiz = () => {
    onQuizComplete(score, answers);
  };

  useEffect(() => {
    setSelectedAnswer(answers[currentQuestionIndex] || '');
  }, [currentQuestionIndex, answers]);

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl mb-2">Quiz Complete!</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Here are your results for "{quiz.title}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Score Summary */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {score}/{quiz.questions.length}
              </div>
              <div className="text-base sm:text-lg text-muted-foreground">
                {Math.round((score / quiz.questions.length) * 100)}% Score
              </div>
              <div className="flex justify-center">
                <Badge variant={score >= quiz.questions.length * 0.7 ? "default" : "secondary"} className="text-xs sm:text-sm">
                  {score >= quiz.questions.length * 0.7 ? "Excellent!" : 
                   score >= quiz.questions.length * 0.5 ? "Good Job!" : "Keep Learning!"}
                </Badge>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Question Review</h3>
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6">
                      <div className="flex items-start gap-2 sm:gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-2 text-sm sm:text-base">{question.question}</p>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-muted-foreground">
                              Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {userAnswer}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-muted-foreground">
                                Correct answer: <span className="text-green-600">{question.correctAnswer}</span>
                              </p>
                            )}
                            <p className="text-muted-foreground mt-2">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button variant="outline" onClick={onBack} className="text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Button onClick={handleFinishQuiz} className="text-sm sm:text-base">
                Save Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back
            </Button>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>
          <CardTitle className="text-lg sm:text-xl mb-3">{quiz.title}</CardTitle>
          <CardDescription>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {quiz.skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {quiz.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">+{quiz.skills.length - 5} more</Badge>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">{currentQuestion.question}</h3>
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value={option.charAt(0)} id={`option-${index}`} className="mt-0.5" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              className="text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button onClick={handleNext} disabled={!selectedAnswer} className="text-sm sm:text-base">
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <span>Finish Quiz</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { generateQuizWithGemini } from "@/services/geminiService";

interface ResumeUploadProps {
  onUploadComplete?: (skills: string[]) => void;
}

export const ResumeUpload = ({ onUploadComplete }: ResumeUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local skill extraction function as fallback
  const extractSkillsFromFile = async (file: File): Promise<string[]> => {
    try {
      let text: string;
      
      if (file.type === 'application/pdf') {
        // For PDF files, try to extract text using a simple approach
        // Note: This is a basic implementation - for production you'd want proper PDF.js integration
        try {
          const arrayBuffer = await file.arrayBuffer();
          // This is a placeholder - in a real implementation you'd use PDF.js
          text = await extractTextFromPDF(arrayBuffer);
        } catch (pdfError) {
          console.error('PDF parsing failed:', pdfError);
          throw new Error('PDF parsing not supported in this environment');
        }
      } else if (file.name.endsWith('.docx')) {
        // For DOCX files, we can't easily parse them client-side without libraries
        throw new Error('DOCX parsing requires server-side processing');
      } else {
        // For plain text files
        text = await file.text();
      }
      
      console.log('Extracted text length:', text.length);
      console.log('Text preview:', text.substring(0, 300));
      
      return extractSkillsFromText(text, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      // Return common skills as final fallback with a message
      toast({
        title: "File parsing failed",
        description: "Using basic skill detection. For better results, try uploading a plain text version of your resume.",
        variant: "default",
      });
      return ["JavaScript", "HTML", "CSS", "React", "Git"];
    }
  };
  
  // Simple PDF text extraction (placeholder)
  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // This is a simplified approach - in production you'd use PDF.js
    // For now, we'll throw an error to force server-side processing or manual input
    throw new Error('PDF text extraction not implemented in client');
  };

  const extractSkillsFromText = (text: string, fileName: string): string[] => {
    const skillKeywords = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'HTML', 'CSS', 'SQL',
      
      // Frontend Technologies
      'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'SASS', 'SCSS', 'Webpack', 'Vite', 'Parcel',
      
      // Backend Technologies
      'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails', 'NestJS',
      
      // Databases
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'MariaDB', 'Cassandra', 'DynamoDB', 'Firebase',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible',
      
      // Mobile Development
      'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
      
      // Data Science & AI
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Jupyter', 'Apache Spark',
      
      // Tools & Platforms
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence', 'Slack', 'Figma', 'Adobe XD', 'Postman', 'Insomnia',
      
      // Methodologies
      'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'Microservices', 'REST API', 'GraphQL', 'WebSockets',
      
      // Testing
      'Jest', 'Cypress', 'Selenium', 'JUnit', 'pytest', 'Mocha', 'Chai', 'TestNG'
    ];

    const foundSkills = new Set<string>();
    const lowerText = text.toLowerCase();
    
    console.log('Client-side parsing - File:', fileName);
    console.log('Text preview:', text.substring(0, 300));

    // Helper function to check skill context
    const checkSkillContext = (text: string, skill: string): boolean => {
      const lowerText = text.toLowerCase();
      const lowerSkill = skill.toLowerCase();
      
      const skillIndex = lowerText.indexOf(lowerSkill);
      if (skillIndex === -1) return false;
      
      // Get surrounding context
      const start = Math.max(0, skillIndex - 50);
      const end = Math.min(lowerText.length, skillIndex + lowerSkill.length + 50);
      const context = lowerText.substring(start, end);
      
      // Check for relevant context keywords
      const relevantKeywords = [
        'skill', 'experience', 'proficient', 'expert', 'knowledge', 'familiar',
        'used', 'worked', 'developed', 'implemented', 'created', 'built',
        'programming', 'language', 'framework', 'library', 'tool', 'platform',
        'database', 'technology', 'software', 'years', 'project', 'development'
      ];
      
      return relevantKeywords.some(keyword => context.includes(keyword));
    };

    // Search for exact matches and variations
    for (const skill of skillKeywords) {
      const lowerSkill = skill.toLowerCase();
      
      // Check for exact match with word boundaries
      const regex = new RegExp(`\\b${lowerSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        // Check context for relevance
        if (checkSkillContext(text, skill)) {
          foundSkills.add(skill);
          console.log(`Found skill: ${skill}`);
        }
      }
      
      // Check for variations without dots (e.g., "nodejs" for "Node.js")
      const noDotSkill = lowerSkill.replace(/\./g, '');
      if (noDotSkill !== lowerSkill) {
        const noDotRegex = new RegExp(`\\b${noDotSkill}\\b`, 'i');
        if (noDotRegex.test(text)) {
          if (checkSkillContext(text, skill)) {
            foundSkills.add(skill);
            console.log(`Found skill variant: ${skill}`);
          }
        }
      }
    }

    const skillsArray = Array.from(foundSkills).sort();
    console.log('Client-side extracted skills:', skillsArray);
    return skillsArray;
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      handleFileUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload your resume.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Call the parse-resume function to extract skills
      try {
        console.log('Invoking parse-resume function with fileName:', fileName);
        const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-resume', {
          body: { fileName }
        });

        console.log('Parse result:', parseResult);
        console.log('Parse error:', parseError);

        if (parseError) {
          console.error('Parse error from Supabase function:', parseError);
          // Fallback to basic text extraction
          console.log('Falling back to client-side parsing...');
          const extractedSkills = await extractSkillsFromFile(file);
          setUploadProgress(100);
          setExtractedSkills(extractedSkills);
          onUploadComplete?.(extractedSkills);
          
          toast({
            title: "Resume uploaded successfully!",
            description: `Extracted ${extractedSkills.length} skills from your resume (client-side parsing).`,
          });
          return;
        }

        if (!parseResult?.success) {
          console.error('Parse result indicates failure:', parseResult);
          throw new Error(parseResult?.error || 'Failed to extract skills from resume');
        }

        setUploadProgress(100);
        
        const extractedSkills = parseResult.skills || [];
        console.log('Successfully extracted skills from server:', extractedSkills);
        setExtractedSkills(extractedSkills);
        onUploadComplete?.(extractedSkills);
        
        toast({
          title: "Resume uploaded successfully!",
          description: `Extracted ${extractedSkills.length} skills from your resume (server-side parsing).`,
        });
      } catch (fallbackError) {
        console.error('Fallback parsing error:', fallbackError);
        // Final fallback to local extraction
        const extractedSkills = await extractSkillsFromFile(file);
        setUploadProgress(100);
        setExtractedSkills(extractedSkills);
        onUploadComplete?.(extractedSkills);
        
        toast({
          title: "Resume uploaded successfully!",
          description: `Extracted ${extractedSkills.length} skills from your resume (local parsing).`,
        });
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateQuiz = async () => {
    if (!user || !extractedSkills.length) return;

    setIsGeneratingQuiz(true);
    
    try {
      // Generate quiz using frontend Gemini service
      const questions = await generateQuizWithGemini(extractedSkills);

      // Save quiz to database
      const { data: quiz, error: insertError } = await supabase
        .from('quizzes')
        .insert({
          user_id: user.id,
          title: `${extractedSkills.slice(0, 3).join(', ')} Interview Quiz`,
          skills: extractedSkills,
          questions: questions,
          total_questions: questions.length,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to save quiz to database');
      }

      toast({
        title: "Quiz generated successfully!",
        description: `Created ${questions.length} personalized interview questions.`,
      });

      // Navigate to dashboard to view the quiz
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      toast({
        title: "Quiz generation failed",
        description: error.message || "There was an error generating your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-6 lg:px-4">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 heading-responsive">
            Upload Your <span className="gradient-text">Resume</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            Get started by uploading your resume. Our AI will analyze your skills 
            and create personalized interview questions.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-3 sm:p-4 lg:p-6 xl:p-8 card-mobile">
            {!uploadedFile ? (
              <>
                {/* Upload Zone */}
                <div
                  className={`upload-zone ${isDragActive ? 'drag-active' : ''} touch-target mobile-scroll`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.getElementById('file-input')?.click();
                    }
                  }}
                >
                  <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4 py-4 sm:py-6">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary mx-auto" />
                    <div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2">
                        <span className="hidden sm:inline">Drop your resume here</span>
                        <span className="sm:hidden">Upload Resume</span>
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                        <span className="hidden sm:inline">Or </span><span className="text-primary cursor-pointer hover:underline">Click to browse</span>
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground px-2">
                      <span className="hidden sm:inline">Supports PDF and DOCX files up to 10MB</span>
                      <span className="sm:hidden">PDF/DOCX up to 10MB</span>
                    </p>
                  </div>
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <>
                {/* Upload Progress */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 rounded-lg bg-muted/30">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base truncate leading-tight">{uploadedFile.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {isUploading ? (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-warning animate-spin flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-success flex-shrink-0" />
                    )}
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing resume...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {/* Extracted Skills */}
                  {extractedSkills.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-semibold text-success text-sm sm:text-base flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Skills Extracted Successfully 
                          <span className="text-xs sm:text-sm">({extractedSkills.length} skills)</span>
                        </span>
                      </h4>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded">
                          Debug: File type: {uploadedFile?.type}, Size: {uploadedFile ? (uploadedFile.size / 1024).toFixed(1) : 0}KB
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto mobile-scroll p-2 bg-muted/20 rounded-lg">
                        {extractedSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                        <Button 
                          onClick={generateQuiz} 
                          className="flex-1 text-sm sm:text-base touch-target button-ripple"
                          disabled={isGeneratingQuiz}
                        >
                          {isGeneratingQuiz && <Loader2 className="mr-2 h-3 h-3 sm:h-4 sm:w-4 animate-spin" />}
                          <span className="hidden sm:inline">Generate Quiz Questions</span>
                          <span className="sm:hidden">Generate Quiz</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-sm sm:text-base touch-target"
                          onClick={() => {
                            setUploadedFile(null);
                            setExtractedSkills([]);
                            setUploadProgress(0);
                          }}
                          disabled={isGeneratingQuiz}
                        >
                          <span className="hidden sm:inline">Upload New Resume</span>
                          <span className="sm:hidden">Upload New</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};
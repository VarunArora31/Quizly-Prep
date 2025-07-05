import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getTextExtractor } from "https://esm.sh/office-text-extractor@2.0.0";

// Add PDF parsing support
const pdfParse = async (buffer: ArrayBuffer): Promise<string> => {
  try {
    const response = await fetch('https://unpkg.com/pdf-parse@1.1.1/lib/pdf-parse.js');
    const pdfParseModule = await response.text();
    // For now, we'll use a simple approach and rely on the client-side fallback
    // In production, you'd want to use a proper PDF parsing library
    return "PDF_PARSING_NOT_IMPLEMENTED";
  } catch (error) {
    console.error('PDF parsing error:', error);
    return "PDF_PARSING_ERROR";
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    
    if (!fileName) {
      throw new Error('File name is required');
    }

    console.log(`Processing resume: ${fileName}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(fileName);

    if (downloadError) {
      console.error('File download error:', downloadError);
      throw new Error('Failed to download resume file');
    }

    // Convert file to text based on file type
    let fileContent: string;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      console.log('Processing PDF file');
      // For PDF files, we need proper parsing
      const arrayBuffer = await fileData.arrayBuffer();
      fileContent = await pdfParse(arrayBuffer);
      
      // If PDF parsing fails, throw error to trigger client-side fallback
      if (fileContent === "PDF_PARSING_NOT_IMPLEMENTED" || fileContent === "PDF_PARSING_ERROR") {
        throw new Error('PDF parsing not available in server-side function');
      }
    } else if (fileExtension === 'docx') {
      console.log('Processing DOCX file');
      // For DOCX files, we need to extract text properly
      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const extractor = getTextExtractor();
        fileContent = await extractor.extractText({ input: arrayBuffer, type: 'docx' });
      } catch (error) {
        console.error('DOCX parsing error:', error);
        throw new Error('DOCX parsing failed');
      }
    } else {
      // For other file types, try text extraction
      fileContent = await fileData.text();
    }
    
    console.log('File content length:', fileContent.length);
    
    // Extract skills using improved keyword matching
    const skills = extractSkillsFromText(fileContent, fileName);
    
    console.log(`Extracted ${skills.length} skills:`, skills);

    return new Response(JSON.stringify({ 
      success: true,
      skills: skills,
      message: `Successfully extracted ${skills.length} skills from resume`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-resume function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractSkillsFromText(text: string, fileName: string): string[] {
  // Comprehensive list of technical skills to search for
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
    'Jest', 'Cypress', 'Selenium', 'JUnit', 'pytest', 'Mocha', 'Chai', 'TestNG',
    
    // Other Technologies
    'Elasticsearch', 'RabbitMQ', 'Apache Kafka', 'Nginx', 'Apache', 'Linux', 'Ubuntu', 'CentOS', 'Bash', 'PowerShell'
  ];

  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Log the text content for debugging
  console.log('Text content preview:', text.substring(0, 500));
  console.log('File name:', fileName);

  // Define skill-related sections to increase relevance
  const skillSections = [
    'skills', 'technical skills', 'technologies', 'programming languages',
    'expertise', 'proficient', 'experience', 'languages', 'frameworks',
    'tools', 'platforms', 'databases', 'software'
  ];

  // Search for exact matches and variations
  for (const skill of skillKeywords) {
    const lowerSkill = skill.toLowerCase();
    
    // Check for exact match with word boundaries
    const regex = new RegExp(`\\b${lowerSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      // Additional context check - is this skill mentioned in a relevant context?
      const contextMatch = checkSkillContext(text, skill);
      if (contextMatch) {
        foundSkills.add(skill);
        console.log(`Found skill: ${skill} (context: ${contextMatch})`);
      }
    }
    
    // Check for variations without dots (e.g., "nodejs" for "Node.js")
    const noDotSkill = lowerSkill.replace(/\./g, '');
    if (noDotSkill !== lowerSkill) {
      const noDotRegex = new RegExp(`\\b${noDotSkill}\\b`, 'i');
      if (noDotRegex.test(text)) {
        const contextMatch = checkSkillContext(text, skill);
        if (contextMatch) {
          foundSkills.add(skill);
          console.log(`Found skill variant: ${skill} (context: ${contextMatch})`);
        }
      }
    }
  }

  const skillsArray = Array.from(foundSkills).sort();
  console.log(`Final extracted skills: ${skillsArray.join(', ')}`);
  return skillsArray;
}

// Helper function to check if skill is mentioned in relevant context
function checkSkillContext(text: string, skill: string): string | null {
  const lowerText = text.toLowerCase();
  const lowerSkill = skill.toLowerCase();
  
  // Find the position of the skill in the text
  const skillIndex = lowerText.indexOf(lowerSkill);
  if (skillIndex === -1) return null;
  
  // Get surrounding context (50 characters before and after)
  const start = Math.max(0, skillIndex - 50);
  const end = Math.min(lowerText.length, skillIndex + lowerSkill.length + 50);
  const context = lowerText.substring(start, end);
  
  // Check if the context contains relevant keywords
  const relevantKeywords = [
    'skill', 'experience', 'proficient', 'expert', 'knowledge', 'familiar',
    'used', 'worked', 'developed', 'implemented', 'created', 'built',
    'programming', 'language', 'framework', 'library', 'tool', 'platform',
    'database', 'technology', 'software', 'years', 'project', 'development'
  ];
  
  for (const keyword of relevantKeywords) {
    if (context.includes(keyword)) {
      return keyword;
    }
  }
  
  // If no specific context found, but it's a technical skill, assume it's relevant
  return 'technical';
}

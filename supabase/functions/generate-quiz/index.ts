import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { skills, userId } = await req.json();
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new Error('Skills array is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`Generating quiz for skills: ${skills.join(', ')}`);

    // Create prompt for Gemini
    const prompt = `Generate 10 technical interview questions based on these skills: ${skills.join(', ')}.

For each question, provide:
1. A clear, specific technical question
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation of why the answer is correct

Focus on practical, interview-style questions that test real understanding, not just memorization.

Return the response as a valid JSON array with this exact structure:
[
  {
    "question": "What is the purpose of React hooks?",
    "options": ["A) To replace class components", "B) To add state and lifecycle to functional components", "C) To improve performance", "D) To handle routing"],
    "correctAnswer": "B",
    "explanation": "React hooks allow functional components to use state and other React features without writing a class."
  }
]

Return ONLY the JSON array, no additional text.`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from Gemini');
    }

    console.log('Generated text:', generatedText);

    // Parse the JSON response from Gemini
    let questions;
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedText;
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format received from AI');
    }

    // Validate question structure
    for (const q of questions) {
      if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error('Invalid question structure');
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save quiz to database
    const { data: quiz, error: insertError } = await supabase
      .from('quizzes')
      .insert({
        user_id: userId,
        title: `${skills.slice(0, 3).join(', ')} Interview Quiz`,
        skills: skills,
        questions: questions,
        total_questions: questions.length,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save quiz to database');
    }

    console.log('Quiz created successfully:', quiz.id);

    return new Response(JSON.stringify({ 
      success: true, 
      quiz: quiz,
      message: `Generated ${questions.length} questions successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
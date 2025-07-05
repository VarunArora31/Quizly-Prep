interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const generateQuizWithGemini = async (skills: string[]): Promise<QuizQuestion[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
  }

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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from Gemini');
    }

    console.log('Generated text:', generatedText);

    // Parse the JSON response from Gemini
    let questions: QuizQuestion[];
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

    return questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

const AIMLAPI_KEY = process.env.REACT_APP_AIMLAPI_KEY;
const AIMLAPI_BASE_URL = process.env.REACT_APP_AIMLAPI_BASE_URL || 'https://api.aimlapi.com/v1';

// Validate and clean topic input
const validateTopic = (topic) => {
  if (!topic || typeof topic !== 'string') {
    throw new Error('Topic is required and must be a string');
  }
  
  const cleanTopic = topic.trim();
  
  if (cleanTopic.length < 2) {
    throw new Error('Topic must be at least 2 characters long');
  }
  
  if (cleanTopic.length > 100) {
    throw new Error('Topic must be less than 100 characters');
  }
  
  // Check for inappropriate content (basic filter)
  const inappropriateWords = ['hack', 'illegal', 'drug', 'weapon'];
  const lowerTopic = cleanTopic.toLowerCase();
  
  for (const word of inappropriateWords) {
    if (lowerTopic.includes(word)) {
      throw new Error('Topic contains inappropriate content');
    }
  }
  
  return cleanTopic;
};

// Enhanced question generation using AiMLAPI
export const generateQuestions = async (topic, difficulty = 'medium', numQuestions = 10) => {
  console.log('🤖 Starting AiMLAPI question generation:', { topic, difficulty, numQuestions });

  if (!AIMLAPI_KEY) {
    throw new Error('AiMLAPI key is not configured. Please add REACT_APP_AIMLAPI_KEY to your environment variables.');
  }

  // Validate inputs
  const cleanTopic = validateTopic(topic);
  
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    throw new Error('Difficulty must be easy, medium, or hard');
  }
  
  const questionCount = parseInt(numQuestions);
  if (isNaN(questionCount) || questionCount < 1 || questionCount > 25) {
    throw new Error('Number of questions must be between 1 and 25');
  }

  // Create difficulty-specific prompts
  const difficultyInstructions = {
    easy: 'Create basic level questions that test fundamental concepts and definitions. Use simple language and straightforward scenarios.',
    medium: 'Create intermediate level questions that require understanding of concepts and their applications. Include some analytical thinking.',
    hard: 'Create advanced level questions that require deep understanding, critical thinking, and complex problem-solving. Include scenario-based questions.'
  };

  const prompt = `Generate exactly ${questionCount} multiple choice questions about "${cleanTopic}" with ${difficulty} difficulty level.

DIFFICULTY LEVEL: ${difficultyInstructions[difficulty]}

REQUIREMENTS:
- Each question must have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should be relevant and accurate
- Avoid ambiguous or trick questions
- Include diverse question types (factual, conceptual, application-based)
- Provide clear, concise explanations

FORMAT (follow this exact format):
Question 1: [Clear, specific question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief, clear explanation of why this answer is correct]

Question 2: [Next question...]
[Continue for all ${questionCount} questions]

TOPIC: ${cleanTopic}
DIFFICULTY: ${difficulty}
NUMBER OF QUESTIONS: ${questionCount}`;

  try {
    console.log('📡 Sending request to AiMLAPI...');

    const response = await fetch(`${AIMLAPI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIMLAPI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator and quiz designer. You create high-quality, accurate, and engaging multiple choice questions for educational purposes. Always follow the exact format specified and ensure all questions are factually correct and appropriate for the given difficulty level.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.min(4000, questionCount * 200), // Dynamic token limit based on question count
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    console.log('📡 AiMLAPI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ AiMLAPI error:', errorData);

      if (response.status === 401) {
        throw new Error('Invalid AiMLAPI key. Please check your configuration.');
      } else if (response.status === 429) {
        throw new Error('AiMLAPI rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 500) {
        throw new Error('AiMLAPI is currently unavailable. Please try again later.');
      } else {
        throw new Error(`AiMLAPI error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    console.log('✅ Received response from AiMLAPI');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const generatedText = data.choices[0].message.content;
    console.log('📝 Generated text length:', generatedText.length);
    
    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error('AiMLAPI returned empty response');
    }
    
    // Parse the generated questions
    const questions = parseQuestions(generatedText);
    console.log('✅ Successfully parsed questions:', questions.length);
    
    if (questions.length === 0) {
      throw new Error('Failed to parse any questions from AI response. Please try again.');
    }
    
    if (questions.length < questionCount * 0.8) { // Allow some tolerance
      console.warn(`⚠️ Generated fewer questions than requested: ${questions.length}/${questionCount}`);
    }
    
    return questions;
    
  } catch (error) {
    console.error('❌ Error in generateQuestions:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to AI service. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Enhanced question parsing with better error handling
export const parseQuestions = (text) => {
  console.log('🔍 Parsing questions from AI response...');
  
  if (!text || typeof text !== 'string') {
    console.error('❌ Invalid text input for parsing');
    return [];
  }

  const questions = [];
  
  try {
    // Split by question numbers or "Question" keyword
    const questionBlocks = text.split(/(?=Question\s*\d+:|^\d+\.|\n\d+\.)/i).filter(block => block.trim());
    
    console.log(`📋 Found ${questionBlocks.length} potential question blocks`);
    
    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      
      if (!block) continue;
      
      try {
        const question = parseQuestionBlock(block);
        if (question) {
          questions.push(question);
          console.log(`✅ Successfully parsed question ${questions.length}`);
        }
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse question block ${i + 1}:`, parseError.message);
        continue;
      }
    }
    
    console.log(`✅ Successfully parsed ${questions.length} questions`);
    return questions;
    
  } catch (error) {
    console.error('❌ Error in parseQuestions:', error);
    return [];
  }
};

// Parse individual question block
const parseQuestionBlock = (block) => {
  // Extract question text
  const questionMatch = block.match(/(?:Question\s*\d+:\s*|^\d+\.\s*)?(.+?)(?=\n[A-E]\))/is);
  if (!questionMatch) {
    throw new Error('Could not extract question text');
  }
  
  const questionText = questionMatch[1].trim().replace(/^Question\s*\d+:\s*/i, '');
  
  // Extract options
  const optionMatches = block.match(/([A-E])\)\s*(.+?)(?=\n[A-E]\)|\nCorrect Answer:|\nExplanation:|$)/gis);
  if (!optionMatches || optionMatches.length < 4) {
    throw new Error('Could not extract enough options (need at least 4)');
  }
  
  const options = [];
  const optionMap = {};
  
  for (const match of optionMatches.slice(0, 5)) { // Take max 5 options
    const optionMatch = match.match(/([A-E])\)\s*(.+)/is);
    if (optionMatch) {
      const letter = optionMatch[1].toUpperCase();
      const text = optionMatch[2].trim();
      options.push(text);
      optionMap[letter] = text;
    }
  }
  
  if (options.length < 4) {
    throw new Error('Not enough valid options found');
  }
  
  // Extract correct answer
  const correctAnswerMatch = block.match(/Correct Answer:\s*([A-E])/i);
  if (!correctAnswerMatch) {
    throw new Error('Could not extract correct answer');
  }
  
  const correctLetter = correctAnswerMatch[1].toUpperCase();
  const correctAnswer = optionMap[correctLetter];
  
  if (!correctAnswer) {
    throw new Error('Correct answer letter does not match any option');
  }
  
  // Extract explanation
  const explanationMatch = block.match(/Explanation:\s*(.+?)(?=\n\n|Question\s*\d+:|$)/is);
  const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
  
  return {
    question: questionText,
    options: options.slice(0, 4), // Ensure exactly 4 options
    answer: correctAnswer,
    explanation: explanation
  };
};

// Fallback question generation for when API fails
export const generateFallbackQuestions = (topic, difficulty, numQuestions) => {
  console.log('🔄 Generating fallback questions...');
  
  const fallbackQuestions = [];
  
  for (let i = 1; i <= Math.min(numQuestions, 5); i++) {
    fallbackQuestions.push({
      question: `Sample ${difficulty} question ${i} about ${topic}`,
      options: [
        `Option A for ${topic}`,
        `Option B for ${topic}`,
        `Option C for ${topic}`,
        `Option D for ${topic}`
      ],
      answer: `Option A for ${topic}`,
      explanation: `This is a sample explanation for ${topic} question ${i}.`
    });
  }
  
  return fallbackQuestions;
};

// Test function for AiMLAPI connectivity
export const testAiMLAPIConnection = async () => {
  try {
    const response = await fetch(`${AIMLAPI_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${AIMLAPI_KEY}`
      }
    });

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'AiMLAPI connection successful' : 'AiMLAPI connection failed'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Connection error: ${error.message}`
    };
  }
};

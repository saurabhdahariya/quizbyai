// OpenAI API configuration using environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

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

// Get exam-specific instructions for ultra-realistic questions
const getExamSpecificInstructions = (topic, difficulty) => {
  const topicLower = topic.toLowerCase();

  // NEET/Medical exam instructions
  if (topicLower.includes('neet') || topicLower.includes('medical') || topicLower.includes('biology') || topicLower.includes('anatomy') || topicLower.includes('physiology') || topicLower.includes('pharmacology') || topicLower.includes('pathology')) {
    return `NEET/Medical Exam Standards (Ultra-Realistic):
- Create questions EXACTLY like NEET-UG/PG pattern with clinical case scenarios
- Use SPECIFIC drug names (e.g., Atorvastatin 40mg, Metformin 500mg), exact dosages, and precise mechanisms
- Include REAL anatomical structures (e.g., "Left anterior descending artery", "Brodmann area 44")
- Use ACTUAL disease conditions with ICD codes, symptoms, and diagnostic criteria
- Include PRECISE numerical values (e.g., "Normal GFR: 90-120 mL/min/1.73m²")
- Reference SPECIFIC laboratory findings (e.g., "HbA1c >6.5%", "Troponin I >0.04 ng/mL")
- Use EXACT medical terminology (e.g., "Myocardial infarction with ST elevation in leads II, III, aVF")
- Include REAL medical guidelines (WHO, AHA, ESC) and recent research findings
- Questions should test clinical reasoning, differential diagnosis, and treatment protocols
- Use authentic medical abbreviations (STEMI, COPD, DKA, CKD, etc.)
- Include pharmacokinetics, drug interactions, and contraindications with specific patient scenarios`;
  }

  // JEE/Engineering exam instructions
  if (topicLower.includes('jee') || topicLower.includes('engineering') || topicLower.includes('physics') || topicLower.includes('chemistry') || topicLower.includes('mathematics') || topicLower.includes('gate')) {
    return `JEE/Engineering Exam Standards (Ultra-Realistic):
- Create questions EXACTLY like JEE Main/Advanced pattern with multi-step numerical problems
- Use SPECIFIC formulas (e.g., "F = ma", "PV = nRT", "E = mc²") with exact constants (g = 9.8 m/s², c = 3×10⁸ m/s)
- Include REAL engineering applications (e.g., "A 500 MW thermal power plant", "Bridge with 50m span")
- Use PRECISE numerical values (e.g., "Velocity = 25.6 m/s", "Temperature = 298.15 K")
- Include ACTUAL chemical compounds (C₆H₁₂O₆, NaCl, H₂SO₄) with exact molecular weights
- Reference SPECIFIC mathematical theorems (Rolle's theorem, L'Hôpital's rule, Green's theorem)
- Use REAL physical constants (Planck's constant h = 6.626×10⁻³⁴ J·s, Avogadro's number = 6.022×10²³)
- Include complex problem-solving with multiple concepts (thermodynamics + mechanics + calculus)
- Questions should require 3-4 step solutions with intermediate calculations
- Use authentic engineering units (Pascal, Joule, Watt, Newton) and dimensional analysis
- Include graph interpretation with specific coordinate values and slopes`;
  }

  // UPSC/Civil Services exam instructions
  if (topicLower.includes('upsc') || topicLower.includes('civil') || topicLower.includes('ias') || topicLower.includes('government') || topicLower.includes('polity') || topicLower.includes('geography') || topicLower.includes('history') || topicLower.includes('economics')) {
    return `UPSC/Civil Services Exam Standards (Ultra-Realistic):
- Create questions EXACTLY like UPSC Prelims/Mains pattern with analytical and application-based approach
- Use SPECIFIC constitutional articles (e.g., "Article 356 - President's Rule", "Article 21 - Right to Life")
- Include EXACT acts and amendments (e.g., "73rd Amendment Act, 1992", "RTI Act, 2005")
- Reference REAL current affairs with precise dates (e.g., "G20 Summit held in New Delhi, September 2023")
- Include SPECIFIC government schemes (PM-KISAN, Ayushman Bharat, Swachh Bharat Mission) with budget allocations
- Use ACTUAL geographical data (e.g., "Deccan Plateau covers 1.9 million km²", "Ganga length: 2,525 km")
- Reference REAL historical events with exact dates (e.g., "Battle of Plassey - June 23, 1757")
- Include SPECIFIC economic indicators (GDP growth rate, inflation rate, fiscal deficit percentage)
- Use ACTUAL international organizations (UN, WHO, IMF, World Bank) with their headquarters and functions
- Questions should test policy analysis, cause-effect relationships, and administrative decision-making
- Include real case studies from Indian governance and administration`;
  }

  // General competitive exam instructions
  return `Competitive Exam Standards:
- Create questions that match real competitive exam patterns
- Use specific facts, figures, and authentic terminology
- Include practical applications and real-world scenarios
- Questions should test analytical thinking and problem-solving
- Use precise language and avoid ambiguous statements
- Include current and relevant information
- Focus on high-yield topics commonly asked in competitive exams`;
};

// Enhanced question generation using OpenAI GPT-3.5 Turbo
export const generateQuestions = async (topic, difficulty = 'medium', numQuestions = 10) => {
  console.log('🤖 Starting OpenAI question generation:', { topic, difficulty, numQuestions });

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add REACT_APP_OPENAI_API_KEY to your environment variables.');
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

  // Enhanced prompt for ultra-realistic exam questions
  const examSpecificInstructions = getExamSpecificInstructions(cleanTopic, difficulty);

  const prompt = `You are a senior exam question setter with 20+ years of experience creating questions for competitive exams. Generate ${questionCount} ultra-realistic multiple choice questions for "${cleanTopic}" at ${difficulty} level.

${examSpecificInstructions}

ULTRA-REALISTIC EXAM STANDARDS:
- Questions MUST be identical in style, complexity, and format to actual exam questions
- Use EXACT terminology, units, values, and language patterns from real exams
- Include specific numerical data, dates, names, formulas, and technical terms
- Questions should be challenging and require deep analytical thinking
- Avoid generic or textbook-style questions - make them exam-specific
- Include real-world scenarios, case studies, and practical applications
- Use precise medical/scientific/technical terminology where applicable
- Questions should differentiate between students of different skill levels

CONTENT AUTHENTICITY:
- Use actual drug names, disease conditions, anatomical structures (for medical)
- Include real chemical formulas, reaction mechanisms, numerical values (for chemistry)
- Use actual historical dates, events, personalities, places (for history/civics)
- Include real mathematical theorems, formulas, problem-solving steps (for math)
- Reference actual laws, articles, constitutional provisions (for law/civics)

EXACT JSON FORMAT (return only valid JSON):
[
  {
    "question": "[Ultra-specific, exam-realistic question with precise details]",
    "options": {
      "A": "[Highly specific and realistic option A]",
      "B": "[Highly specific and realistic option B]",
      "C": "[Highly specific and realistic option C]",
      "D": "[Highly specific and realistic option D]",
      "E": "[Highly specific and realistic option E]"
    },
    "correct_option": "[A/B/C/D/E]",
    "explanation": "[Detailed, factual explanation with specific reasoning and references]"
  }
]

Generate exactly ${questionCount} questions that are indistinguishable from actual competitive exam questions.`;

  try {
    console.log('📡 Sending request to OpenAI...');

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert exam question creator with deep knowledge of competitive exams like NEET, JEE, UPSC, and other professional examinations. You create ultra-realistic questions that are indistinguishable from actual exam questions. Always return valid JSON format with exactly 5 options (A-E) for each question.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.min(4000, questionCount * 300), // Dynamic token limit for detailed questions
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    console.log('📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenAI error:', errorData);

      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (response.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 500) {
        throw new Error('OpenAI is currently unavailable. Please try again later.');
      } else {
        throw new Error(`OpenAI error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    console.log('✅ Received response from OpenAI');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const generatedText = data.choices[0].message.content;
    console.log('📝 Generated text length:', generatedText.length);
    
    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error('OpenAI returned empty response');
    }

    // Parse the generated questions (try JSON first, then fallback to text)
    const questions = parseJSONQuestions(generatedText);
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
      throw new Error('Network error: Unable to connect to OpenAI service. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Parse JSON format questions from OpenAI response
export const parseJSONQuestions = (text) => {
  console.log('🔍 Parsing JSON questions from OpenAI response...');

  try {
    // Try to extract JSON from the response
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Find JSON array in the text
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const questionsData = JSON.parse(jsonText);

    if (!Array.isArray(questionsData)) {
      throw new Error('Response is not an array');
    }

    const questions = questionsData.map((q, index) => {
      if (!q.question || !q.options || !q.correct_option) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }

      // Convert options object to array
      const optionsArray = [
        q.options.A,
        q.options.B,
        q.options.C,
        q.options.D,
        q.options.E
      ].filter(Boolean);

      if (optionsArray.length < 4) {
        throw new Error(`Question ${index + 1} doesn't have enough options`);
      }

      // Find correct answer text and index
      const correctAnswer = q.options[q.correct_option];
      if (!correctAnswer) {
        throw new Error(`Question ${index + 1} has invalid correct option`);
      }

      // Find the index of the correct answer in the options array
      const correctAnswerIndex = optionsArray.findIndex(option => option === correctAnswer);
      if (correctAnswerIndex === -1) {
        throw new Error(`Question ${index + 1} correct answer not found in options`);
      }

      return {
        question: q.question,
        options: optionsArray.slice(0, 5), // Take up to 5 options
        answer: correctAnswer, // Keep text for display
        correctAnswer: correctAnswerIndex, // Add index for comparison
        explanation: q.explanation || 'No explanation provided'
      };
    });

    console.log(`✅ Successfully parsed ${questions.length} JSON questions`);
    return questions;

  } catch (error) {
    console.error('❌ Error parsing JSON questions:', error);
    console.log('📝 Attempting fallback text parsing...');

    // Fallback to text parsing if JSON parsing fails
    return parseQuestions(text);
  }
};

// Enhanced question parsing with better error handling (fallback for non-JSON responses)
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

  // Find the index of the correct answer
  const correctAnswerIndex = options.findIndex(option => option === correctAnswer);
  if (correctAnswerIndex === -1) {
    throw new Error('Correct answer not found in options array');
  }

  // Extract explanation
  const explanationMatch = block.match(/Explanation:\s*(.+?)(?=\n\n|Question\s*\d+:|$)/is);
  const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';

  return {
    question: questionText,
    options: options.slice(0, 5), // Take up to 5 options (A-E)
    answer: correctAnswer, // Keep text for display
    correctAnswer: correctAnswerIndex, // Add index for comparison
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
        `Option D for ${topic}`,
        `Option E for ${topic}`
      ],
      answer: `Option A for ${topic}`, // Text for display
      correctAnswer: 0, // Index for comparison (Option A = index 0)
      explanation: `This is a sample explanation for ${topic} question ${i}.`
    });
  }
  
  return fallbackQuestions;
};

// Test OpenAI API connection
export const testOpenAIConnection = async () => {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'OpenAI connection successful' : 'OpenAI connection failed'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Connection error: ${error.message}`
    };
  }
};

// Legacy function name for backward compatibility
export const testAiMLAPIConnection = testOpenAIConnection;

// Quiz caching functions for better performance
export const generateCacheKey = (topic, difficulty, numQuestions) => {
  return `quiz_${topic.toLowerCase().replace(/\s+/g, '_')}_${difficulty}_${numQuestions}`;
};

// Simple in-memory cache for quiz questions
const quizCache = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export const getCachedQuiz = (cacheKey) => {
  const cached = quizCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('📦 Using cached quiz questions');
    return cached.questions;
  }
  return null;
};

export const setCachedQuiz = (cacheKey, questions) => {
  quizCache.set(cacheKey, {
    questions,
    timestamp: Date.now()
  });
  console.log('💾 Cached quiz questions');
};

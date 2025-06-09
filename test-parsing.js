// Test question parsing logic with mock data
const mockAPIResponse = `Question 1: What is the primary purpose of JavaScript closures?
A) To create private variables and functions
B) To improve code performance
C) To handle asynchronous operations
D) To create object-oriented programming
E) To manage memory allocation
Correct Answer: A
Explanation: Closures in JavaScript allow functions to access variables from their outer scope even after the outer function has returned, effectively creating private variables and encapsulation.

Question 2: Which method is used to add an element to the end of an array in JavaScript?
A) append()
B) insert()
C) push()
D) add()
E) concat()
Correct Answer: C
Explanation: The push() method adds one or more elements to the end of an array and returns the new length of the array.`;

// Import the parsing function (simulate)
function parseQuestions(text) {
  console.log('🔍 Parsing questions from AI response...');
  
  if (!text || typeof text !== 'string') {
    console.error('❌ Invalid text input for parsing');
    return [];
  }

  const questions = [];
  
  try {
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
}

function parseQuestionBlock(block) {
  const questionMatch = block.match(/(?:Question\s*\d+:\s*|^\d+\.\s*)?(.+?)(?=\n[A-E]\))/is);
  if (!questionMatch) {
    throw new Error('Could not extract question text');
  }
  
  const questionText = questionMatch[1].trim().replace(/^Question\s*\d+:\s*/i, '');
  
  const optionMatches = block.match(/([A-E])\)\s*(.+?)(?=\n[A-E]\)|\nCorrect Answer:|\nExplanation:|$)/gis);
  if (!optionMatches || optionMatches.length < 5) {
    throw new Error('Could not extract enough options (need exactly 5)');
  }
  
  const options = [];
  const optionMap = {};
  
  for (const match of optionMatches.slice(0, 5)) {
    const optionMatch = match.match(/([A-E])\)\s*(.+)/is);
    if (optionMatch) {
      const letter = optionMatch[1].toUpperCase();
      const text = optionMatch[2].trim();
      options.push(text);
      optionMap[letter] = text;
    }
  }
  
  if (options.length < 5) {
    throw new Error('Not enough valid options found (need exactly 5)');
  }
  
  const correctAnswerMatch = block.match(/Correct Answer:\s*([A-E])/i);
  if (!correctAnswerMatch) {
    throw new Error('Could not extract correct answer');
  }
  
  const correctLetter = correctAnswerMatch[1].toUpperCase();
  const correctAnswer = optionMap[correctLetter];
  
  if (!correctAnswer) {
    throw new Error('Correct answer letter does not match any option');
  }
  
  const explanationMatch = block.match(/Explanation:\s*(.+?)(?=\n\n|Question\s*\d+:|$)/is);
  const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
  
  return {
    question: questionText,
    options: options.slice(0, 5), // Return all 5 options
    answer: correctAnswer,
    explanation: explanation
  };
}

// Test the parsing
console.log('🧪 Testing question parsing with mock data...');
console.log('\nMock API Response:');
console.log(mockAPIResponse);
console.log('\n' + '='.repeat(50));

const parsedQuestions = parseQuestions(mockAPIResponse);

console.log('\n📊 Parsing Results:');
console.log(`Total questions parsed: ${parsedQuestions.length}`);

parsedQuestions.forEach((q, index) => {
  console.log(`\n📝 Question ${index + 1}:`);
  console.log(`Question: ${q.question}`);
  console.log(`Options (${q.options.length}):`);
  q.options.forEach((option, i) => {
    const letter = String.fromCharCode(65 + i); // A, B, C, D, E
    console.log(`  ${letter}) ${option}`);
  });
  console.log(`Correct Answer: ${q.answer}`);
  console.log(`Explanation: ${q.explanation}`);
});

console.log('\n✅ Parsing test completed!');

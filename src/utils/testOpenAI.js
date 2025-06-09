import { generateQuestions, testOpenAIConnection } from '../services/aimlApiService';

// Test OpenAI API integration
export const testOpenAIAPI = async () => {
  console.log('🧪 Testing OpenAI API Integration...');
  
  try {
    // Test 1: API Connection
    console.log('\n1️⃣ Testing API Connection...');
    const connectionTest = await testOpenAIConnection();
    console.log('Connection result:', connectionTest);
    
    if (!connectionTest.success) {
      throw new Error(`Connection failed: ${connectionTest.message}`);
    }
    
    // Test 2: Small batch request (5 questions)
    console.log('\n2️⃣ Testing small batch (5 questions)...');
    const smallBatch = await generateQuestions('JavaScript basics', 'easy', 5);
    console.log(`Generated ${smallBatch.length} questions`);
    console.log('Sample question:', smallBatch[0]);
    
    // Test 3: Medium batch request (10 questions)
    console.log('\n3️⃣ Testing medium batch (10 questions)...');
    const mediumBatch = await generateQuestions('React components', 'medium', 10);
    console.log(`Generated ${mediumBatch.length} questions`);
    
    // Test 4: Large batch request (15 questions)
    console.log('\n4️⃣ Testing large batch (15 questions)...');
    const largeBatch = await generateQuestions('Data structures', 'hard', 15);
    console.log(`Generated ${largeBatch.length} questions`);
    
    // Test 5: Cache functionality
    console.log('\n5️⃣ Testing cache functionality...');
    const cachedBatch = await generateQuestions('JavaScript basics', 'easy', 5);
    console.log(`Cached result: ${cachedBatch.length} questions`);
    
    console.log('\n✅ All tests passed! OpenAI API is working correctly.');
    
    return {
      success: true,
      message: 'All tests passed successfully',
      results: {
        connection: connectionTest,
        smallBatch: smallBatch.length,
        mediumBatch: mediumBatch.length,
        largeBatch: largeBatch.length,
        cached: cachedBatch.length
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

// Test specific topics
export const testSpecificTopics = async () => {
  const topics = [
    { topic: 'NEET Biology', difficulty: 'medium', count: 5 },
    { topic: 'JEE Mathematics', difficulty: 'hard', count: 5 },
    { topic: 'JavaScript ES6', difficulty: 'easy', count: 5 },
    { topic: 'React Hooks', difficulty: 'medium', count: 5 }
  ];
  
  console.log('🎯 Testing specific topics...');
  
  const results = [];
  
  for (const test of topics) {
    try {
      console.log(`\nTesting: ${test.topic} (${test.difficulty}, ${test.count} questions)`);
      const questions = await generateQuestions(test.topic, test.difficulty, test.count);
      
      results.push({
        topic: test.topic,
        success: true,
        count: questions.length,
        sample: questions[0]?.question || 'No questions generated'
      });
      
      console.log(`✅ Generated ${questions.length} questions for ${test.topic}`);
      
    } catch (error) {
      console.error(`❌ Failed for ${test.topic}:`, error.message);
      results.push({
        topic: test.topic,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

// Performance test
export const testPerformance = async () => {
  console.log('⚡ Testing performance...');
  
  const startTime = Date.now();
  
  try {
    // Test batch efficiency - single request for 15 questions vs multiple smaller requests
    console.log('\n📊 Testing batch efficiency...');
    
    // Single batch request
    const batchStart = Date.now();
    const batchQuestions = await generateQuestions('Computer Science', 'medium', 15);
    const batchTime = Date.now() - batchStart;
    
    console.log(`Batch request: ${batchQuestions.length} questions in ${batchTime}ms`);
    
    // Multiple smaller requests (simulate inefficient approach)
    const multiStart = Date.now();
    const multiQuestions = [];
    
    for (let i = 0; i < 3; i++) {
      const questions = await generateQuestions('Computer Science', 'medium', 5);
      multiQuestions.push(...questions);
    }
    
    const multiTime = Date.now() - multiStart;
    
    console.log(`Multiple requests: ${multiQuestions.length} questions in ${multiTime}ms`);
    console.log(`Efficiency gain: ${((multiTime - batchTime) / multiTime * 100).toFixed(1)}% faster with batching`);
    
    const totalTime = Date.now() - startTime;
    
    return {
      success: true,
      batchTime,
      multiTime,
      efficiencyGain: ((multiTime - batchTime) / multiTime * 100).toFixed(1),
      totalTime,
      batchQuestions: batchQuestions.length,
      multiQuestions: multiQuestions.length
    };
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return {
      success: false,
      error: error.message,
      totalTime: Date.now() - startTime
    };
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Running comprehensive OpenAI API tests...');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  try {
    // Basic API test
    results.tests.basic = await testOpenAIAPI();
    
    // Topic-specific tests
    results.tests.topics = await testSpecificTopics();
    
    // Performance tests
    results.tests.performance = await testPerformance();
    
    console.log('\n🎉 All tests completed!');
    console.log('Results summary:', {
      basicTest: results.tests.basic.success,
      topicTests: results.tests.topics.filter(t => t.success).length + '/' + results.tests.topics.length,
      performanceTest: results.tests.performance.success
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.error = error.message;
    return results;
  }
};

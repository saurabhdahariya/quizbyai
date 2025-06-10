import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Brain,
  Target,
  Zap,
  AlertTriangle,
  Home
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { generateQuestions } from '../../services/aimlApiService';
import { useAuth } from '../../contexts/AuthContext';
import { storeQuizSession } from '../../services/quizService';

const ModernQuizTaker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Get quiz data from location state or passed questions
  const { topic, difficulty, numQuestions = 5, isGuest = false, questions: passedQuestions } = location.state || {};

  const [quizQuestions, setQuizQuestions] = useState(passedQuestions || []); // Fixed state for questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(!passedQuestions); // Skip loading if questions passed
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Load questions only once on component mount
  useEffect(() => {
    if (!topic) {
      navigate('/');
      return;
    }

    // Only load questions if not already passed
    if (!passedQuestions || passedQuestions.length === 0) {
      loadQuestions();
    } else {
      console.log('✅ Using passed questions:', passedQuestions.length);
      setIsLoading(false);
    }
  }, []); // Empty dependency array to run only once

  // Timer effect
  useEffect(() => {
    if (isLoading || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isLoading, showResult]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      console.log('🎯 Loading questions for:', { topic, difficulty, numQuestions });

      const generatedQuestions = await generateQuestions(topic, difficulty, numQuestions);

      if (!generatedQuestions || generatedQuestions.length === 0) {
        setError('Failed to generate questions. Please try again.');
        return;
      }

      console.log('✅ Questions loaded successfully:', generatedQuestions.length);

      // Ensure all questions have exactly 5 options
      const validatedQuestions = generatedQuestions.map((q, index) => {
        if (!q.options || q.options.length < 5) {
          console.warn(`⚠️ Question ${index + 1} has ${q.options?.length || 0} options, padding to 5`);
          const paddedOptions = [...(q.options || [])];
          while (paddedOptions.length < 5) {
            paddedOptions.push(`Option ${String.fromCharCode(65 + paddedOptions.length)}`);
          }
          return { ...q, options: paddedOptions.slice(0, 5) };
        }
        return { ...q, options: q.options.slice(0, 5) }; // Ensure exactly 5 options
      });

      setQuizQuestions(validatedQuestions); // Use fixed state variable
      setTimeLeft(30);
    } catch (error) {
      console.error('❌ Error loading questions:', error);
      setError(`Failed to load questions: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = () => {
    // Auto-select no answer and move to next
    const currentQuestion = quizQuestions[currentQuestionIndex];

    // Safety check for undefined question
    if (!currentQuestion) {
      console.error('❌ Current question is undefined at index:', currentQuestionIndex);
      return;
    }

    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      selectedAnswer: null,
      selectedOption: null,
      correctAnswer: currentQuestion.correctAnswer,
      correctOption: currentQuestion.options[currentQuestion.correctAnswer],
      explanation: currentQuestion.explanation,
      isCorrect: false,
      timeExpired: true
    }]);

    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setShowResult(true);
      // Store quiz results when completed
      storeQuizResults();
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];

    // Safety check for undefined question
    if (!currentQuestion) {
      console.error('❌ Current question is undefined at index:', currentQuestionIndex);
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      selectedAnswer: selectedAnswer,
      selectedOption: selectedAnswer !== null ? currentQuestion.options[selectedAnswer] : null,
      correctAnswer: currentQuestion.correctAnswer,
      correctOption: currentQuestion.options[currentQuestion.correctAnswer],
      explanation: currentQuestion.explanation,
      isCorrect: isCorrect,
      timeExpired: false
    }]);

    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setShowResult(true);
      // Store quiz results when completed
      storeQuizResults();
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-red-500 bg-red-100 dark:bg-red-900/30';
    if (timeLeft <= 20) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-green-500 bg-green-100 dark:bg-green-900/30';
  };

  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  // Store quiz results to Firebase
  const storeQuizResults = async () => {
    if (!currentUser || isGuest) {
      console.log('Skipping result storage for guest user');
      return;
    }

    try {
      console.log('📊 Storing quiz results to Firebase...');

      // Calculate total time spent (assuming 30 seconds per question minus remaining time)
      const totalTimeSpent = (currentQuestionIndex + 1) * 30 - timeLeft;

      // Calculate quiz statistics
      const correctCount = answers.filter(a => a.isCorrect).length;
      const percentage = Math.round((correctCount / quizQuestions.length) * 100);

      // Store quiz session for analytics
      const sessionData = {
        userId: currentUser.uid,
        topic: topic,
        difficulty: difficulty,
        numQuestions: quizQuestions.length,
        timeSpent: totalTimeSpent,
        score: correctCount,
        percentage: percentage,
        isGuest: false,
        completedAt: new Date(),
        questions: quizQuestions.map((q, index) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: answers[index]?.selectedAnswer,
          isCorrect: answers[index]?.isCorrect
        }))
      };

      await storeQuizSession(sessionData);
      console.log('✅ Quiz results stored successfully');
    } catch (error) {
      console.error('❌ Error storing quiz results:', error);
      // Don't show error to user, just log it
    }
  };

  if (!topic) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <motion.div
            className="w-16 h-16 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-16 h-16 text-primary-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Generating Your Quiz
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Creating {numQuestions} questions about {topic}...
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Each question will have 5 options • Difficulty: {difficulty}
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            icon={<Home className="h-4 w-4" />}
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const score = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full mx-auto"
          >
            {/* Results Header */}
            <Card className="mb-8 shadow-xl">
              <CardHeader className={`text-center py-8 ${
                percentage >= 70 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : percentage >= 50 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              } text-white`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mb-4"
                >
                  {percentage >= 70 ? (
                    <CheckCircle className="w-20 h-20 mx-auto" />
                  ) : (
                    <Target className="w-20 h-20 mx-auto" />
                  )}
                </motion.div>
                
                <CardTitle className="text-4xl font-bold mb-2">
                  {percentage}% Score
                </CardTitle>
                <p className="text-xl opacity-90">
                  {score} out of {quizQuestions.length} correct
                </p>
                <p className="text-lg opacity-75 mt-2">
                  Topic: {topic} • Difficulty: {difficulty}
                </p>
              </CardHeader>
            </Card>

            {/* Detailed Results */}
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className={`border-l-4 ${
                    answer.isCorrect 
                      ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10' 
                      : 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          answer.isCorrect 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {answer.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Question {index + 1}: {answer.question}
                          </h3>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-slate-600 dark:text-slate-400">Your Answer: </span>
                              <span className={answer.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                {answer.timeExpired
                                  ? 'Time Expired'
                                  : answer.selectedAnswer !== null
                                  ? `${getOptionLetter(answer.selectedAnswer)}) ${answer.selectedOption}`
                                  : 'No Answer'
                                }
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-slate-600 dark:text-slate-400">Correct Answer: </span>
                              <span className="text-green-600 dark:text-green-400">
                                {getOptionLetter(answer.correctAnswer)}) {answer.correctOption}
                              </span>
                            </div>
                            
                            {answer.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span className="font-medium text-blue-800 dark:text-blue-200">Explanation: </span>
                                <span className="text-blue-700 dark:text-blue-300">{answer.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            >
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="lg"
                icon={<Home className="h-5 w-5" />}
              >
                Back to Home
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                size="lg"
                icon={<Zap className="h-5 w-5" />}
              >
                Try Again
              </Button>
              
              {isGuest && (
                <Button
                  onClick={() => navigate('/signup')}
                  variant="gradient"
                  size="lg"
                  icon={<Target className="h-5 w-5" />}
                >
                  Sign Up for More
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Safety checks for undefined questions
  if (!quizQuestions || quizQuestions.length === 0) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400">Generating quiz questions...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Quiz Generation Failed</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <Button onClick={() => navigate('/')} variant="primary">
              Go Back Home
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">No Questions Available</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Unable to load quiz questions. Please try again.</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  // Additional safety check for current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Question Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Current question (#{currentQuestionIndex + 1}) is not available.
          </p>
          <Button onClick={() => navigate('/')} variant="primary">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-3 py-3">
        <div className="max-w-xl w-full mx-auto">
          {/* Compact Header with Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {topic}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Compact Timer */}
                <motion.div
                  className={`px-3 py-1 rounded-full font-bold text-sm ${getTimerColor()}`}
                  animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: timeLeft <= 10 ? Infinity : 0, duration: 1 }}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  {timeLeft}s
                </motion.div>
              </div>
            </div>
            
            {/* Compact Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
                <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 py-4">
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                          selectedAnswer === index
                            ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 shadow-md'
                            : selectedAnswer !== null
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-slate-800 hover:shadow-md'
                        }`}
                        whileHover={selectedAnswer === null ? { scale: 1.01 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedAnswer === index
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {getOptionLetter(index)}
                          </div>
                          <span className="text-base">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {selectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={handleNext}
                        variant="gradient"
                        size="lg"
                        className="w-full py-3 text-base font-semibold"
                        icon={<ArrowRight className="h-5 w-5" />}
                      >
                        {currentQuestionIndex + 1 === quizQuestions.length ? 'See Results' : 'Next Question'}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModernQuizTaker;

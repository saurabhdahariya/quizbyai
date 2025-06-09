import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  Home,
  ArrowRight
} from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { submitAIQuizResult } from '../../services/quizService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const QuizTaker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Get quiz data from navigation state
  const quizData = location.state;
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer state (30 seconds per question)
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  // Redirect if no quiz data
  useEffect(() => {
    if (!quizData || !quizData.questions) {
      navigate('/quiz/generate');
    }
  }, [quizData, navigate]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto advance to next question
          handleNext();
          return 30; // Reset timer for next question
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, timerActive, showResults]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
    setTimerActive(true);
  }, [currentQuestionIndex]);

  if (!quizData || !quizData.questions) {
    return null;
  }

  const { questions, topic, difficulty, isGuest } = quizData;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    setTimerActive(false); // Stop current timer

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Timer will be reset in useEffect
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
      
      // Calculate results
      const results = questions.map((question, index) => {
        const selectedOption = selectedAnswers[index];
        const isCorrect = selectedOption === question.correctAnswer;
        
        return {
          questionIndex: index,
          question: question.question,
          options: question.options,
          selectedAnswer: selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect: isCorrect,
          explanation: question.explanation || `The correct answer is ${question.options[question.correctAnswer]}`
        };
      });

      // Store quiz results in Firebase for future use (both guests and users)
      const quizResultData = {
        topic: topic || 'Unknown Topic',
        difficulty: difficulty || 'medium',
        questionsCount: questions.length,
        timeSpent: timeSpent || 0,
        score: results.filter(r => r.isCorrect).length,
        totalQuestions: questions.length,
        percentage: Math.round((results.filter(r => r.isCorrect).length / questions.length) * 100),
        createdAt: serverTimestamp(),
        isGuest: isGuest || false,
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        userName: currentUser?.displayName || 'Anonymous'
      };

      // Store in Firebase for caching and analytics
      await addDoc(collection(db, 'quiz_sessions'), quizResultData);

      // If user is logged in, also store in their personal results
      if (currentUser) {
        const userAnswers = results.map(result => ({
          question: result.question,
          selectedAnswer: result.selectedAnswer,
          correctAnswer: result.correctAnswer,
          isCorrect: result.isCorrect,
          explanation: result.explanation,
          userName: currentUser.displayName || 'Anonymous',
          userEmail: currentUser.email || ''
        }));

        await submitAIQuizResult('guest-quiz-' + Date.now(), currentUser.uid, userAnswers, timeSpent);
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still show results even if submission fails
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateResults = () => {
    const results = questions.map((question, index) => {
      const selectedOption = selectedAnswers[index];
      const isCorrect = selectedOption === question.correctAnswer;
      
      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        selectedAnswer: selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation || `The correct answer is ${question.options[question.correctAnswer]}`
      };
    });

    const correctCount = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return { results, correctCount, percentage };
  };

  if (showResults) {
    const { results, correctCount, percentage } = calculateResults();
    const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Results Header */}
            <Card className="mb-8 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Award className="h-8 w-8 text-yellow-500" />
                  Quiz Complete!
                </CardTitle>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {percentage}%
                  </div>
                  <div className="text-lg text-slate-600 dark:text-slate-400">
                    {correctCount} out of {questions.length} correct
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Topic: {topic} • Difficulty: {difficulty} • Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Detailed Results */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Detailed Results & Explanations
              </h2>
              
              {results.map((result, index) => (
                <Card key={index} className="shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${result.isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {result.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                          Question {index + 1}: {result.question}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          {result.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                optionIndex === result.correctAnswer
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                                  : optionIndex === result.selectedAnswer && !result.isCorrect
                                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span>{option}</span>
                                {optionIndex === result.correctAnswer && (
                                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                                )}
                                {optionIndex === result.selectedAnswer && !result.isCorrect && (
                                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 ml-auto" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                            Explanation:
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            {result.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button
                onClick={() => navigate('/quiz/generate')}
                variant="gradient"
                size="lg"
                icon={<RotateCcw className="h-5 w-5" />}
              >
                Take Another Quiz
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="lg"
                icon={<Home className="h-5 w-5" />}
              >
                Back to Home
              </Button>
              
              {!currentUser && (
                <Button
                  onClick={() => navigate('/signup')}
                  variant="primary"
                  size="lg"
                >
                  Sign Up to Track Progress
                </Button>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate('/quiz/generate')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Generator
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {topic} - {difficulty}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                timeLeft <= 10
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : timeLeft <= 20
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Progress: {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-4">
                {/* Circular Timer */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={timeLeft <= 10 ? 'text-red-500' : timeLeft <= 20 ? 'text-yellow-500' : 'text-green-500'}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${(timeLeft / 30) * 100}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${
                      timeLeft <= 10 ? 'text-red-600 dark:text-red-400' :
                      timeLeft <= 20 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {timeLeft}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  timeLeft <= 10
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : timeLeft <= 20
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {timeLeft}s left
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 p-6">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-primary-200 dark:shadow-primary-900/50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg leading-relaxed">{option}</span>
                  </div>
                </motion.button>
              ))}
              
              <div className="pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedAnswers[currentQuestionIndex] !== undefined
                      ? '✅ Answer selected'
                      : '⏳ Select an answer to continue'
                    }
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  variant="gradient"
                  size="xl"
                  className="w-full py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  disabled={selectedAnswers[currentQuestionIndex] === undefined || isSubmitting}
                  isLoading={isSubmitting && isLastQuestion}
                  icon={isLastQuestion ? <CheckCircle className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
                >
                  {isLastQuestion ? 'Submit Quiz & See Results' : 'Next Question →'}
                </Button>

                {timeLeft <= 10 && selectedAnswers[currentQuestionIndex] === undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center"
                  >
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      ⚠️ Time running out! Select an answer quickly.
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default QuizTaker;

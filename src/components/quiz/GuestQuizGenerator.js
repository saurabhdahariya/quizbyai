import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Brain,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader,
  Info,
  UserPlus,
  LogIn,
  Zap
} from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { generateQuestions } from '../../services/aimlApiService';
import { getCachedQuestions, storeQuestionForReuse } from '../../services/quizService';

const GuestQuizGenerator = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Form state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generationStep, setGenerationStep] = useState('');

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  // Popular topics for quick selection
  const popularTopics = [
    {
      category: 'Medical Exams',
      topics: ['NEET Biology', 'NEET Chemistry', 'NEET Physics', 'USMLE'],
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
    },
    {
      category: 'Engineering',
      topics: ['JEE Mathematics', 'JEE Physics', 'JEE Chemistry', 'GATE'],
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
    },
    {
      category: 'Civil Services',
      topics: ['UPSC History', 'UPSC Geography', 'UPSC Polity', 'Current Affairs'],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      category: 'Programming',
      topics: ['JavaScript', 'Python', 'React', 'Data Structures'],
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'
    },
    {
      category: 'Competitive',
      topics: ['SSC Reasoning', 'Banking Aptitude', 'Quantitative Aptitude', 'English'],
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
    },
    {
      category: 'Academic',
      topics: ['Mathematics', 'Science', 'History', 'Geography'],
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'
    }
  ];

  const handleTopicSelect = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  const validateForm = () => {
    setError('');
    
    if (!topic.trim()) {
      setError('Please enter a topic for your quiz');
      return false;
    }
    
    if (topic.trim().length < 3) {
      setError('Topic must be at least 3 characters long');
      return false;
    }
    
    return true;
  };

  const generateQuiz = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError('');

    try {
      const topicTrimmed = topic.trim();
      const numQuestions = 5; // Fixed to 5 for guests

      setGenerationStep('Preparing quiz parameters...');

      // First, try to get cached questions from Firebase
      setGenerationStep('Checking for cached questions...');
      let questions = await getCachedQuestions(topicTrimmed, difficulty, numQuestions);

      if (questions && questions.length >= numQuestions) {
        setGenerationStep('Found cached questions! Loading quiz...');
        questions = questions.slice(0, numQuestions);
      } else {
        // If not enough cached questions, generate new ones
        const remainingQuestions = numQuestions - (questions?.length || 0);
        setGenerationStep(`Generating ${remainingQuestions} new questions with AI...`);

        const newQuestions = await generateQuestions(topicTrimmed, difficulty, remainingQuestions);

        if (newQuestions && newQuestions.length > 0) {
          // Validate and store new questions in Firebase for future use
          for (const question of newQuestions) {
            // Validate question before storing
            if (question &&
                question.question &&
                question.options &&
                Array.isArray(question.options) &&
                question.options.length >= 2 &&
                typeof question.correctAnswer === 'number' &&
                question.correctAnswer >= 0 &&
                question.correctAnswer < question.options.length) {

              try {
                await storeQuestionForReuse(question, topicTrimmed, difficulty);
              } catch (error) {
                console.warn('Failed to store question:', error);
                // Continue with quiz generation even if storage fails
              }
            } else {
              console.warn('Invalid question format, skipping storage:', question);
            }
          }

          // Combine cached and new questions
          questions = [...(questions || []), ...newQuestions];
        }
      }

      if (!questions || questions.length === 0) {
        throw new Error('Failed to generate questions. Please try again with a different topic.');
      }

      setGenerationStep('Quiz ready!');

      // Navigate to quiz with questions
      setTimeout(() => {
        navigate('/quiz/take', {
          state: {
            questions: questions,
            topic: topicTrimmed,
            difficulty: difficulty,
            isGuest: !currentUser,
            timeLimit: null // No time limit for guests
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(`❌ ${error.message || 'Failed to generate quiz. Please try again.'}`);
      setGenerationStep('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Home
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Quick Quiz Generator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Generate a 5-question quiz on any topic instantly
            </p>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary-500" />
                Generate Your Quiz
              </CardTitle>
              <CardDescription>
                Enter any topic and get 5 AI-generated questions instantly
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Guest Notification */}
              {!currentUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        🎯 Quick Quiz Mode (5 Questions)
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        You're generating a quick quiz with 5 questions. No progress tracking in this mode.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          as={Link}
                          to="/signup"
                          variant="primary"
                          size="sm"
                          icon={<UserPlus className="h-4 w-4" />}
                          className="text-xs"
                        >
                          Sign Up for Full Features
                        </Button>
                        <Button
                          as={Link}
                          to="/login"
                          variant="outline"
                          size="sm"
                          icon={<LogIn className="h-4 w-4" />}
                          className="text-xs"
                        >
                          Login
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {isGenerating && generationStep && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center text-blue-600 dark:text-blue-400"
                  >
                    <Loader className="h-5 w-5 mr-2 flex-shrink-0 animate-spin" />
                    <p className="text-sm">{generationStep}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popular Topics */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    🔥 Popular Topics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {popularTopics.map((category, categoryIndex) => (
                      <div key={categoryIndex} className={`p-4 rounded-lg bg-gradient-to-br ${category.bgColor} border border-slate-200 dark:border-slate-700`}>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 text-sm">
                          {category.category}
                        </h4>
                        <div className="space-y-1">
                          {category.topics.map((topicItem, topicIndex) => (
                            <button
                              key={topicIndex}
                              onClick={() => handleTopicSelect(topicItem)}
                              disabled={isGenerating}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all ${
                                topic === topicItem
                                  ? 'bg-primary-500 text-white shadow-md'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-700 dark:hover:text-primary-300'
                              }`}
                            >
                              {topicItem}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Topic Input */}
                <div>
                  <Input
                    label="Or Enter Custom Topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter any topic (e.g., Machine Learning, Ancient History)"
                    disabled={isGenerating}
                    className="text-lg"
                  />
                </div>

                <Select
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  options={difficultyOptions}
                  disabled={isGenerating}
                />

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Quick Quiz Features:
                    </span>
                  </div>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• 5 questions per quiz</li>
                    <li>• Instant results with explanations</li>
                    <li>• No time limit</li>
                    <li>• Questions saved for future use</li>
                  </ul>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateQuiz}
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isGenerating || !topic.trim()}
                isLoading={isGenerating}
                icon={<Zap className="h-5 w-5" />}
              >
                {isGenerating ? 'Generating Quiz...' : 'Generate 5-Question Quiz'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GuestQuizGenerator;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  examCategories,
  difficultyLevels,
  questionCounts,
  timeLimitOptions,
  searchExams
} from '../../data/examTopics';
import { createAIQuiz } from '../../services/quizService';
import { generateQuestions, getCachedQuiz, setCachedQuiz, generateCacheKey } from '../../services/aimlApiService';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Switch from '../ui/Switch';
import {
  Brain,
  Search,
  Clock,
  FileText,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft,
  Timer,
  Target,
  BookOpen,
  Award,
  Info
} from 'lucide-react';

function AIQuizGenerator() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [useCustomTopic, setUseCustomTopic] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimitType, setTimeLimitType] = useState('per_question');
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [totalDuration, setTotalDuration] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generationStep, setGenerationStep] = useState('');

  // Search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const results = searchExams(term);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const selectExamFromSearch = (exam) => {
    setSelectedExam(exam.id);
    setSelectedCategory(exam.categoryId);
    setSearchTerm(exam.name);
    setShowSearchResults(false);
    setUseCustomTopic(false);
  };

  const validateForm = () => {
    setError('');

    if (!useCustomTopic && !selectedExam) {
      setError('Please select an exam/topic or enter a custom topic');
      return false;
    }

    if (useCustomTopic) {
      const topic = customTopic.trim();
      if (!topic) {
        setError('Please enter a custom topic');
        return false;
      }
      if (topic.length < 3) {
        setError('Custom topic must be at least 3 characters long');
        return false;
      }
      if (topic.length > 100) {
        setError('Custom topic must be less than 100 characters');
        return false;
      }
    }

    if (numQuestions < 5 || numQuestions > 25) {
      setError('Number of questions must be between 5 and 25');
      return false;
    }

    return true;
  };

  const generateAIQuiz = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Determine the topic
      let topic, examName;
      if (useCustomTopic) {
        topic = customTopic.trim();
        examName = `Custom: ${topic}`;
      } else {
        const selectedExamData = examCategories[selectedCategory]?.exams.find(e => e.id === selectedExam);
        topic = selectedExamData?.name || selectedExam;
        examName = selectedExamData?.fullName || topic;
      }

      setGenerationStep('Preparing quiz parameters...');

      // Calculate time limit
      const timeLimit = timeLimitType === 'per_question'
        ? Math.ceil((numQuestions * timePerQuestion) / 60)
        : totalDuration;

      // Prepare AI quiz data
      const aiQuizData = {
        title: `${examName} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
        subject: topic,
        difficulty: difficulty,
        numQuestions: parseInt(numQuestions),
        timeLimit: timeLimit,
        prompt: `Generate ${numQuestions} ${difficulty} level multiple choice questions about ${topic}. Each question should have 4 options (A, B, C, D) with one correct answer.`
      };

      setGenerationStep('Checking cache for existing quiz...');

      // Check cache first
      const cacheKey = generateCacheKey(topic, difficulty, numQuestions);
      let rawQuestions = getCachedQuiz(cacheKey);

      if (rawQuestions) {
        setGenerationStep('Found cached quiz! Loading questions...');
        console.log('Using cached questions for:', cacheKey);
      } else {
        setGenerationStep('Generating questions with AiMLAPI...');

        // Generate questions using AiMLAPI
        rawQuestions = await generateQuestions(topic, difficulty, numQuestions);

        // Cache the generated questions
        setCachedQuiz(cacheKey, rawQuestions);
      }

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error('Failed to generate questions. Please try again with a different topic.');
      }

      console.log('Generated questions:', rawQuestions);

      setGenerationStep('Creating quiz in database...');

      // Add time limit configuration to quiz data
      const enhancedQuizData = {
        ...aiQuizData,
        timeLimitType: timeLimitType,
        timePerQuestion: timePerQuestion,
        totalDuration: totalDuration
      };

      // Create AI quiz in Firestore with generated questions
      const createdQuiz = await createAIQuiz(enhancedQuizData, currentUser, rawQuestions);

      setGenerationStep('Quiz saved successfully!');

      setGenerationStep('Quiz created successfully!');
      setSuccess(`Successfully generated ${rawQuestions.length} questions for your quiz!`);

      // Navigate to the quiz after a short delay
      setTimeout(() => {
        navigate(`/ai-quiz/${createdQuiz.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error generating AI quiz:', error);

      // Provide user-friendly error messages
      if (error.message.includes('rate limit')) {
        setError('⏳ API rate limit reached. The system will automatically retry with fallback questions, or you can try again in a few minutes.');
      } else if (error.message.includes('Network error')) {
        setError('🌐 Network connection issue. Please check your internet connection and try again.');
      } else if (error.message.includes('Invalid') && error.message.includes('key')) {
        setError('🔑 API configuration issue. Please contact support if this persists.');
      } else {
        setError(`❌ ${error.message || 'Failed to generate quiz. Please try again.'}`);
      }

      setGenerationStep('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(currentUser ? '/dashboard' : '/')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              {currentUser ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="h-12 w-12 text-white" />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent mb-4">
              AI Quiz Generator
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              {currentUser
                ? `Welcome back, ${currentUser.displayName || 'User'}! Create personalized quizzes with advanced AI technology.`
                : 'Generate custom quizzes on popular exams or any topic using AI'
              }
            </p>

            {/* Enhanced Features for Logged-in Users */}
            {currentUser && (
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { icon: Zap, text: 'Unlimited Quizzes', color: 'text-purple-500' },
                  { icon: Target, text: 'Progress Tracking', color: 'text-blue-500' },
                  { icon: Award, text: 'Achievement System', color: 'text-yellow-500' },
                  { icon: BookOpen, text: 'Study Analytics', color: 'text-green-500' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary-500" />
                Create AI-Generated Quiz
              </CardTitle>
              <CardDescription>
                Choose from popular exams or enter a custom topic to generate questions
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Guest User Notification */}
              {!currentUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-start text-blue-600 dark:text-blue-400"
                >
                  <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Guest Mode</p>
                    <p className="text-sm">
                      You're using the quiz generator as a guest. Your progress won't be saved.
                      <Link to="/signup" className="underline hover:text-blue-700 dark:hover:text-blue-300 ml-1">
                        Sign up
                      </Link> to track your progress and access more features.
                    </p>
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
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

              {/* Topic Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  Select Topic
                </h3>

                {/* Custom Topic Toggle */}
                <Switch
                  checked={useCustomTopic}
                  onChange={setUseCustomTopic}
                  label="Use Custom Topic"
                  description="Enter your own topic instead of selecting from predefined exams"
                />

                {useCustomTopic ? (
                  <Input
                    label="Custom Topic"
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter any topic (e.g., Machine Learning, World War 2, Organic Chemistry)"
                    icon={<FileText className="h-5 w-5 text-primary-500" />}
                    disabled={isGenerating}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Input
                        label="Search Exams"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search for exams (e.g., NEET, JEE, JavaScript)"
                        icon={<Search className="h-5 w-5 text-primary-500" />}
                        disabled={isGenerating}
                      />

                      {/* Search Results */}
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => selectExamFromSearch(exam)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                            >
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {exam.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {exam.category} • {exam.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Category Selection */}
                    <div>
                      <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary-500" />
                        Choose Exam Category
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(examCategories).map(([categoryId, category], index) => {
                          const IconComponent = category.icon;
                          const isSelected = selectedCategory === categoryId;
                          return (
                            <motion.div
                              key={categoryId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Card
                                className={`cursor-pointer transition-all duration-300 ${
                                  isSelected
                                    ? `${category.bgColor} ${category.borderColor} border-2 shadow-lg transform scale-105`
                                    : 'hover:shadow-md border border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700'
                                }`}
                                onClick={() => {
                                  setSelectedCategory(categoryId);
                                  setSelectedExam('');
                                }}
                              >
                                <CardContent className="p-6 text-center">
                                  <motion.div
                                    animate={isSelected ? { rotate: [0, 10, -10, 0] } : {}}
                                    transition={{ duration: 0.5 }}
                                    className={`p-3 rounded-full mx-auto mb-3 ${
                                      isSelected ? category.bgColor : 'bg-slate-100 dark:bg-slate-800'
                                    }`}
                                  >
                                    <IconComponent className={`h-8 w-8 ${
                                      isSelected ? category.color : 'text-slate-500'
                                    }`} />
                                  </motion.div>
                                  <h4 className={`font-semibold ${
                                    isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {category.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {category.description || `${Object.keys(category.exams || {}).length} exams available`}
                                  </p>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="mt-2"
                                    >
                                      <div className="w-2 h-2 bg-primary-500 rounded-full mx-auto"></div>
                                    </motion.div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Exam Selection */}
                    <AnimatePresence>
                      {selectedCategory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-secondary-500" />
                            <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                              Select Specific Exam
                            </h4>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Choose from {examCategories[selectedCategory].name} exams
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {examCategories[selectedCategory].exams.map((exam, index) => {
                              const isSelected = selectedExam === exam.id;
                              return (
                                <motion.div
                                  key={exam.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Card
                                    className={`cursor-pointer transition-all duration-300 ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 border-secondary-300 dark:border-secondary-700 border-2 shadow-lg'
                                        : 'hover:shadow-md border border-slate-200 dark:border-slate-700 hover:border-secondary-200 dark:hover:border-secondary-700'
                                    }`}
                                    onClick={() => setSelectedExam(exam.id)}
                                  >
                                    <CardContent className="p-5">
                                      <div className="flex items-start justify-between mb-3">
                                        <h5 className={`font-semibold ${
                                          isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'
                                        }`}>
                                          {exam.name}
                                        </h5>
                                        {isSelected && (
                                          <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                                          >
                                            <CheckCircle className="h-4 w-4 text-white" />
                                          </motion.div>
                                        )}
                                      </div>

                                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                        {exam.description}
                                      </p>

                                      <div className="flex flex-wrap gap-2">
                                        {exam.subjects.slice(0, 3).map((subject, subIndex) => (
                                          <motion.span
                                            key={subIndex}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (index * 0.1) + (subIndex * 0.05) }}
                                            className={`text-xs px-2 py-1 rounded-full ${
                                              isSelected
                                                ? 'bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}
                                          >
                                            {subject}
                                          </motion.span>
                                        ))}
                                        {exam.subjects.length > 3 && (
                                          <span className={`text-xs px-2 py-1 rounded-full ${
                                            isSelected
                                              ? 'bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300'
                                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                          }`}>
                                            +{exam.subjects.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Quiz Configuration */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent-500" />
                  <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                    Quiz Configuration
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Select
                      label="Difficulty Level"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      options={difficultyLevels}
                      disabled={isGenerating}
                    />
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {difficulty === 'easy' && '📚 Basic concepts and definitions'}
                      {difficulty === 'medium' && '🎯 Intermediate understanding required'}
                      {difficulty === 'hard' && '🔥 Advanced critical thinking'}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Select
                      label="Number of Questions"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      options={questionCounts}
                      disabled={isGenerating}
                    />
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Estimated completion: {Math.ceil(numQuestions * 1.5)} - {Math.ceil(numQuestions * 2)} minutes
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Time Limit Configuration */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary-500" />
                  <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                    Time Limit Configuration
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose how you want to limit the quiz time
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        timeLimitType === 'per_question'
                          ? 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-primary-300 dark:border-primary-700 border-2 shadow-lg'
                          : 'border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800'
                      }`}
                      onClick={() => setTimeLimitType('per_question')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            timeLimitType === 'per_question'
                              ? 'bg-primary-100 dark:bg-primary-900/40'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            <Clock className={`h-5 w-5 ${
                              timeLimitType === 'per_question'
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-slate-500'
                            }`} />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Time per Question
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Set time limit for each question
                            </p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {timeLimitType === 'per_question' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4"
                            >
                              <Select
                                label="Seconds per Question"
                                value={timePerQuestion}
                                onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
                                options={[
                                  { value: 30, label: '30 seconds' },
                                  { value: 45, label: '45 seconds' },
                                  { value: 60, label: '1 minute' },
                                  { value: 90, label: '1.5 minutes' },
                                  { value: 120, label: '2 minutes' }
                                ]}
                                disabled={isGenerating}
                              />
                              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Total time: ~{Math.ceil((numQuestions * timePerQuestion) / 60)} minutes
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        timeLimitType === 'total_duration'
                          ? 'bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 border-secondary-300 dark:border-secondary-700 border-2 shadow-lg'
                          : 'border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-secondary-200 dark:hover:border-secondary-800'
                      }`}
                      onClick={() => setTimeLimitType('total_duration')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            timeLimitType === 'total_duration'
                              ? 'bg-secondary-100 dark:bg-secondary-900/40'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            <Target className={`h-5 w-5 ${
                              timeLimitType === 'total_duration'
                                ? 'text-secondary-600 dark:text-secondary-400'
                                : 'text-slate-500'
                            }`} />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Total Duration
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Set total time for entire quiz
                            </p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {timeLimitType === 'total_duration' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4"
                            >
                              <Select
                                label="Total Quiz Duration"
                                value={totalDuration}
                                onChange={(e) => setTotalDuration(parseInt(e.target.value))}
                                options={[
                                  { value: 10, label: '10 minutes' },
                                  { value: 15, label: '15 minutes' },
                                  { value: 20, label: '20 minutes' },
                                  { value: 30, label: '30 minutes' },
                                  { value: 45, label: '45 minutes' },
                                  { value: 60, label: '60 minutes' }
                                ]}
                                disabled={isGenerating}
                              />
                              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                ~{Math.ceil(totalDuration / numQuestions)} seconds per question
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>

              {/* Generate Button */}
              <motion.div
                className="pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={generateAIQuiz}
                    variant="gradient"
                    size="lg"
                    className="w-full relative overflow-hidden"
                    isLoading={isGenerating}
                    disabled={isGenerating}
                    icon={<Zap className="h-5 w-5" />}
                  >
                    <motion.span
                      animate={isGenerating ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {isGenerating ? 'Generating Quiz...' : 'Generate AI Quiz'}
                    </motion.span>

                    {/* Animated background for loading state */}
                    {isGenerating && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </Button>
                </motion.div>

                {/* Progress indicator */}
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader className="h-4 w-4" />
                      </motion.div>
                      <span>This may take a few moments...</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AIQuizGenerator;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Brain,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Settings,
  BookOpen,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  Timer,
  Hash,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';

const DashboardAIQuiz = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Most Popular Exam Topics - Real exam questions
  const topicSuggestions = [
    {
      category: 'Medical Entrance',
      icon: '🏥',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      topics: ['NEET Biology', 'NEET Physics', 'NEET Chemistry', 'AIIMS MBBS', 'Medical Anatomy', 'Physiology', 'Pharmacology', 'Pathology']
    },
    {
      category: 'Engineering Entrance',
      icon: '⚙️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      topics: ['JEE Mathematics', 'JEE Physics', 'JEE Chemistry', 'GATE CSE', 'Engineering Mechanics', 'Thermodynamics', 'Electronics', 'Computer Science']
    },
    {
      category: 'Civil Services',
      icon: '🏛️',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      topics: ['UPSC Polity', 'UPSC Geography', 'UPSC History', 'Current Affairs', 'Economics', 'Public Administration', 'International Relations', 'Environment']
    },
    {
      category: 'Banking & SSC',
      icon: '🏦',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      topics: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness', 'Banking Awareness', 'Computer Knowledge', 'Data Interpretation', 'Numerical Ability']
    },
    {
      category: 'Programming',
      icon: '💻',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      topics: ['JavaScript', 'Python', 'React', 'Data Structures', 'Algorithms', 'System Design', 'Database', 'Web Development']
    },
    {
      category: 'General Studies',
      icon: '📚',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      topics: ['General Knowledge', 'Science & Technology', 'Mathematics', 'English Grammar', 'Logical Reasoning', 'Mental Ability', 'Current Events', 'General Awareness']
    }
  ];

  const difficultyLevels = [
    { 
      value: 'easy', 
      label: 'Beginner', 
      desc: 'Basic concepts and fundamentals',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    { 
      value: 'medium', 
      label: 'Intermediate', 
      desc: 'Moderate complexity questions',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    { 
      value: 'hard', 
      label: 'Advanced', 
      desc: 'Complex and challenging problems',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  const questionOptions = [
    { value: 5, label: '5', desc: 'Quick', time: '5-10 min', icon: '⚡' },
    { value: 10, label: '10', desc: 'Standard', time: '10-20 min', icon: '📝' },
    { value: 15, label: '15', desc: 'Extended', time: '15-30 min', icon: '📚' },
    { value: 20, label: '20', desc: 'Long', time: '20-40 min', icon: '🎯' },
    { value: 25, label: '25', desc: 'Full Exam', time: '25-50 min', icon: '🏆' }
  ];

  const timeLimitOptions = [
    { value: 0, label: 'No Limit', desc: 'Unlimited', icon: '♾️' },
    { value: 30, label: '30 sec', desc: 'Fast', icon: '⚡' },
    { value: 60, label: '1 min', desc: 'Standard', icon: '⏱️' },
    { value: 90, label: '90 sec', desc: 'Moderate', icon: '⏰' },
    { value: 120, label: '2 min', desc: 'Extended', icon: '🕐' }
  ];

  const handleTopicSelect = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      return;
    }

    setIsGenerating(true);
    
    // Navigate to the quiz taking page with the selected parameters
    navigate('/quiz/take', {
      state: {
        topic: topic.trim(),
        difficulty: difficulty,
        numQuestions: numQuestions,
        timeLimit: timeLimit,
        isGuest: false
      }
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  AI Quiz Generator
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Generate real exam questions with AI
                </p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Topic Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <Card className="shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Popular Topics
                  </CardTitle>
                  <CardDescription>
                    Quick topic suggestions to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {topicSuggestions.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                      className={`p-4 rounded-xl border-2 border-transparent ${category.bgColor} hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{category.icon}</span>
                        <h4 className={`font-semibold ${category.color} text-sm`}>
                          {category.category}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {category.topics.slice(0, 6).map((topicItem, topicIndex) => (
                          <motion.button
                            key={topicIndex}
                            onClick={() => handleTopicSelect(topicItem)}
                            className={`text-left px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                              topic === topicItem
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {topicItem}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Quiz Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-xl border-2 border-primary-100 dark:border-primary-900">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
                    <Settings className="h-6 w-6" />
                    Quiz Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your quiz settings for the perfect learning experience
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Custom Topic Input */}
                  <div>
                    <Input
                      label="Quiz Topic"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter any topic you want to practice..."
                      className="text-lg"
                      icon={<BookOpen className="h-5 w-5" />}
                    />
                  </div>

                  {/* Difficulty Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {difficultyLevels.map((level) => (
                        <motion.button
                          key={level.value}
                          onClick={() => setDifficulty(level.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            difficulty === level.value
                              ? `${level.borderColor} ${level.bgColor}`
                              : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`font-semibold ${level.color}`}>
                            {level.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {level.desc}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                      <Hash className="h-4 w-4 inline mr-2" />
                      Number of Questions
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {questionOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setNumQuestions(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            numQuestions === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                              : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {option.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {option.desc}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                      <Timer className="h-4 w-4 inline mr-2" />
                      Time Limit per Question
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {timeLimitOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setTimeLimit(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            timeLimit === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                              : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {option.label}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {option.desc}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.div
                    className="pt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleGenerateQuiz}
                      variant="gradient"
                      size="xl"
                      className="w-full py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
                      disabled={!topic.trim() || isGenerating}
                      isLoading={isGenerating}
                      icon={<ArrowRight className="h-6 w-6" />}
                    >
                      {isGenerating ? 'Generating Quiz...' : `Generate ${numQuestions} Question Quiz →`}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAIQuiz;

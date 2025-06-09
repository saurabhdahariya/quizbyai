import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  BookOpen
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

const ModernQuickQuizGenerator = () => {
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  // Simplified popular topics for quick selection
  const popularTopics = [
    'Programming',
    'Mathematics',
    'Science',
    'History',
    'Business',
    'Technology'
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', desc: 'Basic concepts and fundamentals', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', desc: 'Intermediate level questions', color: 'text-yellow-600' },
    { value: 'hard', label: 'Hard', desc: 'Advanced and challenging', color: 'text-red-600' }
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
        numQuestions: 5, // Fixed for guest users
        isGuest: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Brain className="h-12 w-12 text-white" />
            </motion.div>
          </div>
          
          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Quick Quiz Generator
          </motion.h1>
          
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Test your knowledge instantly with AI-generated quizzes. Choose from popular topics or create your own custom quiz.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              { icon: Zap, text: 'Instant Generation', color: 'text-yellow-500' },
              { icon: Target, text: '5 Questions', color: 'text-blue-500' },
              { icon: Clock, text: '30s per Question', color: 'text-green-500' },
              { icon: Sparkles, text: 'AI Powered', color: 'text-purple-500' }
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
          </motion.div>
        </motion.div>

        {/* Main Content Layout */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Popular Topics */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    🔥 Popular Topics
                  </CardTitle>
                  <CardDescription>
                    Quick topic suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {popularTopics.map((topicItem, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleTopicSelect(topicItem)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        topic === topicItem
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {topicItem}
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center - Quiz Configuration */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    Quick Quiz Generator
                  </CardTitle>
                  <CardDescription>
                    Generate a 5-question quiz instantly
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Input
                    label="Enter Topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., JavaScript, World History, Biology..."
                    className="text-lg"
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {difficultyOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setDifficulty(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            difficulty === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`font-semibold text-sm ${option.color} dark:${option.color.replace('600', '400')}`}>
                            {option.label}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleGenerateQuiz}
                      variant="gradient"
                      size="xl"
                      className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
                      disabled={!topic.trim() || isGenerating}
                      isLoading={isGenerating}
                      icon={<ArrowRight className="h-6 w-6" />}
                    >
                      {isGenerating ? 'Generating Quiz...' : 'Start 5-Question Quiz →'}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Signup Promotion */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-800">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Unlock Full Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { icon: TrendingUp, text: 'Track Your Progress', desc: 'See detailed analytics' },
                      { icon: Target, text: 'Unlimited Quizzes', desc: 'No 5-question limit' },
                      { icon: Users, text: 'Create Custom Tests', desc: 'Organize for others' },
                      { icon: Award, text: 'Save Results', desc: 'Build your history' }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                      >
                        <feature.icon className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200">
                            {feature.text}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {feature.desc}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => navigate('/signup')}
                      variant="primary"
                      className="w-full"
                      icon={<Users className="h-4 w-4" />}
                    >
                      Sign Up Free
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="outline"
                      className="w-full"
                      icon={<BookOpen className="h-4 w-4" />}
                    >
                      Already have account?
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernQuickQuizGenerator;

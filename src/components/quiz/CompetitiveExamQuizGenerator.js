import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

const CompetitiveExamQuizGenerator = () => {
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('NEET-PG');
  const [difficulty, setDifficulty] = useState('hard');
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  // Competitive exam types with specific characteristics
  const examTypes = [
    { 
      value: 'NEET-PG', 
      label: 'NEET-PG', 
      desc: 'Clinical scenarios, drug mechanisms, patient presentations',
      icon: '🏥',
      topics: ['Anatomy', 'Physiology', 'Pathology', 'Pharmacology', 'Medicine', 'Surgery']
    },
    { 
      value: 'NEET-UG', 
      label: 'NEET-UG', 
      desc: 'Biology, Chemistry, Physics fundamentals',
      icon: '🧬',
      topics: ['Biology', 'Chemistry', 'Physics', 'Botany', 'Zoology']
    },
    { 
      value: 'JEE-Advanced', 
      label: 'JEE Advanced', 
      desc: 'Multi-step problems, numerical analysis, conceptual depth',
      icon: '⚗️',
      topics: ['Mathematics', 'Physics', 'Chemistry', 'Calculus', 'Mechanics']
    },
    { 
      value: 'UPSC', 
      label: 'UPSC Civil Services', 
      desc: 'Current affairs, policy analysis, constitutional law',
      icon: '🏛️',
      topics: ['Polity', 'Geography', 'History', 'Economics', 'Current Affairs']
    },
    { 
      value: 'GATE', 
      label: 'GATE', 
      desc: 'Technical concepts, engineering applications',
      icon: '⚙️',
      topics: ['Computer Science', 'Electronics', 'Mechanical', 'Civil Engineering']
    }
  ];

  const difficultyLevels = [
    { value: 'medium', label: 'Medium', desc: 'Standard competitive level' },
    { value: 'hard', label: 'Hard', desc: 'Advanced competitive level' }
  ];

  const questionCounts = [5, 10, 15, 20];

  const selectedExam = examTypes.find(exam => exam.value === examType);

  const handleTopicSelect = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      return;
    }

    setIsGenerating(true);
    
    // Navigate to the quiz taking page with competitive exam parameters
    navigate('/quiz/take', {
      state: {
        topic: `${examType}: ${topic.trim()}`,
        difficulty: difficulty,
        numQuestions: numQuestions,
        examType: examType,
        isCompetitive: true,
        isGuest: false
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
              className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="h-12 w-12 text-white" />
            </motion.div>
          </div>
          
          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Competitive Exam Quiz
          </motion.h1>
          
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Generate high-quality, exam-realistic questions for NEET, JEE, UPSC, and other competitive exams. 
            Each question is crafted to match actual exam standards with clinical depth and conceptual rigor.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              { icon: Brain, text: 'AI-Powered', color: 'text-blue-500' },
              { icon: Target, text: 'Exam Realistic', color: 'text-green-500' },
              { icon: BookOpen, text: 'Clinical Depth', color: 'text-purple-500' },
              { icon: TrendingUp, text: 'High Quality', color: 'text-orange-500' }
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Exam Type Selection */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    🎯 Select Exam Type
                  </CardTitle>
                  <CardDescription>
                    Choose your competitive exam
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {examTypes.map((exam) => (
                    <motion.button
                      key={exam.value}
                      onClick={() => setExamType(exam.value)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                        examType === exam.value
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{exam.icon}</span>
                        <div>
                          <div className="font-semibold">{exam.label}</div>
                          <div className="text-xs opacity-75">{exam.desc}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center - Quiz Configuration */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
                    {selectedExam?.icon} {selectedExam?.label} Quiz Generator
                  </CardTitle>
                  <CardDescription>
                    Configure your competitive exam quiz
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Popular Topics for Selected Exam */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Popular Topics for {selectedExam?.label}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedExam?.topics.map((topicItem) => (
                        <motion.button
                          key={topicItem}
                          onClick={() => handleTopicSelect(topicItem)}
                          className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                            topic === topicItem
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {topicItem}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Topic Input */}
                  <Input
                    label="Custom Topic (or select from above)"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={`e.g., ${selectedExam?.topics[0]} advanced concepts...`}
                    className="text-lg"
                  />

                  {/* Configuration Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Difficulty Level"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      options={difficultyLevels}
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Number of Questions
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {questionCounts.map((count) => (
                          <motion.button
                            key={count}
                            onClick={() => setNumQuestions(count)}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                              numQuestions === count
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {count}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
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
                      {isGenerating ? 'Generating Exam-Quality Quiz...' : `Generate ${numQuestions} ${selectedExam?.label} Questions`}
                    </Button>
                  </motion.div>

                  {/* Info Note */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>High-Quality Questions:</strong> Each question is generated to match actual {selectedExam?.label} exam standards with clinical depth, conceptual rigor, and realistic scenarios.
                      </div>
                    </div>
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

export default CompetitiveExamQuizGenerator;

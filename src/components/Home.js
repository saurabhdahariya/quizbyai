import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Clock, Zap, BookOpen, Award, Lightbulb } from 'lucide-react';

// Import our UI components
import Header from './Header';
import Button from './ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Switch from './ui/Switch';
// Badge is used in other components but not in Home

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

function Home() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [useTimer, setUseTimer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const popularTopics = [
    { name: 'JavaScript', icon: <Zap className="h-4 w-4" /> },
    { name: 'React', icon: <Sparkles className="h-4 w-4" /> },
    { name: 'Python', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Math', icon: <Award className="h-4 w-4" /> },
    { name: 'History', icon: <Clock className="h-4 w-4" /> },
    { name: 'Science', icon: <Lightbulb className="h-4 w-4" /> },
    { name: 'Geography', icon: <Brain className="h-4 w-4" /> },
    { name: 'Literature', icon: <BookOpen className="h-4 w-4" /> }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const questionOptions = [
    { value: 5, label: '5 Questions' },
    { value: 10, label: '10 Questions' },
    { value: 15, label: '15 Questions' },
    { value: 20, label: '20 Questions' }
  ];

  const timerOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 45, label: '45 seconds' },
    { value: 60, label: '60 seconds' }
  ];

  const startQuiz = () => {
    if (topic.trim() === '') {
      // We could use a toast notification here
      alert('Please enter a topic to start the quiz!');
      return;
    }

    setIsLoading(true);

    // Ensure numQuestions is properly parsed as an integer
    const parsedNumQuestions = parseInt(numQuestions);

    // Validate the number of questions
    if (isNaN(parsedNumQuestions) || parsedNumQuestions < 1) {
      alert('Please select a valid number of questions.');
      setIsLoading(false);
      return;
    }

    // Simulate loading for better UX
    setTimeout(() => {
      navigate('/quiz', {
        state: {
          topic,
          difficulty,
          numQuestions: parsedNumQuestions,
          timePerQuestion: useTimer ? parseInt(timePerQuestion) : 0
        }
      });
      setIsLoading(false);
    }, 800);
  };

  const selectTopic = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Test Your Knowledge
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Create custom quizzes on any topic with AI-generated questions. Challenge yourself and learn something new!
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Topics */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="h-full shadow-lg" hover>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>Select from these trending topics or enter your own</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {popularTopics.map((t, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => selectTopic(t.name)}
                        className={`w-full p-3 rounded-lg flex items-center gap-2 transition-all ${
                          topic === t.name
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className={`${topic === t.name ? 'text-white' : 'text-primary-500 dark:text-primary-400'}`}>
                          {t.icon}
                        </span>
                        <span className="font-medium">{t.name}</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Creator */}
          <motion.div
            className="lg:col-span-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="shadow-lg" glass>
              <CardHeader>
                <CardTitle>Create Your Quiz</CardTitle>
                <CardDescription>Customize your quiz settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Input
                    label="Topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a quiz topic (e.g., JavaScript, World History)"
                    icon={<Sparkles className="h-5 w-5 text-primary-500" />}
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants}>
                    <Select
                      label="Difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      options={difficultyOptions}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Select
                      label="Number of Questions"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      options={questionOptions}
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <Switch
                    checked={useTimer}
                    onChange={setUseTimer}
                    label="Use Timer"
                    description="Set a time limit for each question"
                  />
                </motion.div>

                {useTimer && (
                  <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pl-7"
                  >
                    <Select
                      label="Seconds per Question"
                      value={timePerQuestion}
                      onChange={(e) => setTimePerQuestion(e.target.value)}
                      options={timerOptions}
                    />
                  </motion.div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={startQuiz}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  icon={<Zap className="h-5 w-5" />}
                >
                  Start Quiz
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="text-center p-6" glass hover>
            <Sparkles className="h-10 w-10 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">AI-Generated Questions</h3>
            <p className="text-slate-600 dark:text-slate-400">Unique questions created by AI for endless learning</p>
          </Card>

          <Card className="text-center p-6" glass hover>
            <Zap className="h-10 w-10 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Instant Feedback</h3>
            <p className="text-slate-600 dark:text-slate-400">Get immediate results and explanations</p>
          </Card>

          <Card className="text-center p-6" glass hover>
            <Brain className="h-10 w-10 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Knowledge Expansion</h3>
            <p className="text-slate-600 dark:text-slate-400">Learn new facts and test your understanding</p>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
          <p>© 2025 QuizByAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getAIQuizzes, 
  searchAIQuizzes, 
  getPopularAIQuizzes 
} from '../../services/quizService';
import { difficultyLevels } from '../../data/examTopics';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import { 
  Brain, 
  Search, 
  Clock, 
  Users, 
  Star, 
  TrendingUp,
  Filter,
  Play,
  ArrowLeft,
  Zap
} from 'lucide-react';

function AIQuizBrowser() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [quizzes, setQuizzes] = useState([]);
  const [popularQuizzes, setPopularQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, popular, recent
  
  // Load quizzes
  useEffect(() => {
    loadQuizzes();
  }, []);
  
  const loadQuizzes = async () => {
    try {
      setLoading(true);
      
      // Load all AI quizzes
      const allQuizzes = await getAIQuizzes(50);
      setQuizzes(allQuizzes);
      
      // Load popular quizzes
      const popular = await getPopularAIQuizzes(10);
      setPopularQuizzes(popular);
      
    } catch (error) {
      console.error('Error loading AI quizzes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchAIQuizzes(searchTerm, selectedDifficulty, 50);
      setQuizzes(results);
    } catch (error) {
      console.error('Error searching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('');
    loadQuizzes();
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const formatTimeLimit = (timeLimit, timeLimitType, timePerQuestion) => {
    if (timeLimitType === 'per_question' && timePerQuestion) {
      return `${timePerQuestion}s per question`;
    }
    return `${timeLimit} minutes total`;
  };
  
  const QuizCard = ({ quiz }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" hover>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {quiz.subject} • {quiz.questionsCount} questions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTimeLimit(quiz.timeLimit, quiz.timeLimitType, quiz.timePerQuestion)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{quiz.totalAttempts || 0} attempts</span>
              </div>
            </div>
            
            {/* Average Score */}
            {quiz.averageScore > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Average Score:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{quiz.averageScore}%</span>
                </div>
              </div>
            )}
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {quiz.tags?.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Action Button */}
            <Button
              onClick={() => navigate(`/ai-quiz/${quiz.id}/take`)}
              variant="primary"
              size="sm"
              className="w-full mt-4"
              icon={<Play className="h-4 w-4" />}
            >
              Take Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const displayQuizzes = activeTab === 'popular' ? popularQuizzes : quizzes;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate('/ai-quiz/generate')}
              variant="gradient"
              size="sm"
              icon={<Zap className="h-4 w-4" />}
            >
              Generate New Quiz
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              AI-Generated Quizzes
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Explore and take AI-generated quizzes on various topics
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search quizzes by topic or subject..."
                    icon={<Search className="h-5 w-5 text-primary-500" />}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    options={[
                      { value: '', label: 'All Difficulties' },
                      ...difficultyLevels
                    ]}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearch}
                    variant="primary"
                    icon={<Search className="h-4 w-4" />}
                  >
                    Search
                  </Button>
                  
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    icon={<Filter className="h-4 w-4" />}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                All Quizzes ({quizzes.length})
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'popular'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular ({popularQuizzes.length})
              </div>
            </button>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : displayQuizzes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {displayQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Brain className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                No quizzes found
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                {searchTerm || selectedDifficulty 
                  ? 'Try adjusting your search criteria or create a new quiz.'
                  : 'Be the first to generate an AI quiz!'
                }
              </p>
              <Button
                onClick={() => navigate('/ai-quiz/generate')}
                variant="primary"
                icon={<Zap className="h-4 w-4" />}
              >
                Generate AI Quiz
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AIQuizBrowser;

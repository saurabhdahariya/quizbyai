import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp,
  Trophy,
  Target,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Select from '../ui/Select';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MyProgress = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');

  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    improvementRate: 0
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadQuizAttempts();
  }, [currentUser, navigate]);

  const loadQuizAttempts = async () => {
    try {
      setLoading(true);
      
      // Load quiz sessions for the current user
      const q = query(
        collection(db, 'quiz_sessions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const attempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setQuizAttempts(attempts);
      calculateStats(attempts);
    } catch (error) {
      console.error('Error loading quiz attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attempts) => {
    if (attempts.length === 0) {
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
        improvementRate: 0
      });
      return;
    }

    const totalAttempts = attempts.length;
    const scores = attempts.map(a => a.percentage || 0);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const bestScore = Math.max(...scores);
    const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    // Calculate improvement rate (comparing first half vs second half)
    let improvementRate = 0;
    if (attempts.length >= 4) {
      const halfPoint = Math.floor(attempts.length / 2);
      const firstHalf = attempts.slice(halfPoint);
      const secondHalf = attempts.slice(0, halfPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, a) => sum + (a.percentage || 0), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, a) => sum + (a.percentage || 0), 0) / secondHalf.length;
      
      improvementRate = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
    }

    setStats({
      totalAttempts,
      averageScore,
      bestScore,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      improvementRate
    });
  };

  const getFilteredAttempts = () => {
    let filtered = [...quizAttempts];

    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date();
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      }[filterPeriod];

      if (daysAgo) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(attempt => attempt.createdAt >= cutoffDate);
      }
    }

    // Filter by topic
    if (filterTopic !== 'all') {
      filtered = filtered.filter(attempt => 
        attempt.topic?.toLowerCase().includes(filterTopic.toLowerCase())
      );
    }

    return filtered;
  };

  const getUniqueTopics = () => {
    const topics = quizAttempts.map(a => a.topic).filter(Boolean);
    return [...new Set(topics)];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  if (!currentUser) {
    return null;
  }

  const filteredAttempts = getFilteredAttempts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                My Progress
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Track your quiz performance and improvement over time
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              icon={<BarChart3 className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Attempts</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalAttempts}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                        {stats.averageScore}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Best Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(stats.bestScore)}`}>
                        {stats.bestScore}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Time Spent</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalTimeSpent}m</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Improvement</p>
                      <p className={`text-3xl font-bold ${
                        stats.improvementRate >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%
                      </p>
                    </div>
                    <PieChart className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Time Period"
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Time' },
                      { value: '7d', label: 'Last 7 Days' },
                      { value: '30d', label: 'Last 30 Days' },
                      { value: '90d', label: 'Last 90 Days' }
                    ]}
                  />
                  
                  <Select
                    label="Topic"
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Topics' },
                      ...getUniqueTopics().map(topic => ({
                        value: topic,
                        label: topic
                      }))
                    ]}
                  />

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setFilterPeriod('all');
                        setFilterTopic('all');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Attempts List */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quiz Attempts ({filteredAttempts.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                  >
                    Export
                  </Button>
                </div>
                <CardDescription>
                  Detailed view of all your quiz attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAttempts.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      No Quiz Attempts Found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {filterPeriod !== 'all' || filterTopic !== 'all' 
                        ? 'Try adjusting your filters or take some quizzes to see your progress.'
                        : 'Take your first quiz to start tracking your progress!'
                      }
                    </p>
                    <Button
                      onClick={() => navigate('/quiz/generate')}
                      variant="primary"
                      icon={<Trophy className="h-4 w-4" />}
                    >
                      Take a Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                {attempt.topic || 'Unknown Topic'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(attempt.percentage || 0)}`}>
                                {attempt.percentage || 0}%
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {attempt.difficulty || 'Medium'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(attempt.createdAt)}
                              </div>
                              <div className="flex items-center">
                                <Trophy className="h-4 w-4 mr-1" />
                                {attempt.score || 0}/{attempt.totalQuestions || 0}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {Math.round((attempt.timeSpent || 0) / 60)}m
                              </div>
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {attempt.isGuest ? 'Guest' : 'User'}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => navigate(`/quiz/result/${attempt.id}`)}
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProgress;

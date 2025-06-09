import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Users,
  Clock,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Globe,
  Lock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, draft

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadMyQuizzes();
  }, [currentUser, navigate]);

  const loadMyQuizzes = async () => {
    try {
      setLoading(true);
      
      const q = query(
        collection(db, 'quizzes'),
        where('creatorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date()
      }));

      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = quiz.startTime;
    const endTime = quiz.endTime;

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    if (now > endTime) return 'completed';
    return 'draft';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Edit className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'all') return true;
    return getQuizStatus(quiz) === filter;
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                My Quizzes
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Manage and track your created quizzes
              </p>
            </div>
            <Button
              onClick={() => navigate('/quiz/create')}
              variant="gradient"
              icon={<Plus className="h-5 w-5" />}
            >
              Create New Quiz
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Quizzes', count: quizzes.length },
              { key: 'active', label: 'Active', count: quizzes.filter(q => getQuizStatus(q) === 'active').length },
              { key: 'upcoming', label: 'Upcoming', count: quizzes.filter(q => getQuizStatus(q) === 'upcoming').length },
              { key: 'completed', label: 'Completed', count: quizzes.filter(q => getQuizStatus(q) === 'completed').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {filter === 'all' ? 'No Quizzes Created Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Quizzes`}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {filter === 'all' 
                  ? 'Start creating engaging quizzes for your audience.'
                  : `You don't have any ${filter} quizzes at the moment.`
                }
              </p>
              <Button
                onClick={() => navigate('/quiz/create')}
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
              >
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const status = getQuizStatus(quiz);
              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                        <div className="flex items-center gap-1">
                          {quiz.isPublic ? (
                            <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="mb-4 line-clamp-2">
                        {quiz.description}
                      </CardDescription>

                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Questions
                          </span>
                          <span className="font-medium">{quiz.questions?.length || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Participants
                          </span>
                          <span className="font-medium">{quiz.currentParticipants || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Duration
                          </span>
                          <span className="font-medium">{quiz.timeLimit} min</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Start Time
                          </span>
                          <span className="font-medium text-xs">{formatDate(quiz.startTime)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/quiz/${quiz.id}/details`)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          icon={<Eye className="h-4 w-4" />}
                        >
                          View
                        </Button>
                        
                        <Button
                          onClick={() => navigate(`/quiz/${quiz.id}/participants`)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          icon={<BarChart3 className="h-4 w-4" />}
                        >
                          Results
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          icon={<Trash2 className="h-4 w-4" />}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Statistics Summary */}
        {quizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quiz Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {quizzes.length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Quizzes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {quizzes.reduce((sum, quiz) => sum + (quiz.currentParticipants || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Participants</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {quizzes.filter(q => getQuizStatus(q) === 'active').length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Active Quizzes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyQuizzes;

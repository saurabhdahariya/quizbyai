import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Lock,
  Globe,
  Clock,
  Calendar,
  Trophy,
  Search,
  Key,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { applyToQuiz, canAccessQuiz } from '../../services/quizService';

const JoinQuiz = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('public');
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [privateQuizId, setPrivateQuizId] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadPublicQuizzes();
  }, [currentUser, navigate]);

  const loadPublicQuizzes = async () => {
    try {
      setLoading(true);
      const now = new Date();
      
      const q = query(
        collection(db, 'quizzes'),
        where('isPublic', '==', true),
        where('status', '==', 'open_for_applications'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const quizzes = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(quiz => {
          const startTime = quiz.startTime?.toDate ? quiz.startTime.toDate() : new Date(quiz.startTime);
          return startTime > now; // Only show upcoming quizzes
        });

      setPublicQuizzes(quizzes);
    } catch (error) {
      console.error('Error loading public quizzes:', error);
      setError('Failed to load public quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPublicQuiz = async (quizId) => {
    try {
      setJoining(true);
      setError('');
      setSuccess('');

      // Get quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        setError('Quiz not found');
        return;
      }

      const quiz = quizDoc.data();
      const now = new Date();
      const startTime = quiz.startTime?.toDate ? quiz.startTime.toDate() : new Date(quiz.startTime);

      // Check if quiz hasn't started yet
      if (startTime <= now) {
        setError('This quiz has already started');
        return;
      }

      // Check if quiz requires application
      if (quiz.requiresApplication) {
        // Apply to join the quiz
        await applyToQuiz(quizId, currentUser);
        setSuccess('Application submitted! You will be notified when approved.');
      } else {
        // Direct join - navigate to quiz waiting room or details
        navigate(`/quiz/${quizId}/details`);
      }

    } catch (error) {
      console.error('Error joining quiz:', error);
      if (error.message.includes('already applied')) {
        setError('You have already applied to this quiz');
      } else {
        setError('Failed to join quiz. Please try again.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleJoinPrivateQuiz = async () => {
    if (!privateQuizId.trim()) {
      setError('Please enter a quiz ID');
      return;
    }

    try {
      setJoining(true);
      setError('');
      setSuccess('');

      // Check if quiz exists
      const quizDoc = await getDoc(doc(db, 'quizzes', privateQuizId.trim()));
      if (!quizDoc.exists()) {
        setError('Quiz not found. Please check the quiz ID.');
        return;
      }

      const quiz = quizDoc.data();

      // Check access permissions
      const accessCheck = await canAccessQuiz(privateQuizId.trim(), currentUser.uid, 'custom');

      if (accessCheck.canAccess) {
        // User can access - navigate to quiz
        navigate(`/quiz/${privateQuizId.trim()}/details`);
      } else {
        // Need to apply for access
        if (quiz.requiresApplication) {
          await applyToQuiz(privateQuizId.trim(), currentUser);
          setSuccess('Application submitted! You will be notified when approved.');
        } else {
          setError('You don\'t have permission to join this private quiz.');
        }
      }

    } catch (error) {
      console.error('Error joining private quiz:', error);
      if (error.message.includes('already applied')) {
        setError('You have already applied to this quiz');
      } else {
        setError('Invalid quiz ID or you don\'t have permission to join this quiz');
      }
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilStart = (startTime) => {
    const now = new Date();
    const start = startTime.toDate ? startTime.toDate() : new Date(startTime);
    const diff = start - now;
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Join a Quiz
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Participate in public quizzes or join private ones with an ID
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'public'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="h-4 w-4 inline mr-2" />
              Public Quizzes
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'private'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Private Quiz
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center text-green-600 dark:text-green-400"
          >
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </motion.div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'public' ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Available Public Quizzes
                </h2>
                <Button
                  onClick={loadPublicQuizzes}
                  variant="outline"
                  size="sm"
                  icon={<Search className="h-4 w-4" />}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
                </div>
              ) : publicQuizzes.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      No Public Quizzes Available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      There are no public quizzes available to join right now.
                    </p>
                    <Button
                      onClick={() => navigate('/quiz/create')}
                      variant="primary"
                      icon={<Trophy className="h-4 w-4" />}
                    >
                      Create Your Own Quiz
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {publicQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            <CardDescription className="mt-1">
                              By {quiz.creatorName || 'Anonymous'}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              {getTimeUntilStart(quiz.startTime)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              until start
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {quiz.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(quiz.startTime)}</span>
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{quiz.timeLimit} minutes</span>
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <Trophy className="h-4 w-4 mr-2" />
                            <span>{quiz.questions?.length || 0} questions</span>
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{quiz.currentParticipants || 0} joined</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleJoinPublicQuiz(quiz.id)}
                          variant="gradient"
                          className="w-full"
                          disabled={joining}
                          icon={<ArrowRight className="h-4 w-4" />}
                        >
                          {joining ? 'Joining...' : 'Join Quiz'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Join Private Quiz</CardTitle>
                  <CardDescription>
                    Enter the quiz ID provided by the organizer
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Input
                    label="Quiz ID"
                    type="text"
                    value={privateQuizId}
                    onChange={(e) => setPrivateQuizId(e.target.value)}
                    placeholder="Enter quiz ID (e.g., ABC123)"
                    disabled={joining}
                  />

                  <Button
                    onClick={handleJoinPrivateQuiz}
                    variant="gradient"
                    className="w-full"
                    disabled={joining || !privateQuizId.trim()}
                    isLoading={joining}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    {joining ? 'Joining...' : 'Join Private Quiz'}
                  </Button>

                  <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                    <p>Don't have a quiz ID?</p>
                    <Button
                      onClick={() => navigate('/quiz/create')}
                      variant="link"
                      size="sm"
                    >
                      Create your own quiz instead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JoinQuiz;

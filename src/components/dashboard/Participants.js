import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Trophy,
  Clock,
  Calendar,
  Eye,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  User,
  Mail,
  Award,
  TrendingUp
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Participants = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [participants, setParticipants] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score'); // score, time, name, date

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadData();
  }, [currentUser, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user's quizzes (try both field names)
      let allQuizzes = [];

      try {
        const quizzesQuery1 = query(
          collection(db, 'quizzes'),
          where('creatorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const quizzesSnapshot1 = await getDocs(quizzesQuery1);
        allQuizzes = [...allQuizzes, ...quizzesSnapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
      } catch (error) {
        console.log('Error with creatorId query:', error);
      }

      try {
        const quizzesQuery2 = query(
          collection(db, 'quizzes'),
          where('createdBy', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const quizzesSnapshot2 = await getDocs(quizzesQuery2);
        allQuizzes = [...allQuizzes, ...quizzesSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
      } catch (error) {
        console.log('Error with createdBy query:', error);
      }

      // Remove duplicates
      const uniqueQuizzes = allQuizzes.filter((quiz, index, self) =>
        index === self.findIndex(q => q.id === quiz.id)
      );

      setQuizzes(uniqueQuizzes);

      // Load quiz results for user's quizzes from multiple collections
      let allParticipants = [];

      // Get quiz IDs for filtering
      const quizIds = uniqueQuizzes.map(q => q.id);

      // Load from quiz_results collection
      try {
        const resultsQuery = query(
          collection(db, 'quiz_results'),
          where('quizCreatorId', '==', currentUser.uid),
          orderBy('submittedAt', 'desc')
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        allParticipants = [...allParticipants, ...resultsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate() || new Date()
        }))];
      } catch (error) {
        console.log('Error loading quiz_results:', error);
      }

      // Load from quiz_sessions collection (for AI quizzes that might be organized)
      try {
        if (quizIds.length > 0) {
          const sessionsQuery = query(
            collection(db, 'quiz_sessions'),
            where('quizId', 'in', quizIds.slice(0, 10)), // Firestore 'in' limit is 10
            orderBy('completedAt', 'desc')
          );
          const sessionsSnapshot = await getDocs(sessionsQuery);
          allParticipants = [...allParticipants, ...sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().completedAt?.toDate() || new Date(),
            // Map fields for consistency
            totalQuestions: doc.data().numQuestions,
            timeSpent: doc.data().timeSpent
          }))];
        }
      } catch (error) {
        console.log('Error loading quiz_sessions:', error);
      }

      // Remove duplicates and set participants
      const uniqueParticipants = allParticipants.filter((participant, index, self) =>
        index === self.findIndex(p => p.id === participant.id)
      );

      setParticipants(uniqueParticipants);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredParticipants = () => {
    let filtered = [...participants];

    // Filter by quiz
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(p => p.quizId === selectedQuiz);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'time':
          return (a.timeSpent || 0) - (b.timeSpent || 0);
        case 'name':
          return (a.userName || '').localeCompare(b.userName || '');
        case 'date':
          return b.submittedAt - a.submittedAt;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = () => {
    const filtered = getFilteredParticipants();
    const csvContent = [
      ['Name', 'Email', 'Quiz', 'Score', 'Total Questions', 'Percentage', 'Time Spent', 'Submitted At'].join(','),
      ...filtered.map(p => [
        p.userName || 'Anonymous',
        p.userEmail || 'N/A',
        quizzes.find(q => q.id === p.quizId)?.title || 'Unknown Quiz',
        p.score || 0,
        p.totalQuestions || 0,
        Math.round(((p.score || 0) / (p.totalQuestions || 1)) * 100) + '%',
        formatTime(p.timeSpent || 0),
        formatDate(p.submittedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-participants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredParticipants = getFilteredParticipants();

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
                Quiz Participants
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                View and analyze participant responses and performance
              </p>
            </div>
            <Button
              onClick={exportData}
              variant="outline"
              icon={<Download className="h-5 w-5" />}
              disabled={filteredParticipants.length === 0}
            >
              Export Data
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Quiz"
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                options={[
                  { value: 'all', label: 'All Quizzes' },
                  ...quizzes.map(quiz => ({
                    value: quiz.id,
                    label: quiz.title
                  }))
                ]}
              />
              
              <Input
                label="Search Participants"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                icon={<Search className="h-4 w-4" />}
              />
              
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'score', label: 'Score (High to Low)' },
                  { value: 'time', label: 'Time Spent (Low to High)' },
                  { value: 'name', label: 'Name (A to Z)' },
                  { value: 'date', label: 'Date (Recent First)' }
                ]}
              />

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedQuiz('all');
                    setSearchTerm('');
                    setSortBy('score');
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                No Participants Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {participants.length === 0 
                  ? 'No one has taken your quizzes yet.'
                  : 'No participants match your current filters.'
                }
              </p>
              {participants.length === 0 && (
                <Button
                  onClick={() => navigate('/quiz/create')}
                  variant="primary"
                  icon={<Trophy className="h-4 w-4" />}
                >
                  Create a Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Participants List */}
            <div className="space-y-4">
              {filteredParticipants.map((participant, index) => {
                const quiz = quizzes.find(q => q.id === participant.quizId);
                const percentage = Math.round(((participant.score || 0) / (participant.totalQuestions || 1)) * 100);
                
                return (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {(participant.userName || 'A').charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                  {participant.userName || 'Anonymous'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(participant.score, participant.totalQuestions)}`}>
                                  {percentage}%
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {participant.userEmail || 'No email'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4" />
                                  {participant.score || 0}/{participant.totalQuestions || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(participant.timeSpent || 0)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(participant.submittedAt)}
                                </div>
                              </div>
                              
                              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Quiz: {quiz?.title || 'Unknown Quiz'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => navigate(`/quiz/${participant.quizId}/result/${participant.id}`)}
                              variant="outline"
                              size="sm"
                              icon={<Eye className="h-4 w-4" />}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {filteredParticipants.length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Participants</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {filteredParticipants.length > 0 
                          ? Math.round(filteredParticipants.reduce((sum, p) => sum + ((p.score || 0) / (p.totalQuestions || 1) * 100), 0) / filteredParticipants.length)
                          : 0
                        }%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Average Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {filteredParticipants.length > 0 
                          ? Math.round(filteredParticipants.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / filteredParticipants.length / 60)
                          : 0
                        }m
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Avg Time Spent</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {filteredParticipants.filter(p => ((p.score || 0) / (p.totalQuestions || 1)) >= 0.7).length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Passed (≥70%)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Participants;

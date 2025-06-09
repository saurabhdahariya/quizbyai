import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart3,
  Users,
  FileText,
  Shield,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Database,
  Settings,
  Home,
  Calendar,
  Star,
  Zap,
  Globe,
  Lock,
  ArrowLeft,
  MoreVertical,
  UserPlus,
  Crown,
  AlertTriangle,
  MessageSquare,
  Flag,
  Download,
  RefreshCw,
  Search,
  Filter,
  Edit,
  UserCheck,
  UserX,
  Bell
} from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import {
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  // State for dashboard data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    totalSessions: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Super admin email - replace with your email
  const SUPER_ADMIN_EMAIL = 'admin@quizbyai.com'; // Super admin email

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL || userRole === 'superadmin';

  // Fetch user role from database
  const fetchUserRole = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('uid', '==', currentUser.uid)
      ));

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchUserRole();
  }, [currentUser, navigate]);

  useEffect(() => {
    if (userRole && !isSuperAdmin) {
      navigate('/dashboard');
      return;
    }

    if (isSuperAdmin) {
      loadDashboardData();
    }
  }, [userRole, isSuperAdmin, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics
      const [usersSnapshot, quizzesSnapshot, questionsSnapshot, sessionsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'quizzes')),
        getDocs(collection(db, 'question_bank')),
        getDocs(collection(db, 'quiz_sessions'))
      ]);

      setStats({
        totalUsers: usersSnapshot.size,
        totalQuizzes: quizzesSnapshot.size,
        totalQuestions: questionsSnapshot.size,
        totalSessions: sessionsSnapshot.size
      });

      // Load recent users
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      setRecentUsers(recentUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load recent quizzes
      const recentQuizzesQuery = query(
        collection(db, 'quizzes'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const recentQuizzesSnapshot = await getDocs(recentQuizzesQuery);
      setRecentQuizzes(recentQuizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load recent quiz sessions
      const recentSessionsQuery = query(
        collection(db, 'quiz_sessions'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const recentSessionsSnapshot = await getDocs(recentSessionsQuery);
      setRecentSessions(recentSessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        loadDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          banned: true,
          bannedAt: new Date()
        });
        loadDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error banning user:', error);
        alert('Failed to ban user');
      }
    }
  };

  if (!currentUser || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You don't have permission to access the Super Admin dashboard.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                Super Admin Dashboard
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Complete control and analytics for QuizByAI platform
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Quizzes</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalQuizzes}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Question Bank</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalQuestions}</p>
                    </div>
                    <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quiz Sessions</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalSessions}</p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {user.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleBanUser(user.id)}
                          variant="ghost"
                          size="sm"
                          icon={<Ban className="h-4 w-4" />}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Ban
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quizzes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Quizzes
                </CardTitle>
                <CardDescription>Latest quiz creations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {quiz.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          By: {quiz.creatorName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Created: {quiz.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => navigate(`/quiz/${quiz.id}/details`)}
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="h-4 w-4" />}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="h-4 w-4" />}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quiz Sessions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Quiz Sessions
                </CardTitle>
                <CardDescription>Latest quiz attempts and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {session.topic} ({session.difficulty})
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Score: {session.score}/{session.totalQuestions} ({session.percentage}%)
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {session.isGuest ? 'Guest User' : 'Registered User'} • 
                          {session.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.percentage >= 70 ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

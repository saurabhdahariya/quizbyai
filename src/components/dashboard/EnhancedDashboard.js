import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import {
  Home,
  Brain,
  Users,
  PlusCircle,
  BarChart3,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Trophy,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    quizzesOrganized: 0,
    totalParticipants: 0
  });

  // Super admin check
  const SUPER_ADMIN_EMAIL = 'admin@quizbyai.com';
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  // Sidebar navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'ai-quiz', label: 'Take AI Quiz', icon: Brain, path: '/dashboard/ai-quiz' },
    { id: 'join-quiz', label: 'Join Quiz', icon: Users, path: '/quiz/join' },
    { id: 'organize', label: 'Organize Quiz', icon: PlusCircle, path: '/quiz/create' },
    { id: 'progress', label: 'My Progress', icon: BarChart3, path: '/dashboard/progress' },
    { id: 'my-quizzes', label: 'My Quizzes', icon: FileText, path: '/dashboard/quizzes' },
    { id: 'participants', label: 'Participants', icon: UserCheck, path: '/dashboard/participants' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  // Add super admin item if applicable
  if (isSuperAdmin) {
    navigationItems.push({
      id: 'admin',
      label: 'Super Admin',
      icon: Trophy,
      path: '/admin/dashboard'
    });
  }

  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Load real user statistics from Firebase
  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('Loading real stats for user:', currentUser.uid);

        // Get user document for basic stats
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Get quiz results for this user
        const resultsQuery = query(
          collection(db, 'quiz_results'),
          where('userId', '==', currentUser.uid)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        const results = resultsSnapshot.docs.map(doc => doc.data());

        // Get quizzes created by this user
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('creatorId', '==', currentUser.uid)
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzes = quizzesSnapshot.docs.map(doc => doc.data());

        // Calculate statistics
        const totalQuizzesTaken = results.length;
        const averageScore = results.length > 0
          ? Math.round(results.reduce((sum, result) => sum + (result.percentage || 0), 0) / results.length)
          : 0;
        const quizzesOrganized = quizzes.length;
        const totalParticipants = quizzes.reduce((sum, quiz) => sum + (quiz.totalParticipants || 0), 0);

        setStats({
          totalQuizzesTaken,
          averageScore,
          quizzesOrganized,
          totalParticipants
        });

        console.log('Loaded stats:', { totalQuizzesTaken, averageScore, quizzesOrganized, totalParticipants });

      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to default stats
        setStats({
          totalQuizzesTaken: 0,
          averageScore: 0,
          quizzesOrganized: 0,
          totalParticipants: 0
        });
      }
    };

    if (currentUser) {
      loadStats();
    }
  }, [currentUser]);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                QuizByAI
              </span>
            </div>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="sm"
              className="lg:hidden"
              icon={<X className="h-5 w-5" />}
            />
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {currentUser.displayName || 'User'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {currentUser.email}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.path || 
                              (item.id === 'dashboard' && currentPath === '/dashboard');
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              className="w-full justify-start"
              icon={isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              icon={<LogOut className="h-5 w-5" />}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              size="sm"
              icon={<Menu className="h-5 w-5" />}
            />
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">QuizByAI</span>
            </div>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              icon={isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Welcome back, {currentUser.displayName || 'User'}! 👋
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Ready to challenge yourself with some quizzes today?
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quizzes Taken</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalQuizzesTaken}</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Score</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.averageScore}%</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quizzes Organized</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.quizzesOrganized}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <PlusCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Participants</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.totalParticipants}</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/quiz/generate')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    Take AI Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Generate a personalized quiz on any topic with AI
                  </p>
                  <Button variant="outline" className="w-full">
                    Start Quiz →
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/quiz/create')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                      <PlusCircle className="h-5 w-5 text-white" />
                    </div>
                    Organize Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Create custom quizzes for others to participate
                  </p>
                  <Button variant="outline" className="w-full">
                    Create Quiz →
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/dashboard/progress')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    View Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Track your performance and improvement over time
                  </p>
                  <Button variant="outline" className="w-full">
                    View Stats →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedDashboard;

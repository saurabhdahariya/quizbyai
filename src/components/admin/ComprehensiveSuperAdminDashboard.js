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
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { 
  collection, 
  getDocs, 
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

const ComprehensiveSuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalQuestions: 0,
    apiUsage: 0,
    reportsCount: 0
  });
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Check if user is super admin
  const SUPER_ADMIN_EMAIL = 'admin@quizbyai.com';
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'quizzes', label: 'Quiz Moderation', icon: FileText },
    { id: 'reports', label: 'Reported Content', icon: Flag },
    { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isSuperAdmin) {
      navigate('/dashboard');
      return;
    }

    loadDashboardData();
  }, [currentUser, navigate, isSuperAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setUsers(usersData);

      // Load quizzes
      const quizzesQuery = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
      const quizzesSnapshot = await getDocs(quizzesQuery);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setQuizzes(quizzesData);

      // Load reports
      try {
        const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData = reportsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setReports(reportsData);
      } catch (error) {
        console.log('Reports collection not found, creating empty array');
        setReports([]);
      }

      // Load feedback
      try {
        const feedbackQuery = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
        const feedbackSnapshot = await getDocs(feedbackQuery);
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setFeedback(feedbackData);
      } catch (error) {
        console.log('Feedback collection not found, creating empty array');
        setFeedback([]);
      }

      // Calculate stats
      const now = new Date();
      const activeQuizzes = quizzesData.filter(quiz => {
        const startTime = quiz.startTime?.toDate() || new Date();
        const endTime = quiz.endTime?.toDate() || new Date();
        return now >= startTime && now <= endTime;
      });

      setStats({
        totalUsers: usersData.length,
        totalQuizzes: quizzesData.length,
        activeQuizzes: activeQuizzes.length,
        totalQuestions: quizzesData.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0),
        apiUsage: Math.floor(Math.random() * 10000), // Mock API usage
        reportsCount: reports.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBanned: !isBanned,
        updatedAt: serverTimestamp()
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBanned: !isBanned } : user
      ));
    } catch (error) {
      console.error('Error updating user ban status:', error);
      alert('Failed to update user status');
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
        setStats(prev => ({ ...prev, totalQuizzes: prev.totalQuizzes - 1 }));
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: 'dismissed',
        updatedAt: serverTimestamp()
      });
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: 'dismissed' } : report
      ));
    } catch (error) {
      console.error('Error dismissing report:', error);
      alert('Failed to dismiss report');
    }
  };

  const exportData = (type) => {
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'users':
        data = users.map(user => ({
          Name: user.displayName || 'N/A',
          Email: user.email,
          Role: user.role || 'user',
          'Signup Date': user.createdAt?.toLocaleDateString(),
          Status: user.isBanned ? 'Banned' : 'Active'
        }));
        filename = 'users-export.csv';
        break;
      case 'quizzes':
        data = quizzes.map(quiz => ({
          Title: quiz.title,
          Creator: quiz.creatorEmail || 'N/A',
          Type: quiz.type || 'custom',
          Questions: quiz.questions?.length || 0,
          'Created Date': quiz.createdAt?.toLocaleDateString(),
          Status: quiz.isPublic ? 'Public' : 'Private'
        }));
        filename = 'quizzes-export.csv';
        break;
      default:
        return;
    }

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!currentUser || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You don't have permission to access the Super Admin Dashboard.
            </p>
            <Button onClick={() => navigate('/dashboard')} variant="primary">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-800 shadow-lg h-screen sticky top-0">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-200">Super Admin</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Platform Control</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeTab === item.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="w-full"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Dashboard Home */}
              {activeTab === 'dashboard' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Super Admin Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Platform overview and management controls
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100">Total Users</p>
                            <p className="text-3xl font-bold">{stats.totalUsers}</p>
                          </div>
                          <Users className="h-12 w-12 text-blue-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100">Total Quizzes</p>
                            <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                          </div>
                          <FileText className="h-12 w-12 text-green-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100">Active Quizzes</p>
                            <p className="text-3xl font-bold">{stats.activeQuizzes}</p>
                          </div>
                          <Activity className="h-12 w-12 text-orange-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100">API Usage</p>
                            <p className="text-3xl font-bold">{stats.apiUsage}</p>
                          </div>
                          <Database className="h-12 w-12 text-purple-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={() => setActiveTab('users')}
                          variant="outline"
                          className="w-full justify-start"
                          icon={<Users className="h-4 w-4" />}
                        >
                          Manage Users
                        </Button>
                        <Button
                          onClick={() => setActiveTab('quizzes')}
                          variant="outline"
                          className="w-full justify-start"
                          icon={<FileText className="h-4 w-4" />}
                        >
                          Moderate Quizzes
                        </Button>
                        <Button
                          onClick={() => setActiveTab('reports')}
                          variant="outline"
                          className="w-full justify-start"
                          icon={<Flag className="h-4 w-4" />}
                        >
                          Review Reports
                        </Button>
                        <Button
                          onClick={() => setActiveTab('feedback')}
                          variant="outline"
                          className="w-full justify-start"
                          icon={<MessageSquare className="h-4 w-4" />}
                        >
                          View Feedback
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>System Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Platform Status</span>
                            <span className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Online
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Database</span>
                            <span className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Connected
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">AI Service</span>
                            <span className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Reports</span>
                            <span className="flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="h-4 w-4" />
                              {stats.reportsCount} Pending
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* User Management */}
              {activeTab === 'users' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        User Management
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400">
                        Manage user accounts, roles, and permissions
                      </p>
                    </div>
                    <Button
                      onClick={() => exportData('users')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export Users
                    </Button>
                  </div>

                  {/* Search and Filter */}
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          icon={<Search className="h-4 w-4" />}
                          className="flex-1"
                        />
                        <Select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          options={[
                            { value: 'all', label: 'All Roles' },
                            { value: 'user', label: 'Users' },
                            { value: 'organizer', label: 'Organizers' },
                            { value: 'superadmin', label: 'Super Admins' }
                          ]}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users Table */}
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                              <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">User</th>
                              <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Role</th>
                              <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Signup Date</th>
                              <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                              <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users
                              .filter(user => {
                                const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    user.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesRole = filterRole === 'all' || user.role === filterRole;
                                return matchesSearch && matchesRole;
                              })
                              .map((user) => (
                                <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700">
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                          {user.displayName || 'No Name'}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                          {user.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      user.role === 'superadmin'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        : user.role === 'organizer'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                    }`}>
                                      {user.role || 'user'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-400">
                                    {user.createdAt?.toLocaleDateString() || 'N/A'}
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      user.isBanned
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      {user.isBanned ? 'Banned' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={user.role || 'user'}
                                        onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                                        className="text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                                      >
                                        <option value="user">User</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="superadmin">Super Admin</option>
                                      </select>
                                      <Button
                                        onClick={() => handleBanUser(user.id, user.isBanned)}
                                        variant="outline"
                                        size="sm"
                                        className={user.isBanned ? 'text-green-600' : 'text-orange-600'}
                                      >
                                        {user.isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                      </Button>
                                      <Button
                                        onClick={() => handleDeleteUser(user.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quiz Moderation */}
              {activeTab === 'quizzes' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        Quiz Moderation
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400">
                        Manage and moderate all platform quizzes
                      </p>
                    </div>
                    <Button
                      onClick={() => exportData('quizzes')}
                      variant="outline"
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export Quizzes
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                      <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                            <div className="flex items-center gap-1">
                              {quiz.isPublic ? (
                                <Globe className="h-4 w-4 text-green-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {quiz.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                            <div className="flex justify-between">
                              <span>Creator:</span>
                              <span className="font-medium">{quiz.creatorEmail || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Questions:</span>
                              <span className="font-medium">{quiz.questions?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="font-medium">{quiz.type || 'Custom'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Created:</span>
                              <span className="font-medium">{quiz.createdAt?.toLocaleDateString()}</span>
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
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              icon={<Trash2 className="h-4 w-4" />}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              {activeTab === 'feedback' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                      User Feedback
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Review feedback and suggestions from users
                    </p>
                  </div>

                  {feedback.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <MessageSquare className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          No Feedback Yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          User feedback will appear here when submitted.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {feedback.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {(item.userName || item.userEmail || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800 dark:text-slate-200">
                                    {item.userName || 'Anonymous'}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {item.userEmail || 'No email'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {item.createdAt?.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="mb-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === 'bug'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : item.type === 'feature'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              }`}>
                                {item.type || 'General'}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                              {item.message}
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Mark as Read
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'settings' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                      System Settings
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Configure platform settings and features
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Platform Features</CardTitle>
                        <CardDescription>Toggle platform-wide features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>AI Quiz Generation</span>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>User Registration</span>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Public Quizzes</span>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Maintenance Mode</span>
                          <input type="checkbox" className="toggle" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>System Actions</CardTitle>
                        <CardDescription>Perform system maintenance tasks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={() => loadDashboardData()}
                          variant="outline"
                          className="w-full justify-start"
                          icon={<RefreshCw className="h-4 w-4" />}
                        >
                          Refresh Data
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          icon={<Database className="h-4 w-4" />}
                        >
                          Clear Cache
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          icon={<Download className="h-4 w-4" />}
                        >
                          Export All Data
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600"
                          icon={<AlertTriangle className="h-4 w-4" />}
                        >
                          System Backup
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveSuperAdminDashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PlusCircle, Calendar, Clock, Users, BookOpen, Database, Brain, Zap, Shield } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';
import FirestoreTest from '../FirestoreTest';
import FirestoreDebugger from '../FirestoreDebugger';
import FirebaseRulesHelper from '../FirebaseRulesHelper';

function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Super admin email - replace with your email
  const SUPER_ADMIN_EMAIL = 'admin@quizbyai.com'; // Super admin email
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        console.log('Fetching quizzes for user:', currentUser?.uid);

        try {
          // Fetch quizzes created by the current user
          const myQuizzesQuery = query(
            collection(db, 'quizzes'),
            where('createdBy', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );

          console.log('Executing query for my quizzes');
          const myQuizzesSnapshot = await getDocs(myQuizzesQuery);
          console.log('Got snapshot with', myQuizzesSnapshot.docs.length, 'docs');

          const myQuizzesData = myQuizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setMyQuizzes(myQuizzesData);
        } catch (myQuizzesError) {
          console.error('Error fetching my quizzes:', myQuizzesError);
          setMyQuizzes([]);
        }

        try {
          // Fetch public quizzes available to join
          const now = new Date();
          console.log('Fetching public quizzes after:', now);

          // First try a simpler query without the date filter
          const simpleQuery = query(
            collection(db, 'quizzes'),
            where('isPublic', '==', true)
          );

          console.log('Executing simple query for public quizzes');
          const publicQuizzesSnapshot = await getDocs(simpleQuery);
          console.log('Got snapshot with', publicQuizzesSnapshot.docs.length, 'public quizzes');

          // Filter in memory instead of in the query to avoid potential issues
          const availableQuizzesData = publicQuizzesSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(quiz => {
              // Convert Firestore timestamp to JS Date if needed
              const startTime = quiz.startTime?.toDate ? quiz.startTime.toDate() : new Date(quiz.startTime);
              return startTime > now && quiz.createdBy !== currentUser.uid;
            });

          setAvailableQuizzes(availableQuizzesData);
        } catch (publicQuizzesError) {
          console.error('Error fetching public quizzes:', publicQuizzesError);
          setAvailableQuizzes([]);
        }
      } catch (error) {
        console.error('Error in fetchQuizzes:', error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchQuizzes();
    } else {
      setMyQuizzes([]);
      setAvailableQuizzes([]);
      setLoading(false);
    }
  }, [currentUser]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              Welcome, {userProfile?.name || currentUser?.displayName || 'User'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your quizzes and discover new ones
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button
              onClick={() => navigate('/quiz/create')}
              variant="gradient"
              size="lg"
              icon={<PlusCircle className="h-5 w-5" />}
            >
              Create Custom Quiz
            </Button>

            <Button
              onClick={() => navigate('/quiz/generate')}
              variant="primary"
              size="lg"
              icon={<Brain className="h-5 w-5" />}
            >
              Quick AI Quiz
            </Button>

            {isSuperAdmin && (
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="secondary"
                size="lg"
                icon={<Shield className="h-5 w-5" />}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Super Admin
              </Button>
            )}
          </div>
        </div>

        {/* Firebase Rules Helper Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <FirebaseRulesHelper />
        </motion.div>

        {/* Firestore Debugging Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <FirestoreDebugger />
        </motion.div>

        {/* AI Quiz Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary-500" />
                AI-Generated Quizzes
              </CardTitle>
              <CardDescription>
                Generate custom quizzes on any topic using AI or browse existing AI quizzes
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800" hover>
                  <Zap className="h-10 w-10 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Generate AI Quiz</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Create custom quizzes on popular exams or any topic using AI</p>
                  <Button
                    onClick={() => navigate('/ai-quiz/generate')}
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={<Zap className="h-4 w-4" />}
                  >
                    Generate Quiz
                  </Button>
                </Card>

                <Card className="text-center p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-secondary-200 dark:border-secondary-800" hover>
                  <Brain className="h-10 w-10 text-secondary-500 dark:text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Browse AI Quizzes</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Explore and take AI-generated quizzes created by the community</p>
                  <Button
                    onClick={() => navigate('/ai-quiz/browse')}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    icon={<Brain className="h-4 w-4" />}
                  >
                    Browse Quizzes
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Quizzes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>My Quizzes</CardTitle>
                <CardDescription>Quizzes you've created</CardDescription>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
                  </div>
                ) : myQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">You haven't created any quizzes yet</p>
                    <Button
                      onClick={() => navigate('/create-quiz')}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Create Your First Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myQuizzes.map(quiz => (
                      <motion.div
                        key={quiz.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/quiz/${quiz.id}/manage`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 dark:text-slate-200">{quiz.title}</h3>
                          <Badge variant={quiz.isPublic ? "primary" : "secondary"} size="sm">
                            {quiz.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {quiz.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDate(quiz.startTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{quiz.duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-3.5 w-3.5 mr-1" />
                            <span>{quiz.numQuestions} questions</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>{quiz.approvedParticipants?.length || 0} participants</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Quizzes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Available Quizzes</CardTitle>
                <CardDescription>Public quizzes you can join</CardDescription>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
                  </div>
                ) : availableQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">No public quizzes available right now</p>
                    <Button
                      onClick={() => navigate('/browse-quizzes')}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Browse All Quizzes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableQuizzes.map(quiz => (
                      <motion.div
                        key={quiz.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/quiz/${quiz.id}/details`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 dark:text-slate-200">{quiz.title}</h3>
                          <Badge variant="success" size="sm">
                            {quiz.difficulty}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {quiz.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDate(quiz.startTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{quiz.duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-3.5 w-3.5 mr-1" />
                            <span>{quiz.numQuestions} questions</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>By {quiz.createdByName}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, Calendar, Clock, BookOpen, Users, AlertCircle, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';

function QuizManage() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    async function fetchQuizAndUsers() {
      try {
        setLoading(true);
        
        // Fetch quiz details
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        
        if (!quizDoc.exists()) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }
        
        const quizData = quizDoc.data();
        
        // Check if user is the creator
        if (quizData.createdBy !== currentUser.uid) {
          setError('You do not have permission to manage this quiz');
          setLoading(false);
          return;
        }
        
        setQuiz(quizData);
        
        // Fetch pending users
        const pendingUserPromises = (quizData.pendingParticipants || []).map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
        });
        
        const pendingUserResults = await Promise.all(pendingUserPromises);
        setPendingUsers(pendingUserResults.filter(Boolean));
        
        // Fetch approved users
        const approvedUserPromises = (quizData.approvedParticipants || []).map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
        });
        
        const approvedUserResults = await Promise.all(approvedUserPromises);
        setApprovedUsers(approvedUserResults.filter(Boolean));
      } catch (error) {
        console.error('Error fetching quiz and users:', error);
        setError('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuizAndUsers();
  }, [quizId, currentUser]);
  
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
  
  const handleApproveUser = async (userId) => {
    try {
      setError('');
      
      // Update quiz document
      await updateDoc(doc(db, 'quizzes', quizId), {
        pendingParticipants: arrayRemove(userId),
        approvedParticipants: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const userToMove = pendingUsers.find(user => user.id === userId);
      
      if (userToMove) {
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
        setApprovedUsers([...approvedUsers, userToMove]);
      }
      
      setSuccess('User approved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user. Please try again.');
    }
  };
  
  const handleRejectUser = async (userId) => {
    try {
      setError('');
      
      // Update quiz document
      await updateDoc(doc(db, 'quizzes', quizId), {
        pendingParticipants: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      setSuccess('User rejected successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Failed to reject user. Please try again.');
    }
  };
  
  const handleRemoveUser = async (userId) => {
    try {
      setError('');
      
      // Update quiz document
      await updateDoc(doc(db, 'quizzes', quizId), {
        approvedParticipants: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setApprovedUsers(approvedUsers.filter(user => user.id !== userId));
      
      setSuccess('User removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error removing user:', error);
      setError('Failed to remove user. Please try again.');
    }
  };
  
  const handleEditQuestions = () => {
    navigate(`/quiz/${quizId}/questions`);
  };
  
  const handleViewResults = () => {
    navigate(`/quiz/${quizId}/results`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Error</CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="primary"
            size="lg"
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  const quizStartTime = quiz?.startTime.toDate ? quiz.startTime.toDate() : new Date(quiz.startTime);
  const quizEndTime = quiz?.endTime.toDate ? quiz.endTime.toDate() : new Date(quiz.endTime);
  const now = new Date();
  
  const isQuizActive = now >= quizStartTime && now <= quizEndTime;
  const isQuizUpcoming = now < quizStartTime;
  const isQuizEnded = now > quizEndTime;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="mb-6"
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Dashboard
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg mb-8" glass>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
                    <CardDescription>Manage your quiz</CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant={quiz?.difficulty === 'easy' ? 'success' : quiz?.difficulty === 'medium' ? 'warning' : 'danger'} size="md">
                      {quiz?.difficulty}
                    </Badge>
                    
                    <Badge variant={quiz?.isPublic ? 'primary' : 'secondary'} size="md">
                      {quiz?.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center">
                    <Calendar className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Start Time</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(quiz?.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center">
                    <Clock className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {quiz?.duration} minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center">
                    <BookOpen className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {quiz?.numQuestions} questions
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center">
                    <Users className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Participants</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {approvedUsers.length} approved
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Status</h3>
                  
                  {isQuizUpcoming && (
                    <p className="text-slate-700 dark:text-slate-300">
                      This quiz will start on {formatDate(quiz?.startTime)}
                    </p>
                  )}
                  
                  {isQuizActive && (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      This quiz is currently active!
                    </p>
                  )}
                  
                  {isQuizEnded && (
                    <p className="text-slate-700 dark:text-slate-300">
                      This quiz ended on {formatDate(quiz?.endTime)}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  {isQuizUpcoming && (
                    <Button
                      onClick={handleEditQuestions}
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      icon={<Edit className="h-5 w-5" />}
                    >
                      Edit Questions
                    </Button>
                  )}
                  
                  {isQuizEnded && (
                    <Button
                      onClick={handleViewResults}
                      variant="gradient"
                      size="lg"
                      className="flex-1"
                    >
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Pending Participants */}
          {pendingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>
                    {pendingUsers.length} {pendingUsers.length === 1 ? 'user' : 'users'} waiting for approval
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {pendingUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">
                            {user.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            onClick={() => handleApproveUser(user.id)}
                            variant="success"
                            size="sm"
                            className="flex-1 md:flex-none"
                            icon={<CheckCircle className="h-4 w-4" />}
                          >
                            Approve
                          </Button>
                          
                          <Button
                            onClick={() => handleRejectUser(user.id)}
                            variant="danger"
                            size="sm"
                            className="flex-1 md:flex-none"
                            icon={<XCircle className="h-4 w-4" />}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Approved Participants */}
          {approvedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Approved Participants</CardTitle>
                  <CardDescription>
                    {approvedUsers.length} {approvedUsers.length === 1 ? 'user' : 'users'} approved to take this quiz
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {approvedUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">
                            {user.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                        
                        {isQuizUpcoming && (
                          <Button
                            onClick={() => handleRemoveUser(user.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            icon={<Trash2 className="h-4 w-4" />}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizManage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, Calendar, Clock, BookOpen, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';

function QuizDetails() {
  const { quizId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        
        if (!quizDoc.exists()) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }
        
        const quizData = quizDoc.data();
        setQuiz(quizData);
        
        // Check if user has applied or is approved
        setHasApplied(
          quizData.pendingParticipants?.includes(currentUser.uid) ||
          quizData.approvedParticipants?.includes(currentUser.uid)
        );
        
        setIsApproved(quizData.approvedParticipants?.includes(currentUser.uid));
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuiz();
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
  
  const handleApply = async () => {
    try {
      setError('');
      
      // Check if quiz is in the future
      const startTime = quiz.startTime.toDate ? quiz.startTime.toDate() : new Date(quiz.startTime);
      if (startTime <= new Date()) {
        return setError('This quiz has already started or ended');
      }
      
      // Update quiz document
      await updateDoc(doc(db, 'quizzes', quizId), {
        pendingParticipants: arrayUnion(currentUser.uid),
        updatedAt: serverTimestamp()
      });
      
      setHasApplied(true);
      setSuccess('Application submitted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error applying for quiz:', error);
      setError('Failed to apply for quiz. Please try again.');
    }
  };
  
  const handleCancelApplication = async () => {
    try {
      setError('');
      
      // Update quiz document
      await updateDoc(doc(db, 'quizzes', quizId), {
        pendingParticipants: arrayRemove(currentUser.uid),
        approvedParticipants: arrayRemove(currentUser.uid),
        updatedAt: serverTimestamp()
      });
      
      setHasApplied(false);
      setIsApproved(false);
      setSuccess('Application cancelled successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error cancelling application:', error);
      setError('Failed to cancel application. Please try again.');
    }
  };
  
  const handleStartQuiz = () => {
    navigate(`/quiz/${quizId}/take`);
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
        <div className="max-w-3xl mx-auto">
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
            <Card className="shadow-lg" glass>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
                    <CardDescription>Created by {quiz?.createdByName}</CardDescription>
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
                
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300">
                    {quiz?.description || 'No description provided'}
                  </p>
                </div>
                
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
                      <p className="text-sm text-slate-500 dark:text-slate-400">Topic</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {quiz?.topic}
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
                  
                  {hasApplied && !isApproved && (
                    <p className="text-amber-600 dark:text-amber-400 mt-2">
                      Your application is pending approval
                    </p>
                  )}
                  
                  {isApproved && (
                    <p className="text-green-600 dark:text-green-400 mt-2">
                      You are approved to take this quiz
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                {!hasApplied && isQuizUpcoming && (
                  <Button
                    onClick={handleApply}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    Apply to Join
                  </Button>
                )}
                
                {hasApplied && isQuizUpcoming && (
                  <Button
                    onClick={handleCancelApplication}
                    variant="outline"
                    size="lg"
                    className="w-full text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Cancel Application
                  </Button>
                )}
                
                {isApproved && isQuizActive && (
                  <Button
                    onClick={handleStartQuiz}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    Start Quiz
                  </Button>
                )}
                
                {isQuizEnded && (
                  <Button
                    onClick={() => navigate(`/quiz/${quizId}/results`)}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    View Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default QuizDetails;

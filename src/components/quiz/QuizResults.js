import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, Award, CheckCircle, XCircle, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';

function QuizResults() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [userSubmission, setUserSubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExplanations, setShowExplanations] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  useEffect(() => {
    async function fetchQuizAndResults() {
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
        setQuiz(quizData);
        
        // Check if quiz has ended
        const endTime = quizData.endTime.toDate ? quizData.endTime.toDate() : new Date(quizData.endTime);
        const now = new Date();
        
        if (now < endTime) {
          setError('Results will be available after the quiz ends');
          setLoading(false);
          return;
        }
        
        // Fetch user's submission
        const userSubmissionQuery = query(
          collection(db, 'submissions'),
          where('quizId', '==', quizId),
          where('userId', '==', currentUser.uid)
        );
        
        const userSubmissionSnapshot = await getDocs(userSubmissionQuery);
        
        if (!userSubmissionSnapshot.empty) {
          const submissionData = userSubmissionSnapshot.docs[0].data();
          setUserSubmission({
            id: userSubmissionSnapshot.docs[0].id,
            ...submissionData
          });
        }
        
        // If user is the quiz creator, fetch all submissions
        if (quizData.createdBy === currentUser.uid) {
          const allSubmissionsQuery = query(
            collection(db, 'submissions'),
            where('quizId', '==', quizId),
            orderBy('score', 'desc')
          );
          
          const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
          const submissionsData = await Promise.all(allSubmissionsSnapshot.docs.map(async doc => {
            const data = doc.data();
            
            // Fetch user details for each submission
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            const userData = userDoc.exists() ? userDoc.data() : { name: 'Unknown User' };
            
            return {
              id: doc.id,
              ...data,
              userName: userData.name
            };
          }));
          
          setAllSubmissions(submissionsData);
        }
      } catch (error) {
        console.error('Error fetching quiz and results:', error);
        setError('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuizAndResults();
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md text-center p-8">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2">Results Not Available</CardTitle>
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
        </main>
      </div>
    );
  }
  
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
                <CardTitle className="text-2xl">{quiz?.title} - Results</CardTitle>
                <CardDescription>
                  Quiz completed on {formatDate(quiz?.endTime)}
                </CardDescription>
              </CardHeader>
              
              {userSubmission ? (
                <CardContent className="space-y-6">
                  {/* Score summary */}
                  <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        Your Score
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        You answered {userSubmission.score} out of {userSubmission.totalQuestions} questions correctly
                      </p>
                    </div>
                    
                    <div className="relative w-32 h-32">
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 shadow-inner">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-500 to-secondary-500 transition-all duration-1000"
                            style={{ height: `${userSubmission.percentage}%` }}
                          ></div>
                        </div>
                        <div className="relative z-10 text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                          {Math.round(userSubmission.percentage)}%
                        </div>
                      </div>
                      <motion.div 
                        className="absolute -top-2 -right-2"
                        initial={{ rotate: -30, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <Award className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Answer review */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        Question Review
                      </h3>
                      <Switch
                        checked={showExplanations}
                        onChange={setShowExplanations}
                        label={showExplanations ? "Hide Explanations" : "Show Explanations"}
                        description={showExplanations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      {userSubmission.answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            answer.isCorrect
                              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">
                              Question {index + 1}
                            </h4>
                            <Badge
                              variant={answer.isCorrect ? "success" : "danger"}
                              size="sm"
                            >
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          
                          <p className="text-slate-700 dark:text-slate-300 mb-3">
                            {answer.question}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className={`inline-flex items-center justify-center rounded-full w-6 h-6 mr-2 ${
                                answer.isCorrect 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              }`}>
                                {answer.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Your answer:
                                </p>
                                <p className={`text-sm ${answer.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {answer.selectedOption}
                                </p>
                              </div>
                            </div>
                            
                            {!answer.isCorrect && (
                              <div className="flex items-start">
                                <span className="inline-flex items-center justify-center rounded-full w-6 h-6 mr-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Correct answer:
                                  </p>
                                  <p className="text-sm text-green-600 dark:text-green-400">
                                    {answer.correctOption}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    You didn't participate in this quiz
                  </p>
                </CardContent>
              )}
            </Card>
          </motion.div>
          
          {/* All participants results (only for quiz creator) */}
          {quiz?.createdBy === currentUser.uid && allSubmissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-lg" glass>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Participants Results</CardTitle>
                      <CardDescription>
                        {allSubmissions.length} participants completed this quiz
                      </CardDescription>
                    </div>
                    
                    <Switch
                      checked={showAllParticipants}
                      onChange={setShowAllParticipants}
                      label=""
                      description={<Users className="h-4 w-4" />}
                    />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Rank</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Name</th>
                          <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Score</th>
                          <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Percentage</th>
                          <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSubmissions.slice(0, showAllParticipants ? undefined : 5).map((submission, index) => (
                          <tr 
                            key={submission.id}
                            className={`border-b border-slate-200 dark:border-slate-700 ${
                              submission.userId === currentUser.uid ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                              {submission.userName}
                              {submission.userId === currentUser.uid && (
                                <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">(You)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-800 dark:text-slate-200">
                              {submission.score}/{submission.totalQuestions}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant={
                                  submission.percentage >= 80 ? "success" :
                                  submission.percentage >= 60 ? "primary" :
                                  submission.percentage >= 40 ? "warning" : "danger"
                                }
                                size="sm"
                              >
                                {Math.round(submission.percentage)}%
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(submission.completedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {!showAllParticipants && allSubmissions.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={() => setShowAllParticipants(true)}
                        variant="outline"
                        size="sm"
                      >
                        Show All {allSubmissions.length} Participants
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizResults;

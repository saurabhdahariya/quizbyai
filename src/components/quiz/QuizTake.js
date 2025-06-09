import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Clock, AlertCircle, ChevronRight, LogOut } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';

function QuizTake() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizEnded, setQuizEnded] = useState(false);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle quiz end
  const endQuiz = useCallback(async () => {
    try {
      setQuizEnded(true);
      
      // Calculate score
      const score = answers.filter(answer => answer.isCorrect).length;
      
      // Save submission to Firestore
      await addDoc(collection(db, 'submissions'), {
        quizId,
        userId: currentUser.uid,
        answers,
        score,
        totalQuestions: questions.length,
        percentage: (score / questions.length) * 100,
        completedAt: serverTimestamp()
      });
      
      // Navigate to results page
      navigate(`/quiz/${quizId}/results`);
    } catch (error) {
      console.error('Error ending quiz:', error);
      setError('Failed to submit quiz results. Please try again.');
    }
  }, [quizId, currentUser, answers, questions, navigate]);
  
  // Load quiz and questions
  useEffect(() => {
    async function fetchQuizAndQuestions() {
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
        
        // Check if user is approved
        if (!quizData.approvedParticipants?.includes(currentUser.uid)) {
          setError('You are not approved to take this quiz');
          setLoading(false);
          return;
        }
        
        // Check if quiz is active
        const startTime = quizData.startTime.toDate ? quizData.startTime.toDate() : new Date(quizData.startTime);
        const endTime = quizData.endTime.toDate ? quizData.endTime.toDate() : new Date(quizData.endTime);
        const now = new Date();
        
        if (now < startTime) {
          setError('This quiz has not started yet');
          setLoading(false);
          return;
        }
        
        if (now > endTime) {
          setError('This quiz has already ended');
          setLoading(false);
          return;
        }
        
        setQuiz(quizData);
        
        // Set timer
        const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remainingTime);
        
        // Fetch questions
        const questionsQuery = query(
          collection(db, 'questions'),
          where('quizId', '==', quizId)
        );
        
        const questionsSnapshot = await getDocs(questionsQuery);
        const questionsData = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Shuffle questions
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
      } catch (error) {
        console.error('Error fetching quiz and questions:', error);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuizAndQuestions();
  }, [quizId, currentUser]);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || quizEnded) {
      if (!quizEnded && questions.length > 0) {
        endQuiz();
      }
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, quizEnded, questions, endQuiz]);
  
  // Handle option selection
  const handleOptionSelect = (option, index) => {
    if (selectedOption !== null) return; // Prevent changing answer
    
    setSelectedOption(option);
    
    // Check if answer is correct
    const isCorrect = option === questions[currentQuestion].answer;
    
    // Save answer
    setAnswers([...answers, {
      questionId: questions[currentQuestion].id,
      question: questions[currentQuestion].question,
      selectedOption: option,
      correctOption: questions[currentQuestion].answer,
      isCorrect
    }]);
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      endQuiz();
    }
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Error</CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="primary"
            size="lg"
            icon={<LogOut className="h-5 w-5" />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">No Questions</CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mb-6">This quiz doesn't have any questions yet.</p>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="primary"
            size="lg"
            icon={<LogOut className="h-5 w-5" />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  const currentQuestionData = questions[currentQuestion];
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg" glass>
            <CardHeader className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{quiz?.title}</CardTitle>
                  <CardDescription className="text-white/80">
                    Question {currentQuestion + 1} of {questions.length}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className={`text-xl font-mono ${timeLeft < 60 ? 'text-red-300' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {currentQuestionData.question}
                  </h2>
                  
                  <div className="space-y-3">
                    {currentQuestionData.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleOptionSelect(option, index)}
                        disabled={selectedOption !== null}
                        className={`w-full text-left p-4 rounded-lg transition-colors flex items-start
                          ${selectedOption === option
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : selectedOption !== null
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow'
                          }`}
                        whileHover={selectedOption === null ? { scale: 1.01 } : {}}
                        whileTap={selectedOption === null ? { scale: 0.99 } : {}}
                      >
                        <span className={`font-bold mr-3 text-lg rounded-full w-8 h-8 flex items-center justify-center
                          ${selectedOption === option 
                            ? 'bg-white/20 text-white' 
                            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
                          {optionLetters[index]}
                        </span>
                        <span className="pt-1">{option}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
            
            <CardFooter>
              {selectedOption && (
                <Button
                  onClick={handleNextQuestion}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  icon={<ChevronRight className="h-5 w-5" />}
                >
                  {currentQuestion + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default QuizTake;

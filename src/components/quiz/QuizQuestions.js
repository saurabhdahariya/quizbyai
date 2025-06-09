import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { generateQuestions } from '../../utils/api';
import { parseQuestions } from '../../utils/parser';
import { Save, ArrowLeft, Plus, Trash2, Edit, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';

function QuizQuestions() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // For manual question entry
  const [showAddForm, setShowAddForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [explanation, setExplanation] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    async function fetchQuizAndQuestions() {
      try {
        setLoading(true);

        // Check if we're using a mock quiz from localStorage
        if (quizId.startsWith('quiz_')) {
          console.log('Loading mock quiz from localStorage');
          const storedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
          const mockQuiz = storedQuizzes.find(q => q.id === quizId);

          if (!mockQuiz) {
            setError('Quiz not found in local storage');
            setLoading(false);
            return;
          }

          // Check if user is the creator
          if (mockQuiz.createdBy !== currentUser.uid) {
            setError('You do not have permission to edit this quiz');
            setLoading(false);
            return;
          }

          setQuiz(mockQuiz);

          // Get mock questions from localStorage
          const storedQuestions = JSON.parse(localStorage.getItem(`questions_${quizId}`) || '[]');
          setQuestions(storedQuestions);
          setLoading(false);
          return;
        }

        // Try to fetch from Firestore
        try {
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
            setError('You do not have permission to edit this quiz');
            setLoading(false);
            return;
          }

          setQuiz(quizData);

          // Fetch existing questions
          try {
            const questionsQuery = query(
              collection(db, 'questions'),
              where('quizId', '==', quizId)
            );

            const questionsSnapshot = await getDocs(questionsQuery);
            const questionsData = questionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            setQuestions(questionsData);
          } catch (questionsError) {
            console.error('Error fetching questions:', questionsError);
            setQuestions([]);
          }
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          setError('Failed to load quiz from Firestore. Check your connection.');
        }
      } catch (error) {
        console.error('Error fetching quiz and questions:', error);
        setError('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    }

    fetchQuizAndQuestions();
  }, [quizId, currentUser]);

  const handleGenerateQuestions = async () => {
    try {
      setGenerating(true);
      setError('');

      // Calculate how many more questions we need
      const remainingQuestions = quiz.numQuestions - questions.length;

      if (remainingQuestions <= 0) {
        setError(`You already have ${questions.length} questions. Delete some to generate new ones.`);
        setGenerating(false);
        return;
      }

      // Generate questions using OpenAI
      const rawQuestions = await generateQuestions(quiz.topic, quiz.difficulty, remainingQuestions);
      const parsedQuestions = parseQuestions(rawQuestions);

      // Check if we're using a mock quiz from localStorage
      if (quizId.startsWith('quiz_')) {
        console.log('Saving generated questions to localStorage');

        const savedQuestions = [];

        for (const question of parsedQuestions) {
          const mockQuestionId = 'question_' + Math.random().toString(36).substring(2, 15);
          const questionData = {
            id: mockQuestionId,
            quizId,
            question: question.question,
            options: question.options,
            answer: question.answer,
            explanation: question.explanation,
            createdAt: new Date().toISOString()
          };

          savedQuestions.push(questionData);
        }

        const updatedQuestions = [...questions, ...savedQuestions];
        localStorage.setItem(`questions_${quizId}`, JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
        setSuccess(`Generated ${savedQuestions.length} new questions`);
      } else {
        // Try to save to Firestore
        try {
          // Save questions to Firestore
          const savedQuestions = [];

          for (const question of parsedQuestions) {
            const questionData = {
              quizId,
              question: question.question,
              options: question.options,
              answer: question.answer,
              explanation: question.explanation,
              createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'questions'), questionData);
            savedQuestions.push({
              id: docRef.id,
              ...questionData
            });
          }

          setQuestions([...questions, ...savedQuestions]);
          setSuccess(`Generated ${savedQuestions.length} new questions`);
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);

          // Fallback to localStorage if Firestore fails
          const savedQuestions = [];

          for (const question of parsedQuestions) {
            const mockQuestionId = 'question_' + Math.random().toString(36).substring(2, 15);
            const questionData = {
              id: mockQuestionId,
              quizId,
              question: question.question,
              options: question.options,
              answer: question.answer,
              explanation: question.explanation,
              createdAt: new Date().toISOString()
            };

            savedQuestions.push(questionData);
          }

          setQuestions([...questions, ...savedQuestions]);
          setSuccess(`Generated ${savedQuestions.length} new questions (saved locally)`);
        }
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      setError('');

      if (!questionText.trim()) {
        return setError('Question text is required');
      }

      if (!optionA.trim() || !optionB.trim()) {
        return setError('At least two options are required');
      }

      if (!correctOption) {
        return setError('Please select the correct answer');
      }

      const options = [
        optionA,
        optionB,
        optionC.trim() ? optionC : null,
        optionD.trim() ? optionD : null,
        optionE.trim() ? optionE : null
      ].filter(Boolean);

      let answer;
      switch (correctOption) {
        case 'A': answer = optionA; break;
        case 'B': answer = optionB; break;
        case 'C': answer = optionC; break;
        case 'D': answer = optionD; break;
        case 'E': answer = optionE; break;
        default: answer = '';
      }

      const questionData = {
        quizId,
        question: questionText,
        options,
        answer,
        explanation: explanation || 'No explanation provided',
        createdAt: new Date().toISOString() // Use ISO string instead of serverTimestamp for compatibility
      };

      // Check if we're using a mock quiz from localStorage
      if (quizId.startsWith('quiz_')) {
        console.log('Saving question to localStorage');

        if (editingIndex >= 0) {
          // Update existing question
          const updatedQuestions = [...questions];
          updatedQuestions[editingIndex] = {
            id: questions[editingIndex].id,
            ...questionData
          };

          localStorage.setItem(`questions_${quizId}`, JSON.stringify(updatedQuestions));
          setQuestions(updatedQuestions);
          setSuccess('Question updated successfully');
        } else {
          // Add new question
          const mockQuestionId = 'question_' + Math.random().toString(36).substring(2, 15);
          const newQuestion = {
            id: mockQuestionId,
            ...questionData
          };

          const updatedQuestions = [...questions, newQuestion];
          localStorage.setItem(`questions_${quizId}`, JSON.stringify(updatedQuestions));
          setQuestions(updatedQuestions);
          setSuccess('Question added successfully');
        }
      } else {
        // Try to use Firestore
        try {
          if (editingIndex >= 0) {
            // Update existing question
            const questionId = questions[editingIndex].id;
            await updateDoc(doc(db, 'questions', questionId), questionData);

            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = {
              id: questionId,
              ...questionData
            };

            setQuestions(updatedQuestions);
            setSuccess('Question updated successfully');
          } else {
            // Add new question
            const docRef = await addDoc(collection(db, 'questions'), questionData);

            setQuestions([...questions, {
              id: docRef.id,
              ...questionData
            }]);

            setSuccess('Question added successfully');
          }
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          setError('Failed to save to Firestore. Check your connection.');
          return;
        }
      }

      // Reset form
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setOptionE('');
      setCorrectOption('');
      setExplanation('');
      setEditingIndex(-1);
      setShowAddForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to save question. Please try again.');
    }
  };

  const handleEditQuestion = (index) => {
    const question = questions[index];

    setQuestionText(question.question);
    setOptionA(question.options[0] || '');
    setOptionB(question.options[1] || '');
    setOptionC(question.options[2] || '');
    setOptionD(question.options[3] || '');
    setOptionE(question.options[4] || '');

    // Determine correct option letter
    const correctOptionIndex = question.options.findIndex(opt => opt === question.answer);
    setCorrectOption(correctOptionIndex >= 0 ? String.fromCharCode(65 + correctOptionIndex) : '');

    setExplanation(question.explanation || '');
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDeleteQuestion = async (index) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const questionId = questions[index].id;
      await updateDoc(doc(db, 'questions', questionId), {
        deleted: true,
        updatedAt: serverTimestamp()
      });

      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);

      setSuccess('Question deleted successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question. Please try again.');
    }
  };

  const handleFinish = () => {
    if (questions.length < quiz.numQuestions) {
      if (!window.confirm(`You've only added ${questions.length} of ${quiz.numQuestions} questions. Are you sure you want to finish?`)) {
        return;
      }
    }

    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
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
                <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
                <CardDescription>
                  Add questions for your quiz ({questions.length} of {quiz?.numQuestions} questions added)
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400 mb-4"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center text-green-600 dark:text-green-400 mb-4"
                  >
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                  </motion.div>
                )}

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="primary"
                    size="lg"
                    icon={<Plus className="h-5 w-5" />}
                  >
                    Add Question Manually
                  </Button>

                  <Button
                    onClick={handleGenerateQuestions}
                    variant="secondary"
                    size="lg"
                    isLoading={generating}
                    icon={generating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    disabled={generating || questions.length >= quiz?.numQuestions}
                  >
                    Generate Questions with AI
                  </Button>
                </div>

                {/* Question list */}
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                          Question {index + 1}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditQuestion(index)}
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            icon={<Trash2 className="h-4 w-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 mb-3">{question.question}</p>

                      <div className="space-y-1 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-md ${
                              option === question.answer
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-slate-50 dark:bg-slate-700/30'
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}:
                            </span>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={handleFinish}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  icon={<Save className="h-5 w-5" />}
                >
                  Finish
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Add/Edit Question Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg mb-8">
                <CardHeader>
                  <CardTitle>{editingIndex >= 0 ? 'Edit Question' : 'Add New Question'}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Input
                    label="Question"
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Option A"
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="First option"
                      required
                    />

                    <Input
                      label="Option B"
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="Second option"
                      required
                    />

                    <Input
                      label="Option C"
                      type="text"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      placeholder="Third option (optional)"
                    />

                    <Input
                      label="Option D"
                      type="text"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      placeholder="Fourth option (optional)"
                    />

                    <Input
                      label="Option E"
                      type="text"
                      value={optionE}
                      onChange={(e) => setOptionE(e.target.value)}
                      placeholder="Fifth option (optional)"
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Correct Answer
                      </label>
                      <select
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500/20 focus:outline-none focus:ring-2 transition-all duration-200"
                        required
                      >
                        <option value="">Select correct option</option>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        {optionC.trim() && <option value="C">Option C</option>}
                        {optionD.trim() && <option value="D">Option D</option>}
                        {optionE.trim() && <option value="E">Option E</option>}
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Explanation (Optional)"
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Explain why the answer is correct"
                  />
                </CardContent>

                <CardFooter className="flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingIndex(-1);
                      setQuestionText('');
                      setOptionA('');
                      setOptionB('');
                      setOptionC('');
                      setOptionD('');
                      setOptionE('');
                      setCorrectOption('');
                      setExplanation('');
                    }}
                    variant="outline"
                    size="md"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleAddQuestion}
                    variant="primary"
                    size="md"
                  >
                    {editingIndex >= 0 ? 'Update Question' : 'Add Question'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizQuestions;

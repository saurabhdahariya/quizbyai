import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Clock,
  Users,
  Lock,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Switch from '../ui/Switch';
import { createQuiz } from '../../services/quizService';

const CustomQuizOrganizer = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Quiz metadata
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [subject, setSubject] = useState(''); // Required field for createQuiz
  const [difficulty, setDifficulty] = useState('medium'); // Required field for createQuiz
  const [timeLimit, setTimeLimit] = useState(30); // minutes
  const [isPublic, setIsPublic] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Questions
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
  ]);

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const validateQuiz = () => {
    setError('');

    if (!quizTitle.trim()) {
      setError('Quiz title is required');
      return false;
    }

    if (!quizDescription.trim()) {
      setError('Quiz description is required');
      return false;
    }

    if (!subject.trim()) {
      setError('Subject is required');
      return false;
    }

    if (!startTime || !endTime) {
      setError('Start time and end time are required');
      return false;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('End time must be after start time');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is required`);
        return false;
      }

      if (q.options.some(option => !option.trim())) {
        setError(`All options for question ${i + 1} are required`);
        return false;
      }

      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        setError(`Please select a correct answer for question ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return;

    setIsCreating(true);
    setError('');

    try {
      const quizData = {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        subject: subject.trim(), // Required field
        difficulty: difficulty, // Required field
        numQuestions: questions.length, // Required field
        questions: questions,
        timeLimit: timeLimit,
        isPublic: isPublic,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous',
        creatorEmail: currentUser.email,
        status: 'open_for_applications',
        maxParticipants: isPublic ? 1000 : 50,
        currentParticipants: 0
      };

      const quizResult = await createQuiz(quizData, currentUser);
      setSuccess('Quiz created successfully!');
      
      setTimeout(() => {
        navigate(`/quiz/${quizResult.id}/manage`);
      }, 2000);

    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentUser) {
    return null;
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
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Create Custom Quiz
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Design your own quiz with custom questions and settings
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quiz Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>
                Configure your quiz details and access settings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Quiz Title"
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />

                <Input
                  label="Subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics, Science, History"
                  required
                />

                <Select
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  options={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' }
                  ]}
                  required
                />

                <Input
                  label="Time Limit (minutes)"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min="5"
                  max="180"
                  required
                />

                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />

                <Input
                  label="End Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Quiz Description"
                type="textarea"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Describe what this quiz is about..."
                rows={3}
                required
              />

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  )}
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {isPublic ? 'Public Quiz' : 'Private Quiz'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {isPublic 
                        ? 'Anyone can apply to join this quiz'
                        : 'Only invited users can join this quiz'
                      }
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isPublic}
                  onChange={setIsPublic}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quiz Questions</CardTitle>
                  <CardDescription>
                    Add questions with multiple choice answers
                  </CardDescription>
                </div>
                <Button
                  onClick={addQuestion}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Question
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {questions.map((question, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Question {questionIndex + 1}
                    </h3>
                    {questions.length > 1 && (
                      <Button
                        onClick={() => removeQuestion(questionIndex)}
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Question"
                      type="textarea"
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      placeholder="Enter your question..."
                      rows={2}
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="relative">
                          <Input
                            label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)}`}
                            required
                            className={question.correctAnswer === optionIndex ? 'border-green-500 dark:border-green-400' : ''}
                          />
                          {question.correctAnswer === optionIndex && (
                            <CheckCircle className="absolute top-8 right-3 h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    <Select
                      label="Correct Answer"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', parseInt(e.target.value))}
                      options={[
                        { value: 0, label: 'Option A' },
                        { value: 1, label: 'Option B' },
                        { value: 2, label: 'Option C' },
                        { value: 3, label: 'Option D' }
                      ]}
                      required
                    />

                    <Input
                      label="Explanation (Optional)"
                      type="textarea"
                      value={question.explanation}
                      onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                      placeholder="Explain why this is the correct answer..."
                      rows={2}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCreateQuiz}
              variant="gradient"
              size="xl"
              className="px-12 py-4"
              disabled={isCreating}
              isLoading={isCreating}
              icon={<Save className="h-6 w-6" />}
            >
              {isCreating ? 'Creating Quiz...' : 'Create Quiz'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomQuizOrganizer;

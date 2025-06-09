import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Save, ArrowLeft, Clock, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import Header from '../Header';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Switch from '../ui/Switch';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';

function CreateQuiz() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [isPublic, setIsPublic] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const questionOptions = [
    { value: 5, label: '5 Questions' },
    { value: 10, label: '10 Questions' },
    { value: 15, label: '15 Questions' },
    { value: 20, label: '20 Questions' }
  ];

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
    { value: 120, label: '120 minutes' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      return setError('Quiz title is required');
    }

    if (!topic.trim()) {
      return setError('Quiz topic is required');
    }

    if (!startDate || !startTime) {
      return setError('Start date and time are required');
    }

    try {
      setError('');
      setLoading(true);

      // Combine date and time into a timestamp
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

      // Check if start time is in the future
      if (startDateTime <= new Date()) {
        setLoading(false);
        return setError('Start time must be in the future');
      }

      console.log('Creating quiz with data:', {
        title,
        description,
        topic,
        difficulty,
        numQuestions,
        startDateTime: startDateTime.toString(),
        endDateTime: endDateTime.toString(),
        duration,
        isPublic,
        currentUser: currentUser ? currentUser.uid : 'No user'
      });

      // Create quiz document with proper Firestore schema
      const quizData = {
        // Basic quiz information
        title: title.trim(),
        description: description.trim() || '',
        topic: topic.trim(),
        difficulty,

        // Quiz configuration
        numQuestions: parseInt(numQuestions),
        duration: parseInt(duration), // Duration in minutes
        timeLimit: parseInt(duration) * 60, // Time limit in seconds for easier calculations

        // Scheduling
        startTime: startDateTime,
        endTime: endDateTime,

        // Access control
        isPublic,

        // Author information
        createdBy: currentUser.uid,
        createdByName: userProfile?.name || currentUser.displayName || 'Anonymous User',
        createdByEmail: currentUser.email || '',

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Participant management
        approvedParticipants: [],
        pendingParticipants: [],

        // Quiz status
        status: 'draft', // draft, active, completed

        // Questions will be stored in a separate 'questions' collection
        // but we'll track the count here
        questionsCount: 0,

        // Results tracking
        totalSubmissions: 0,
        averageScore: 0,

        // Additional metadata
        tags: [topic.toLowerCase()],
        category: topic,
        language: 'en',
        version: 1
      };

      // Robust createQuiz function with proper error handling
      await createQuizInFirestore(quizData);

    } catch (error) {
      console.error('Error in form validation:', error);
      setError(`Failed to create quiz: ${error.message}`);
      setLoading(false);
    }
  };

  // Separate function for creating quiz in Firestore
  const createQuizInFirestore = async (quizData) => {
    try {
      console.log('=== CREATING QUIZ IN FIRESTORE ===');
      console.log('Quiz data to be saved:', JSON.stringify(quizData, null, 2));

      // Validate required fields before sending to Firestore
      const requiredFields = ['title', 'topic', 'difficulty', 'numQuestions', 'duration', 'createdBy'];
      const missingFields = requiredFields.filter(field => !quizData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate data types
      if (typeof quizData.numQuestions !== 'number' || quizData.numQuestions <= 0) {
        throw new Error('Number of questions must be a positive number');
      }

      if (typeof quizData.duration !== 'number' || quizData.duration <= 0) {
        throw new Error('Duration must be a positive number');
      }

      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error('Firestore database is not initialized');
      }

      console.log('Validation passed. Attempting to add document to Firestore...');

      // Try to create the document in Firestore
      const quizRef = await addDoc(collection(db, 'quizzes'), quizData);

      console.log('✅ Quiz successfully created in Firestore with ID:', quizRef.id);

      // Update the quiz status to indicate it was successfully saved
      await updateDoc(quizRef, {
        id: quizRef.id,
        status: 'created',
        updatedAt: serverTimestamp()
      });

      console.log('✅ Quiz metadata updated successfully');

      setSuccess('Quiz created successfully!');

      // Navigate to quiz questions page after a short delay
      setTimeout(() => {
        navigate(`/quiz/${quizRef.id}/questions`);
      }, 1000);

    } catch (firestoreError) {
      console.error('❌ Firestore error details:', {
        code: firestoreError.code,
        message: firestoreError.message,
        stack: firestoreError.stack
      });

      // Check for specific Firestore errors
      if (firestoreError.code === 'permission-denied') {
        setError('Permission denied. Please check your Firestore security rules.');
      } else if (firestoreError.code === 'unavailable') {
        setError('Firestore is currently unavailable. Please try again later.');
      } else if (firestoreError.code === 'failed-precondition') {
        setError('Firestore operation failed. Please check your internet connection.');
      } else {
        // Fallback to localStorage for development
        console.log('🔄 Falling back to localStorage...');
        await createQuizInLocalStorage(quizData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback function for localStorage
  const createQuizInLocalStorage = async (quizData) => {
    try {
      const mockId = 'quiz_' + Math.random().toString(36).substring(2, 15);

      // Convert Firestore timestamps to ISO strings for localStorage
      const localQuizData = {
        ...quizData,
        id: mockId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startTime: quizData.startTime.toISOString(),
        endTime: quizData.endTime.toISOString()
      };

      // Store in localStorage
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      localStorage.setItem('quizzes', JSON.stringify([...existingQuizzes, localQuizData]));

      console.log('✅ Quiz saved to localStorage with ID:', mockId);
      setSuccess('Quiz created successfully (saved locally)!');

      // Navigate to quiz questions page
      setTimeout(() => {
        navigate(`/quiz/${mockId}/questions`);
      }, 1000);

    } catch (localStorageError) {
      console.error('❌ LocalStorage error:', localStorageError);
      setError('Failed to save quiz. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="mb-6"
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg" glass>
              <CardHeader>
                <CardTitle className="text-2xl">Create New Quiz</CardTitle>
                <CardDescription>Set up your quiz details and schedule</CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
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
                      <Save className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{success}</p>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Basic Information</h3>

                    <Input
                      label="Quiz Title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for your quiz"
                      required
                    />

                    <Input
                      label="Description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what your quiz is about"
                    />

                    <Input
                      label="Topic"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter the main topic or subject"
                      required
                      icon={<BookOpen className="h-5 w-5 text-slate-400" />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        options={difficultyOptions}
                      />

                      <Select
                        label="Number of Questions"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        options={questionOptions}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Schedule</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        icon={<Calendar className="h-5 w-5 text-slate-400" />}
                      />

                      <Input
                        label="Start Time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        icon={<Clock className="h-5 w-5 text-slate-400" />}
                      />
                    </div>

                    <Select
                      label="Duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      options={durationOptions}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Access</h3>

                    <Switch
                      checked={isPublic}
                      onChange={setIsPublic}
                      label="Public Quiz"
                      description={isPublic ?
                        "Anyone can see and request to join this quiz" :
                        "Only people you invite can join this quiz"}
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                    icon={<Save className="h-5 w-5" />}
                  >
                    Create Quiz
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default CreateQuiz;

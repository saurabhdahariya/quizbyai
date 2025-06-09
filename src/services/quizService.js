import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ==================== QUIZ CREATION ====================

export const createQuiz = async (quizData, currentUser) => {
  try {
    console.log('Creating quiz with data:', quizData);

    // Validate required fields
    const requiredFields = ['title', 'subject', 'difficulty', 'numQuestions', 'timeLimit', 'startTime'];
    const missingFields = requiredFields.filter(field => !quizData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Calculate end time and application deadline
    const startTime = new Date(quizData.startTime);
    const endTime = new Date(startTime.getTime() + (quizData.timeLimit * 60 * 1000));
    const applicationDeadline = new Date(startTime.getTime() - (30 * 60 * 1000)); // 30 min before start

    const quiz = {
      // Basic Information
      title: quizData.title.trim(),
      subject: quizData.subject.trim(),
      topic: quizData.topic?.trim() || quizData.subject,
      difficulty: quizData.difficulty,

      // Configuration
      numQuestions: parseInt(quizData.numQuestions),
      timeLimit: parseInt(quizData.timeLimit),

      // Scheduling & Access
      startTime: startTime,
      endTime: endTime,
      applicationDeadline: applicationDeadline,

      // Creator Information
      creatorId: currentUser.uid,
      creatorName: currentUser.displayName || 'Anonymous',
      creatorEmail: currentUser.email,

      // Access Control
      requiresApplication: quizData.requiresApplication ?? true,
      maxParticipants: quizData.maxParticipants || null,
      isPublic: quizData.isPublic ?? true,

      // Status
      status: 'draft',

      // Statistics
      totalApplicants: 0,
      totalParticipants: 0,
      averageScore: 0,
      questionsCount: 0,

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Metadata
      tags: [quizData.subject.toLowerCase()],
      category: quizData.subject,
      language: 'en'
    };

    const quizRef = await addDoc(collection(db, 'quizzes'), quiz);
    console.log('Quiz created with ID:', quizRef.id);

    return { id: quizRef.id, ...quiz };
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

// ==================== AI QUIZ CREATION ====================

export const createAIQuiz = async (aiQuizData, currentUser, generatedQuestions = []) => {
  try {
    console.log('Creating AI quiz with data:', aiQuizData);
    console.log('Generated questions count:', generatedQuestions.length);

    const aiQuiz = {
      // Basic Information
      title: aiQuizData.title || `${aiQuizData.subject} - ${aiQuizData.difficulty} Quiz`,
      subject: aiQuizData.subject,
      difficulty: aiQuizData.difficulty,

      // Configuration
      numQuestions: parseInt(aiQuizData.numQuestions),
      timeLimit: parseInt(aiQuizData.timeLimit || 30),
      timeLimitType: aiQuizData.timeLimitType || 'total_duration',
      timePerQuestion: aiQuizData.timePerQuestion || 60,

      // AI Generation Details
      generatedBy: 'aimlapi-gpt-3.5-turbo',
      generationPrompt: aiQuizData.prompt || '',
      generatedAt: serverTimestamp(),

      // Access (AI quizzes are always accessible)
      isPublic: true,
      requiresApplication: false,

      // Creator (user who requested the AI quiz)
      requestedBy: currentUser.uid,
      requestedByName: currentUser.displayName || 'Anonymous',
      requestedByEmail: currentUser.email || '',

      // Status
      status: 'active',

      // Usage Statistics
      totalAttempts: 0,
      averageScore: 0,
      popularityScore: 0,
      questionsCount: generatedQuestions.length,

      // Timestamps
      createdAt: serverTimestamp(),
      lastAttemptAt: null,

      // Metadata
      tags: [aiQuizData.subject.toLowerCase()],
      category: aiQuizData.subject,

      // Store questions directly in the document for AI quizzes (for simplicity)
      questions: generatedQuestions.map((q, index) => ({
        id: `q_${index + 1}`,
        order: index + 1,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        createdAt: new Date().toISOString()
      }))
    };

    const aiQuizRef = await addDoc(collection(db, 'ai_quizzes'), aiQuiz);
    console.log('AI Quiz created with ID:', aiQuizRef.id);

    // Update user statistics
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(userRef, {
          quizzesCreated: (userData.quizzesCreated || 0) + 1,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || 'Anonymous',
          role: 'student',
          quizzesCreated: 1,
          quizzesTaken: 0,
          averageScore: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (userUpdateError) {
      console.warn('Failed to update user statistics:', userUpdateError);
    }

    return { id: aiQuizRef.id, ...aiQuiz };
  } catch (error) {
    console.error('Error creating AI quiz:', error);
    throw error;
  }
};

// ==================== QUIZ APPLICATION ====================

export const applyToQuiz = async (quizId, currentUser) => {
  try {
    console.log('Applying to quiz:', quizId);

    // Check if quiz exists and is open for applications
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }

    const quiz = quizDoc.data();
    const now = new Date();

    // Check if applications are still open
    if (quiz.applicationDeadline && now > quiz.applicationDeadline.toDate()) {
      throw new Error('Application deadline has passed');
    }

    // Check if user already applied
    const existingApplicationQuery = query(
      collection(db, 'quiz_applications'),
      where('quizId', '==', quizId),
      where('userId', '==', currentUser.uid)
    );

    const existingApplications = await getDocs(existingApplicationQuery);
    if (!existingApplications.empty) {
      throw new Error('You have already applied to this quiz');
    }

    // Create application
    const application = {
      quizId: quizId,
      userId: currentUser.uid,
      quizTitle: quiz.title,
      quizStartTime: quiz.startTime,

      appliedAt: serverTimestamp(),
      status: 'pending',
      approvedAt: null,
      approvedBy: null,

      userName: currentUser.displayName || 'Anonymous',
      userEmail: currentUser.email,

      hasAccess: false,
      accessGrantedAt: null
    };

    // Use transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      // Add application
      const applicationRef = doc(collection(db, 'quiz_applications'));
      transaction.set(applicationRef, application);

      // Update quiz applicant count
      const quizRef = doc(db, 'quizzes', quizId);
      transaction.update(quizRef, {
        totalApplicants: quiz.totalApplicants + 1,
        updatedAt: serverTimestamp()
      });
    });

    console.log('Application submitted successfully');
    return application;
  } catch (error) {
    console.error('Error applying to quiz:', error);
    throw error;
  }
};

// ==================== ACCESS CONTROL ====================

export const canAccessQuiz = async (quizId, userId, quizType = 'custom') => {
  try {
    console.log('Checking access for quiz:', quizId, 'user:', userId);

    const collectionName = quizType === 'ai' ? 'ai_quizzes' : 'quizzes';
    const quizDoc = await getDoc(doc(db, collectionName, quizId));

    if (!quizDoc.exists()) {
      return { canAccess: false, reason: 'Quiz not found' };
    }

    const quiz = quizDoc.data();

    // AI quizzes are always accessible
    if (quizType === 'ai') {
      return { canAccess: true, reason: 'AI quiz - always accessible' };
    }

    // Check if user is the creator
    if (quiz.creatorId === userId) {
      return { canAccess: true, reason: 'Quiz creator' };
    }

    // Check if quiz requires application
    if (!quiz.requiresApplication) {
      return { canAccess: true, reason: 'Public quiz - no application required' };
    }

    // Check if user has approved application
    const applicationQuery = query(
      collection(db, 'quiz_applications'),
      where('quizId', '==', quizId),
      where('userId', '==', userId),
      where('status', '==', 'approved')
    );

    const applications = await getDocs(applicationQuery);
    if (!applications.empty) {
      return { canAccess: true, reason: 'Approved application' };
    }

    return { canAccess: false, reason: 'No approved application found' };
  } catch (error) {
    console.error('Error checking quiz access:', error);
    return { canAccess: false, reason: 'Error checking access' };
  }
};

// ==================== QUIZ SUBMISSION ====================

export const submitQuiz = async (quizId, userId, answers, quizType = 'custom', timeSpent = 0) => {
  try {
    console.log('Submitting quiz:', quizId, 'for user:', userId);

    // Validate access
    const accessCheck = await canAccessQuiz(quizId, userId, quizType);
    if (!accessCheck.canAccess) {
      throw new Error(`Access denied: ${accessCheck.reason}`);
    }

    // Get quiz details
    const collectionName = quizType === 'ai' ? 'ai_quizzes' : 'quizzes';
    const quizDoc = await getDoc(doc(db, collectionName, quizId));
    const quiz = quizDoc.data();

    // Calculate score
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    // Create result document
    const result = {
      quizId: quizId,
      userId: userId,
      quizType: quizType,

      quizTitle: quiz.title,
      quizSubject: quiz.subject,
      quizDifficulty: quiz.difficulty,

      startedAt: new Date(Date.now() - (timeSpent * 1000)),
      completedAt: serverTimestamp(),
      timeSpent: timeSpent,
      timeLimitSeconds: quiz.timeLimit * 60,

      answers: answers,
      score: correctAnswers,
      totalQuestions: totalQuestions,
      percentage: percentage,
      grade: grade,

      status: 'completed',
      isVisible: true, // Results are visible after submission

      userName: answers[0]?.userName || 'Anonymous',
      userEmail: answers[0]?.userEmail || ''
    };

    // Use transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      // Add result
      const resultRef = doc(collection(db, 'quiz_results'));
      transaction.set(resultRef, result);

      // Update quiz statistics
      const quizRef = doc(db, collectionName, quizId);
      const currentParticipants = quizType === 'ai' ? quiz.totalAttempts : quiz.totalParticipants;
      const currentAverage = quiz.averageScore || 0;
      const newParticipants = currentParticipants + 1;
      const newAverage = ((currentAverage * currentParticipants) + percentage) / newParticipants;

      const updateData = {
        averageScore: Math.round(newAverage),
        updatedAt: serverTimestamp()
      };

      if (quizType === 'ai') {
        updateData.totalAttempts = newParticipants;
        updateData.lastAttemptAt = serverTimestamp();
      } else {
        updateData.totalParticipants = newParticipants;
      }

      transaction.update(quizRef, updateData);

      // Update user statistics
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userQuizzesTaken = (userData.quizzesTaken || 0) + 1;
        const userTotalScore = (userData.totalScore || 0) + percentage;
        const userAverageScore = Math.round(userTotalScore / userQuizzesTaken);

        transaction.update(userRef, {
          quizzesTaken: userQuizzesTaken,
          totalScore: userTotalScore,
          averageScore: userAverageScore,
          bestScore: Math.max(userData.bestScore || 0, percentage),
          totalTimeSpent: (userData.totalTimeSpent || 0) + timeSpent,
          lastQuizAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });

    console.log('Quiz submitted successfully');
    return result;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

// ==================== RESULTS VISIBILITY ====================

export const canShowResults = async (quizId, userId, quizType = 'custom') => {
  try {
    // AI quiz results are always visible
    if (quizType === 'ai') {
      return { canShow: true, reason: 'AI quiz results always visible' };
    }

    // Get quiz details
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      return { canShow: false, reason: 'Quiz not found' };
    }

    const quiz = quizDoc.data();
    const now = new Date();

    // Check if quiz time is over
    if (now < quiz.endTime.toDate()) {
      return { canShow: false, reason: 'Quiz is still active' };
    }

    // Check if user has submitted the quiz
    const resultQuery = query(
      collection(db, 'quiz_results'),
      where('quizId', '==', quizId),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );

    const results = await getDocs(resultQuery);
    if (results.empty) {
      return { canShow: false, reason: 'No completed submission found' };
    }

    return { canShow: true, reason: 'Quiz completed and time is over' };
  } catch (error) {
    console.error('Error checking results visibility:', error);
    return { canShow: false, reason: 'Error checking results' };
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const getUpcomingQuizzes = async (limitCount = 10) => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'quizzes'),
      where('startTime', '>', now),
      where('isPublic', '==', true),
      where('status', '==', 'open_for_applications'),
      orderBy('startTime', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting upcoming quizzes:', error);
    throw error;
  }
};

export const getUserQuizzes = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('creatorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user quizzes:', error);
    throw error;
  }
};

export const getAIQuizzes = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'ai_quizzes'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting AI quizzes:', error);
    throw error;
  }
};

// ==================== AI QUIZ SPECIFIC FUNCTIONS ====================

export const getAIQuizById = async (quizId) => {
  try {
    const quizDoc = await getDoc(doc(db, 'ai_quizzes', quizId));

    if (!quizDoc.exists()) {
      throw new Error('AI Quiz not found');
    }

    return { id: quizDoc.id, ...quizDoc.data() };
  } catch (error) {
    console.error('Error getting AI quiz:', error);
    throw error;
  }
};

export const submitAIQuizResult = async (quizId, userId, answers, timeSpent = 0) => {
  try {
    console.log('Submitting AI quiz result:', quizId, 'for user:', userId);

    // Get AI quiz details
    const aiQuiz = await getAIQuizById(quizId);

    // Calculate score
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    // Create result document
    const result = {
      quizId: quizId,
      userId: userId,
      quizType: 'ai',

      quizTitle: aiQuiz.title,
      quizSubject: aiQuiz.subject,
      quizDifficulty: aiQuiz.difficulty,

      startedAt: new Date(Date.now() - (timeSpent * 1000)),
      completedAt: serverTimestamp(),
      timeSpent: timeSpent,
      timeLimitSeconds: aiQuiz.timeLimit * 60,

      answers: answers,
      score: correctAnswers,
      totalQuestions: totalQuestions,
      percentage: percentage,
      grade: grade,

      status: 'completed',
      isVisible: true, // AI quiz results are always visible

      userName: answers[0]?.userName || 'Anonymous',
      userEmail: answers[0]?.userEmail || ''
    };

    // Use transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      // Add result to ai_results collection
      const resultRef = doc(collection(db, 'ai_results'));
      transaction.set(resultRef, result);

      // Update AI quiz statistics
      const aiQuizRef = doc(db, 'ai_quizzes', quizId);
      const currentAttempts = aiQuiz.totalAttempts || 0;
      const currentAverage = aiQuiz.averageScore || 0;
      const newAttempts = currentAttempts + 1;
      const newAverage = ((currentAverage * currentAttempts) + percentage) / newAttempts;

      // Calculate popularity score (attempts + average score factor)
      const popularityScore = newAttempts + (newAverage / 10);

      transaction.update(aiQuizRef, {
        totalAttempts: newAttempts,
        averageScore: Math.round(newAverage),
        popularityScore: Math.round(popularityScore),
        lastAttemptAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update user statistics
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userQuizzesTaken = (userData.quizzesTaken || 0) + 1;
        const userTotalScore = (userData.totalScore || 0) + percentage;
        const userAverageScore = Math.round(userTotalScore / userQuizzesTaken);

        transaction.update(userRef, {
          quizzesTaken: userQuizzesTaken,
          totalScore: userTotalScore,
          averageScore: userAverageScore,
          bestScore: Math.max(userData.bestScore || 0, percentage),
          totalTimeSpent: (userData.totalTimeSpent || 0) + timeSpent,
          lastQuizAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });

    console.log('AI quiz result submitted successfully');
    return { ...result, id: 'generated' };
  } catch (error) {
    console.error('Error submitting AI quiz result:', error);
    throw error;
  }
};

export const getUserAIQuizResults = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'ai_results'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user AI quiz results:', error);
    throw error;
  }
};

export const getAIQuizResults = async (quizId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'ai_results'),
      where('quizId', '==', quizId),
      orderBy('percentage', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting AI quiz results:', error);
    throw error;
  }
};

// ==================== SEARCH AND FILTER FUNCTIONS ====================

export const searchAIQuizzes = async (searchTerm, difficulty = null, limitCount = 20) => {
  try {
    let q = query(
      collection(db, 'ai_quizzes'),
      where('status', '==', 'active')
    );

    if (difficulty) {
      q = query(q, where('difficulty', '==', difficulty));
    }

    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side filtering for search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(quiz =>
        quiz.title.toLowerCase().includes(term) ||
        quiz.subject.toLowerCase().includes(term) ||
        quiz.tags.some(tag => tag.includes(term))
      );
    }

    return results;
  } catch (error) {
    console.error('Error searching AI quizzes:', error);
    throw error;
  }
};

export const getPopularAIQuizzes = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'ai_quizzes'),
      where('status', '==', 'active'),
      where('totalAttempts', '>', 0),
      orderBy('totalAttempts', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting popular AI quizzes:', error);
    throw error;
  }
};

// Store quiz session for analytics and question reuse
export const storeQuizSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, 'quiz_sessions'), {
      ...sessionData,
      createdAt: serverTimestamp()
    });
    console.log('Quiz session stored with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing quiz session:', error);
    throw error;
  }
};

// Store individual questions for reuse
export const storeQuestionForReuse = async (question, topic, difficulty) => {
  try {
    // Validate question data before storing
    if (!question || typeof question !== 'object') {
      console.warn('Invalid question object:', question);
      return null;
    }

    if (!question.question || !question.options || question.correctAnswer === undefined) {
      console.warn('Missing required question fields:', question);
      return null;
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      console.warn('Invalid options array:', question.options);
      return null;
    }

    if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      console.warn('Invalid correctAnswer:', question.correctAnswer);
      return null;
    }

    const questionData = {
      question: String(question.question).trim(),
      options: question.options.map(opt => String(opt).trim()),
      correctAnswer: Number(question.correctAnswer),
      explanation: question.explanation ? String(question.explanation).trim() : '',
      topic: String(topic).toLowerCase().trim(),
      difficulty: String(difficulty).toLowerCase().trim(),
      usageCount: 0,
      createdAt: serverTimestamp(),
      lastUsed: null
    };

    const docRef = await addDoc(collection(db, 'question_bank'), questionData);
    console.log('Question stored for reuse with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing question for reuse:', error);
    // Don't throw error - continue with quiz generation even if storage fails
    return null;
  }
};

// Get cached questions from database
export const getCachedQuestions = async (topic, difficulty, limitCount = 5) => {
  try {
    // Simple query without complex ordering to avoid permission issues
    const q = query(
      collection(db, 'question_bank'),
      where('topic', '==', topic.toLowerCase().trim()),
      where('difficulty', '==', difficulty.toLowerCase().trim()),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        options: data.options || [],
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || ''
      };
    });

    console.log(`Found ${questions.length} cached questions for ${topic} (${difficulty})`);
    return questions;
  } catch (error) {
    console.error('Error getting cached questions:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

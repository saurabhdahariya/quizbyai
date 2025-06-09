// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider as TailwindThemeProvider } from './components/ThemeProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/auth/PrivateRoute';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';

// Quiz Components
import CreateQuiz from './components/quiz/CreateQuiz';
import QuizQuestions from './components/quiz/QuizQuestions';
import QuizDetails from './components/quiz/QuizDetails';
import QuizManage from './components/quiz/QuizManage';
import QuizTake from './components/quiz/QuizTake';
import QuizResults from './components/quiz/QuizResults';

// AI Quiz Components
import AIQuizGenerator from './components/quiz/AIQuizGenerator';
import AIQuizBrowser from './components/quiz/AIQuizBrowser';
import GuestQuizGenerator from './components/quiz/GuestQuizGenerator';
import QuizTaker from './components/quiz/QuizTaker';
import CustomQuizOrganizer from './components/quiz/CustomQuizOrganizer';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import EnhancedDashboard from './components/dashboard/EnhancedDashboard';
import JoinQuiz from './components/quiz/JoinQuiz';
import MyProgress from './components/dashboard/MyProgress';
import Settings from './components/dashboard/Settings';
import MyQuizzes from './components/dashboard/MyQuizzes';
import Participants from './components/dashboard/Participants';
import ModernQuickQuizGenerator from './components/quiz/ModernQuickQuizGenerator';
import ModernQuizTaker from './components/quiz/ModernQuizTaker';
import DashboardAIQuiz from './components/dashboard/DashboardAIQuiz';
import ComprehensiveSuperAdminDashboard from './components/admin/ComprehensiveSuperAdminDashboard';
import SetSuperAdminRole from './components/admin/SetSuperAdminRole';
import FloatingFeedbackButton from './components/feedback/FloatingFeedbackButton';

// Test Components
import OpenAITest from './components/test/OpenAITest';

// Legacy Components
import Home from './components/Home';
import Quiz from './components/Quiz';
import Result from './components/Result';

function App() {
  // Add class to body for global styles
  useEffect(() => {
    document.body.classList.add('antialiased');
    document.body.classList.add('font-sans');
    document.body.classList.add('bg-slate-50');
    document.body.classList.add('dark:bg-slate-900');
    document.body.classList.add('text-slate-900');
    document.body.classList.add('dark:text-slate-100');

    return () => {
      document.body.classList.remove('antialiased');
      document.body.classList.remove('font-sans');
      document.body.classList.remove('bg-slate-50');
      document.body.classList.remove('dark:bg-slate-900');
      document.body.classList.remove('text-slate-900');
      document.body.classList.remove('dark:text-slate-100');
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <TailwindThemeProvider>
          <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/result" element={<Result />} />

              {/* Guest Quiz Routes - No authentication required */}
              <Route path="/quiz/generate" element={<ModernQuickQuizGenerator />} />
              <Route path="/quiz/take" element={<ModernQuizTaker />} />

              {/* Test Routes */}
              <Route path="/test/openai" element={<OpenAITest />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                {/* Enhanced Dashboard Routes */}
                <Route path="/dashboard" element={<EnhancedDashboard />} />
                <Route path="/dashboard/ai-quiz" element={<DashboardAIQuiz />} />
                <Route path="/dashboard/progress" element={<MyProgress />} />
                <Route path="/dashboard/quizzes" element={<MyQuizzes />} />
                <Route path="/dashboard/participants" element={<Participants />} />
                <Route path="/dashboard/settings" element={<Settings />} />

                {/* Quiz Routes */}
                <Route path="/quiz/join" element={<JoinQuiz />} />
                <Route path="/create-quiz" element={<CreateQuiz />} />
                <Route path="/quiz/:quizId/questions" element={<QuizQuestions />} />
                <Route path="/quiz/:quizId/details" element={<QuizDetails />} />
                <Route path="/quiz/:quizId/manage" element={<QuizManage />} />
                <Route path="/quiz/:quizId/take" element={<QuizTake />} />
                <Route path="/quiz/:quizId/results" element={<QuizResults />} />

                {/* AI Quiz Routes */}
                <Route path="/ai-quiz/generate" element={<AIQuizGenerator />} />
                <Route path="/ai-quiz/browse" element={<AIQuizBrowser />} />

                {/* Custom Quiz Routes */}
                <Route path="/quiz/create" element={<CustomQuizOrganizer />} />

                {/* Super Admin Routes */}
                <Route path="/admin/dashboard" element={<ComprehensiveSuperAdminDashboard />} />
                <Route path="/admin/setup" element={<SetSuperAdminRole />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>

          {/* Global Floating Feedback Button */}
          <FloatingFeedbackButton />
          </BrowserRouter>
        </TailwindThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  ArrowLeft,
  Brain,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  CheckCircle,
  Chrome
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import AuthPageTransition from './AuthPageTransition';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'Invalid email or password'
          : error.code === 'auth/too-many-requests'
          ? 'Too many failed login attempts. Please try again later.'
          : 'Failed to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>

        <div className="flex min-h-screen relative z-10">
          {/* Left Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Logo */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <motion.div
                      className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Brain className="h-8 w-8 text-white" />
                    </motion.div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">QuizByAI</span>
                  </div>
                </div>

                <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Welcome Back
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Sign in to continue your learning journey
                    </CardDescription>
                  </CardHeader>
              
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-3 px-6">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400"
                        >
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <p className="text-xs">{error}</p>
                        </motion.div>
                      )}

                      <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        icon={<Mail className="h-4 w-4 text-slate-400" />}
                        className="text-sm"
                      />

                      <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        icon={<Lock className="h-4 w-4 text-slate-400" />}
                        className="text-sm"
                      />
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 px-6 pb-6">
                      <Button
                        type="submit"
                        variant="gradient"
                        size="md"
                        className="w-full"
                        isLoading={loading}
                        icon={<LogIn className="h-4 w-4" />}
                      >
                        Sign In
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        size="md"
                        className="w-full"
                        isLoading={loading}
                        icon={<Chrome className="h-4 w-4" />}
                      >
                        Sign in with Google
                      </Button>

                      <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link
                          to="/signup"
                          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          Sign Up
                        </Link>
                      </p>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Features Summary */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-32 h-32 bg-white rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="flex flex-col justify-center p-12 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  Welcome to QuizByAI
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  The ultimate AI-powered quiz platform for students, educators, and knowledge enthusiasts.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Brain,
                      title: "AI-Powered Questions",
                      description: "Generate realistic exam-quality questions using advanced AI technology"
                    },
                    {
                      icon: Trophy,
                      title: "Progress Tracking",
                      description: "Monitor your performance with detailed analytics and insights"
                    },
                    {
                      icon: Users,
                      title: "Quiz Organization",
                      description: "Create and manage quizzes for your students or team members"
                    },
                    {
                      icon: CheckCircle,
                      title: "Real Exam Preparation",
                      description: "Practice with questions that match actual competitive exam standards"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="flex items-start gap-4"
                    >
                      <div className="p-3 bg-white/20 rounded-lg">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthPageTransition>
  );
}

export default Login;

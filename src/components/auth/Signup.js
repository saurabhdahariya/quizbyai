import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  ArrowLeft,
  Brain,
  Trophy,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Award,
  BarChart3,
  BookOpen,
  Chrome
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import AuthPageTransition from './AuthPageTransition';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'Email is already in use'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : 'Failed to create an account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign up error:', error);
      setError('Failed to sign up with Google. Please try again.');
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
            onClick={() => {
              console.log('Back button clicked - navigating to home');
              navigate('/');
            }}
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
        {/* Left Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          <div className="w-full max-w-md mx-auto relative z-10">

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
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Brain className="h-8 w-8 text-white" />
                  </motion.div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">QuizByAI</span>
                </div>
              </div>

              <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Join thousands of learners on QuizByAI
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
                      label="Full Name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      icon={<User className="h-4 w-4 text-slate-400" />}
                      className="text-sm"
                    />

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
                      placeholder="Create a strong password"
                      required
                      icon={<Lock className="h-4 w-4 text-slate-400" />}
                      className="text-sm"
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
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
                      icon={<UserPlus className="h-4 w-4" />}
                    >
                      Create Account
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
                      onClick={handleGoogleSignUp}
                      variant="outline"
                      size="md"
                      className="w-full"
                      isLoading={loading}
                      icon={<Chrome className="h-4 w-4" />}
                    >
                      Sign up with Google
                    </Button>

                    <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        Sign In
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>


            </motion.div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 text-white p-8 flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Join the Future of
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Smart Learning
              </span>
            </h2>

            <p className="text-lg mb-8 text-white/90 leading-relaxed">
              Create an account to unlock unlimited AI-powered quizzes and track your progress.
            </p>

            {/* Benefits List - Compact */}
            <div className="space-y-4">
              {[
                { icon: Sparkles, title: 'Unlimited AI Quizzes', desc: 'Generate quizzes on any topic' },
                { icon: BarChart3, title: 'Detailed Analytics', desc: 'Track your performance' },
                { icon: BookOpen, title: 'Custom Quiz Creation', desc: 'Create and organize quizzes' },
                { icon: Award, title: 'Achievement System', desc: 'Earn badges and compete' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <div className="p-2 bg-white/20 rounded-lg">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-white/80 text-xs">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 p-3 bg-white/10 rounded-lg backdrop-blur-sm text-center"
            >
              <p className="text-white/90 text-sm mb-2">Already have an account?</p>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
              >
                Sign In →
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </div>
    </AuthPageTransition>
  );
}

export default Signup;

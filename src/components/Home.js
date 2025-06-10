import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import {
  Brain,
  Rocket,
  Star,
  Zap,
  Users,
  TrendingUp,
  Github,
  Mail,
  MessageCircle,
  Heart,
  Coffee,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Button from './ui/Button';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  // In-view hooks for animations
  const heroInView = useInView(heroRef, { once: true, threshold: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, threshold: 0.2 });
  const howItWorksInView = useInView(howItWorksRef, { once: true, threshold: 0.2 });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const handleGetStarted = () => {
    // Always go to quiz generator, regardless of auth status
    navigate('/quiz/generate');
  };

  // Core features data
  const coreFeatures = [
    {
      title: 'AI Quiz Generator',
      icon: <Brain className="h-6 w-6" />,
      description: 'Generate quizzes using AI on any subject',
      features: ['Custom Topics', 'Difficulty Control', 'Question Count', 'Time Limits'],
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
    },
    {
      title: 'Performance Tracking',
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Track scores and performance insights',
      features: ['Score Analysis', 'Progress Charts', 'Time Tracking', 'Improvement Tips'],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      title: 'Quiz Organization',
      icon: <Settings className="h-6 w-6" />,
      description: 'Organize public or private tests',
      features: ['Public Quizzes', 'Private Tests', 'Invite System', 'Custom Settings'],
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'
    },
    {
      title: 'Real-time Interaction',
      icon: <Zap className="h-6 w-6" />,
      description: 'Modern UI with real-time interaction',
      features: ['Live Updates', 'Instant Feedback', 'Smooth Animations', 'Mobile Friendly'],
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-clip-text text-transparent">
                Create Smart Quizzes
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">
                in Seconds with AI
              </span>
            </h1>

            {/* Auto-typing text */}
            <div className="text-2xl md:text-3xl font-semibold text-primary-600 dark:text-primary-400 mb-6 h-16">
              <TypeAnimation
                sequence={[
                  'Generate Smart Quizzes ⚡️',
                  2000,
                  'Track Your Performance 📊',
                  2000,
                  'Organize Tests Privately 🔐',
                  2000,
                  'Powered by AI 💡',
                  2000,
                  'Practice Smarter, Not Harder 🎯',
                  2000
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            Generate custom quizzes, track performance, and improve your learning journey with our
            <span className="font-semibold text-primary-600"> AI-powered platform</span>.
            Choose difficulty levels, set question counts, and organize tests for any subject.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <Button
              onClick={handleGetStarted}
              variant="gradient"
              size="xl"
              className="px-12 py-4 text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              icon={<Rocket className="h-6 w-6" />}
            >
              Get Started
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">50K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">1000+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Topics Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-600 dark:text-accent-400 mb-1">95%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">24/7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">AI Available</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Core Features Section */}
        <motion.div
          ref={featuresRef}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need for effective learning and quiz management in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-6 rounded-xl bg-gradient-to-br ${feature.bgColor} border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 cursor-pointer`}
                onClick={() => navigate('/quiz/generate')}
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          ref={howItWorksRef}
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12">
            Our AI-powered platform simplifies quiz creation and learning. Simply enter any topic,
            choose your preferences, and get instant, high-quality questions. Track your progress
            and improve your knowledge efficiently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Smart Quiz Creation
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                AI generates custom questions on any topic with adjustable difficulty and question count
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Real-Time Performance Tracking
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor scores, track improvement, and get detailed analytics on your learning progress
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Custom Test Organizer Mode
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Create and organize public or private quizzes with custom settings and time limits
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Invite-Based Quiz Participation
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Share quizzes with friends, students, or colleagues through secure invite links
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Compact Footer - Matching Header Height */}
      <footer className="relative z-10 bg-slate-900 dark:bg-slate-950 text-white py-3 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Brand Section */}
            <div className="flex items-center gap-3 mb-2 md:mb-0">
              <div className="p-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">QuizByAI</span>
              <span className="text-slate-400 text-sm hidden md:inline">AI-powered learning platform</span>
            </div>

            {/* Links and Social */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-4">
                <a href="#" className="text-slate-300 hover:text-white transition-colors">About</a>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">Contact</a>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">Privacy</a>
              </div>

              <div className="flex items-center gap-2">
                <motion.a
                  href="https://github.com/saurabhdahariya/quizbyai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github className="h-3 w-3" />
                </motion.a>
                <motion.a
                  href="saurabhdahariya81@outllok.com"
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail className="h-3 w-3" />
                </motion.a>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Heart className="h-3 w-3 text-red-500" />
                <span>© 2025</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

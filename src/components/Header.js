import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, Brain, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import Button from './ui/Button';

const Header = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50"
        >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Brain className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        QuizByAI
                    </h1>
                </motion.div>

                <div className="flex items-center gap-3">
                    {currentUser ? (
                        <>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="ghost"
                                size="sm"
                                className="hidden md:flex"
                                icon={<User className="h-4 w-4" />}
                            >
                                Dashboard
                            </Button>

                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                icon={<LogOut className="h-4 w-4" />}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                as={Link}
                                to="/login"
                                variant="ghost"
                                size="sm"
                                icon={<LogIn className="h-4 w-4" />}
                            >
                                Login
                            </Button>

                            <Button
                                as={Link}
                                to="/signup"
                                variant="primary"
                                size="sm"
                                icon={<UserPlus className="h-4 w-4" />}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
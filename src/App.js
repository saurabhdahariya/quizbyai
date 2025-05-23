// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './components/ThemeProvider';

// We'll import fonts later if needed

// Import components
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
    <ThemeProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

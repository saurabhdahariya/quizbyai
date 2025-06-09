import React, { useState } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { Database, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

function FirestoreDebugger() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (type, message, data = null) => {
    const result = {
      id: Date.now(),
      type, // success, error, warning, info
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testFirestoreConnection = async () => {
    setLoading(true);
    addResult('info', 'Testing Firestore connection...');

    try {
      // Test 1: Check if db is initialized
      if (!db) {
        addResult('error', 'Firestore database is not initialized');
        setLoading(false);
        return;
      }
      addResult('success', 'Firestore database is initialized');

      // Test 2: Check authentication
      if (!currentUser) {
        addResult('warning', 'User is not authenticated');
      } else {
        addResult('success', `User authenticated: ${currentUser.email}`);
      }

      // Test 3: Try to read from a collection
      try {
        const testCollection = collection(db, 'test_connection');
        const snapshot = await getDocs(testCollection);
        addResult('success', `Successfully read from test_connection collection (${snapshot.docs.length} documents)`);
      } catch (readError) {
        addResult('error', `Failed to read from collection: ${readError.message}`, readError);
      }

      // Test 4: Try to write to a collection
      try {
        const testDoc = {
          message: 'Connection test',
          timestamp: serverTimestamp(),
          userId: currentUser?.uid || 'anonymous',
          testId: Math.random().toString(36).substring(2, 15)
        };

        const docRef = await addDoc(collection(db, 'test_connection'), testDoc);
        addResult('success', `Successfully wrote to Firestore with ID: ${docRef.id}`, testDoc);
      } catch (writeError) {
        addResult('error', `Failed to write to Firestore: ${writeError.message}`, writeError);
      }

    } catch (error) {
      addResult('error', `General Firestore error: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const testQuizCreation = async () => {
    setLoading(true);
    addResult('info', 'Testing quiz creation...');

    if (!currentUser) {
      addResult('error', 'Cannot test quiz creation: User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const testQuizData = {
        title: 'Test Quiz',
        description: 'This is a test quiz for debugging',
        topic: 'Testing',
        difficulty: 'easy',
        numQuestions: 5,
        duration: 30,
        timeLimit: 1800,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000),
        isPublic: true,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || 'Test User',
        createdByEmail: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedParticipants: [],
        pendingParticipants: [],
        status: 'draft',
        questionsCount: 0,
        totalSubmissions: 0,
        averageScore: 0,
        tags: ['testing'],
        category: 'Testing',
        language: 'en',
        version: 1
      };

      addResult('info', 'Attempting to create test quiz...', testQuizData);

      const quizRef = await addDoc(collection(db, 'quizzes'), testQuizData);
      addResult('success', `Test quiz created successfully with ID: ${quizRef.id}`);

      // Try to read the created quiz back
      const createdQuiz = await getDoc(quizRef);
      if (createdQuiz.exists()) {
        addResult('success', 'Successfully read back the created quiz', createdQuiz.data());
      } else {
        addResult('warning', 'Quiz was created but could not be read back');
      }

    } catch (error) {
      addResult('error', `Failed to create test quiz: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Firestore Debugger
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={testFirestoreConnection} 
            isLoading={loading}
            variant="primary"
          >
            Test Connection
          </Button>

          <Button 
            onClick={testQuizCreation} 
            isLoading={loading}
            variant="secondary"
            disabled={!currentUser}
          >
            Test Quiz Creation
          </Button>

          <Button 
            onClick={clearResults} 
            variant="outline"
          >
            Clear Results
          </Button>
        </div>

        {!currentUser && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ You need to be logged in to test quiz creation functionality.
            </p>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div 
              key={result.id}
              className={`p-4 rounded-lg border ${getBackgroundColor(result.type)}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(result.type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{result.message}</p>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No test results yet. Click a test button to get started.
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-slate-500 dark:text-slate-400">
        This component helps debug Firestore connectivity and quiz creation issues.
      </CardFooter>
    </Card>
  );
}

export default FirestoreDebugger;

import React, { useState } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import Button from './ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';

function FirestoreTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState([]);

  const handleTestWrite = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const docRef = await addDoc(collection(db, 'test_collection'), {
        message: 'Test message',
        timestamp: serverTimestamp(),
        randomValue: Math.random()
      });
      
      setResult(`Document written with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error adding document:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRead = async () => {
    setLoading(true);
    setResult('');
    setTestData([]);
    
    try {
      const querySnapshot = await getDocs(collection(db, 'test_collection'));
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTestData(data);
      setResult(`Read ${data.length} documents successfully`);
    } catch (error) {
      console.error('Error reading documents:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Firestore Connection Test</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button 
            onClick={handleTestWrite} 
            isLoading={loading}
            variant="primary"
          >
            Test Write
          </Button>
          
          <Button 
            onClick={handleTestRead} 
            isLoading={loading}
            variant="secondary"
          >
            Test Read
          </Button>
        </div>
        
        {result && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="font-medium">{result}</p>
          </div>
        )}
        
        {testData.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Data:</h3>
            <div className="max-h-60 overflow-y-auto">
              {testData.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 mb-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"
                >
                  <p className="text-sm font-medium">ID: {item.id}</p>
                  <p className="text-sm">Message: {item.message}</p>
                  <p className="text-sm">Random: {item.randomValue}</p>
                  <p className="text-sm">
                    Timestamp: {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-sm text-slate-500 dark:text-slate-400">
        This component tests Firestore connectivity
      </CardFooter>
    </Card>
  );
}

export default FirestoreTest;

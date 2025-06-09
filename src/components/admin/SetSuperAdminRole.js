import React, { useState } from 'react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';

const SetSuperAdminRole = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('admin@quizbyai.com');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetSuperAdmin = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      // Find user by email
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        setMessage('User not found. Please make sure the user has signed up first.');
        setLoading(false);
        return;
      }

      // Update user role to superadmin
      const userDoc = usersSnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'superadmin'
      });

      setMessage(`Successfully set ${email} as super admin!`);
    } catch (error) {
      console.error('Error setting super admin role:', error);
      setMessage('Error setting super admin role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show this component if user is already logged in
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Set Super Admin Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to make super admin"
          />
          
          <Button
            onClick={handleSetSuperAdmin}
            isLoading={loading}
            className="w-full"
            variant="primary"
          >
            Set as Super Admin
          </Button>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Successfully') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>First, sign up with email: admin@quizbyai.com</li>
              <li>Then use this tool to set the role</li>
              <li>Finally, access /admin/dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetSuperAdminRole;

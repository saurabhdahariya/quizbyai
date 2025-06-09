import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  Trash2,
  Save,
  ArrowLeft,
  Shield,
  Bell,
  Globe,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Switch from '../ui/Switch';

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, deleteUserAccount } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || ''
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    quizReminders: true,
    resultNotifications: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: true,
    allowInvites: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      
      await updateUserProfile({
        displayName: profile.displayName
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteUserAccount();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
      setLoading(false);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Settings
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Manage your account preferences and privacy settings
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center text-red-600 dark:text-red-400"
            >
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center text-green-600 dark:text-green-400"
            >
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </motion.div>
          )}

          {/* Profile Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and display preferences
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Display Name"
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Enter your display name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                  helperText="Email cannot be changed"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleProfileUpdate}
                  variant="primary"
                  disabled={loading}
                  isLoading={loading}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  )}
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {isDarkMode 
                        ? 'Switch to light mode for better visibility in bright environments'
                        : 'Switch to dark mode for reduced eye strain in low light'
                      }
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Email Notifications
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Receive important updates via email
                  </div>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Quiz Reminders
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Get reminded about upcoming quizzes you've joined
                  </div>
                </div>
                <Switch
                  checked={notifications.quizReminders}
                  onChange={(checked) => setNotifications({ ...notifications, quizReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Result Notifications
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when quiz results are available
                  </div>
                </div>
                <Switch
                  checked={notifications.resultNotifications}
                  onChange={(checked) => setNotifications({ ...notifications, resultNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Public Profile
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Allow others to see your profile information
                  </div>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Show Progress
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Display your quiz progress and achievements publicly
                  </div>
                </div>
                <Switch
                  checked={privacy.showProgress}
                  onChange={(checked) => setPrivacy({ ...privacy, showProgress: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Allow Quiz Invites
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Let others invite you to private quizzes
                  </div>
                </div>
                <Switch
                  checked={privacy.allowInvites}
                  onChange={(checked) => setPrivacy({ ...privacy, allowInvites: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-lg border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-800 dark:text-red-200">
                      Delete Account
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Permanently delete your account and all associated data
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>

              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
                >
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                      Are you absolutely sure?
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="primary"
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                        isLoading={loading}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Yes, Delete Account
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

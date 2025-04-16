import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/common/ui/Button';
import Card from '../../../components/common/ui/Card';
import UserLayout from '../../../components/common/layout/UserLayout';
import SecurityIcon from '../../../components/common/icons/SecurityIcon';
import LoadingSpinner from '../../../components/common/ui/LoadingSpinner';

const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Check for session expired message in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      setLocalError('Your session has expired. Please log in again.');
      addToast('info', 'Your session has expired. Please log in again.');
    }
  }, [location, addToast]);
  
  // Handle account lock timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLocked && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            addToast('info', 'You can now try logging in again');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockTimeRemaining, addToast]);
  
  // Reset local error when auth error changes
  useEffect(() => {
    if (error) {
      setLocalError(null);
    }
  }, [error]);
  
  // Check login attempts and lock if needed
  const checkLoginAttempts = () => {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 60; // 1 minute in seconds
    
    if (loginAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setLockTimeRemaining(LOCK_TIME);
      const errorMessage = `Too many failed login attempts. Please try again in ${LOCK_TIME} seconds.`;
      setLocalError(errorMessage);
      addToast('warning', errorMessage);
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setLocalError(null);
    
    // Check if account is locked
    if (isLocked) {
      const errorMessage = `Account temporarily locked. Please try again in ${lockTimeRemaining} seconds.`;
      setLocalError(errorMessage);
      addToast('error', errorMessage);
      return;
    }
    
    // Validate form
    if (!email || !password) {
      const errorMessage = 'Email and password are required';
      setLocalError(errorMessage);
      addToast('error', errorMessage);
      return;
    }
    
    // Check login attempts
    if (!checkLoginAttempts()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await login({ email, password });
      
      // Reset login attempts on success
      setLoginAttempts(0);
      
      // Success message
      addToast('success', 'Login successful! Welcome back.');
      
      // Redirect to dashboard on success
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      // Increment failed login attempts
      setLoginAttempts(prev => prev + 1);
      checkLoginAttempts();
      
      // Show error toast
      if (error) {
        addToast('error', error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <UserLayout>
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <Card>
          {(error || localError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || localError}
            </div>
          )}
          
          {isLocked && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center">
              <SecurityIcon className="mr-2" />
              <span>
                Account temporarily locked. Please try again in <strong>{lockTimeRemaining}</strong> seconds.
              </span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={isLocked || isLoading}
                  aria-invalid={!!error || !!localError}
                  aria-describedby={error || localError ? "login-error" : undefined}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-800">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={isLocked || isLoading}
                  aria-invalid={!!error || !!localError}
                  aria-describedby={error || localError ? "login-error" : undefined}
                />
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLocked || isLoading}
                >
                  {isLoading ? <LoadingSpinner size="small" color="white" className="mr-2" /> : null}
                  Sign In
                </Button>
              </div>
            </div>
          </form>
          
          <div className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
              Create one now
            </Link>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Login;
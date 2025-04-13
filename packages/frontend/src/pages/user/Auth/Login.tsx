import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/common/ui/Button';
import Card from '../../../components/common/ui/Card';
import UserLayout from '../../../components/common/layout/UserLayout';

const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    
    try {
      setIsLoading(true);
      
      await login({ email, password });
      
      // Redirect to dashboard on success
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      // Error is set by the auth context
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
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
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
                />
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
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
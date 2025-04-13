import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../services/api/auth.service';
import Button from '../../../components/common/ui/Button';
import Card from '../../../components/common/ui/Card';
import UserLayout from '../../../components/common/layout/UserLayout';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword({ email });
      
      // Show success message
      setSuccessMessage('If the email exists in our system, a password reset link has been sent. Please check your inbox.');
      
      // Clear form
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to process your request. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive a password reset link</p>
        </div>
        
        <Card>
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
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
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </div>
            </div>
          </form>
          
          <div className="text-center text-sm text-gray-600 mt-6">
            <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
};

export default ForgotPassword;
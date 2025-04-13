import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/common/ui/Button';
import Card from '../../../components/common/ui/Card';
import UserLayout from '../../../components/common/layout/UserLayout';

const Register: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'collector' | 'dealer' | 'cutter' | 'appraiser'>('collector');
  
  // Role-specific state for cutter
  const [specialty, setSpecialty] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  
  // Role-specific state for dealer
  const [companyName, setCompanyName] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  
  // Form submission state
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form validation
  const validateForm = () => {
    // Clear previous errors
    clearError();
    setLocalError(null);
    
    // Check required fields
    if (!username || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields');
      return false;
    }
    
    // Check password match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setLocalError('Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    // Check role-specific requirements
    if (role === 'cutter' && !specialty) {
      setLocalError('Please specify your cutting specialty');
      return false;
    }
    
    if (role === 'dealer' && !companyName) {
      setLocalError('Please provide your company name');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare registration data
      const userData = {
        username,
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role
      };
      
      // Add role-specific profile data
      if (role === 'cutter') {
        Object.assign(userData, {
          cutterProfile: {
            specialty,
            experienceYears: experienceYears === '' ? undefined : Number(experienceYears),
            bio: bio || undefined,
          }
        });
      } else if (role === 'dealer') {
        Object.assign(userData, {
          dealerProfile: {
            companyName,
            businessLicense: businessLicense || undefined,
          }
        });
      }
      
      // Submit registration
      const result = await register(userData);
      
      // Show success message
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      
      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setRole('collector');
      setSpecialty('');
      setExperienceYears('');
      setBio('');
      setCompanyName('');
      setBusinessLicense('');
      
      // Redirect to login after delay
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      console.error('Registration error:', err);
      // Error is set by the auth context
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
        
        <Card>
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {(error || localError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || localError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and numbers.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Role Selection */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Account Type</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <label className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${role === 'collector' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="collector"
                      checked={role === 'collector'}
                      onChange={() => setRole('collector')}
                      className="sr-only"
                    />
                    <div className="font-medium mb-1">Collector</div>
                    <div className="text-sm text-gray-500">Collect and manage your gemstones</div>
                  </label>
                  
                  <label className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${role === 'dealer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="dealer"
                      checked={role === 'dealer'}
                      onChange={() => setRole('dealer')}
                      className="sr-only"
                    />
                    <div className="font-medium mb-1">Dealer</div>
                    <div className="text-sm text-gray-500">Buy and sell gemstones professionally</div>
                  </label>
                  
                  <label className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${role === 'cutter' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="cutter"
                      checked={role === 'cutter'}
                      onChange={() => setRole('cutter')}
                      className="sr-only"
                    />
                    <div className="font-medium mb-1">Cutter</div>
                    <div className="text-sm text-gray-500">Showcase your cutting skills and portfolio</div>
                  </label>
                  
                  <label className={`border rounded-lg p-4 cursor-pointer text-center transition-colors ${role === 'appraiser' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="appraiser"
                      checked={role === 'appraiser'}
                      onChange={() => setRole('appraiser')}
                      className="sr-only"
                    />
                    <div className="font-medium mb-1">Appraiser</div>
                    <div className="text-sm text-gray-500">Professionally appraise and certify gemstones</div>
                  </label>
                </div>
              </div>
              
              {/* Role-specific fields */}
              {role === 'cutter' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Cutter Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Faceting, Cabochon, Fantasy Cuts"
                        required={role === 'cutter'}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experienceYears"
                        min="0"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 5"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Tell us about your cutting experience, style, and specialization..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Dealer-specific fields */}
              {role === 'dealer' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Dealer Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required={role === 'dealer'}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-1">
                        Business License
                      </label>
                      <input
                        type="text"
                        id="businessLicense"
                        value={businessLicense}
                        onChange={(e) => setBusinessLicense(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Submit button */}
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </div>
              
              {/* Login link */}
              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Register;
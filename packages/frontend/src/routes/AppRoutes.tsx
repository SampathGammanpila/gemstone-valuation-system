import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/ui/LoadingSpinner';

// User Pages
import Home from '../pages/user/Home';
import Login from '../pages/user/Auth/Login';
import Register from '../pages/user/Auth/Register';
import ForgotPassword from '../pages/user/Auth/ForgotPassword';
import AllCutters from '../pages/user/Cutters/AllCutters';
import CutterDetail from '../pages/user/Cutters/CutterDetail';

// Valuation Pages (placeholder)
const ValuationWizard = () => <div>Valuation Wizard</div>;

// Profile Pages
import CutterProfile from '../components/user/profile/CutterProfile';
const MyCollection = () => <div>My Collection</div>;
const ProfileSettings = () => <div>Profile Settings</div>;
const Unauthorized = () => (
  <div className="text-center py-10">
    <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
    <p className="text-gray-600">You don't have permission to access this page.</p>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ element: React.ReactNode; roles?: string[] }> = ({ 
  element, 
  roles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" text="Loading your account..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{element}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Determine which profile component to show based on user role
  const getProfileComponent = () => {
    if (isLoading) {
      return <LoadingSpinner size="large" text="Loading profile..." />;
    }
    
    if (!user) return <Navigate to="/login" replace />;
    
    switch (user.role) {
      case 'cutter':
        return <CutterProfile />;
      case 'dealer':
        return <div>Dealer Profile</div>;
      case 'appraiser':
        return <div>Appraiser Profile</div>;
      default:
        return <div>Collector Profile</div>;
    }
  };

  return (
    <Routes>
      {/* Public routes - accessible to all */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/cutters" element={<AllCutters />} />
      <Route path="/cutters/:id" element={<CutterDetail />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected user routes with proper role restrictions */}
      <Route path="/profile" element={<ProtectedRoute element={getProfileComponent()} />} />
      <Route path="/profile/settings" element={<ProtectedRoute element={<ProfileSettings />} />} />
      <Route path="/profile/collection" element={<ProtectedRoute element={<MyCollection />} roles={['collector', 'dealer']} />} />
      <Route path="/valuation" element={<ProtectedRoute element={<ValuationWizard />} roles={['appraiser', 'dealer']} />} />
      
      {/* Cutter specific routes */}
      <Route path="/cutter-workspace" element={<ProtectedRoute element={<div>Cutter Workspace</div>} roles={['cutter']} />} />
      
      {/* Dealer specific routes */}
      <Route path="/marketplace/manage" element={<ProtectedRoute element={<div>Manage Listings</div>} roles={['dealer']} />} />
      
      {/* Appraiser specific routes */}
      <Route path="/appraisals" element={<ProtectedRoute element={<div>Manage Appraisals</div>} roles={['appraiser']} />} />

      {/* 404 redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
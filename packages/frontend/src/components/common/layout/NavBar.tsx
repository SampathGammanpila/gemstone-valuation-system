// components/common/layout/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

const NavBar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-primary-600">GemStone</span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center">
            <Link to="/cutters" className="px-3 py-2 text-gray-700 hover:text-primary-600">
              Cutters
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="px-3 py-2 text-gray-700 hover:text-primary-600">
                  My Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="px-3 py-2 text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="ml-4 px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
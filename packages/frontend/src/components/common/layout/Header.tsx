import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1.25L3.5 9.75L12 18.25L20.5 9.75L12 1.25ZM12 4.16L17.94 10.1L12 16.04L6.06 10.1L12 4.16Z" />
                <path d="M12 18.25V22.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="ml-2 text-xl font-bold">GemStone</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 px-3 py-2">
              Home
            </Link>
            <Link to="/valuation" className="text-gray-600 hover:text-primary-600 px-3 py-2">
              Valuation Wizard
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-primary-600 px-3 py-2">
              My Collection
            </Link>
            <Link to="/admin" className="text-gray-600 hover:text-primary-600 px-3 py-2">
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="bg-white p-2 rounded-md text-gray-600 hover:text-primary-600 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-inner">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/valuation" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Valuation Wizard
            </Link>
            <Link 
              to="/profile" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              My Collection
            </Link>
            <Link 
              to="/admin" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
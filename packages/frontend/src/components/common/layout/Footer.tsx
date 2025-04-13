import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center text-white">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1.25L3.5 9.75L12 18.25L20.5 9.75L12 1.25ZM12 4.16L17.94 10.1L12 16.04L6.06 10.1L12 4.16Z" />
                <path d="M12 18.25V22.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="ml-2 text-xl font-bold">GemStone</span>
            </Link>
            <p className="mt-3 text-gray-400">
              A comprehensive gemstone valuation and management system, designed for collectors, dealers, and enthusiasts.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/valuation" className="text-gray-400 hover:text-white transition">
                  Valuation Wizard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition">
                  My Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>support@gemstone-system.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Gem Street, Crystal City</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>© {currentYear} Gemstone Valuation System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
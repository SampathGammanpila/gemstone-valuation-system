import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../../components/common/layout/UserLayout';
import Card from '../../../components/common/ui/Card';
import userService from '../../../services/api/user.service';
import { CutterListItem } from '../../../types/user.types';

const AllCutters: React.FC = () => {
  const [cutters, setCutters] = useState<CutterListItem[]>([]);
  const [filteredCutters, setFilteredCutters] = useState<CutterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchCutters = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllCutters();
        setCutters(data);
        setFilteredCutters(data);
      } catch (err) {
        console.error('Error fetching cutters:', err);
        setError('Failed to load cutters. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCutters();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    let results = cutters;

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        cutter =>
          cutter.username.toLowerCase().includes(term) ||
          (cutter.firstName && cutter.firstName.toLowerCase().includes(term)) ||
          (cutter.lastName && cutter.lastName.toLowerCase().includes(term)) ||
          (cutter.specialty && cutter.specialty.toLowerCase().includes(term))
      );
    }

    // Apply expertise filter
    if (expertiseFilter) {
      results = results.filter(cutter => cutter.expertise === expertiseFilter);
    }

    // Apply availability filter
    if (availabilityFilter !== null) {
      results = results.filter(cutter => cutter.availableForCustomWork === availabilityFilter);
    }

    setFilteredCutters(results);
  }, [searchTerm, expertiseFilter, availabilityFilter, cutters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setExpertiseFilter('');
    setAvailabilityFilter(null);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Gemstone Cutters</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or specialty"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Expertise filter */}
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">
                Expertise Level
              </label>
              <select
                id="expertise"
                value={expertiseFilter}
                onChange={e => setExpertiseFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
                <option value="Master">Master</option>
              </select>
            </div>

            {/* Availability filter */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                id="availability"
                value={availabilityFilter === null ? '' : availabilityFilter ? 'yes' : 'no'}
                onChange={e => {
                  const val = e.target.value;
                  setAvailabilityFilter(val === '' ? null : val === 'yes');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="yes">Available for custom work</option>
                <option value="no">Not available</option>
              </select>
            </div>
          </div>

          {/* Clear filters button */}
          {(searchTerm || expertiseFilter || availabilityFilter !== null) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredCutters.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cutters found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCutters.map(cutter => (
              <Link to={`/cutters/${cutter.id}`} key={cutter.id}>
                <Card
                  hoverable
                  className="h-full transition-transform duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {cutter.profileImage ? (
                        <img
                          src={cutter.profileImage}
                          alt={cutter.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-bold">
                          {cutter.firstName ? cutter.firstName[0].toUpperCase() : cutter.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cutter.firstName && cutter.lastName
                          ? `${cutter.firstName} ${cutter.lastName}`
                          : cutter.username}
                      </h3>
                      
                      <div className="flex space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            cutter.expertise === 'Beginner'
                              ? 'bg-blue-100 text-blue-800'
                              : cutter.expertise === 'Intermediate'
                              ? 'bg-green-100 text-green-800'
                              : cutter.expertise === 'Expert'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {cutter.expertise || 'Beginner'}
                        </span>
                        
                        {cutter.portfolioVerified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Specialty</h4>
                    <p className="text-gray-600 mb-3">{cutter.specialty || 'Not specified'}</p>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Experience:</span>{' '}
                        <span className="font-medium">{cutter.experienceYears || 0} years</span>
                      </div>
                      
                      <div>
                        <span
                          className={`${
                            cutter.availableForCustomWork
                              ? 'text-green-600'
                              : 'text-red-600'
                          } font-medium`}
                        >
                          {cutter.availableForCustomWork
                            ? 'Available for work'
                            : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default AllCutters;
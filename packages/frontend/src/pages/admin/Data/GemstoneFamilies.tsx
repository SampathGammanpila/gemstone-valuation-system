import React, { useEffect, useState } from 'react';
import UserLayout from '../../../components/common/layout/UserLayout';
import Card from '../../../components/common/ui/Card';
import Button from '../../../components/common/ui/Button';
import Loader from '../../../components/common/feedback/Loader';
import ErrorMessage from '../../../components/common/feedback/ErrorMessage';
import GemstoneFamilyService, { GemstoneFamily } from '../../../services/api/gemstone.service';

const GemstoneFamilies: React.FC = () => {
  // State for gemstone families data
  const [families, setFamilies] = useState<GemstoneFamily[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gemstone families on component mount
  useEffect(() => {
    fetchGemstoneFamilies();
  }, []);

  // Function to fetch gemstone families
  const fetchGemstoneFamilies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await GemstoneFamilyService.getAllGemstoneFamilies();
      setFamilies(data);
    } catch (err) {
      console.error('Error fetching gemstone families:', err);
      setError('Failed to load gemstone families. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get category counts for summary
  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    
    families.forEach(family => {
      const category = family.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
    
    return counts;
  };

  // Function to determine badge color based on value category
  const getValueCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Precious':
        return 'bg-gemstone-red text-white';
      case 'Semi-precious':
        return 'bg-gemstone-blue text-white';
      case 'Ornamental':
        return 'bg-gemstone-green text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <UserLayout>
        <div className="py-20">
          <Loader fullPage text="Loading gemstone families..." />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gemstone Families</h1>
          <p className="text-gray-600">Manage mineral groups and their properties</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary">Add New Family</Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchGemstoneFamilies}
          className="mb-6" 
        />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Families" className="bg-primary-50">
          <p className="text-3xl font-bold text-primary-700">{families.length}</p>
        </Card>
        
        {Object.entries(getCategoryCounts()).slice(0, 3).map(([category, count]) => (
          <Card key={category} title={category} className="bg-gray-50">
            <p className="text-3xl font-bold text-gray-700">{count}</p>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <Card title="All Gemstone Families">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hardness</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {families.length > 0 ? (
                families.map((family) => (
                  <tr key={family.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{family.name}</div>
                      <div className="text-sm text-gray-500">{family.mineral_group || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{family.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getValueCategoryColor(family.value_category)}`}>
                        {family.value_category || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {family.hardness_min && family.hardness_max
                          ? `${family.hardness_min} - ${family.hardness_max}`
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No gemstone families found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </UserLayout>
  );
};

export default GemstoneFamilies;
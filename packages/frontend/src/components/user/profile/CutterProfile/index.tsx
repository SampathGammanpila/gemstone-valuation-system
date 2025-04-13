import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import Card from '../../../common/ui/Card';
import Button from '../../../common/ui/Button';
import ExpertiseBadge from './ExpertiseBadge';
import PortfolioGallery from './PortfolioGallery';
import SkillsList from './SkillsList';
import AddPortfolioItemModal from './AddPortfolioItemModal';
import userService from '../../../../services/api/user.service';
import { CutterProfileType, PortfolioItem } from '../../../../types/user.types';

const CutterProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CutterProfileType | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCutterProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile();
        if (response.profile) {
          setProfile(response.profile as CutterProfileType);
          if (response.profile.portfolioItems) {
            setPortfolio(response.profile.portfolioItems);
          }
        }
      } catch (err) {
        console.error('Error fetching cutter profile:', err);
        setError('Failed to load your cutter profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCutterProfile();
  }, [refreshTrigger]);

  const handleAddPortfolioItem = async (item: Partial<PortfolioItem>) => {
    try {
      await userService.addPortfolioItem(item);
      setRefreshTrigger(prev => prev + 1);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding portfolio item:', err);
      setError('Failed to add portfolio item. Please try again.');
    }
  };

  const handleDeletePortfolioItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await userService.deletePortfolioItem(itemId);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting portfolio item:', err);
        setError('Failed to delete portfolio item. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">No Cutter Profile!</strong>
        <span className="block sm:inline"> You don't have a cutter profile set up yet. Please contact an administrator.</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <Card title="Cutter Profile" titleClassName="text-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <h3 className="font-medium text-gray-700 mb-2">Expertise Level</h3>
            <ExpertiseBadge level={profile.expertise_level || 'Beginner'} />
            
            <h3 className="font-medium text-gray-700 mt-4 mb-2">Years of Experience</h3>
            <p className="text-gray-600">{profile.experience_years || 0} years</p>
            
            <h3 className="font-medium text-gray-700 mt-4 mb-2">Workshop Location</h3>
            <p className="text-gray-600">{profile.workshop_location || 'Not specified'}</p>
            
            <h3 className="font-medium text-gray-700 mt-4 mb-2">Availability</h3>
            <p className="text-gray-600">
              {profile.available_for_custom_work
                ? 'Available for custom work'
                : 'Not currently accepting custom work'}
            </p>
          </div>
          
          <div className="col-span-2">
            <h3 className="font-medium text-gray-700 mb-2">Specialty</h3>
            <p className="text-gray-600 mb-4">{profile.specialty || 'Not specified'}</p>
            
            <h3 className="font-medium text-gray-700 mb-2">Bio</h3>
            <p className="text-gray-600">{profile.bio || 'No bio provided.'}</p>
            
            {profile.certification && profile.certification.length > 0 && (
              <>
                <h3 className="font-medium text-gray-700 mt-4 mb-2">Certifications</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {profile.certification.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </Card>
      
      {/* Skills */}
      <Card title="Cutting Skills" titleClassName="text-2xl">
        <SkillsList skills={profile.skills || []} />
      </Card>
      
      {/* Portfolio */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Portfolio</h2>
          <Button onClick={() => setShowAddModal(true)}>Add New Item</Button>
        </div>
        
        <PortfolioGallery 
          items={portfolio} 
          onDelete={handleDeletePortfolioItem} 
          isVerified={profile.portfolio_verified || false}
        />
        
        {portfolio.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">Your portfolio is empty. Add your first item to showcase your work!</p>
          </div>
        )}
      </div>
      
      {/* Add Portfolio Item Modal */}
      {showAddModal && (
        <AddPortfolioItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPortfolioItem}
        />
      )}
    </div>
  );
};

export default CutterProfile;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import UserLayout from '../../../components/common/layout/UserLayout';
import Card from '../../../components/common/ui/Card';
import Button from '../../../components/common/ui/Button';
import ExpertiseBadge from '../../../components/user/profile/CutterProfile/ExpertiseBadge';
import SkillsList from '../../../components/user/profile/CutterProfile/SkillsList';
import PortfolioGallery from '../../../components/user/profile/CutterProfile/PortfolioGallery';
import userService from '../../../services/api/user.service';
import { CutterDetailResponse } from '../../../types/user.types';

const CutterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cutter, setCutter] = useState<CutterDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCutterDetails = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('No cutter ID provided');
        
        const data = await userService.getCutterDetails(parseInt(id));
        setCutter(data);
      } catch (err) {
        console.error('Error fetching cutter details:', err);
        setError('Failed to load cutter details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCutterDetails();
  }, [id]);

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </UserLayout>
    );
  }

  if (error || !cutter) {
    return (
      <UserLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Cutter not found'}</span>
          <div className="mt-4">
            <Link to="/cutters" className="text-red-700 underline">
              Return to cutters list
            </Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto py-8">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Link to="/cutters" className="text-primary-600 hover:text-primary-800 flex items-center">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to all cutters
          </Link>
        </div>

        {/* Cutter profile header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {cutter.profileImage ? (
                <img
                  src={cutter.profileImage}
                  alt={cutter.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                  {cutter.firstName ? cutter.firstName[0].toUpperCase() : cutter.username[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="md:ml-6 text-center md:text-left mt-4 md:mt-0">
              <h1 className="text-3xl font-bold text-gray-900">
                {cutter.firstName && cutter.lastName
                  ? `${cutter.firstName} ${cutter.lastName}`
                  : cutter.username}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <ExpertiseBadge level={cutter.profile.expertiseLevel as any || 'Beginner'} />
                
                {cutter.profile.portfolioVerified && (
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
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
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Verified Cutter
                  </span>
                )}
                
                <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {cutter.profile.experienceYears || 0} years experience
                </span>
              </div>
              
              <p className="text-gray-600 mt-4">
                {cutter.profile.specialty || 'No specialty specified'}
              </p>
            </div>
            
            <div className="ml-auto mt-6 md:mt-0 flex-shrink-0">
              {cutter.profile.availableForCustomWork ? (
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-green-600 font-medium mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Available for custom work
                  </span>
                  <Button variant="primary">Contact Cutter</Button>
                </div>
              ) : (
                <span className="text-red-600 font-medium flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Not available for custom work
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: Bio and details */}
          <div className="md:col-span-1">
            <Card title="About" className="mb-6">
              <p className="text-gray-700">
                {cutter.profile.bio || 'No bio provided.'}
              </p>
            </Card>
            
            <Card title="Details" className="mb-6">
              <div className="space-y-4">
                {cutter.profile.workshopLocation && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Workshop Location</h3>
                    <p className="text-gray-800">{cutter.profile.workshopLocation}</p>
                  </div>
                )}
                
                {cutter.profile.certifications && cutter.profile.certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Certifications</h3>
                    <ul className="list-disc list-inside text-gray-800">
                      {cutter.profile.certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {cutter.profile.toolsUsed && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tools Used</h3>
                    <p className="text-gray-800">{cutter.profile.toolsUsed}</p>
                  </div>
                )}
              </div>
            </Card>
            
            <Card title="Cutting Skills">
              <SkillsList skills={cutter.skills || []} />
            </Card>
          </div>
          
          {/* Right column: Portfolio */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
            
            {cutter.portfolio && cutter.portfolio.length > 0 ? (
              <PortfolioGallery 
                items={cutter.portfolio} 
                onDelete={() => {}} // Empty function as viewers can't delete
                isVerified={cutter.profile.portfolioVerified || false}
                readOnly={true}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">This cutter hasn't added any portfolio items yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default CutterDetail;
import React from 'react';

interface ExpertiseBadgeProps {
  level: 'Beginner' | 'Intermediate' | 'Expert' | 'Master';
}

const ExpertiseBadge: React.FC<ExpertiseBadgeProps> = ({ level }) => {
  // Determine color based on expertise level
  const getColor = () => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800';
      case 'Intermediate':
        return 'bg-green-100 text-green-800';
      case 'Expert':
        return 'bg-purple-100 text-purple-800';
      case 'Master':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getColor()}`}>
      {level}
    </span>
  );
};

export default ExpertiseBadge;
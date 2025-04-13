import React from 'react';

interface Skill {
  skill_id: number;
  name: string;
  description: string | null;
  proficiency_level: number;
}

interface SkillsListProps {
  skills: Skill[];
}

const SkillsList: React.FC<SkillsListProps> = ({ skills }) => {
  if (skills.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
        No cutting skills have been added to your profile yet.
      </div>
    );
  }

  // Sort skills by proficiency level (highest first)
  const sortedSkills = [...skills].sort((a, b) => b.proficiency_level - a.proficiency_level);

  return (
    <div className="space-y-4">
      {sortedSkills.map((skill) => (
        <div key={skill.skill_id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">{skill.name}</h3>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                    ${level <= skill.proficiency_level 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-500'}`}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
          {skill.description && (
            <p className="text-sm text-gray-600">{skill.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default SkillsList;
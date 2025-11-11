import React from 'react';
import type { Course } from '../types';
import { LockClosedIcon, CheckCircleIcon, PlayIcon, LoadingSpinner } from './icons';

interface CourseViewProps {
  course: Course;
  onSelectSubTopic: (moduleIndex: number, subTopicIndex: number) => void;
  isLoading: boolean;
}

const CourseView: React.FC<CourseViewProps> = ({ course, onSelectSubTopic, isLoading }) => {
    const [loadingSubTopic, setLoadingSubTopic] = React.useState<string | null>(null);

    const handleSubTopicClick = (moduleIndex: number, subTopicIndex: number) => {
        const subTopic = course.modules[moduleIndex].subTopics[subTopicIndex];
        if (subTopic.isUnlocked && !subTopic.isCompleted) {
            setLoadingSubTopic(`${moduleIndex}-${subTopicIndex}`);
            onSelectSubTopic(moduleIndex, subTopicIndex);
        }
    };

    const { totalSubTopics, completedSubTopics, completionPercentage } = React.useMemo(() => {
        const allSubTopics = course.modules.flatMap(module => module.subTopics);
        const total = allSubTopics.length;
        const completed = allSubTopics.filter(st => st.isCompleted).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
            totalSubTopics: total,
            completedSubTopics: completed,
            completionPercentage: percentage,
        };
    }, [course]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-2 text-indigo-400">{course.syllabusTitle}</h1>
      <p className="text-center text-gray-400 mb-10">Your personalized learning path. Complete each sub-topic to unlock the next.</p>
      
      <div className="mb-12 px-4">
        <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-300">
            <span>Overall Progress</span>
            <span className="font-semibold text-indigo-400">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3" role="progressbar" aria-label="Course completion progress" aria-valuenow={completionPercentage} aria-valuemin="0" aria-valuemax="100">
            <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${completionPercentage}%` }}
            ></div>
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{completedSubTopics} of {totalSubTopics} topics completed</p>
      </div>

      <div className="space-y-8">
        {course.modules.map((module, moduleIndex) => (
          <div key={moduleIndex} className="bg-gray-800/50 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-indigo-500">Module {moduleIndex + 1}:</span> {module.moduleTitle}
            </h2>
            <ul className="space-y-3">
              {module.subTopics.map((subTopic, subTopicIndex) => {
                const isClickable = subTopic.isUnlocked && !subTopic.isCompleted;
                const isLoadingThis = isLoading && loadingSubTopic === `${moduleIndex}-${subTopicIndex}`;

                return (
                  <li
                    key={subTopicIndex}
                    onClick={() => handleSubTopicClick(moduleIndex, subTopicIndex)}
                    className={`flex items-center justify-between p-4 rounded-md transition-all duration-300 ease-in-out ${
                      isClickable
                        ? 'bg-gray-700 hover:bg-indigo-900/50 hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                        : 'bg-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {subTopic.isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : subTopic.isUnlocked ? (
                        <PlayIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                      ) : (
                        <LockClosedIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-white">{subTopic.subTopicTitle}</p>
                        <p className="text-sm text-gray-400">{subTopic.description}</p>
                      </div>
                    </div>
                    {isLoadingThis && <LoadingSpinner className="w-5 h-5 text-white" />}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseView;

import React, { useState } from 'react';
import { LogoIcon } from './icons';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
}

const TopicInput: React.FC<TopicInputProps> = ({ onSubmit }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  const sampleTopics = ["The Renaissance", "Quantum Computing Basics", "Introduction to Japanese Cuisine", "History of Ancient Rome"];
  const selectSampleTopic = () => {
    const randomTopic = sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
    setTopic(randomTopic);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="max-w-2xl w-full">
        <LogoIcon className="w-24 h-24 mx-auto text-indigo-500 mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          What do you want to learn today?
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Enter any topic, and our AI will generate a complete, interactive course for you in minutes.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'The Science of Black Holes'"
            className="flex-grow px-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
          />
          <button
            type="submit"
            disabled={!topic.trim()}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition-transform hover:scale-105 disabled:scale-100"
          >
            Create Course
          </button>
        </form>
         <div className="mt-6">
            <button onClick={selectSampleTopic} className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
              Or try a sample topic
            </button>
        </div>
      </div>
    </div>
  );
};

export default TopicInput;

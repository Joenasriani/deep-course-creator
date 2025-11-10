
import React, { useState } from 'react';
import type { SubTopic } from '../types';
import { LightbulbIcon, QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon } from './icons';

declare const marked: any;

interface TutorialViewProps {
    subTopic: SubTopic;
    onBack: () => void;
    onStartQuiz: () => void;
}

const InteractiveCheckComponent: React.FC<{ check: SubTopic['tutorialContent']['interactiveCheck'] }> = ({ check }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (option: string) => {
        if (submitted) return;
        setSelectedAnswer(option);
    };

    const handleSubmit = () => {
        if (selectedAnswer) {
            setSubmitted(true);
        }
    };
    
    const isCorrect = selectedAnswer === check.correctAnswer;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-400" />
                Check Your Understanding
            </h3>
            <p className="mb-4 text-gray-300">{check.question}</p>
            <div className="space-y-2">
                {check.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = check.correctAnswer === option;
                    
                    let optionClass = "w-full text-left p-3 border rounded-md transition-colors duration-200 flex items-center justify-between";
                    if(submitted) {
                        if (isCorrectOption) {
                            optionClass += " bg-green-500/30 border-green-500 text-white";
                        } else if (isSelected && !isCorrectOption) {
                            optionClass += " bg-red-500/30 border-red-500 text-white";
                        } else {
                            optionClass += " border-gray-600 opacity-70";
                        }
                    } else {
                        optionClass += isSelected ? " bg-indigo-600 border-indigo-500" : " bg-gray-700 border-gray-600 hover:bg-gray-600";
                    }

                    return (
                        <button key={index} onClick={() => handleSelect(option)} className={optionClass} disabled={submitted}>
                            <span>{option}</span>
                             {submitted && isCorrectOption && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                            {submitted && isSelected && !isCorrectOption && <XCircleIcon className="w-5 h-5 text-red-400" />}
                        </button>
                    );
                })}
            </div>
            {!submitted && (
                <button onClick={handleSubmit} disabled={!selectedAnswer} className="mt-4 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Check
                </button>
            )}
            {submitted && (
                <p className={`mt-4 font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? "That's right!" : `Not quite. The correct answer is: ${check.correctAnswer}`}
                </p>
            )}
        </div>
    );
};


const TutorialView: React.FC<TutorialViewProps> = ({ subTopic, onBack, onStartQuiz }) => {
    const { tutorialContent } = subTopic;

    if (!tutorialContent) {
        return <div className="text-center p-8">Loading tutorial content...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-0">
             <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                &larr; Back to Syllabus
            </button>
            <h2 className="text-3xl lg:text-4xl font-bold text-indigo-400 mb-2">{subTopic.subTopicTitle}</h2>
            <p className="text-gray-400 mb-8">{subTopic.description}</p>
            
            <article className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-white prose-a:text-indigo-400">
                <div dangerouslySetInnerHTML={{ __html: marked.parse(tutorialContent.introduction) }} />
                
                {tutorialContent.coreConcepts.map((concept, index) => (
                    <section key={index} className="mt-6">
                        <h2>{concept.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(concept.explanation) }} />
                    </section>
                ))}
            </article>

            <div className="bg-indigo-900/30 border border-indigo-700 rounded-lg p-6 mt-8 flex items-start gap-4">
                <LightbulbIcon className="w-8 h-8 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-yellow-300">Key Takeaway</h3>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(tutorialContent.keyTakeaway) }} />
                </div>
            </div>

            <InteractiveCheckComponent check={tutorialContent.interactiveCheck} />

            <div className="text-center mt-12">
                <button onClick={onStartQuiz} className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105">
                    I'm Ready! Start the Quiz
                </button>
            </div>
        </div>
    );
};

export default TutorialView;

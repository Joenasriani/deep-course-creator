import React, { useState, useEffect } from 'react';
import type { Game, MatchingGameData, FillInTheBlanksGameData, TrueFalseGameData } from '../types';

// Helper to shuffle arrays
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};


const MatchingGame: React.FC<{ game: Game }> = ({ game }) => {
    const data = game.data as MatchingGameData[];
    const [terms] = useState(() => shuffleArray(data.map(item => item.term)));
    const [definitions] = useState(() => shuffleArray(data.map(item => item.definition)));
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState<{ text: string, color: 'green' | 'red' } | null>(null);
    const [incorrectDef, setIncorrectDef] = useState<string | null>(null);

    const handleTermClick = (term: string) => {
        if (matchedPairs[term]) return;
        setSelectedTerm(term);
        setFeedback(null);
    };

    const handleDefinitionClick = (definition: string) => {
        if (!selectedTerm || Object.values(matchedPairs).includes(definition)) return;

        const correctTermData = data.find(item => item.definition === definition);
        if (correctTermData?.term === selectedTerm) {
            setMatchedPairs(prev => ({ ...prev, [selectedTerm]: definition }));
            setFeedback({ text: 'Correct!', color: 'green' });
        } else {
            setMistakes(prev => prev + 1);
            setFeedback({ text: 'Incorrect, try again.', color: 'red' });
            setIncorrectDef(definition);
            setTimeout(() => setIncorrectDef(null), 500);
        }
        setSelectedTerm(null);
        setTimeout(() => setFeedback(null), 1500);
    };
    
    const allMatched = Object.keys(matchedPairs).length === data.length;
    
    const getScoreFeedback = () => {
        if (mistakes === 0) return "🎉 Perfect match! You're a vocabulary virtuoso! 🎉";
        if (mistakes <= 3) return "👍 Great job! You connected the dots well. A true concept connoisseur!";
        return "🧠 What do you call a lazy kangaroo? Pouch potato! Don't worry, keep practicing and you'll be matching them all in no time!";
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Term Buttons */}
                <div className="space-y-2">
                    {terms.map(term => (
                        <button key={term} onClick={() => handleTermClick(term)} disabled={!!matchedPairs[term]}
                            className={`w-full p-3 rounded-md text-left transition-all duration-200 ${matchedPairs[term] ? 'bg-green-800 cursor-not-allowed opacity-70' : selectedTerm === term ? 'bg-indigo-600 scale-105 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {term}
                        </button>
                    ))}
                </div>
                {/* Definition Buttons */}
                <div className="space-y-2">
                    {definitions.map(def => (
                        <button key={def} onClick={() => handleDefinitionClick(def)} disabled={Object.values(matchedPairs).includes(def)}
                            className={`w-full p-3 rounded-md text-left transition-all duration-200 ${Object.values(matchedPairs).includes(def) ? 'bg-green-800 cursor-not-allowed opacity-70' : incorrectDef === def ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {def}
                        </button>
                    ))}
                </div>
            </div>
            
            {feedback && (
                <p className={`text-center mt-4 font-semibold text-lg ${feedback.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback.text}
                </p>
            )}

            {allMatched && (
                <div className="mt-6 text-center p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <h4 className="text-xl font-bold">Congratulations!</h4>
                    <p className="text-2xl my-2">You matched them all with {mistakes} mistake{mistakes !== 1 ? 's' : ''}.</p>
                    <p className="text-gray-300">{getScoreFeedback()}</p>
                </div>
            )}
        </div>
    );
};

const FillInTheBlanksGame: React.FC<{ game: Game }> = ({ game }) => {
    const data = game.data as FillInTheBlanksGameData[];
    const [answers, setAnswers] = useState<string[]>(Array(data.length).fill(''));
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (index: number, value: string) => {
        if (submitted) return;
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const results = data.map((item, index) => item.answer.toLowerCase() === answers[index].toLowerCase().trim());
    const score = results.filter(Boolean).length;

    const getScoreFeedback = () => {
        const percentage = (score / data.length) * 100;
        if (percentage >= 80) return "🎉 Excellent work! You filled in all the blanks with confidence. 🎉";
        if (percentage >= 50) return "👍 Nice job! You've got a good handle on this. A little review will fill in any gaps!";
        return "🧠 Why was the equal sign so humble? Because he knew he wasn’t less than or greater than anyone else! Keep practicing, you'll get there!";
    };

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className={`flex flex-col sm:flex-row items-center gap-2 p-3 rounded-md transition-colors ${submitted ? (results[index] ? 'bg-green-900/20' : 'bg-red-900/20') : 'bg-gray-800'}`}>
                    <p className="flex-grow">{item.sentence.replace('___', '')}</p>
                    <input type="text" value={answers[index]} onChange={e => handleChange(index, e.target.value)} disabled={submitted}
                           className={`px-3 py-1 bg-gray-800 border-2 rounded-md w-full sm:w-auto transition-colors ${submitted ? (results[index] ? 'border-green-500 bg-green-900/30' : 'border-red-500 bg-red-900/30') : 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                </div>
            ))}
            {!submitted && (
                <button onClick={handleSubmit} className="mt-4 px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">Check Answers</button>
            )}
            {submitted && (
                <div className="mt-6 text-center p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <h4 className="text-xl font-bold">Results</h4>
                    <p className="text-2xl my-2">Your Score: {score} / {data.length}</p>
                    <p className="text-gray-300">{getScoreFeedback()}</p>
                </div>
            )}
        </div>
    );
};

const TrueFalseGame: React.FC<{ game: Game }> = ({ game }) => {
    const data = game.data as TrueFalseGameData[];
    const [answers, setAnswers] = useState<(boolean | null)[]>(Array(data.length).fill(null));

    const handleAnswer = (index: number, selectedAnswer: boolean) => {
        if (answers[index] !== null) return; // Lock answer once selected

        const newAnswers = [...answers];
        newAnswers[index] = selectedAnswer;
        setAnswers(newAnswers);
    };

    const allAnswered = answers.every(a => a !== null);
    const score = answers.reduce((count, answer, index) => {
        if (answer === null) return count; // Don't count unanswered questions
        // Coerce to string for robust comparison, in case API returns "true" instead of true
        return String(answer) === String(data[index].isTrue) ? count + 1 : count;
    }, 0);

    const getScoreFeedback = () => {
        const percentage = (score / data.length) * 100;
        if (percentage >= 80) return "🎉 Congratulations! You aced it! You're a true master of this topic. 🎉";
        if (percentage >= 50) return "👍 Good job! You're on the right track. A little more review and you'll be an expert. Keep up the great work!";
        return "🧠 Why did the student throw a clock out the window? He wanted to see time fly! Don't worry, review the material and you'll get it next time!";
    };

    return (
        <div className="space-y-3">
            {data.map((item, index) => {
                const userAnswer = answers[index];
                const isAnswered = userAnswer !== null;

                const getButtonClass = (buttonValue: boolean) => {
                    const baseClass = 'px-4 py-1 rounded-md w-20 text-center transition-colors';
                    if (!isAnswered) {
                        return `${baseClass} bg-gray-700 hover:bg-gray-600`;
                    }
                    
                    const wasSelected = userAnswer === buttonValue;
                    if (wasSelected) {
                        const isCorrect = String(userAnswer) === String(item.isTrue);
                        return `${baseClass} ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`;
                    } else {
                        return `${baseClass} bg-gray-800 opacity-50 cursor-not-allowed`;
                    }
                };
                
                let containerClass = 'p-4 rounded-lg border-2 transition-colors border-gray-700';
                if(isAnswered) {
                    const wasCorrect = String(userAnswer) === String(item.isTrue);
                    containerClass = `p-4 rounded-lg border-2 transition-colors ${wasCorrect ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'}`;
                }

                return (
                    <div key={index} className={containerClass}>
                        <p className="mb-3">{item.statement}</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleAnswer(index, true)} 
                                disabled={isAnswered}
                                className={getButtonClass(true)}
                            >
                                True
                            </button>
                            <button 
                                onClick={() => handleAnswer(index, false)} 
                                disabled={isAnswered}
                                className={getButtonClass(false)}
                            >
                                False
                            </button>
                        </div>
                    </div>
                );
            })}
            {allAnswered && (
                 <div className="mt-6 text-center p-4 rounded-lg bg-gray-900 border border-gray-700">
                    <h4 className="text-xl font-bold">Game Over!</h4>
                    <p className="text-2xl my-2">Your Score: {score} / {data.length}</p>
                    <p className="text-gray-300">{getScoreFeedback()}</p>
                </div>
            )}
        </div>
    );
};


const GameRenderer: React.FC<{ game: Game }> = ({ game }) => {
    switch (game.gameType) {
        case 'matching': return <MatchingGame game={game} />;
        case 'fill-in-the-blanks': return <FillInTheBlanksGame game={game} />;
        case 'true-false': return <TrueFalseGame game={game} />;
        default: return <p>Unknown game type</p>;
    }
};

const GamesView: React.FC<{ games: Game[] }> = ({ games }) => {
    if (games.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Educational Games</h2>
                <p className="text-gray-400">Complete modules in your course to unlock interactive games here!</p>
            </div>
        );
    }
    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-4">Educational Games</h2>
            <p className="text-center text-gray-400 mb-8">
                Here's a quick check on your existing knowledge. As you complete modules in the course, new games will appear here to test what you've learned!
            </p>
            <div className="space-y-8 max-w-4xl mx-auto">
                {games.map((game, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg shadow-xl p-6 border border-gray-700">
                        <h3 className="text-2xl font-bold text-indigo-400 mb-2">{game.gameTitle}</h3>
                        <p className="text-gray-400 mb-6">{game.instructions}</p>
                        <GameRenderer game={game} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamesView;
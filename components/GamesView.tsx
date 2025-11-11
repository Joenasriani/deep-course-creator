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
    const [feedback, setFeedback] = useState('');
    const [incorrectDef, setIncorrectDef] = useState<string | null>(null);

    const handleTermClick = (term: string) => {
        if (matchedPairs[term]) return;
        setSelectedTerm(term);
    };

    const handleDefinitionClick = (definition: string) => {
        if (!selectedTerm || Object.values(matchedPairs).includes(definition)) return;

        const correctTerm = data.find(item => item.definition === definition)?.term;
        if (correctTerm === selectedTerm) {
            setMatchedPairs(prev => ({ ...prev, [selectedTerm]: definition }));
            setFeedback('Correct!');
        } else {
            setFeedback('Incorrect, try again.');
            setIncorrectDef(definition);
            setTimeout(() => setIncorrectDef(null), 1000);
        }
        setSelectedTerm(null);
        setTimeout(() => setFeedback(''), 1500);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    {terms.map(term => (
                        <button key={term} onClick={() => handleTermClick(term)} disabled={!!matchedPairs[term]}
                            className={`w-full p-3 rounded-md text-left transition-colors ${matchedPairs[term] ? 'bg-green-700 cursor-not-allowed' : selectedTerm === term ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {term}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    {definitions.map(def => (
                        <button key={def} onClick={() => handleDefinitionClick(def)} disabled={Object.values(matchedPairs).includes(def)}
                            className={`w-full p-3 rounded-md text-left transition-colors ${Object.values(matchedPairs).includes(def) ? 'bg-green-700 cursor-not-allowed' : incorrectDef === def ? 'bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {def}
                        </button>
                    ))}
                </div>
            </div>
            {feedback && <p className="text-center mt-4 font-semibold">{feedback}</p>}
             {Object.keys(matchedPairs).length === data.length && <p className="text-center mt-4 font-bold text-lg text-green-400">Congratulations, you matched them all!</p>}
        </div>
    );
};

const FillInTheBlanksGame: React.FC<{ game: Game }> = ({ game }) => {
    const data = game.data as FillInTheBlanksGameData[];
    const [answers, setAnswers] = useState<string[]>(Array(data.length).fill(''));
    const [results, setResults] = useState<boolean[]>(Array(data.length).fill(false));
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        const newResults = data.map((item, index) => item.answer.toLowerCase() === answers[index].toLowerCase().trim());
        setResults(newResults);
        setSubmitted(true);
    };

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-gray-700 rounded-md">
                    <p className="flex-grow">{item.sentence.replace('___', '')}</p>
                    <input type="text" value={answers[index]} onChange={e => handleChange(index, e.target.value)} 
                           className={`px-3 py-1 bg-gray-800 border rounded-md w-full sm:w-auto ${submitted ? (results[index] ? 'border-green-500' : 'border-red-500') : 'border-gray-600'}`} />
                </div>
            ))}
            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">Check Answers</button>
        </div>
    );
};

const TrueFalseGame: React.FC<{ game: Game }> = ({ game }) => {
    const data = game.data as TrueFalseGameData[];
    const [answers, setAnswers] = useState<(boolean | null)[]>(Array(data.length).fill(null));

    const handleAnswer = (index: number, answer: boolean) => {
        const newAnswers = [...answers];
        newAnswers[index] = answer;
        setAnswers(newAnswers);
    };

    return (
        <div className="space-y-3">
            {data.map((item, index) => {
                const result = answers[index] === item.isTrue;
                return (
                    <div key={index} className={`p-4 rounded-lg border-2 ${answers[index] === null ? 'border-gray-700' : result ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'}`}>
                        <p className="mb-3">{item.statement}</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleAnswer(index, true)} className={`px-4 py-1 rounded-md ${answers[index] === true ? 'bg-indigo-600' : 'bg-gray-700'}`}>True</button>
                            <button onClick={() => handleAnswer(index, false)} className={`px-4 py-1 rounded-md ${answers[index] === false ? 'bg-indigo-600' : 'bg-gray-700'}`}>False</button>
                        </div>
                    </div>
                );
            })}
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

import React, { useState, useCallback } from 'react';
import type { Course, Game } from './types';
import { generateSyllabus, generateTutorial, generateQuiz, generateGame } from './services/geminiService';
import TopicInput from './components/TopicInput';
import CourseView from './components/CourseView';
import QuizView from './components/QuizView';
import GamesView from './components/GamesView';
import TutorialView from './components/TutorialView';
import { LogoIcon, LoadingSpinner, BookOpenIcon, GameControllerIcon, AlertTriangleIcon } from './components/icons';

type AppState = 'idle' | 'generatingSyllabus' | 'learning' | 'error';
type ActiveTab = 'course' | 'games';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('idle');
    const [activeTab, setActiveTab] = useState<ActiveTab>('course');
    const [topic, setTopic] = useState<string>('');
    const [course, setCourse] = useState<Course | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [activeContent, setActiveContent] = useState<{ type: 'tutorial' | 'quiz', moduleIndex: number, subTopicIndex: number } | null>(null);
    const [contentLoading, setContentLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleTopicSubmit = async (newTopic: string) => {
        setAppState('generatingSyllabus');
        setTopic(newTopic);
        setCourse(null);
        setGames([]);
        setActiveContent(null);
        setError(null);
        try {
            const syllabus = await generateSyllabus(newTopic);
            // Unlock the first sub-topic
            if (syllabus.modules.length > 0 && syllabus.modules[0].subTopics.length > 0) {
                syllabus.modules[0].subTopics[0].isUnlocked = true;
            }
            setCourse(syllabus);
            setAppState('learning');
        } catch (err) {
            console.error(err);
            setError('Failed to generate the syllabus. The AI may be busy, please try again.');
            setAppState('error');
        }
    };

    const handleSelectSubTopic = useCallback(async (moduleIndex: number, subTopicIndex: number) => {
        if (!course) return;

        const subTopic = course.modules[moduleIndex].subTopics[subTopicIndex];
        if (!subTopic.tutorialContent || !subTopic.quiz) {
            setContentLoading(true);
            try {
                const [tutorialContent, quiz] = await Promise.all([
                    generateTutorial(subTopic.subTopicTitle, subTopic.description),
                    generateQuiz(subTopic.subTopicTitle)
                ]);

                const newCourse = { ...course };
                newCourse.modules[moduleIndex].subTopics[subTopicIndex].tutorialContent = tutorialContent;
                newCourse.modules[moduleIndex].subTopics[subTopicIndex].quiz = quiz;
                setCourse(newCourse);
            } catch (err) {
                console.error(err);
                setError('Failed to load sub-topic content. Please try again.');
                setContentLoading(false);
                return;
            } finally {
                setContentLoading(false);
            }
        }
        setActiveContent({ type: 'tutorial', moduleIndex, subTopicIndex });
    }, [course]);

    const handleQuizComplete = useCallback(async (moduleIndex: number, subTopicIndex: number) => {
        if (!course) return;
        
        const newCourse = { ...course };
        
        // Mark sub-topic as complete
        newCourse.modules[moduleIndex].subTopics[subTopicIndex].isCompleted = true;
        
        // Unlock next sub-topic
        const nextSubTopicIndex = subTopicIndex + 1;
        if (nextSubTopicIndex < newCourse.modules[moduleIndex].subTopics.length) {
            newCourse.modules[moduleIndex].subTopics[nextSubTopicIndex].isUnlocked = true;
        } else {
            // Unlock first sub-topic of next module
            const nextModuleIndex = moduleIndex + 1;
            if (nextModuleIndex < newCourse.modules.length) {
                newCourse.modules[nextModuleIndex].subTopics[0].isUnlocked = true;
            }
        }

        // Check if module is complete
        const currentModule = newCourse.modules[moduleIndex];
        const allSubTopicsCompleted = currentModule.subTopics.every(st => st.isCompleted);
        if (allSubTopicsCompleted && !currentModule.isCompleted) {
            currentModule.isCompleted = true;
            // Generate a game for the completed module
            try {
                const newGame = await generateGame(currentModule.moduleTitle);
                setGames(prevGames => [...prevGames, newGame]);
                // You could add a notification here
            } catch (err) {
                console.error("Failed to generate game:", err);
                // Non-critical error, so we don't block the user.
            }
        }
        
        setCourse(newCourse);
        setActiveContent(null);
    }, [course]);
    
    const renderContent = () => {
        if (appState === 'generatingSyllabus') {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <LoadingSpinner className="w-16 h-16 text-indigo-400" />
                    <p className="text-xl font-semibold">Generating your course on "{topic}"...</p>
                    <p className="text-gray-400">The AI is crafting a personalized learning journey for you. This may take a moment.</p>
                </div>
            );
        }

        if (appState === 'error') {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <AlertTriangleIcon className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold">An Error Occurred</h2>
                    <p className="text-gray-400">{error}</p>
                    <button onClick={() => { setAppState('idle'); setTopic(''); }} className="mt-4 px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                        Start Over
                    </button>
                </div>
            );
        }
        
        if (appState === 'learning' && course) {
            if (activeContent) {
                const { type, moduleIndex, subTopicIndex } = activeContent;
                const subTopic = course.modules[moduleIndex].subTopics[subTopicIndex];

                if (type === 'tutorial') {
                   return <TutorialView 
                        subTopic={subTopic}
                        onBack={() => setActiveContent(null)}
                        onStartQuiz={() => setActiveContent({ type: 'quiz', moduleIndex, subTopicIndex })}
                    />;
                }

                if (type === 'quiz') {
                    return <QuizView 
                        subTopic={subTopic} 
                        onComplete={() => handleQuizComplete(moduleIndex, subTopicIndex)} 
                        onBack={() => setActiveContent({ type: 'tutorial', moduleIndex, subTopicIndex })}
                    />;
                }
            }

            return (
                <div className="p-4 md:p-8">
                    <CourseView 
                        course={course} 
                        onSelectSubTopic={handleSelectSubTopic}
                        isLoading={contentLoading} 
                    />
                </div>
            );
        }

        return <TopicInput onSubmit={handleTopicSubmit} />;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <header className="bg-gray-800/50 backdrop-blur-sm shadow-md sticky top-0 z-10">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-8 h-8 text-indigo-500" />
                        <h1 className="text-2xl font-bold text-white">IntelliCourse Creator</h1>
                    </div>
                    {course && (
                        <div className="flex items-center bg-gray-900 rounded-full p-1">
                            <button onClick={() => setActiveTab('course')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'course' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <BookOpenIcon className="w-5 h-5"/>
                                Course
                            </button>
                            <button onClick={() => setActiveTab('games')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'games' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <GameControllerIcon className="w-5 h-5"/>
                                Games {games.length > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{games.length}</span>}
                            </button>
                        </div>
                    )}
                </nav>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'course' ? renderContent() : <GamesView games={games} />}
            </main>
             <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-800">
                <p>Powered by Gemini. Created for educational purposes.</p>
            </footer>
        </div>
    );
};

export default App;

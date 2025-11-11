import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface AdminUnlockProps {
    onUnlockAll: () => void;
}

const AdminUnlock: React.FC<AdminUnlockProps> = ({ onUnlockAll }) => {
    const [isCardOpen, setIsCardOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [unlocked, setUnlocked] = useState(false);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1324') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

    const handleUnlockClick = () => {
        onUnlockAll();
        setUnlocked(true);
        setTimeout(() => {
            setIsCardOpen(false);
            // Reset state for next time
            setPassword('');
            setIsAuthenticated(false);
            setUnlocked(false);
        }, 2000); // Close card after 2 seconds
    };
    
    if (!isCardOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-20">
                <button
                    onClick={() => setIsCardOpen(true)}
                    className="flex flex-col items-center justify-center bg-gray-700 rounded-lg shadow-lg hover:bg-indigo-600 transition-colors px-3 py-2"
                    aria-label="Open Admin Controls"
                >
                    <KeyIcon className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-bold text-white tracking-wider uppercase mt-1">Admin</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsCardOpen(false)}>
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700 w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-center mb-4 text-indigo-400">Admin Controls</h3>
                
                {!isAuthenticated ? (
                    <form onSubmit={handlePasswordSubmit}>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-2">
                            Enter Password to Unlock
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <button
                            type="submit"
                            className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Submit
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        {unlocked ? (
                            <div>
                                <p className="text-green-400 font-semibold text-lg">Success!</p>
                                <p className="text-gray-300">All modules have been unlocked.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-300 mb-4">Password accepted. Click below to unlock all course modules.</p>
                                <button
                                    onClick={handleUnlockClick}
                                    className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Unlock All Modules
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUnlock;

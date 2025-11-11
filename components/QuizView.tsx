import React, { useState, useMemo, useEffect } from 'react';
import type { SubTopic } from '../types';
import { generateQuizAdvice } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface QuizViewProps {
  subTopic: SubTopic;
  onComplete: () => void;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ subTopic, onComplete, onBack }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  const quiz = useMemo(() => subTopic.quiz || [], [subTopic]);

  const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (submitted) return;
    // FIX: Corrected typo from [question-index] to [questionIndex]
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };
  
  const handleSubmit = () => {
    setSubmitted(true);
  };
  
  const handleTryAgain = () => {
    setAnswers({});
    setSubmitted(false);
    setAdvice(null);
  };

  const score = useMemo(() => {
    return quiz.reduce((total, question, index) => {
      return answers[index] === question.correctAnswer ? total + 1 : total;
    }, 0);
  }, [answers, quiz]);

  const questionsNeededToPass = 7;
  const hasPassed = score >= questionsNeededToPass;

  useEffect(() => {
    const generateAndSetAdvice = async () => {
      if (submitted && !hasPassed) {
        setIsAdviceLoading(true);
        setAdvice(null);
        const incorrectAnswersPayload = quiz
          .map((q, index) => ({ ...q, userAnswer: answers[index] }))
          .filter(q => q.userAnswer !== q.correctAnswer)
          .map(q => ({
            question: q.question,
            wrongAnswer: q.userAnswer || 'Not answered',
            correctAnswer: q.correctAnswer,
          }));

        try {
          const generatedAdvice = await generateQuizAdvice(subTopic.subTopicTitle, incorrectAnswersPayload);
          setAdvice(generatedAdvice);
        } catch (error) {
          console.error("Failed to generate advice:", error);
          setAdvice("Review the topics where you made mistakes and try again. You can do it!");
        } finally {
          setIsAdviceLoading(false);
        }
      }
    };

    generateAndSetAdvice();
  }, [submitted, hasPassed, quiz, answers, subTopic.subTopicTitle]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button onClick={onBack} className="mb-6 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
        &larr; Back to Tutorial
      </button>
      <h2 className="text-3xl font-bold text-indigo-400 mb-2">Quiz: {subTopic.subTopicTitle}</h2>
      <p className="text-gray-400 mb-8">Answer at least {questionsNeededToPass} questions correctly to proceed to the next topic.</p>

      <div className="space-y-6">
        {quiz.map((q, index) => (
          <div key={index} className={`p-5 rounded-lg border-2 ${submitted ? (answers[index] === q.correctAnswer ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20') : 'border-gray-700 bg-gray-800'}`}>
            <p className="font-semibold mb-4 text-lg">{index + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map(option => {
                const isSelected = answers[index] === option;
                const isCorrect = q.correctAnswer === option;
                
                let optionClass = "w-full text-left p-3 border rounded-md transition-colors duration-200 flex items-center justify-between";
                let icon = null;

                if (submitted) {
                    if (isCorrect) {
                        optionClass += " bg-green-500/30 border-green-500 text-white";
                        icon = <CheckCircleIcon className="w-5 h-5 text-green-400" />;
                    } else if (isSelected && !isCorrect) {
                        optionClass += " bg-red-500/30 border-red-500 text-white";
                        icon = <XCircleIcon className="w-5 h-5 text-red-400" />;
                    } else { // Unselected and incorrect
                        optionClass += " border-gray-600 text-gray-400 opacity-70";
                        icon = <XCircleIcon className="w-5 h-5 text-gray-500" />;
                    }
                } else {
                    optionClass += isSelected ? " bg-indigo-600 border-indigo-500" : " bg-gray-700 border-gray-600 hover:bg-gray-600";
                }

                return (
                  <button key={option} onClick={() => handleSelectAnswer(index, option)} className={optionClass} disabled={submitted}>
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitted && (
        <div className="mt-8 text-center p-6 rounded-lg bg-gray-800">
            <h3 className="text-2xl font-bold">Your Score: {score} / {quiz.length}</h3>
            {hasPassed ? (
                <>
                    <p className="text-green-400 mt-2 text-lg">Congratulations! You scored {score} out of {quiz.length} and passed the quiz.</p>
                    <button onClick={onComplete} className="mt-6 px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-105">
                        Continue Learning
                    </button>
                </>
            ) : (
                 <>
                    <p className="text-red-400 mt-2">You need to score at least {questionsNeededToPass}/{quiz.length} to continue.</p>
                    <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-md text-left max-w-2xl mx-auto">
                       <h4 className="font-semibold text-indigo-400 mb-2">Study Suggestion</h4>
                       {isAdviceLoading ? (
                           <p className="text-gray-400 italic">Generating personalized advice...</p>
                       ) : (
                           <p className="text-gray-300">{advice}</p>
                       )}
                   </div>
                    <button onClick={handleTryAgain} className="mt-6 px-8 py-3 bg-yellow-600 text-white font-bold rounded-lg shadow-lg hover:bg-yellow-700 transition-transform hover:scale-105">
                        Try Again
                    </button>
                </>
            )}
        </div>
      )}
      
      {!submitted && (
         <div className="mt-8 text-center">
            <button onClick={handleSubmit} disabled={Object.keys(answers).length !== quiz.length} className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed">
                Submit Answers
            </button>
         </div>
      )}
    </div>
  );
};

export default QuizView;
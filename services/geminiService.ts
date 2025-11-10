
import { GoogleGenAI } from "@google/genai";
import { SYLLABUS_PROMPT, TUTORIAL_PROMPT, QUIZ_PROMPT, GAME_PROMPT, SYLLABUS_SCHEMA, QUIZ_SCHEMA, GAME_SCHEMA, TUTORIAL_SCHEMA } from '../constants';
import type { Course, QuizQuestion, Game, TutorialContent } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonResponse = <T,>(text: string): T => {
    try {
        // The API might return the JSON wrapped in markdown backticks
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(cleanedText) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON format received from API.");
    }
};

export const generateSyllabus = async (topic: string): Promise<Course> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: SYLLABUS_PROMPT(topic),
        config: {
            responseMimeType: "application/json",
            responseSchema: SYLLABUS_SCHEMA,
        },
    });

    const syllabusData = parseJsonResponse<{ syllabusTitle: string; modules: Array<{ moduleTitle: string; subTopics: Array<{ subTopicTitle: string; description: string; }> }> }>(response.text);

    return {
        syllabusTitle: syllabusData.syllabusTitle,
        modules: syllabusData.modules.map(module => ({
            ...module,
            isCompleted: false,
            subTopics: module.subTopics.map(subTopic => ({
                ...subTopic,
                isCompleted: false,
                isUnlocked: false,
            }))
        }))
    };
};

export const generateTutorial = async (subTopicTitle: string, description: string): Promise<TutorialContent> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: TUTORIAL_PROMPT(subTopicTitle, description),
        config: {
            responseMimeType: "application/json",
            responseSchema: TUTORIAL_SCHEMA,
        },
    });
    return parseJsonResponse<TutorialContent>(response.text);
};

export const generateQuiz = async (subTopicTitle: string): Promise<QuizQuestion[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: QUIZ_PROMPT(subTopicTitle),
        config: {
            responseMimeType: "application/json",
            responseSchema: QUIZ_SCHEMA,
        },
    });

    const quizData = parseJsonResponse<{ questions: QuizQuestion[] }>(response.text);
    return quizData.questions;
};

export const generateGame = async (moduleTitle: string): Promise<Game> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: GAME_PROMPT(moduleTitle),
        config: {
            responseMimeType: "application/json",
            responseSchema: GAME_SCHEMA,
        },
    });

    return parseJsonResponse<Game>(response.text);
};

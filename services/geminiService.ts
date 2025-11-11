import { GoogleGenAI, Modality } from "@google/genai";
import { SYLLABUS_PROMPT, TUTORIAL_PROMPT, QUIZ_PROMPT, GAME_PROMPT, INITIAL_GAME_PROMPT, QUIZ_ADVICE_PROMPT, SYLLABUS_SCHEMA, QUIZ_SCHEMA, GAME_SCHEMA, TUTORIAL_SCHEMA, QUIZ_ADVICE_SCHEMA } from '../constants';
import type { Course, QuizQuestion, Game, TutorialContent, CoreConcept } from '../types';

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

export const generateInitialGame = async (topic: string): Promise<Game> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: INITIAL_GAME_PROMPT(topic),
        config: {
            responseMimeType: "application/json",
            responseSchema: GAME_SCHEMA,
        },
    });
    return parseJsonResponse<Game>(response.text);
};

const generateImageForPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in API response.");
    } catch (error) {
        console.error(`Failed to generate image for prompt "${prompt}":`, error);
        // Return a transparent pixel to prevent breaking the UI on error
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
};

export const generateTutorial = async (subTopicTitle: string, description: string): Promise<TutorialContent> => {
    // 1. Generate the text content first
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: TUTORIAL_PROMPT(subTopicTitle, description),
        config: {
            responseMimeType: "application/json",
            responseSchema: TUTORIAL_SCHEMA,
        },
    });
    
    const tutorialContent = parseJsonResponse<TutorialContent>(textResponse.text);

    // 2. Create prompts and generate images in parallel
    const imagePrompts: string[] = [
        `An illustrative, visually appealing image for a tutorial introduction about "${subTopicTitle}"`,
        ...tutorialContent.coreConcepts.map(concept => 
            `An illustrative, visually appealing image for a tutorial on "${subTopicTitle}" focusing on the concept of "${concept.title}"`
        )
    ];

    const imageResults = await Promise.all(imagePrompts.map(generateImageForPrompt));

    // 3. Combine text content with generated images
    tutorialContent.introImageUrl = imageResults[0];
    tutorialContent.coreConcepts.forEach((concept, index) => {
        concept.imageUrl = imageResults[index + 1];
    });
    
    return tutorialContent;
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

export const generateQuizAdvice = async (subTopicTitle: string, incorrectAnswers: { question: string; wrongAnswer: string; correctAnswer: string }[]): Promise<string> => {
    if (incorrectAnswers.length === 0) {
        return "Great job! You seem to have a solid understanding of this topic.";
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: QUIZ_ADVICE_PROMPT(subTopicTitle, incorrectAnswers),
        config: {
            responseMimeType: "application/json",
            responseSchema: QUIZ_ADVICE_SCHEMA,
        },
    });
    
    const adviceData = parseJsonResponse<{ advice: string }>(response.text);
    return adviceData.advice;
};
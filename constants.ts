import { Type } from '@google/genai';

export const SYLLABUS_PROMPT = (topic: string) => `
You are an expert curriculum designer. Given the topic "${topic}", create a comprehensive syllabus for an online course. 
The syllabus should be structured into logical modules, and each module should contain several specific sub-topics.
Return the output as a JSON object that strictly follows the provided schema.
`;

export const SYLLABUS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    syllabusTitle: { type: Type.STRING, description: 'The main title of the course syllabus.' },
    modules: {
      type: Type.ARRAY,
      description: 'An array of course modules.',
      items: {
        type: Type.OBJECT,
        properties: {
          moduleTitle: { type: Type.STRING, description: 'The title of the module.' },
          subTopics: {
            type: Type.ARRAY,
            description: 'An array of sub-topics within the module.',
            items: {
              type: Type.OBJECT,
              properties: {
                subTopicTitle: { type: Type.STRING, description: 'The title of the sub-topic.' },
                description: { type: Type.STRING, description: 'A brief, one-sentence description of the sub-topic.' },
              },
              required: ['subTopicTitle', 'description'],
            },
          },
        },
        required: ['moduleTitle', 'subTopics'],
      },
    },
  },
  required: ['syllabusTitle', 'modules'],
};


export const TUTORIAL_PROMPT = (subTopicTitle: string, description: string) => `
You are an expert educator and instructional designer. Create a detailed, engaging, and structured tutorial for the sub-topic: "${subTopicTitle}".
The sub-topic is described as: "${description}".

The tutorial must be broken down into the following distinct sections and returned as a single JSON object adhering to the provided schema:
1.  **introduction**: A brief, engaging paragraph introducing the topic.
2.  **coreConcepts**: An array of 2-4 core concepts. Each concept should have a clear 'title' and a detailed 'explanation'.
3.  **keyTakeaway**: A concise summary of the most important point of the tutorial.
4.  **interactiveCheck**: A single multiple-choice question to quickly test understanding. It must have 4 options and one correct answer.

For all text fields ('introduction', 'explanation', 'keyTakeaway'), use Markdown for rich formatting (like **bold text**, *italics*, bulleted lists using '-', and \`code snippets\`). The content should be clear, well-structured, and easy for a beginner to digest.
`;

export const TUTORIAL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        introduction: { type: Type.STRING, description: "A brief, engaging introduction to the sub-topic in Markdown format." },
        coreConcepts: {
            type: Type.ARRAY,
            description: "An array of core concepts, each with a title and a detailed explanation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the core concept." },
                    explanation: { type: Type.STRING, description: "A detailed explanation of the concept in Markdown format." },
                },
                required: ['title', 'explanation'],
            }
        },
        keyTakeaway: { type: Type.STRING, description: "A concise summary of the most important point in Markdown format." },
        interactiveCheck: {
            type: Type.OBJECT,
            description: "A single multiple-choice question to test understanding.",
            properties: {
                question: { type: Type.STRING, description: "The question text." },
                options: {
                    type: Type.ARRAY,
                    description: "An array of exactly 4 possible answers.",
                    items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the provided options." }
            },
            required: ['question', 'options', 'correctAnswer']
        }
    },
    required: ['introduction', 'coreConcepts', 'keyTakeaway', 'interactiveCheck'],
};


export const QUIZ_PROMPT = (subTopicTitle: string) => `
Based on the topic "${subTopicTitle}", create a 10-question multiple-choice quiz to test understanding.
Each question must have exactly 4 options, and only one correct answer.
Return the output as a JSON object that strictly follows the provided schema. Ensure the 'correctAnswer' exactly matches one of the strings in the 'options' array.
`;

export const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "An array of 10 quiz questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The quiz question text." },
          options: {
            type: Type.ARRAY,
            description: "An array of exactly 4 possible answers.",
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the provided options." }
        },
        required: ['question', 'options', 'correctAnswer']
      }
    }
  },
  required: ['questions']
};


export const GAME_PROMPT = (moduleTitle: string) => `
You are a creative educational game designer. Based on the learning module "${moduleTitle}", design a simple, interactive learning game.
Randomly choose one of the following game types: "matching", "fill-in-the-blanks", or "true-false".
Provide a name for the game, a brief set of instructions, and the necessary data for the game (at least 5 items).
Return the output as a JSON object that strictly follows the provided schema.

- For "matching", data should be an array of {term, definition} pairs.
- For "fill-in-the-blanks", data should be an array of {sentence, answer} pairs. Use '___' for the blank in the sentence.
- For "true-false", data should be an array of {statement, isTrue} pairs.
`;

export const GAME_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        gameType: { type: Type.STRING, enum: ['matching', 'fill-in-the-blanks', 'true-false'] },
        gameTitle: { type: Type.STRING, description: "The title of the game." },
        instructions: { type: Type.STRING, description: "Brief instructions on how to play." },
        data: {
            type: Type.ARRAY,
            description: "Game data, structure depends on gameType.",
            items: {
                type: Type.OBJECT,
                properties: {
                    // Properties for all game types (some will be null)
                    term: { type: Type.STRING, nullable: true },
                    definition: { type: Type.STRING, nullable: true },
                    sentence: { type: Type.STRING, nullable: true },
                    answer: { type: Type.STRING, nullable: true },
                    statement: { type: Type.STRING, nullable: true },
                    isTrue: { type: Type.BOOLEAN, nullable: true },
                }
            }
        }
    },
    required: ['gameType', 'gameTitle', 'instructions', 'data']
};

export const INITIAL_GAME_PROMPT = (topic: string) => `
You are an educational game designer. Your goal is to create a simple introductory knowledge-check game for a course on "${topic}".
The game should be a "true-false" type to quickly gauge what the user already knows.
Create a game titled "Initial Knowledge Check: ${topic}".
Provide brief instructions.
The game data should consist of 5-7 statements about the topic that can be answered with true or false.
Return the output as a JSON object that strictly follows the provided schema, with the "gameType" set to "true-false".
`;

export const QUIZ_ADVICE_PROMPT = (subTopicTitle: string, incorrectAnswers: { question: string; wrongAnswer: string; correctAnswer: string }[]) => `
You are a helpful and encouraging tutor. A student has just completed a quiz on the topic "${subTopicTitle}".
They made mistakes on the following questions:
${incorrectAnswers.map(item => `- Question: "${item.question}"\n  - Their Answer: "${item.wrongAnswer}"\n  - Correct Answer: "${item.correctAnswer}"`).join('\n')}

Based on these specific errors, provide a short (2-3 sentences), friendly, and constructive piece of advice. 
Focus on the core concepts they might be misunderstanding. Do not just repeat the correct answers.
For example, if they confused 'mitosis' with 'meiosis', explain the key difference briefly.
Return the advice as a JSON object with a single "advice" key.
`;

export const QUIZ_ADVICE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    advice: { type: Type.STRING, description: "Short, constructive advice for the student based on their wrong answers." }
  },
  required: ['advice']
};
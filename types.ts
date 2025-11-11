
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface InteractiveCheck {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface CoreConcept {
  title: string;
  explanation: string; // Markdown content
  imageUrl?: string;
}

export interface TutorialContent {
  introduction: string; // Markdown content
  introImageUrl?: string;
  coreConcepts: CoreConcept[];
  keyTakeaway: string; // Markdown content
  interactiveCheck: InteractiveCheck;
}

export interface SubTopic {
  subTopicTitle: string;
  description: string;
  tutorialContent?: TutorialContent;
  quiz?: QuizQuestion[];
  isCompleted: boolean;
  isUnlocked: boolean;
}

export interface Module {
  moduleTitle: string;
  subTopics: SubTopic[];
  isCompleted: boolean;
}

export interface Course {
  syllabusTitle: string;
  modules: Module[];
}

export type GameType = 'matching' | 'fill-in-the-blanks' | 'true-false';

export interface MatchingGameData {
  term: string;
  definition: string;
}

export interface FillInTheBlanksGameData {
  sentence: string; // e.g., "The capital of France is ___."
  answer: string;
}

export interface TrueFalseGameData {
  statement: string;
  isTrue: boolean;
}

export interface Game {
  gameType: GameType;
  gameTitle: string;
  instructions: string;
  data: MatchingGameData[] | FillInTheBlanksGameData[] | TrueFalseGameData[];
}
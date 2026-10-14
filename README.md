# IntelliCourse Creator

A React-based **AI-assisted course-building prototype** that turns a user-supplied topic into a structured syllabus and interactive learning materials.

## Implemented workflow

1. Enter a course topic.
2. Generate a syllabus organized into modules and subtopics.
3. Open AI-generated tutorials and quizzes for individual subtopics.
4. Access educational games for practice and reinforcement.

## Technology

- React, TypeScript, Vite.
- Google Gen AI SDK, with Gemini calls in `services/geminiService.ts`.
- Dedicated React components for the syllabus, tutorials, quiz, and games.

## Run locally

```bash
npm install
npm run dev
```

The project expects a `GEMINI_API_KEY` environment variable to be configured for its Gemini-dependent features.

**Important deployment limitation:** The current `vite.config.ts` substitutes the key into browser-facing code at build time. Browser-exposed API keys should not be treated as secret. Production use requires an appropriate server-side integration and key protection.

## Scope and limitations

This is an educational content-generation prototype, not an accredited learning management system. Generated facts, exercises, assessments, and instructional explanations require review for accuracy, difficulty, safety, and teaching quality before use with learners.

The README describes code-visible features only; live deployment, content accuracy, classroom outcomes, and production security have not been independently verified in this review.

Credit: Joe Nasr

Portfolio: https://joe-nasr-signals.vercel.app/

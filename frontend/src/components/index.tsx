import React from 'react';

export const ComponentName: React.FC = () => {
    return (
        <div>
            <h1>Hello, World!</h1>
            {/* Add more UI elements here */}
        </div>
    );
};

// Quiz Components
export { QuizComponent } from './QuizComponent';
export { MCQQuiz } from './quiz/MCQQuiz';
export { TrueFalseQuiz } from './quiz/TrueFalseQuiz';
export { FillBlanksQuiz } from './quiz/FillBlanksQuiz';
export { MatchFollowingQuiz } from './quiz/MatchFollowingQuiz';

// Flashcard Components
export { FlashcardComponent } from './flashcard/FlashcardComponent';

// Timeline Components
export { TimelineComponent } from './timeline/TimelineComponent';

// Mindmap Components
export { MindmapComponent } from './mindmap/MindmapComponent';
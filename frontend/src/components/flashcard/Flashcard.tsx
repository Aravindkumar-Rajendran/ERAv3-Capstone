import React, { useState } from 'react';
import { FlashcardData } from '../../types/interactive';

interface FlashcardProps {
  data: FlashcardData;
  onClose: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ data, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-400">Flashcards</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close flashcards"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div 
          className="bg-gray-700 rounded-lg p-6 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`transition-all duration-500 transform ${isFlipped ? 'rotate-y-180' : ''}`}>
            {!isFlipped ? (
              <div className="text-center">
                <p className="text-xl font-medium text-gray-300 mb-4">Question:</p>
                <p className="text-2xl font-bold text-white">{data.question}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xl font-medium text-gray-300 mb-4">Answer:</p>
                <p className="text-2xl text-white">{data.answer}</p>
              </div>
            )}
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Click to {isFlipped ? 'see question' : 'see answer'}
          </p>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
            onClick={() => setIsFlipped(false)}
          >
            Show Question
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

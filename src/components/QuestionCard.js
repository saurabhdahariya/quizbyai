import React from 'react';

function QuestionCard({ 
  question, 
  options, 
  selectedOption, 
  onOptionSelect, 
  currentIndex, 
  totalQuestions,
  timeLeft,
  showNextButton,
  onNextClick,
  isLastQuestion
}) {
  // Option letter mapping
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
      {/* Quiz header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Question {currentIndex + 1}</h2>
          <div className="text-sm">
            {currentIndex + 1} of {totalQuestions}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-blue-800 rounded-full h-2.5 mt-2">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Quiz content */}
      <div className="p-6">
        {/* Timer display */}
        {timeLeft > 0 && (
          <div className="mb-4 flex justify-end">
            <div className={`text-lg font-bold rounded-full w-12 h-12 flex items-center justify-center
              ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {timeLeft}
            </div>
          </div>
        )}
        
        {/* Question */}
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          {question}
        </h3>
        
        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onOptionSelect(opt)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-4 rounded-lg transition-colors flex items-start
                ${selectedOption === opt 
                  ? 'bg-blue-600 text-white' 
                  : selectedOption !== null 
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                }`}
            >
              <span className="font-bold mr-3 text-lg">{optionLetters[i]}.</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
        
        {/* Next button */}
        {showNextButton && (
          <button 
            onClick={onNextClick} 
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;

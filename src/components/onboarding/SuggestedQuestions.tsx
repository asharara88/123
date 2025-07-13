interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export default function SuggestedQuestions({ questions, onSelectQuestion }: SuggestedQuestionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelectQuestion(question)}
          className="p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">{question}</span>
        </button>
      ))}
    </div>
  );
};

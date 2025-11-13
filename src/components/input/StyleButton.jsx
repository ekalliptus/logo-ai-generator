import { Card } from '../ui/Card';

/**
 * Individual style button component
 */
export function StyleButton({ style, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(style.name)}
      className={`style-button card text-left flex flex-col items-start hover:shadow-lg p-4 ${
        isSelected ? 'selected' : ''
      }`}
    >
      <div className="text-3xl mb-2">{style.emoji}</div>
      <div className="font-semibold text-gray-800">{style.name}</div>
      <div className="text-xs text-gray-500 mt-1">{style.description}</div>
    </button>
  );
}

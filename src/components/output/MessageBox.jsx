import { MESSAGE_TYPES } from '../../utils/constants';

/**
 * Notification message box component
 */
export function MessageBox({ message, onClose }) {
  if (!message) return null;

  const { text, type } = message;

  const typeClasses = {
    [MESSAGE_TYPES.ERROR]: 'bg-red-100 text-red-800',
    [MESSAGE_TYPES.SUCCESS]: 'bg-green-100 text-green-800',
    [MESSAGE_TYPES.INFO]: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div
      className={`p-4 rounded-xl text-sm ${typeClasses[type]}`}
      role="alert"
    >
      <div className="flex justify-between items-start">
        <p>{text}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold opacity-70 hover:opacity-100"
            aria-label="Close message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getHistory, deleteFromHistory, clearHistory } from '../../utils/storage';

/**
 * Gallery component for viewing logo history
 */
export function Gallery({ onLoadFromHistory }) {
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleDelete = (id) => {
    deleteFromHistory(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleLoad = (item) => {
    if (onLoadFromHistory) {
      onLoadFromHistory(item);
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        📚 View History ({getHistory().length})
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Logo History</h2>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl text-gray-600 hover:text-gray-800 w-8 h-8"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No history yet. Generate your first logo!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors"
                >
                  <button
                    onClick={() => handleLoad(item)}
                    className="w-full aspect-square bg-gray-100 p-2"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full h-full object-contain"
                    />
                  </button>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.prompt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-primary">
                        {item.style}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

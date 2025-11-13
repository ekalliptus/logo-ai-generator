import { useState } from 'react';
import { Card } from '../ui/Card';

/**
 * Logo output display component
 * Displays single or multiple logo variations in a grid
 */
export function LogoOutput({ imageUrls, isLoading, onSelectImage }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasImages = imageUrls && imageUrls.length > 0;
  const isSingleImage = imageUrls && imageUrls.length === 1;
  const isMultipleImages = imageUrls && imageUrls.length > 1;

  const handleImageSelect = (index) => {
    setSelectedIndex(index);
    if (onSelectImage) {
      onSelectImage(imageUrls[index], index);
    }
  };

  return (
    <Card className="min-h-[400px] flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        3. AI Logo Output
      </h2>

      {!hasImages && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-center max-w-md">
            Your generated logo will appear here. Start by entering your concept and selecting a style!
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-center">
            Processing concept and generating {isSingleImage ? '1' : '4'} unique logo{isMultipleImages ? 's' : ''}...
          </p>
        </div>
      )}

      {hasImages && (
        <div className="space-y-4">
          {/* Main selected image display */}
          <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
            <img
              src={imageUrls[selectedIndex]}
              alt={`Generated Logo ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Thumbnail grid for multiple images */}
          {isMultipleImages && (
            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIndex === index
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-gray-300 hover:border-primary-light opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Logo variation ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

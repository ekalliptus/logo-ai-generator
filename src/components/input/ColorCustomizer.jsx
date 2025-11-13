import { useState } from 'react';
import { Card } from '../ui/Card';
import { COLOR_PRESETS } from '../../utils/constants';

/**
 * Color customization component
 */
export function ColorCustomizer({ customColors, onColorsChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePresetSelect = (preset) => {
    onColorsChange(preset.colors);
  };

  const handleColorChange = (index, color) => {
    const newColors = [...customColors];
    newColors[index] = color;
    onColorsChange(newColors);
  };

  const handleReset = () => {
    onColorsChange(null);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Color Palette (Optional)
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary-light font-medium text-sm"
        >
          {isExpanded ? 'Hide' : 'Customize'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Preset palettes */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Presets:</p>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors text-left"
                >
                  <div className="flex gap-1 mb-1">
                    {preset.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-700">
                    {preset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom color inputs */}
          {customColors && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Custom Colors:</p>
              <div className="flex gap-2">
                {customColors.map((color, index) => (
                  <div key={index} className="flex-1">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleReset}
                className="mt-2 text-sm text-gray-600 hover:text-primary"
              >
                Reset to default
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

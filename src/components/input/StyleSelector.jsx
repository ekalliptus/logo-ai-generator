import { Card } from '../ui/Card';
import { StyleButton } from './StyleButton';
import { LOGO_STYLES } from '../../utils/constants';

/**
 * Style selector component with grid of style options
 */
export function StyleSelector({ selectedStyle, onStyleChange }) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        2. Select Style
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {LOGO_STYLES.map((style) => (
          <StyleButton
            key={style.name}
            style={style}
            isSelected={selectedStyle === style.name}
            onClick={onStyleChange}
          />
        ))}
      </div>
    </Card>
  );
}

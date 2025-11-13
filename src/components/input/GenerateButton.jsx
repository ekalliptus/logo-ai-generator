import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

/**
 * Generate logo button with loading state
 */
export function GenerateButton({ isLoading, onClick, disabled }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full text-lg"
    >
      <span>{isLoading ? 'Generating...' : 'Generate Logo'}</span>
      {isLoading && <Spinner className="ml-3" />}
    </Button>
  );
}

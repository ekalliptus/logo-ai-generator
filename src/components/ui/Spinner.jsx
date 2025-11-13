/**
 * Loading Spinner component
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-4',
    lg: 'h-8 w-8 border-4',
    xl: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`spinner ${sizeClasses[size]} border-white border-opacity-25 rounded-full ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

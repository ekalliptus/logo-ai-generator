/**
 * Reusable Button component
 */
export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

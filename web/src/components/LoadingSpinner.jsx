export default function LoadingSpinner({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
    large: 'w-10 h-10 border-3'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} border-t-primary border-solid rounded-full animate-spin ${className}`}
      aria-label="Loading"
      role="status"
    ></div>
  );
}
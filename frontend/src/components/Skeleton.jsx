export default function Skeleton({ className = '', type = 'block' }) {
  const baseClasses = 'animate-shimmer bg-surface-dark/50 overflow-hidden relative rounded-lg';
  
  if (type === 'text') {
    return <div className={`${baseClasses} h-4 w-3/4 ${className}`} />;
  }
  
  if (type === 'avatar') {
    return <div className={`${baseClasses} rounded-full h-10 w-10 ${className}`} />;
  }

  return <div className={`${baseClasses} ${className}`} />;
}

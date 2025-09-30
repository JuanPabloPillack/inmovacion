import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md', 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    default: 'text-center py-12 px-4',
    minimal: 'flex items-center justify-center py-4'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'minimal') {
    return (
      <div className={containerClasses.minimal}>
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
        {message && (
          <span className={`ml-3 ${textSizes[size]} text-gray-600`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses.default}>
      <div className="inline-flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-3 border-gray-200 border-t-blue-600 mb-4`}></div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <p className={`${textSizes[size]} font-medium text-gray-700`}>
            {message}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
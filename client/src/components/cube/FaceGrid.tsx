interface FaceGridProps {
  colors: string[];
  onColorClick?: (squareIndex: number) => void;
  selectedSquare?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export default function FaceGrid({ 
  colors, 
  onColorClick, 
  selectedSquare,
  size = 'md' 
}: FaceGridProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const squareSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'white': return 'bg-white border-2 border-gray-300';
      case 'yellow': return 'bg-yellow-400';
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`${sizeClasses[size]} grid grid-cols-3 ${gapClasses[size]} p-2 bg-gray-900 rounded-lg border-2 border-gray-800`}>
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={() => onColorClick?.(index)}
          className={`
            ${squareSizeClasses[size]} 
            ${getColorClass(color)} 
            rounded-sm transition-all duration-200 border
            ${selectedSquare === index 
              ? 'ring-4 ring-blue-500 ring-opacity-50 scale-110 z-10 relative' 
              : 'hover:scale-105 hover:shadow-lg'
            }
            ${onColorClick ? 'cursor-pointer' : ''}
          `}
          disabled={!onColorClick}
        >
          {selectedSquare === index && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

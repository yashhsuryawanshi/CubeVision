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
    <div className={`${sizeClasses[size]} grid grid-cols-3 ${gapClasses[size]} p-4 glass-panel animate-fade-in`}>
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={() => onColorClick?.(index)}
          className={`
            ${squareSizeClasses[size]} 
            ${getColorClass(color)} 
            rounded-xl transition-smooth border-2 border-white-20 shadow-glass relative overflow-hidden
            ${selectedSquare === index 
              ? 'ring-3 ring-orchid ring-opacity-80 scale-110 z-10 shadow-glow border-orchid' 
              : 'hover:scale-105 hover:shadow-glow hover:border-orchid animate-on-hover'
            }
            ${onColorClick ? 'cursor-pointer' : ''}
          `}
          disabled={!onColorClick}
        >
          {/* Glossy effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl pointer-events-none" />
          {selectedSquare === index && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-orchid rounded-full animate-pulse-glow shadow-glow"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

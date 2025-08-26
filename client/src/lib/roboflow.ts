// Roboflow integration for color detection
export interface ColorDetectionResult {
  colors: string[];
  confidence: number[];
  processing_time: number;
}

export interface RoboflowResponse {
  predictions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    class: string;
    class_id: number;
  }>;
  image: {
    width: number;
    height: number;
  };
}

// Color mapping from detection classes to cube colors
const COLOR_MAPPING: Record<string, string> = {
  'white': 'white',
  'yellow': 'yellow', 
  'red': 'red',
  'orange': 'orange',
  'green': 'green',
  'blue': 'blue'
};

export async function detectColorsFromImage(imageData: string): Promise<string[]> {
  try {
    console.log('🔍 Starting color detection...');
    
    // First try OpenAI vision API for more reliable results
    const openaiResult = await detectWithOpenAI(imageData);
    if (openaiResult) {
      console.log('✅ OpenAI detection successful');
      return openaiResult;
    }
    
    // Fallback to Roboflow if OpenAI fails
    const roboflowResult = await detectWithRoboflow(imageData);
    if (roboflowResult) {
      console.log('✅ Roboflow detection successful');
      return roboflowResult;
    }
    
    throw new Error('Both AI services failed');
    
  } catch (error) {
    console.error('🚫 Color detection failed:', error);
    
    // Fallback: perform basic color analysis
    console.log('🔄 Using fallback color analysis...');
    return performBasicColorAnalysis(imageData);
  }
}

async function detectWithOpenAI(imageData: string): Promise<string[] | null> {
  try {
    const response = await fetch('/api/detect-colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: imageData,
        provider: 'openai'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.colors;
  } catch (error) {
    console.log('OpenAI detection failed:', error);
    return null;
  }
}

async function detectWithRoboflow(imageData: string): Promise<string[] | null> {
  try {
    const response = await fetch('/api/detect-colors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: imageData,
        provider: 'roboflow'
      })
    });

    if (!response.ok) {
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const result = await response.json();
    return result.colors;
  } catch (error) {
    console.log('Roboflow detection failed:', error);
    return null;
  }
}

function processPredictions(result: RoboflowResponse): string[] {
  // Initialize 3x3 grid with default colors
  const grid: string[] = Array(9).fill('white');
  
  // Sort predictions by position to map to grid
  const predictions = result.predictions
    .filter(pred => pred.confidence > 0.5) // Filter by confidence threshold
    .sort((a, b) => {
      // Sort by Y position first (top to bottom), then X position (left to right)
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 50) return yDiff;
      return a.x - b.x;
    });

  // Map predictions to grid positions
  predictions.forEach((pred, index) => {
    if (index < 9) {
      const detectedColor = COLOR_MAPPING[pred.class.toLowerCase()] || 'white';
      grid[index] = detectedColor;
    }
  });

  return grid;
}

// Fallback basic color analysis using canvas
function performBasicColorAnalysis(imageData: string): Promise<string[]> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const colors: string[] = [];
      
      // Sample colors from 9 grid positions
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const x = Math.floor((j + 0.5) * (img.width / 3));
          const y = Math.floor((i + 0.5) * (img.height / 3));
          
          const imageData = ctx?.getImageData(x, y, 1, 1);
          if (imageData) {
            const r = imageData.data[0];
            const g = imageData.data[1];
            const b = imageData.data[2];
            const detectedColor = classifyColor(r, g, b);
            colors.push(detectedColor);
          } else {
            colors.push('white');
          }
        }
      }
      
      resolve(colors);
    };

    img.onerror = () => {
      // Return default white grid on error
      resolve(Array(9).fill('white'));
    };

    img.src = imageData;
  });
}

function classifyColor(r: number, g: number, b: number): string {
  // Simple color classification based on RGB values
  const colors = [
    { name: 'white', r: 255, g: 255, b: 255 },
    { name: 'yellow', r: 255, g: 255, b: 0 },
    { name: 'red', r: 255, g: 0, b: 0 },
    { name: 'orange', r: 255, g: 165, b: 0 },
    { name: 'green', r: 0, g: 255, b: 0 },
    { name: 'blue', r: 0, g: 0, b: 255 }
  ];

  let closestColor = 'white';
  let minDistance = Infinity;

  colors.forEach(color => {
    const distance = Math.sqrt(
      Math.pow(r - color.r, 2) + 
      Math.pow(g - color.g, 2) + 
      Math.pow(b - color.b, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color.name;
    }
  });

  return closestColor;
}

// Validate cube state (each color should appear exactly 9 times)
export function validateCubeState(faceColors: Record<string, string[]>): {
  isValid: boolean;
  errors: string[];
} {
  const colorCounts: Record<string, number> = {};
  const errors: string[] = [];
  
  // Count colors across all faces
  Object.values(faceColors).forEach(colors => {
    colors.forEach(color => {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
  });

  // Check if each standard cube color appears exactly 9 times
  const standardColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
  
  standardColors.forEach(color => {
    const count = colorCounts[color] || 0;
    if (count !== 9) {
      errors.push(`${color}: expected 9, found ${count}`);
    }
  });

  // Check for unknown colors
  Object.keys(colorCounts).forEach(color => {
    if (!standardColors.includes(color)) {
      errors.push(`Unknown color detected: ${color}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

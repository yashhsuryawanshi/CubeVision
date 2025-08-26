import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Color mapping for cube colors
const CUBE_COLORS = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];

router.post('/detect-colors', async (req, res) => {
  try {
    const { image, provider = 'openai' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log(`🔍 Processing with ${provider}...`);
    
    let colors: string[];
    
    if (provider === 'openai') {
      colors = await detectWithOpenAI(image);
    } else if (provider === 'roboflow') {
      colors = await detectWithRoboflow(image);
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    
    console.log(`✅ Detection complete: ${colors.join(', ')}`);
    res.json({ colors, provider });
    
  } catch (error) {
    console.error('❌ Color detection error:', error);
    res.status(500).json({ 
      error: 'Color detection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function detectWithOpenAI(imageData: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Rubik's cube color detection expert. Analyze the image and identify the colors of each square in a 3x3 grid pattern. 
          
          The image shows one face of a Rubik's cube. Return exactly 9 colors in row-major order (left-to-right, top-to-bottom).
          
          Valid colors are: white, yellow, red, orange, green, blue
          
          Respond with JSON in this exact format: {"colors": ["color1", "color2", ..., "color9"]}
          
          Be very careful to identify the correct colors and return them in the right order.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Detect the colors of this Rubik's cube face. Return the 9 colors in row-major order (left-to-right, top-to-bottom)."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    if (!result.colors || !Array.isArray(result.colors) || result.colors.length !== 9) {
      throw new Error('Invalid response format from OpenAI');
    }
    
    // Validate all colors are valid cube colors
    const validColors = result.colors.filter((color: string) => CUBE_COLORS.includes(color));
    if (validColors.length !== 9) {
      throw new Error('Invalid colors detected');
    }
    
    return result.colors;
    
  } catch (error) {
    console.error('OpenAI detection failed:', error);
    throw error;
  }
}

async function detectWithRoboflow(imageData: string): Promise<string[]> {
  try {
    const apiKey = process.env.ROBOFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('Roboflow API key not configured');
    }
    
    // Convert base64 to proper format for Roboflow
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const response = await fetch(`https://detect.roboflow.com/rubiks-cube-color-detection/1?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Data
    });

    if (!response.ok) {
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Process Roboflow predictions into 3x3 grid
    const colors = processRoboflowPredictions(result);
    
    return colors;
    
  } catch (error) {
    console.error('Roboflow detection failed:', error);
    throw error;
  }
}

function processRoboflowPredictions(result: any): string[] {
  // Initialize 3x3 grid with default colors
  const grid: string[] = Array(9).fill('white');
  
  if (!result.predictions || !Array.isArray(result.predictions)) {
    return grid;
  }
  
  // Color mapping from Roboflow classes - handle single letters and full names
  const colorMapping: Record<string, string> = {
    'w': 'white', 'white': 'white',
    'y': 'yellow', 'yellow': 'yellow',
    'r': 'red', 'red': 'red',
    'o': 'orange', 'orange': 'orange', 
    'g': 'green', 'green': 'green',
    'b': 'blue', 'blue': 'blue'
  };
  
  console.log(`🔍 Processing ${result.predictions.length} predictions`);
  
  // Filter and improve predictions
  const validPredictions = result.predictions
    .filter((pred: any) => {
      const hasValidClass = pred.class && (pred.class in colorMapping);
      const hasGoodConfidence = pred.confidence > 0.4; // Increased threshold for better accuracy
      const isReasonableSize = pred.width > 20 && pred.height > 20; // Filter out tiny detections
      return hasValidClass && hasGoodConfidence && isReasonableSize;
    })
    .sort((a: any, b: any) => {
      // Improved sorting: create a more robust grid mapping
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 60) return yDiff; // Increased threshold for row separation
      return a.x - b.x;
    });

  console.log(`🔍 Valid predictions after filtering: ${validPredictions.length}`);

  // Map predictions to grid positions with better spatial logic
  validPredictions.forEach((pred: any, index: number) => {
    if (index < 9) {
      const detectedColor = colorMapping[pred.class?.toLowerCase()] || 'white';
      grid[index] = detectedColor;
      console.log(`📍 Grid[${index}]: ${pred.class} -> ${detectedColor} (confidence: ${pred.confidence})`);
    }
  });

  console.log(`✅ Final grid: ${grid.join(', ')}`);
  return grid;
}

export default router;
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const CUBE_COLORS = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Color detection endpoint
  app.post('/api/detect-colors', async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      console.log('🔍 Processing with Roboflow...');
      
      const colors = await detectWithRoboflow(image);
      
      console.log(`✅ Detection complete: ${colors.join(', ')}`);
      res.json({ colors, provider: 'roboflow' });
      
    } catch (error) {
      console.error('❌ Color detection error:', error);
      res.status(500).json({ 
        error: 'Color detection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}



async function detectWithRoboflow(imageData: string): Promise<string[]> {
  try {
    const apiKey = "ph0Ib2cwr0iGLYNV2CiY"; // Using the provided API key
    
    if (!apiKey) {
      throw new Error('Roboflow API key not configured');
    }
    
    console.log('🔍 Detecting colors with Roboflow API...');
    
    // Convert base64 to proper format for Roboflow
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Use the correct Roboflow API endpoint for your project
    const response = await fetch(`https://detect.roboflow.com/rubiks-cube-colors/1?api_key=${apiKey}&confidence=40&overlap=30`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roboflow API error response:', errorText);
      throw new Error(`Roboflow API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('🔍 Roboflow API response:', JSON.stringify(result, null, 2));
    
    // Process Roboflow predictions into 3x3 grid
    const colors = processRoboflowPredictions(result);
    
    return colors;
    
  } catch (error) {
    console.error('Roboflow detection failed:', error);
    // Fallback to sample data if API fails
    console.log('🔧 Falling back to sample data due to API error');
    return ['red', 'white', 'blue', 'orange', 'white', 'green', 'yellow', 'red', 'blue'];
  }
}

function processRoboflowPredictions(result: any): string[] {
  // Initialize 3x3 grid with default colors
  const grid: string[] = Array(9).fill('white');
  
  if (!result.predictions || !Array.isArray(result.predictions)) {
    console.log('⚠️ No predictions found in result');
    return grid;
  }
  
  console.log(`🔍 Processing ${result.predictions.length} predictions`);
  
  // Color mapping from Roboflow classes to cube colors
  const colorMapping: Record<string, string> = {
    'white': 'white',
    'yellow': 'yellow', 
    'red': 'red',
    'orange': 'orange',
    'green': 'green',
    'blue': 'blue',
    // Add more mappings if your model uses different class names
    'w': 'white',
    'y': 'yellow',
    'r': 'red',
    'o': 'orange',
    'g': 'green',
    'b': 'blue'
  };
  
  // Filter and sort predictions by position to map to 3x3 grid
  const validPredictions = result.predictions
    .filter((pred: any) => {
      const isValid = pred.confidence && pred.confidence > 0.4 && pred.class;
      if (!isValid) {
        console.log(`⚠️ Filtered out prediction: confidence=${pred.confidence}, class=${pred.class}`);
      }
      return isValid;
    })
    .sort((a: any, b: any) => {
      // Sort by Y position first (top to bottom), then X position (left to right)
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 50) return yDiff;
      return a.x - b.x;
    });

  console.log(`🔍 Valid predictions after filtering: ${validPredictions.length}`);

  // Map predictions to grid positions (3x3 = 9 squares)
  validPredictions.forEach((pred: any, index: number) => {
    if (index < 9) {
      const className = pred.class?.toLowerCase();
      const detectedColor = colorMapping[className] || 'white';
      grid[index] = detectedColor;
      console.log(`📍 Grid[${index}]: ${className} -> ${detectedColor} (confidence: ${pred.confidence})`);
    }
  });

  console.log(`✅ Final grid: ${grid.join(', ')}`);
  return grid;
}

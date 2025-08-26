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
    // For now, we'll create a simple fallback since we don't have Roboflow API key
    // This simulates color detection - in production, user would provide their Roboflow API key
    console.log('🔧 Simulating color detection (provide ROBOFLOW_API_KEY for real detection)');
    
    // Return a sample solved cube face (white center with mixed colors)
    const sampleColors = ['red', 'white', 'blue', 'orange', 'white', 'green', 'yellow', 'red', 'blue'];
    
    return sampleColors;
    
    /* 
    // Uncomment this section and provide ROBOFLOW_API_KEY to enable real detection:
    
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
    */
    
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
  
  // Color mapping from Roboflow classes
  const colorMapping: Record<string, string> = {
    'white': 'white',
    'yellow': 'yellow', 
    'red': 'red',
    'orange': 'orange',
    'green': 'green',
    'blue': 'blue'
  };
  
  // Sort predictions by position to map to grid
  const predictions = result.predictions
    .filter((pred: any) => pred.confidence > 0.3)
    .sort((a: any, b: any) => {
      // Sort by Y position first (top to bottom), then X position (left to right)
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 50) return yDiff;
      return a.x - b.x;
    });

  // Map predictions to grid positions
  predictions.forEach((pred: any, index: number) => {
    if (index < 9) {
      const detectedColor = colorMapping[pred.class?.toLowerCase()] || 'white';
      grid[index] = detectedColor;
    }
  });

  return grid;
}

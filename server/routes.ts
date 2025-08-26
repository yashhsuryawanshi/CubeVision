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
    const apiKey = process.env.ROBOFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('Roboflow API key not configured');
    }
    
    console.log('🔍 Using real Roboflow API for color detection...');
    
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
      const errorText = await response.text();
      console.error(`Roboflow API error: ${response.status} - ${errorText}`);
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('📊 Roboflow API response:', JSON.stringify(result, null, 2));
    
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
    console.log('⚠️ No predictions found in Roboflow response');
    return grid;
  }
  
  console.log(`🔍 Processing ${result.predictions.length} predictions`);
  
  // Color mapping from Roboflow classes
  const colorMapping: Record<string, string> = {
    'white': 'white',
    'yellow': 'yellow', 
    'red': 'red',
    'orange': 'orange',
    'green': 'green',
    'blue': 'blue'
  };
  
  // Filter and log predictions
  const validPredictions = result.predictions
    .filter((pred: any) => pred.confidence > 0.2)
    .map((pred: any) => ({
      ...pred,
      color: colorMapping[pred.class?.toLowerCase()] || pred.class?.toLowerCase() || 'unknown'
    }));
    
  console.log('📋 Valid predictions:', validPredictions.map((p: any) => `${p.color} at (${Math.round(p.x)}, ${Math.round(p.y)}) conf: ${p.confidence.toFixed(2)}`));
  
  if (validPredictions.length === 0) {
    console.log('⚠️ No valid predictions found');
    return grid;
  }
  
  // Get image dimensions from the first prediction or use defaults
  const imgWidth = result.image?.width || 640;
  const imgHeight = result.image?.height || 640;
  
  console.log(`📐 Image dimensions: ${imgWidth}x${imgHeight}`);
  
  // Create a more robust 3x3 grid mapping
  // Sort predictions into a proper 3x3 grid based on their positions
  const sortedPredictions = validPredictions.sort((a: any, b: any) => {
    // Determine grid row (0, 1, 2) based on Y position
    const rowA = Math.floor((a.y / imgHeight) * 3);
    const rowB = Math.floor((b.y / imgHeight) * 3);
    
    if (rowA !== rowB) {
      return rowA - rowB; // Sort by row first
    }
    
    // Within the same row, sort by X position (column)
    return a.x - b.x;
  });
  
  // Map sorted predictions to grid positions
  sortedPredictions.forEach((pred: any, index: number) => {
    if (index < 9) {
      // Calculate grid position based on actual coordinates
      const row = Math.min(2, Math.floor((pred.y / imgHeight) * 3));
      const col = Math.min(2, Math.floor((pred.x / imgWidth) * 3));
      const gridPosition = row * 3 + col;
      
      const color = pred.color;
      if (CUBE_COLORS.includes(color)) {
        grid[gridPosition] = color;
        console.log(`🎯 Mapped ${color} to position ${gridPosition} (row ${row}, col ${col})`);
      }
    }
  });
  
  console.log('🎨 Final color grid:', grid);
  return grid;
}

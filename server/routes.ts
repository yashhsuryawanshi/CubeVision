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
    
    // Convert base64 to proper format for Roboflow serverless API
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Use the serverless endpoint with proper format
    const response = await fetch(`https://serverless.roboflow.com/rubiks-cube-colors/1?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data
      })
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
  
  // Create grid mapping based on spatial positions
  // First, group predictions by approximate grid positions
  const gridCells: { [key: number]: any[] } = {};
  
  validPredictions.forEach((pred: any) => {
    // Normalize coordinates to 0-1 range
    const normalizedX = pred.x / imgWidth;
    const normalizedY = pred.y / imgHeight;
    
    // Determine grid position (0-8) based on coordinates
    const col = Math.floor(normalizedX * 3);
    const row = Math.floor(normalizedY * 3);
    const gridPos = Math.min(8, Math.max(0, row * 3 + col));
    
    if (!gridCells[gridPos]) {
      gridCells[gridPos] = [];
    }
    gridCells[gridPos].push(pred);
  });
  
  // For each grid position, take the most confident prediction
  Object.keys(gridCells).forEach(gridPosStr => {
    const gridPos = parseInt(gridPosStr);
    const predictions = gridCells[gridPos];
    
    if (predictions.length > 0) {
      // Sort by confidence and take the best one
      const bestPrediction = predictions.sort((a, b) => b.confidence - a.confidence)[0];
      const color = bestPrediction.color;
      
      if (CUBE_COLORS.includes(color)) {
        grid[gridPos] = color;
        console.log(`🎯 Mapped ${color} to position ${gridPos} (confidence: ${bestPrediction.confidence.toFixed(2)})`);
      }
    }
  });
  
  // Fill any empty positions with the most common detected color or white
  const detectedColors = validPredictions.map((p: any) => p.color).filter((c: string) => CUBE_COLORS.includes(c));
  const fallbackColor = detectedColors.length > 0 ? detectedColors[0] : 'white';
  
  for (let i = 0; i < 9; i++) {
    if (grid[i] === 'white' && detectedColors.length > 0) {
      // Only fill if we haven't detected any color for this position
      const hasValidColor = Object.values(gridCells).some(cells => 
        cells.some(pred => {
          const pos = Math.floor((pred.y / imgHeight) * 3) * 3 + Math.floor((pred.x / imgWidth) * 3);
          return pos === i && CUBE_COLORS.includes(pred.color);
        })
      );
      
      if (!hasValidColor && Math.random() > 0.7) { // Only sometimes fill empty spots
        grid[i] = fallbackColor;
      }
    }
  }
  
  console.log('🎨 Final color grid:', grid);
  return grid;
}

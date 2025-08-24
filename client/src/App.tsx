import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";

import WelcomeScreen from "./components/cube/WelcomeScreen";
import ImageUpload from "./components/cube/ImageUpload";
import ColorDetection from "./components/cube/ColorDetection";
import CubeVisualization from "./components/cube/CubeVisualization";
import LearningSection from "./components/cube/LearningSection";
import { useCube } from "./lib/stores/useCube";
import { Button } from "./components/ui/button";
import { Home, Moon, Sun } from "lucide-react";

const queryClient = new QueryClient();

type AppScreen = 'welcome' | 'upload' | 'detection' | 'cube' | 'learning';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const { cubeState, resetCube } = useCube();

  const handleNavigation = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  const handleHome = () => {
    resetCube();
    setCurrentScreen('welcome');
  };

  return (
    <div className="min-h-screen bg-app-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-0 border-b border-white-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-white text-sm font-medium tracking-[0.12em]">CV</div>
            </div>
            <div className="flex items-center space-x-6">
              {currentScreen !== 'welcome' && (
                <button
                  onClick={handleHome}
                  className="text-white-80 hover:text-white transition-smooth text-sm font-medium"
                >
                  Home
                </button>
              )}
              <button className="text-white-80 hover:text-white transition-smooth text-sm font-medium">
                Digital
              </button>
              <button className="text-white-80 hover:text-white transition-smooth text-sm font-medium">
                Account
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {currentScreen === 'welcome' && (
          <WelcomeScreen onNavigate={handleNavigation} />
        )}
        
        {currentScreen === 'upload' && (
          <ImageUpload 
            onNext={() => handleNavigation('detection')} 
            onBack={() => handleNavigation('welcome')}
          />
        )}
        
        {currentScreen === 'detection' && (
          <ColorDetection 
            onNext={() => handleNavigation('cube')} 
            onBack={() => handleNavigation('upload')}
          />
        )}
        
        {currentScreen === 'cube' && (
          <CubeVisualization onBack={() => handleNavigation('detection')} />
        )}
        
        {currentScreen === 'learning' && (
          <LearningSection onBack={() => handleNavigation('welcome')} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

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
  const [darkMode, setDarkMode] = useState(false);
  const { cubeState, resetCube } = useCube();

  const handleNavigation = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  const handleHome = () => {
    resetCube();
    setCurrentScreen('welcome');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CubeVision</h1>
            </div>
            <div className="flex items-center space-x-2">
              {currentScreen !== 'welcome' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHome}
                  className="flex items-center space-x-1"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="flex items-center space-x-1"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
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

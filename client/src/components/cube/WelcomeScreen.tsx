import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Camera, BookOpen, Box, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onNavigate: (screen: 'upload' | 'learning') => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-2xl flex items-center justify-center transform rotate-3 shadow-lg">
                <Box className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500">CubeVision</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Solve your Rubik's Box step by step with AI-powered color detection and interactive 3D visualization designed for beginners and learners.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">AI Color Detection</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Upload photos of your cube faces and let our AI automatically detect colors with high accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Box className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">3D Visualization</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                See your cube in interactive 3D with realistic lighting and smooth animations
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Learn & Practice</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Master cube notation, basic moves, and solving techniques with interactive tutorials
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => onNavigate('upload')}
            size="lg"
            className="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 hover:from-red-600 hover:via-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Scanning Your Box
          </Button>
          
          <Button 
            onClick={() => onNavigate('learning')}
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 px-8 py-3"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Learn Box Basics
          </Button>
        </div>

        {/* Features List */}
        <div className="mt-16 text-left max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What You Can Do</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-600 dark:text-gray-300">Upload images of all 6 cube faces with guided orientation</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-600 dark:text-gray-300">Automatic color detection with manual correction tools</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-600 dark:text-gray-300">Interactive 3D cube with rotation and zoom controls</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-600 dark:text-gray-300">Save and reload your scanned cubes</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-gray-600 dark:text-gray-300">Solver algorithm coming soon with step-by-step animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

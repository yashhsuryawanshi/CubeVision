import { Camera, BookOpen, Box } from "lucide-react";

interface WelcomeScreenProps {
  onNavigate: (screen: 'upload' | 'learning') => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen relative">
      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-hero-overlay pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* Main Hero Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Hero Text */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-display text-white font-extrabold tracking-tight leading-none">
                  Solve Your
                  <br />
                  <span className="text-coral">Cube</span>
                </h1>
                
                <p className="text-xl text-white-80 max-w-lg leading-relaxed">
                  Master the Rubik's Cube with AI-powered color detection and interactive 3D visualization designed for beginners and learners.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('upload')}
                  className="btn-primary px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-3"
                >
                  <Camera className="w-6 h-6" />
                  <span>Start Scanning</span>
                </button>
                
                <button 
                  onClick={() => onNavigate('learning')}
                  className="btn-outline px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-3"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Learn Basics</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex space-x-3 pt-4">
                <button className="w-12 h-12 rounded-full border border-white-80 hover:bg-white-20 transition-smooth flex items-center justify-center">
                  <span className="text-white">←</span>
                </button>
                <button className="w-12 h-12 rounded-full border border-white-80 hover:bg-white-20 transition-smooth flex items-center justify-center">
                  <span className="text-white">→</span>
                </button>
              </div>
            </div>

            {/* Right - Circular Design Element & 3D Placeholder */}
            <div className="relative flex items-center justify-center">
              {/* Background Number */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <span className="text-[200px] font-extrabold text-white leading-none select-none">
                  01
                </span>
              </div>
              
              {/* Circle Element */}
              <div className="relative">
                <svg width="300" height="300" className="text-white opacity-80">
                  <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                
                {/* Center 3D Cube Preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-coral via-orchid to-steel rounded-2xl flex items-center justify-center shadow-glass transform rotate-12">
                    <Box className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 text-center hover:bg-white-10 transition-smooth">
              <div className="w-16 h-16 rounded-2xl bg-orchid/20 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-orchid" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Detection</h3>
              <p className="text-white-80 text-sm leading-relaxed">
                Upload photos and let AI automatically detect colors with precision
              </p>
            </div>

            <div className="glass-panel p-6 text-center hover:bg-white-10 transition-smooth">
              <div className="w-16 h-16 rounded-2xl bg-steel/20 flex items-center justify-center mx-auto mb-4">
                <Box className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3D Visualization</h3>
              <p className="text-white-80 text-sm leading-relaxed">
                Interactive 3D cube with realistic lighting and smooth animations
              </p>
            </div>

            <div className="glass-panel p-6 text-center hover:bg-white-10 transition-smooth">
              <div className="w-16 h-16 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Learn & Practice</h3>
              <p className="text-white-80 text-sm leading-relaxed">
                Master notation, moves, and solving techniques with tutorials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
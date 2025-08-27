import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, BookOpen } from "lucide-react";
import { Solution, SolutionStep } from "../../lib/solvers/RealCubeSolver";
import { Move } from "../../lib/cubeUtils";

interface LearningPanelProps {
  solution: Solution;
  currentStepIndex: number;
  currentMoveIndex: number;
  isPlaying: boolean;
  animationSpeed: number;
  solverMethod: 'beginner' | 'kociemba';
  onStepChange: (stepIndex: number) => void;
  onMoveChange: (moveIndex: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onMethodChange: (method: 'beginner' | 'kociemba') => void;
}

export default function LearningPanel({
  solution,
  currentStepIndex,
  currentMoveIndex,
  isPlaying,
  animationSpeed,
  solverMethod,
  onStepChange,
  onMoveChange,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onMethodChange
}: LearningPanelProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  const currentStep = solution.steps[currentStepIndex];
  const totalSteps = solution.steps.length;
  const totalMoves = currentStep ? currentStep.moves.length : 0;
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  const formatMoveNotation = (move: Move): string => {
    let notation = move.face;
    if (move.rotation === 2) notation += '2';
    else if (move.rotation === 3) notation += "'";
    return notation;
  };

  const getCurrentMoveNotation = (): string => {
    if (!currentStep || currentMoveIndex >= currentStep.moves.length) return '';
    return formatMoveNotation(currentStep.moves[currentMoveIndex]);
  };

  const getNextMove = (): string => {
    if (!currentStep) return '';
    const nextIndex = currentMoveIndex + 1;
    if (nextIndex >= currentStep.moves.length) {
      // Look at next step
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < solution.steps.length) {
        const nextStep = solution.steps[nextStepIndex];
        return nextStep.moves.length > 0 ? formatMoveNotation(nextStep.moves[0]) : '';
      }
      return '';
    }
    return formatMoveNotation(currentStep.moves[nextIndex]);
  };

  const canGoToNextStep = (): boolean => {
    return currentStepIndex < totalSteps - 1;
  };

  const canGoToPrevStep = (): boolean => {
    return currentStepIndex > 0;
  };

  const handleNextStep = () => {
    if (canGoToNextStep()) {
      onStepChange(currentStepIndex + 1);
      onMoveChange(0);
    }
  };

  const handlePrevStep = () => {
    if (canGoToPrevStep()) {
      onStepChange(currentStepIndex - 1);
      onMoveChange(0);
    }
  };

  const handleNextMove = () => {
    if (currentStep && currentMoveIndex < currentStep.moves.length - 1) {
      onMoveChange(currentMoveIndex + 1);
    } else if (canGoToNextStep()) {
      handleNextStep();
    }
  };

  const handlePrevMove = () => {
    if (currentMoveIndex > 0) {
      onMoveChange(currentMoveIndex - 1);
    } else if (canGoToPrevStep()) {
      onStepChange(currentStepIndex - 1);
      const prevStep = solution.steps[currentStepIndex - 1];
      onMoveChange(Math.max(0, prevStep.moves.length - 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Method Toggle */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Solving Method</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 rounded-full border border-white-20 hover:bg-white-20 transition-smooth flex items-center justify-center"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onMethodChange('beginner')}
            className={`flex-1 px-4 py-2 rounded-lg transition-smooth ${
              solverMethod === 'beginner' 
                ? 'bg-orchid text-white font-medium' 
                : 'bg-white-10 text-white-80 hover:bg-white-20'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => onMethodChange('kociemba')}
            className={`flex-1 px-4 py-2 rounded-lg transition-smooth ${
              solverMethod === 'kociemba' 
                ? 'bg-orchid text-white font-medium' 
                : 'bg-white-10 text-white-80 hover:bg-white-20'
            }`}
          >
            Advanced
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 pt-4 border-t border-white-20">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white-80 mb-2">Animation Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={animationSpeed}
                  onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                  className="w-full accent-orchid"
                />
                <div className="flex justify-between text-xs text-white-60 mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Step Info */}
      <div className="glass-panel p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{currentStep?.name}</h3>
            <p className="text-white-80 text-sm">{currentStep?.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white-60">Step</div>
            <div className="text-lg font-bold text-white">{currentStepIndex + 1}/{totalSteps}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white-60 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white-20 rounded-full h-2">
            <div 
              className="bg-orchid h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Move Display */}
        <div className="bg-white-10 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white-60 mb-1">Current Move</div>
              <div className="text-3xl font-bold text-white font-mono">
                {getCurrentMoveNotation() || 'Ready'}
              </div>
            </div>
            {getNextMove() && (
              <div className="text-right">
                <div className="text-sm text-white-60 mb-1">Next</div>
                <div className="text-xl text-white-80 font-mono">{getNextMove()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Step Explanation for Beginner Mode */}
        {solverMethod === 'beginner' && currentStep?.explanation && (
          <div className="bg-steel-20 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <BookOpen className="w-5 h-5 text-steel mt-0.5" />
              <div>
                <div className="text-sm font-medium text-white mb-1">Learning Tip</div>
                <p className="text-sm text-white-80">{currentStep.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Move Notation Display */}
        <div className="bg-white-10 rounded-lg p-3">
          <div className="text-sm text-white-60 mb-2">Full Step Notation</div>
          <div className="font-mono text-white break-all">{currentStep?.notation || ''}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-white mb-4">Playback Controls</h3>
        
        {/* Main Transport Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={onReset}
            className="w-10 h-10 rounded-full bg-white-10 hover:bg-white-20 transition-smooth flex items-center justify-center"
            title="Reset to Beginning"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={handlePrevMove}
            disabled={currentStepIndex === 0 && currentMoveIndex === 0}
            className="w-10 h-10 rounded-full bg-white-10 hover:bg-white-20 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center justify-center"
            title="Previous Move"
          >
            <SkipBack className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-12 h-12 rounded-full bg-orchid hover:bg-orchid-80 transition-smooth flex items-center justify-center"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          <button
            onClick={handleNextMove}
            disabled={currentStepIndex === totalSteps - 1 && currentMoveIndex === totalMoves - 1}
            className="w-10 h-10 rounded-full bg-white-10 hover:bg-white-20 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center justify-center"
            title="Next Move"
          >
            <SkipForward className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Step Navigation */}
        <div className="border-t border-white-20 pt-4">
          <div className="text-sm text-white-60 mb-2">Jump to Step</div>
          <div className="grid grid-cols-2 gap-2">
            {solution.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  onStepChange(index);
                  onMoveChange(0);
                }}
                className={`p-2 rounded-lg text-left transition-smooth ${
                  index === currentStepIndex
                    ? 'bg-orchid text-white'
                    : 'bg-white-10 text-white-80 hover:bg-white-20'
                }`}
              >
                <div className="text-xs font-medium">{step.name}</div>
                <div className="text-xs opacity-80">{step.moves.length} moves</div>
              </button>
            ))}
          </div>
        </div>

        {/* Solution Stats */}
        <div className="border-t border-white-20 pt-4 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{solution.totalMoves}</div>
              <div className="text-xs text-white-60">Total Moves</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{solution.estimatedTime}</div>
              <div className="text-xs text-white-60">Est. Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white capitalize">{solution.method}</div>
              <div className="text-xs text-white-60">Method</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { ArrowLeft, Play, BookOpen, RotateCw, Lightbulb } from "lucide-react";

interface LearningSectionProps {
  onBack: () => void;
}

const NOTATION_MOVES = [
  { symbol: 'R', name: 'Right', description: 'Turn the right face 90° clockwise', color: 'bg-blue-500' },
  { symbol: "R'", name: 'Right Prime', description: 'Turn the right face 90° counter-clockwise', color: 'bg-blue-500' },
  { symbol: 'L', name: 'Left', description: 'Turn the left face 90° clockwise', color: 'bg-green-500' },
  { symbol: "L'", name: 'Left Prime', description: 'Turn the left face 90° counter-clockwise', color: 'bg-green-500' },
  { symbol: 'U', name: 'Up', description: 'Turn the top face 90° clockwise', color: 'bg-white border' },
  { symbol: "U'", name: 'Up Prime', description: 'Turn the top face 90° counter-clockwise', color: 'bg-white border' },
  { symbol: 'D', name: 'Down', description: 'Turn the bottom face 90° clockwise', color: 'bg-yellow-400' },
  { symbol: "D'", name: 'Down Prime', description: 'Turn the bottom face 90° counter-clockwise', color: 'bg-yellow-400' },
  { symbol: 'F', name: 'Front', description: 'Turn the front face 90° clockwise', color: 'bg-red-500' },
  { symbol: "F'", name: 'Front Prime', description: 'Turn the front face 90° counter-clockwise', color: 'bg-red-500' },
  { symbol: 'B', name: 'Back', description: 'Turn the back face 90° clockwise', color: 'bg-orange-500' },
  { symbol: "B'", name: 'Back Prime', description: 'Turn the back face 90° counter-clockwise', color: 'bg-orange-500' },
];

const BEGINNER_STEPS = [
  {
    title: "1. White Cross",
    description: "Form a white cross on the top face with edge pieces aligned with center colors",
    difficulty: "Easy",
    algorithms: ["F R U R' U' F'", "R U R' F R F'"],
    tips: "Start with the white face on top. Look for white edge pieces and move them to the top."
  },
  {
    title: "2. White Corners",
    description: "Complete the white face by positioning white corners correctly",
    difficulty: "Easy",
    algorithms: ["R U R' U'", "R U2 R' U' R U' R'"],
    tips: "White corner should be in bottom layer. Use right-hand algorithm to move it up."
  },
  {
    title: "3. Middle Layer",
    description: "Position the middle layer edge pieces correctly",
    difficulty: "Medium",
    algorithms: ["U R U' R' U' F U F'", "U' L' U L U F' U' F"],
    tips: "Find edge pieces in top layer that don't have yellow. Use left or right hand algorithm."
  },
  {
    title: "4. Yellow Cross",
    description: "Form a yellow cross on the top face (don't worry about alignment yet)",
    difficulty: "Medium",
    algorithms: ["F R U R' U' F'"],
    tips: "You might need to repeat the algorithm multiple times. Look for dot → line → cross pattern."
  },
  {
    title: "5. Yellow Face",
    description: "Complete the yellow face by orienting all yellow pieces correctly",
    difficulty: "Medium",
    algorithms: ["R U R' U R U2 R'"],
    tips: "Hold yellow face on top. Look for fish or sune patterns and apply the algorithm."
  },
  {
    title: "6. Yellow Corners",
    description: "Position yellow corner pieces in their correct locations",
    difficulty: "Hard",
    algorithms: ["R' F R' B2 R F' R' B2 R2"],
    tips: "Find one correctly placed corner and hold it in front-right. Repeat algorithm until solved."
  },
  {
    title: "7. Yellow Edges",
    description: "Complete the cube by positioning the final yellow edge pieces",
    difficulty: "Hard",
    algorithms: ["R U' R F R' F' R F R F' R U R' U' R'"],
    tips: "Find one correctly placed edge. Hold it at the back and apply algorithm until solved."
  }
];

export default function LearningSection({ onBack }: LearningSectionProps) {
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Learn to Solve the Rubik's Cube
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Master the fundamentals with our step-by-step beginner-friendly guide
          </p>
        </div>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="notation">Notation</TabsTrigger>
            <TabsTrigger value="method">Method</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>How to Hold the Cube</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-lg mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hold with thumbs on front and sides</p>
                    </div>
                  </div>
                  <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Hold the cube with your thumbs on the front face</li>
                    <li>• Index and middle fingers support the back</li>
                    <li>• Keep your grip relaxed and flexible</li>
                    <li>• Practice turning faces smoothly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>Cube Terminology</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Badge variant="outline">Center</Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                        The middle piece of each face - never moves relative to each other
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge variant="outline">Edge</Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                        Pieces with 2 colors, located between centers
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge variant="outline">Corner</Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                        Pieces with 3 colors, located at the cube's corners
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Badge variant="outline">Algorithm</Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                        A sequence of moves that accomplishes a specific goal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notation Tab */}
          <TabsContent value="notation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cube Notation System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {NOTATION_MOVES.map((move) => (
                    <div
                      key={move.symbol}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-6 h-6 ${move.color} rounded`}></div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono text-lg px-2 py-1">
                            {move.symbol}
                          </Badge>
                          <span className="font-medium">{move.name}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {move.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Quick Tips:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Clockwise turns are shown without apostrophes (R, U, F)</li>
                    <li>• Counter-clockwise turns have apostrophes (R', U', F')</li>
                    <li>• Practice each move slowly before attempting algorithms</li>
                    <li>• Double turns are written as R2, U2, etc.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Method Tab */}
          <TabsContent value="method" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Steps List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Layer-by-Layer Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {BEGINNER_STEPS.map((step, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedStep(index)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedStep === index
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{step.title}</span>
                            <Badge
                              variant={
                                step.difficulty === 'Easy' ? 'default' :
                                step.difficulty === 'Medium' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {step.difficulty}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{BEGINNER_STEPS[selectedStep].title}</span>
                      <Badge
                        variant={
                          BEGINNER_STEPS[selectedStep].difficulty === 'Easy' ? 'default' :
                          BEGINNER_STEPS[selectedStep].difficulty === 'Medium' ? 'secondary' : 'destructive'
                        }
                      >
                        {BEGINNER_STEPS[selectedStep].difficulty}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      {BEGINNER_STEPS[selectedStep].description}
                    </p>

                    <div>
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Key Algorithms:</h4>
                      <div className="space-y-2">
                        {BEGINNER_STEPS[selectedStep].algorithms.map((algorithm, i) => (
                          <div
                            key={i}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-lg border"
                          >
                            {algorithm}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Tip:</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {BEGINNER_STEPS[selectedStep].tips}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Tutorial
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <RotateCw className="w-4 h-4 mr-2" />
                        Practice Mode
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Virtual Cube Practice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-lg mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Interactive cube coming soon</p>
                    </div>
                  </div>
                  <Button className="w-full" disabled>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice Session
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Trainer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Right Hand Algorithm</span>
                      <Badge variant="outline">Basic</Badge>
                    </div>
                    <div className="font-mono text-lg bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      R U R' U'
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Sexy Move</span>
                      <Badge variant="outline">Intermediate</Badge>
                    </div>
                    <div className="font-mono text-lg bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      R U R' F R F'
                    </div>
                  </div>

                  <Button className="w-full" variant="outline" disabled>
                    <RotateCw className="w-4 h-4 mr-2" />
                    Practice Algorithms
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import Player from "./components/Player";
import InputArea from "./components/InputArea";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { generateCallsign } from "./utils/audioUtils";

const AppContent: React.FC = () => {
  const [remainingCallsigns, setRemainingCallsigns] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [inputKey, setInputKey] = useState<number>(0); // Key to force InputArea re-render
  const [currentNumberOfCallsigns, setCurrentNumberOfCallsigns] =
    useState<number>(5); // State to hold number of callsigns from PileupPlayer
  useTheme();

  const handleNumberOfCallsignsChange = useCallback((num: number) => {
    setCurrentNumberOfCallsigns(num);
  }, []);

  const generateNewProblem = useCallback(() => {
    const newCallsigns: string[] = [];
    for (let i = 0; i < currentNumberOfCallsigns; i++) {
      newCallsigns.push(generateCallsign(Math.floor(Math.random() * 4) + 4)); // Callsign length 4-7
    }
    setRemainingCallsigns(newCallsigns);
    setFeedbackMessage("");
    setInputKey((prevKey) => prevKey + 1); // Reset InputArea
  }, [currentNumberOfCallsigns]);

  useEffect(() => {
    generateNewProblem(); // Generate initial problem on mount
  }, [generateNewProblem, currentNumberOfCallsigns]); // Add currentNumberOfCallsigns to dependency array

  const handleCallsignSubmit = (submittedCallsign: string) => {
    const index = remainingCallsigns.indexOf(submittedCallsign);
    if (index > -1) {
      // Correct answer
      const newRemainingCallsigns = remainingCallsigns.filter(
        (_, i) => i !== index
      );
      setRemainingCallsigns(newRemainingCallsigns);
      setFeedbackMessage(`"${submittedCallsign}" - Correct!`);
      setInputKey((prevKey) => prevKey + 1); // Clear input on correct answer
      if (newRemainingCallsigns.length === 0) {
        setFeedbackMessage(
          "All callsigns identified! Generating new problem..."
        );
        setTimeout(() => generateNewProblem(), 2000); // Generate new problem after a short delay
      }
    } else {
      // Incorrect answer
      setFeedbackMessage(`"${submittedCallsign}" - Incorrect. Try again.`);
      // Do not clear input on incorrect answer
    }
  };

  const handleGiveUp = useCallback(() => {
    if (remainingCallsigns.length > 0) {
      setFeedbackMessage(
        `Give up! Remaining callsigns were: ${remainingCallsigns.join(", ")}`
      );
    }
  }, [remainingCallsigns]);


  return (
    <div className="app">
      <main>
        <div className="components-container">
          <Player
            callsignsToPlay={remainingCallsigns}
            onNumberOfCallsignsChange={handleNumberOfCallsignsChange} // Pass the handler
          />
          <InputArea
            key={inputKey} // Use key to force re-render and clear input
            onCallsignSubmit={handleCallsignSubmit}
            currentFeedback={feedbackMessage}
          />
          <div className="status-area">
            <p>Remaining Callsigns: {remainingCallsigns.length}</p>
            <button
              onClick={handleGiveUp}
              disabled={remainingCallsigns.length === 0}
            >
              Give Up
            </button>
            <button onClick={generateNewProblem}>New Problem</button>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

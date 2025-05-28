import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  createAudioContext,
  playMorseCodeWithFrequency,
  playBackgroundNoise,
} from "../utils/audioUtils";

interface PileupPlayerProps {
  callsignsToPlay: string[];
  onNumberOfCallsignsChange: (num: number) => void; // Add this prop
  onPlayerReady?: (startPileup: () => void) => void; // Callback to expose startPileup function
}

const Player: React.FC<PileupPlayerProps> = ({
  callsignsToPlay,
  onNumberOfCallsignsChange,
  onPlayerReady,
}) => {
  const [wpm, setWpm] = useState<number>(20);
  const [numberOfCallsigns, setNumberOfCallsigns] = useState<number>(5); // New state for number of callsigns
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseStartedRef = useRef<boolean>(false); // To ensure noise starts only once
  const callsignFrequenciesRef = useRef<number[]>([]); // Store frequencies for consistent playback

  // Call onNumberOfCallsignsChange when numberOfCallsigns changes
  useEffect(() => {
    onNumberOfCallsignsChange(numberOfCallsigns);
  }, [numberOfCallsigns, onNumberOfCallsignsChange]);

  const startPileup = useCallback(async () => {
    setIsPlaying(true);

    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (!noiseStartedRef.current) {
      playBackgroundNoise(audioContextRef.current);
      noiseStartedRef.current = true;
    }

    let maxEndTime = 0;
    const baseTime = audioContextRef.current.currentTime + 1; // Start playback after 1 second

    // Generate frequencies if not already generated or if callsigns have changed
    if (callsignFrequenciesRef.current.length !== callsignsToPlay.length) {
      callsignFrequenciesRef.current = callsignsToPlay.map(
        () => Math.random() * (3000 - 200) + 200
      );
    }

    for (let i = 0; i < callsignsToPlay.length; i++) {
      const callsign = callsignsToPlay[i];
      const frequency = callsignFrequenciesRef.current[i]; // Use stored frequency
      const delay = Math.random() * 3; // Random delay up to 3 seconds for staggering

      const endTime = playMorseCodeWithFrequency(
        callsign,
        audioContextRef.current,
        wpm,
        frequency,
        baseTime + delay
      );
      if (endTime > maxEndTime) {
        maxEndTime = endTime;
      }
    }

    // Set a timeout to mark as finished when the last sound is expected to end
    const timeToWait =
      (maxEndTime - audioContextRef.current.currentTime) * 1000;
    setTimeout(() => {
      setIsPlaying(false);
    }, timeToWait);
  }, [callsignsToPlay, wpm]);

  // Expose startPileup function to parent component
  useEffect(() => {
    if (onPlayerReady) {
      onPlayerReady(startPileup);
    }
  }, [onPlayerReady, startPileup]);

  // Effect to ensure audio context is resumed on user interaction
  useEffect(() => {
    const resumeAudioContext = async () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state === "suspended"
      ) {
        await audioContextRef.current.resume();
      }
    };
    document.addEventListener("click", resumeAudioContext);
    return () => {
      document.removeEventListener("click", resumeAudioContext);
    };
  }, []);

  // Effect to handle spacebar key press for play functionality
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isPlaying && callsignsToPlay.length > 0) {
        event.preventDefault(); // Prevent page scrolling
        startPileup();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isPlaying, callsignsToPlay.length, startPileup]);

  return (
    <div className="pileup-player">
      <div className="settings-section">
        <div className="setting-item">
          <label htmlFor="num-callsigns-slider">
            Number of Callsigns: {numberOfCallsigns}
          </label>
          <input
            type="range"
            id="num-callsigns-slider"
            min="1"
            max="10"
            value={numberOfCallsigns}
            onChange={(e) => setNumberOfCallsigns(Number(e.target.value))}
            className="controls"
          />
        </div>
        <div className="setting-item">
          <label htmlFor="wpm-slider">WPM: {wpm}</label>
          <input
            type="range"
            id="wpm-slider"
            min="5"
            max="40"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="controls"
          />
        </div>
      </div>
      <div className="controls">
        <button
          onClick={startPileup}
          disabled={isPlaying || callsignsToPlay.length === 0}
        >
          {isPlaying ? "Playing..." : "Play"}
        </button>
      </div>
    </div>
  );
};

export default Player;

import React, { useState, useRef, useEffect } from "react";

interface InputAreaProps {
  onCallsignSubmit: (callsign: string) => void;
  currentFeedback: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  onCallsignSubmit,
  currentFeedback,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentCursorPosition = e.target.selectionStart || 0;
    cursorPositionRef.current = currentCursorPosition;
    setInputValue(e.target.value.toUpperCase()); // Convert input to uppercase
  };

  // カーソル位置を復元
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(
        cursorPositionRef.current,
        cursorPositionRef.current
      );
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      onCallsignSubmit(inputValue.trim());
    }
  };

  return (
    <div className="input-area">
      <p>Enter what you heard</p>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type callsign here"
          autoFocus
        />
        <button type="submit">Submit</button>
      </form>
      {currentFeedback && (
        <div className="feedback">
          <p
            className={
              currentFeedback.includes("Correct!") ? "correct" : "incorrect"
            }
          >
            {currentFeedback}
          </p>
        </div>
      )}
    </div>
  );
};

export default InputArea;

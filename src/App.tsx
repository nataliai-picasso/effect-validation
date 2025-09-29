import React, { useState, ChangeEvent } from 'react';
import './App.scss';

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    // Mirror the input to the output for demonstration
    setOutputValue(value);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="input-section">
          <h2 className="section-title">Input</h2>
          <textarea
            className="input-field"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type something here..."
          />
        </div>
        <div className="output-section">
          <h2 className="section-title">Output</h2>
          <div className="output-field">
            {outputValue || 'Output will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

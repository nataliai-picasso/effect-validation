import React, { useState, ChangeEvent } from 'react';
import { Effect, Schema } from 'effect';
import { DataItemsSchema } from './schemas/data.schema';
import './App.scss';

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');

  const validateJson = (jsonString: string): Effect.Effect<unknown, string, never> => {
    return Effect.try({
      try: () => {
        // First, parse the JSON
        const parsed = JSON.parse(jsonString);
        
        // Then validate against Wix DataItems schema (your data is already a record of DataItems)
        const result = Schema.decodeUnknownSync(DataItemsSchema)(parsed);
        return result;
      },
      catch: (error) => {
        if (error instanceof SyntaxError) {
          return `JSON Parse Error: ${error.message}`;
        }
        return `Validation Error: ${error}`;
      }
    });
  };

  const performValidation = (value: string): void => {
    if (value.trim() === '') {
      setOutputValue('');
      return;
    }

    // Validate the JSON using Effect
    const validation = validateJson(value);
    
    Effect.runSync(
      Effect.match(validation, {
        onFailure: (error) => {
          console.log("error", error);
          setOutputValue(`❌ ${error}`);
        },
        onSuccess: (result) => {
          console.log("result", result);
          setOutputValue(`✅ Valid JSON:\n${JSON.stringify(result, null, 2)}`);
        }
      })
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Trigger validation on Ctrl+Enter or Cmd+Enter (post)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      performValidation(inputValue);
    }
  };

  const handleValidateClick = (): void => {
    performValidation(inputValue);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="input-section">
          <h2 className="section-title">JSON Input</h2>
          <textarea
            className="input-field"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='Enter Wix DataItems JSON to validate (see schema example below)'
          />
          <div className="button-container">
            <button 
              className="validate-button"
              onClick={handleValidateClick}
              type="button"
            >
              Validate JSON
            </button>
            <span className="shortcut-hint">or press Ctrl+Enter (⌘+Enter on Mac)</span>
          </div>
          <div className="schema-info">
            <h3>Expected Schema (Wix DataItems):</h3>
            <pre>{`{
  "link": {
    "dataType": "link",
    "displayName": "Link",
    "link": {
      "linkTypes": ["pageLink", "externalLink", ...]
    }
  },
  "label": {
    "dataType": "text", 
    "displayName": "Label",
    "defaultValue": "Example Text",
    "text": {
      "maxLength": 1200
    }
  }
}`}</pre>
          </div>
        </div>
        <div className="output-section">
          <h2 className="section-title">Validation Result</h2>
          <div className="output-field">
            <pre>{outputValue || 'Validation results will appear here...'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

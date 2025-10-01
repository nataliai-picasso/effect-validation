import React, { useState, ChangeEvent } from 'react';
import { Effect, Schema } from 'effect';
import { DataItemsSchema } from './schemas/data.schema';
import { CssPropertiesSchema, CssCustomPropertiesSchema } from './schemas/css-property.schema';
import { ElementStatePropsSchema } from './schemas/state.schema';
import './App.scss';

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');

  const validateFieldWithSchema = (fieldValue: unknown, fieldName: string): Effect.Effect<unknown, string, never> => {
    return Effect.try({
      try: () => {
        switch (fieldName) {
          case 'data':
            return Schema.decodeUnknownSync(DataItemsSchema)(fieldValue);
          case 'cssProperties':
            return Schema.decodeUnknownSync(CssPropertiesSchema)(fieldValue);
          case 'cssCustomProperties':
            return Schema.decodeUnknownSync(CssCustomPropertiesSchema)(fieldValue);
          case 'states':
            return Schema.decodeUnknownSync(ElementStatePropsSchema)(fieldValue);
          default:
            throw new Error(`Unknown field type: ${fieldName}`);
        }
      },
      catch: (error) => {
        return error;
      }
    });
  };

  const findEditorElement = (obj: unknown): unknown | null => {
    if (!obj || typeof obj !== 'object') {
      return null;
    }
    
    const objRecord = obj as Record<string, unknown>;
    
    // Check if current object has editorElement
    if ('editorElement' in objRecord) {
      return objRecord.editorElement;
    }
    
    // Recursively search in nested objects and arrays
    for (const value of Object.values(objRecord)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          const found = findEditorElement(item);
          if (found) return found;
        }
      } else if (value && typeof value === 'object') {
        const found = findEditorElement(value);
        if (found) return found;
      }
    }
    
    return null;
  };

  const validateJson = (jsonString: string): Effect.Effect<Record<string, unknown>, string, never> => {
    return Effect.try({
      try: () => {
        // First, parse the JSON
        const parsed = JSON.parse(jsonString);
        
        // Try to find editorElement anywhere in the structure
        const editorElement = findEditorElement(parsed);
        
        if (editorElement && typeof editorElement === 'object') {
          const validationResults: Record<string, unknown> = {};
          const validationErrors: string[] = [];
          
          // Only validate known fields, ignore others
          const knownFields = ['data', 'cssProperties', 'cssCustomProperties', 'states'];
          
          for (const [key, value] of Object.entries(editorElement)) {
            if (knownFields.includes(key)) {
              const fieldValidation = validateFieldWithSchema(value, key);
              
              const fieldResult = Effect.runSync(
                Effect.match(fieldValidation, {
                  onFailure: (error) => {
                    validationErrors.push(error);
                    return null;
                  },
                  onSuccess: (result) => result
                })
              );
              
              if (fieldResult !== null) {
                validationResults[key] = fieldResult;
              }
            }
            // Unknown fields are ignored completely
          }
          
          if (validationErrors.length > 0) {
            throw new Error(validationErrors.join('; '));
          }
          
          return {
            editorElement: validationResults,
            originalStructure: parsed
          };
        } else if (editorElement !== null) {
          throw new Error('editorElement field must be an object');
        } else {
          // Fallback to original DataItems validation if no editorElement found
          const result = Schema.decodeUnknownSync(DataItemsSchema)(parsed);
          return result;
        }
      },
      catch: (error) => {
        if (error instanceof SyntaxError) {
          return `JSON Parse Error: ${error.message}`;
        }
        return error;
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
            placeholder='Enter JSON with "editorElement" structure (nested or top-level) or Wix DataItems to validate (see schema examples below)'
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

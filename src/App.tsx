import React, { useState, ChangeEvent } from 'react';
import { Effect, Schema } from 'effect';
import { DataItemsSchema } from './schemas/data.schema';
import { CssPropertiesSchema, CssCustomPropertiesSchema } from './schemas/css-property.schema';
import { ElementStatePropsSchema } from './schemas/state.schema';
import { DisplayFiltersSchema } from './schemas/display-filters.schema';
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
          case 'displayFilters':
            return Schema.decodeUnknownSync(DisplayFiltersSchema)(fieldValue);
          default:
            throw new Error(`Unknown field type: ${fieldName}`);
        }
      },
      catch: (error) => {
        return String(error);
      }
    });
  };

  const validateFieldWithSchemaAsync = async (fieldValue: unknown, fieldName: string): Promise<{ success: true; result: unknown } | { success: false; error: string }> => {
    const validation = validateFieldWithSchema(fieldValue, fieldName);
    
    try {
      const result = Effect.runSync(validation);
      return { success: true, result };
    } catch (error) {
      // Extract the actual error message from Effect's FiberFailure
      let errorMessage = String(error);
      
      // Remove FiberFailure wrapper if present
      if (errorMessage.includes('(FiberFailure)')) {
        // Extract the actual error message after "(FiberFailure) Error: Error: "
        const match = errorMessage.match(/\(FiberFailure\) Error: Error: (.+)/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          // Fallback: remove the FiberFailure prefix
          errorMessage = errorMessage.replace(/\(FiberFailure\) Error: /, '');
        }
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const validateFieldsBatch = async (editorElement: Record<string, unknown>): Promise<{
    validationResults: Record<string, unknown>;
    errors: Array<{ field: string; error: string }>;
  }> => {
    const knownFields = ['data', 'cssProperties', 'cssCustomProperties', 'states', 'displayFilters'];
    const fieldsToValidate = Object.entries(editorElement)
      .filter(([key]) => knownFields.includes(key));

    // Run all validations in parallel using Promise.allSettled
    const validationPromises = fieldsToValidate.map(async ([fieldName, fieldValue]) => {
      const result = await validateFieldWithSchemaAsync(fieldValue, fieldName);
      return { fieldName, result };
    });

    const validationResults = await Promise.allSettled(validationPromises);
    
    const validationResultsMap: Record<string, unknown> = {};
    const errors: Array<{ field: string; error: string }> = [];

    validationResults.forEach((settledResult) => {
      if (settledResult.status === 'fulfilled') {
        const { fieldName, result } = settledResult.value;
        if (result.success) {
          validationResultsMap[fieldName] = result.result;
        } else {
          errors.push({ field: fieldName, error: result.error });
        }
      } else {
        // This shouldn't happen with our current implementation, but handle it just in case
        errors.push({ field: 'unknown', error: settledResult.reason });
      }
    });

    return { validationResults: validationResultsMap, errors };
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

  const validateJson = async (jsonString: string): Promise<Record<string, unknown> | string> => {
    try {
      // First, parse the JSON
      const parsed = JSON.parse(jsonString);
      
      // Try to find editorElement anywhere in the structure
      const editorElement = findEditorElement(parsed);
      
      if (editorElement && typeof editorElement === 'object') {
        // Use batch validation to collect all errors at once
        const { validationResults, errors } = await validateFieldsBatch(editorElement as Record<string, unknown>);
        
        if (errors.length > 0) {
          // Format all errors with field names for better clarity
          const formattedErrors = errors.map(({ field, error }) => {
            // If the error starts with "Field: .", replace it with the actual field name
            if (error.startsWith('Field: .')) {
              const pathAfterDot = error.substring(8); // Remove "Field: ."
              return `Field: ${field}.${pathAfterDot}`;
            }
            return `Field '${field}': ${error}`;
          }).join('; ');
          return formattedErrors;
        }
        
        return {
          editorElement: validationResults,
          originalStructure: parsed
        };
      } else if (editorElement !== null) {
        return 'editorElement field must be an object';
      } else {
        // Fallback to original DataItems validation if no editorElement found
        const result = Schema.decodeUnknownSync(DataItemsSchema)(parsed);
        return result as Record<string, unknown>;
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        return `JSON Parse Error: ${error.message}`;
      }
      return String(error);
    }
  };

  const performValidation = async (value: string): Promise<void> => {
    if (value.trim() === '') {
      setOutputValue('');
      return;
    }

    try {
      // Validate the JSON using async batch validation
      const result = await validateJson(value);
      
      if (typeof result === 'string') {
        // Result is an error string - format as a list
        console.log("error", result);
        const errorList = result.split('; ').map(error => `• ${error}`).join('\n');
        setOutputValue(`❌ Validation Errors:\n${errorList}`);
      } else {
        // Result is a successful validation
        console.log("result", result);
        setOutputValue(`✅ Valid JSON:\n${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      console.log("unexpected error", error);
      setOutputValue(`❌ Unexpected error: ${error}`);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Trigger validation on Ctrl+Enter or Cmd+Enter (post)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      performValidation(inputValue).catch((error) => {
        console.log("validation error", error);
        setOutputValue(`❌ Validation failed: ${error}`);
      });
    }
  };

  const handleValidateClick = (): void => {
    performValidation(inputValue).catch((error) => {
      console.log("validation error", error);
      setOutputValue(`❌ Validation failed: ${error}`);
    });
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
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {outputValue || 'Validation results will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

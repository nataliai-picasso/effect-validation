import { useState, ChangeEvent } from 'react';
import { Schema } from 'effect';
import { EditorElementCss_propertiesSchema, EditorElementCss_custom_propertiesSchema } from './proto-based-schemas/editor_element.schema';
import { StatesSchema } from './proto-based-schemas/state.schema';
import { DataSchema } from './proto-based-schemas/data.schema';
import { DisplayFiltersSchema } from './schemas/display-filters.schema';
import './App.scss';

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');

  const validateFieldWithSchema = (fieldValue: unknown, fieldName: string): unknown => {
    console.log("fieldName", fieldName);
    console.log("fieldValue", fieldValue);
    switch (fieldName) {
      case 'data':
        return Schema.decodeUnknownSync(DataSchema)(fieldValue);
      case 'cssProperties':
        return Schema.decodeUnknownSync(EditorElementCss_propertiesSchema)(fieldValue);
      case 'cssCustomProperties':
        return Schema.decodeUnknownSync(EditorElementCss_custom_propertiesSchema)(fieldValue);
      case 'states':
        return Schema.decodeUnknownSync(StatesSchema)(fieldValue);
      case 'displayFilters':
        return Schema.decodeUnknownSync(DisplayFiltersSchema)(fieldValue);
      default:
        throw new Error(`Unknown field type: ${fieldName}`);
    }
  };

  const validateFieldWithSchemaAsync = async (fieldValue: unknown, fieldName: string): Promise<{ success: true; result: unknown } | { success: false; error: string }> => {
    try {
      const result = validateFieldWithSchema(fieldValue, fieldName);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: String(error) };
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

    const settledResults = await Promise.allSettled(validationPromises);

    const validationResults: Record<string, unknown> = {};
    const errors: Array<{ field: string; error: string }> = [];

    settledResults.forEach((settledResult) => {
      if (settledResult.status === 'fulfilled') {
        const { fieldName, result } = settledResult.value;
        if (result.success) {
          validationResults[fieldName] = result.result;
        } else {
          errors.push({ field: fieldName, error: result.error });
        }
      } else {
        errors.push({ field: 'unknown', error: settledResult.reason });
      }
    });

    return { validationResults, errors };
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(event.target.value);
  };

  const handleValidate = async (): Promise<void> => {
    try {
      console.log("inputValue", inputValue);
      const parsed = JSON.parse(inputValue);
      console.log("parsed", parsed);

      const component = parsed.components?.[0];
      if (!component) {
        setOutputValue('Error: No component found in input');
        return;
      }

      const editorElement = component.data?.editorReactComponent?.editorElement;
      if (!editorElement) {
        setOutputValue('Error: No editorElement found in component');
        return;
      }

      // Batch validate all fields
      const { validationResults, errors } = await validateFieldsBatch(editorElement);

      if (errors.length > 0) {
        const errorMessages = errors.map(({ field, error }) => `${field}: ${error}`).join('\n');
        setOutputValue(`❌ Validation Errors:\n${errorMessages}`);
      } else {
        setOutputValue(`✅ Validation Success:\n${JSON.stringify(validationResults, null, 2)}`);
      }
    } catch (error) {
      console.log("error", error);
      if (error instanceof Error) {
        setOutputValue(`Error: ${error.message}`);
      } else {
        setOutputValue(`Error: ${String(error)}`);
      }
    }
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
            onKeyDown={handleValidate}
            placeholder='Enter JSON with "editorElement" structure (nested or top-level) or Wix DataItems to validate (see schema examples below)'
          />
          <div className="button-container">
            <button 
              className="validate-button"
              onClick={handleValidate}
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

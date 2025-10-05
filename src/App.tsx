import { useState, ChangeEvent } from 'react';
import {
  validateFieldsBatch,
  formatEffectError
} from './utils';
import './App.scss';

const App = (): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>('');
  const [outputValue, setOutputValue] = useState<string>('');

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(event.target.value);
  };

  const handleValidate = async (): Promise<void> => {
    try {
      const parsed = JSON.parse(inputValue);
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

      const { validationResults, errors } = await validateFieldsBatch(editorElement);

      if (errors.length > 0) {
        const errorMessages = errors.join('\n');
        setOutputValue(`❌ Validation Errors:\n${errorMessages}`);
      } else {
        setOutputValue(`✅ Validation Success:\n${JSON.stringify(validationResults, null, 2)}`);
      }
    } catch (error) {
      setOutputValue(`Error: ${error as string}`);
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
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleValidate();
            }}
            placeholder='Enter JSON with "editorElement" structure (nested or top-level)'
          />
          <div className="button-container">
            <button className="validate-button" onClick={handleValidate} type="button">
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
};

export default App;

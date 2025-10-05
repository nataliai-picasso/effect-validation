import * as fs from 'fs';
import * as path from 'path';

interface ProtoStructure {
  hasCssPropertyItem: boolean;
  hasCssCustomPropertyItem: boolean;
  hasCssPropertyItemDefaults: boolean;
  hasCssPropertyItemDefinitionOverrides: boolean;
  cssPropertyItemFields: string[];
  cssCustomPropertyItemFields: string[];
  cssPropertyItemDefaultsFields: string[];
  cssPropertyItemDefinitionOverridesFields: string[];
}

function validateProtoStructure(protoFilePath: string): ProtoStructure {
  const content = fs.readFileSync(protoFilePath, 'utf-8');
  const lines = content.split('\n');
  
  const structure: ProtoStructure = {
    hasCssPropertyItem: false,
    hasCssCustomPropertyItem: false,
    hasCssPropertyItemDefaults: false,
    hasCssPropertyItemDefinitionOverrides: false,
    cssPropertyItemFields: [],
    cssCustomPropertyItemFields: [],
    cssPropertyItemDefaultsFields: [],
    cssPropertyItemDefinitionOverridesFields: []
  };
  
  let currentMessage = '';
  const messageRegex = /^\s*message\s+(\w+)\s*\{/;
  const mapFieldRegex = /^\s*map<[^>]+>\s+(\w+)\s*=/;
  const fieldRegex = /^\s*(?:repeated\s+)?([a-zA-Z_][a-zA-Z0-9_.]*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/;
  
  lines.forEach((line) => {
    const messageMatch = line.match(messageRegex);
    if (messageMatch) {
      currentMessage = messageMatch[1];
      if (currentMessage === 'CssPropertyItem') structure.hasCssPropertyItem = true;
      if (currentMessage === 'CssCustomPropertyItem') structure.hasCssCustomPropertyItem = true;
      if (currentMessage === 'CssPropertyItemDefaults') structure.hasCssPropertyItemDefaults = true;
      if (currentMessage === 'CssPropertyItemDefinitionOverrides') structure.hasCssPropertyItemDefinitionOverrides = true;
    }
    
    // Check for map fields first
    const mapMatch = line.match(mapFieldRegex);
    if (mapMatch && currentMessage) {
      const fieldName = mapMatch[1];
      
      if (currentMessage === 'CssPropertyItem') {
        structure.cssPropertyItemFields.push(fieldName);
      } else if (currentMessage === 'CssCustomPropertyItem') {
        structure.cssCustomPropertyItemFields.push(fieldName);
      } else if (currentMessage === 'CssPropertyItemDefaults') {
        structure.cssPropertyItemDefaultsFields.push(fieldName);
      } else if (currentMessage === 'CssPropertyItemDefinitionOverrides') {
        structure.cssPropertyItemDefinitionOverridesFields.push(fieldName);
      }
    } else {
      // Check for regular fields
      const fieldMatch = line.match(fieldRegex);
      if (fieldMatch && currentMessage) {
        const fieldType = fieldMatch[1];
        const fieldName = fieldMatch[2];
        
        if (currentMessage === 'CssPropertyItem') {
          structure.cssPropertyItemFields.push(fieldName);
        } else if (currentMessage === 'CssCustomPropertyItem') {
          structure.cssCustomPropertyItemFields.push(fieldName);
        } else if (currentMessage === 'CssPropertyItemDefaults') {
          structure.cssPropertyItemDefaultsFields.push(fieldName);
        } else if (currentMessage === 'CssPropertyItemDefinitionOverrides') {
          structure.cssPropertyItemDefinitionOverridesFields.push(fieldName);
        }
      }
    }
  });
  
  return structure;
}

function validateExpectedStructure(structure: ProtoStructure): void {
  const errors: string[] = [];
  
  if (!structure.hasCssPropertyItem) {
    errors.push('Missing message CssPropertyItem in proto file');
  }
  
  if (!structure.hasCssCustomPropertyItem) {
    errors.push('Missing message CssCustomPropertyItem in proto file');
  }
  
  // Validate CssPropertyItem has 'states_default_values' field
  if (structure.hasCssPropertyItem && !structure.cssPropertyItemFields.includes('states_default_values')) {
    errors.push('CssPropertyItem message is missing required "states_default_values" field');
  }
  
  // Validate CssCustomPropertyItem has 'states_default_values' field
  if (structure.hasCssCustomPropertyItem && !structure.cssCustomPropertyItemFields.includes('states_default_values')) {
    errors.push('CssCustomPropertyItem message is missing required "states_default_values" field');
  }
  
  if (errors.length > 0) {
    console.error('("Proto structure validation failed:")', '');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  console.log('("Proto structure validation passed")', '');
}

function recreateCssPropertySchema(protoFilePath: string, outputSchemaPath: string): void {
  // Verify the proto file exists
  if (!fs.existsSync(protoFilePath)) {
    console.error('("Proto file not found:")', protoFilePath);
    process.exit(1);
  }
  
  // Extract the proto file name for metadata
  const protoFileName = path.basename(protoFilePath);
  
  // Create a new CSS property schema file with custom validation
  const customSchemaContent = `import { Schema } from 'effect';

// Generated schemas for CSS property validation in ${protoFileName}
// Source: ${protoFilePath}
// Generated on: ${new Date().toISOString()}
// 
// This file includes custom validation for CSS properties structure where statesDefaultValues cannot be empty.
// DO NOT EDIT THIS FILE MANUALLY - it will be regenerated on build.

// Enhanced schema for cssProperties structure validation
// This validates the entire cssProperties object structure: cssProperties.{key}.statesDefaultValues cannot be empty (if present)
export const CssPropertiesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    statesDefaultValues: Schema.Record({
      key: Schema.String,
      value: Schema.Unknown
    }).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
      message: () => "statesDefaultValues cannot be empty"
    }))
  })
});

// Enhanced schema for cssCustomProperties structure validation
// This validates the entire cssCustomProperties object structure: cssCustomProperties.{key}.statesDefaultValues cannot be empty (if present)
export const CssCustomPropertiesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    statesDefaultValues: Schema.Record({
      key: Schema.String,
      value: Schema.Unknown
    }).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
      message: () => "statesDefaultValues cannot be empty"
    }))
  })
});

// Legacy schemas for backward compatibility (overriding css_property.schema.ts)
export const CssPropertyItemStates_default_valuesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "states_default_values cannot be empty"
}));

export const CssCustomPropertyItemStates_default_valuesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "states_default_values cannot be empty"
}));

export const CssPropertyItemDefaultsStates_default_valuesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "states_default_values cannot be empty"
}));

export const CssPropertyItemDefinitionOverridesStates_default_valuesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "states_default_values cannot be empty"
}));

// Type exports
export type CssProperties = Schema.Schema.Type<typeof CssPropertiesSchema>;
export type CssCustomProperties = Schema.Schema.Type<typeof CssCustomPropertiesSchema>;
export type CssPropertyItemStates_default_values = Schema.Schema.Type<typeof CssPropertyItemStates_default_valuesSchema>;
export type CssCustomPropertyItemStates_default_values = Schema.Schema.Type<typeof CssCustomPropertyItemStates_default_valuesSchema>;
export type CssPropertyItemDefaultsStates_default_values = Schema.Schema.Type<typeof CssPropertyItemDefaultsStates_default_valuesSchema>;
export type CssPropertyItemDefinitionOverridesStates_default_values = Schema.Schema.Type<typeof CssPropertyItemDefinitionOverridesStates_default_valuesSchema>;
`;
  
  // Write the custom schema file (overwriting the generated one)
  fs.writeFileSync(outputSchemaPath, customSchemaContent, 'utf-8');
  
  console.log('("Recreated CSS property schema file with custom validation:")', path.basename(outputSchemaPath));
}

function main(): void {
  const protoDir = path.join(__dirname, '..', 'proto');
  const protoFilePath = path.join(protoDir, 'css_property.proto');
  const schemaDir = path.join(__dirname, '..', 'proto-based-schemas');
  const schemaFilePath = path.join(schemaDir, 'css_property.schema.ts');
  
  console.log('("Starting CSS property schema validation and recreation...")', '');
  console.log('("Proto file:")', protoFilePath);
  console.log('("Schema output:")', schemaFilePath);
  
  // Step 1: Validate proto structure
  console.log('("\nStep 1: Validating proto structure...")', '');
  const structure = validateProtoStructure(protoFilePath);
  validateExpectedStructure(structure);
  
  // Step 2: Recreate the CSS property schema with custom validation
  console.log('("\nStep 2: Recreating css_property.schema.ts with custom validation...")', '');
  recreateCssPropertySchema(protoFilePath, schemaFilePath);
  
  console.log('("\nValidation and schema recreation complete!")', '');
}

// Run the script
main();

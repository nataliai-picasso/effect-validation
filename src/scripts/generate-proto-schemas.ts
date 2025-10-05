import * as fs from 'fs';
import * as path from 'path';

interface MapType {
  keyType: string;
  valueType: string;
  fieldName: string;
  lineNumber: number;
  messageContext: string;
}

interface ProtoFileAnalysis {
  fileName: string;
  protoFilePath: string;
  maps: MapType[];
}

function parseProtoFile(filePath: string): MapType[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const maps: MapType[] = [];
  
  // Regex to match: map<string, Type> fieldName = number;
  const mapRegex = /^\s*map<\s*(\w+)\s*,\s*([\w.]+)\s*>\s+(\w+)\s*=/;
  // Regex to match: message MessageName {
  const messageRegex = /^\s*message\s+(\w+)\s*\{/;
  
  let currentMessage = '';
  
  lines.forEach((line, index) => {
    const messageMatch = line.match(messageRegex);
    if (messageMatch) {
      currentMessage = messageMatch[1];
    }
    
    const match = line.match(mapRegex);
    if (match) {
      maps.push({
        keyType: match[1],
        valueType: match[2],
        fieldName: match[3],
        lineNumber: index + 1,
        messageContext: currentMessage
      });
    }
  });
  
  return maps;
}

function generateSchemaForMap(map: MapType, sourceProtoFile: string): string {
  const { keyType, valueType, fieldName, messageContext } = map;
  
  // Determine the schema type for the value
  let valueSchemaType: string;
  
  // Handle google.protobuf.Value as Unknown
  if (valueType === 'google.protobuf.Value') {
    valueSchemaType = 'Schema.Unknown';
  }
  // Handle known types that would need imports (these are placeholders)
  else if (valueType === 'DataItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import DataItemSchema if needed';
  } else if (valueType === 'StyleItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import StyleItemSchema if needed';
  } else if (valueType === 'ElementItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import ElementItemSchema if needed';
  } else if (valueType === 'Action') {
    valueSchemaType = 'Schema.Unknown // TODO: Import ActionSchema if needed';
  } else if (valueType === 'PresetItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import PresetItemSchema if needed';
  } else if (valueType === 'ElementState') {
    valueSchemaType = 'Schema.Unknown // TODO: Import ElementStateSchema if needed';
  } else if (valueType === 'DisplayGroupItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import DisplayGroupItemSchema if needed';
  } else if (valueType === 'CssPropertyItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import CssPropertyItemSchema if needed';
  } else if (valueType === 'CssCustomPropertyItem') {
    valueSchemaType = 'Schema.Unknown // TODO: Import CssCustomPropertyItemSchema if needed';
  } else {
    // Default case for unknown types
    valueSchemaType = 'Schema.Unknown';
  }
  
  // Generate schema name based on message context and field name for uniqueness
  const contextPrefix = messageContext ? messageContext : '';
  const schemaName = contextPrefix + fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + 'Schema';
  const typeName = contextPrefix + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  
  // Generate the schema code
  const schemaCode = `export const ${schemaName} = Schema.Record({
  key: Schema.String,
  value: ${valueSchemaType}
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "${fieldName} cannot be empty"
}));`;
  
  // Generate type export
  const typeExport = `export type ${typeName} = Schema.Schema.Type<typeof ${schemaName}>;`;
  
  return `${schemaCode}\n\n${typeExport}`;
}

function generateSchemaFile(analysis: ProtoFileAnalysis): string {
  const { fileName, protoFilePath, maps } = analysis;
  
  if (maps.length === 0) {
    return `import { Schema } from 'effect';

// No map types found in ${fileName}
`;
  }
  
  const header = `import { Schema } from 'effect';

// Generated schemas for map types in ${fileName}
// Source: ${protoFilePath}
// Generated on: ${new Date().toISOString()}

`;
  
  const schemas = maps.map(map => {
    const messageInfo = map.messageContext ? ` in message ${map.messageContext}` : '';
    const comment = `// Map type: map<${map.keyType}, ${map.valueType}> ${map.fieldName}${messageInfo} (line ${map.lineNumber})`;
    const schema = generateSchemaForMap(map, fileName);
    return `${comment}\n${schema}`;
  }).join('\n\n');
  
  return header + schemas + '\n';
}

function main(): void {
  const protoDir = path.join(__dirname, '..', 'proto');
  const outputDir = path.join(__dirname, '..', 'proto-based-schemas');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('("Starting proto schema generation...")', '');
  console.log('("Proto directory:")', protoDir);
  console.log('("Output directory:")', outputDir);
  
  // Read all proto files
  const protoFiles = fs.readdirSync(protoDir)
    .filter(file => file.endsWith('.proto'));
  
  console.log('("Found proto files:")', protoFiles.length);
  
  const analyses: ProtoFileAnalysis[] = [];
  
  protoFiles.forEach(file => {
    const protoFilePath = path.join(protoDir, file);
    const maps = parseProtoFile(protoFilePath);
    
    console.log(`("Analyzing ${file}:")`, maps.length, 'maps found');
    
    analyses.push({
      fileName: file,
      protoFilePath,
      maps
    });
  });
  
  // Generate schema files
  analyses.forEach(analysis => {
    const outputFileName = analysis.fileName.replace('.proto', '.schema.ts');
    const outputPath = path.join(outputDir, outputFileName);
    
    const schemaContent = generateSchemaFile(analysis);
    fs.writeFileSync(outputPath, schemaContent, 'utf-8');
    
    console.log('("Generated:")', outputFileName);
  });
  
  console.log('("Schema generation complete!")', '');
}

// Run the script
main();


import { Either, Schema, ParseResult } from "effect";
import { CssPropertiesSchema, CssCustomPropertiesSchema } from "./proto-based-schemas/css_property.schema";
import { StatesSchema } from "./proto-based-schemas/state.schema";
import { DataSchema } from "./proto-based-schemas/data.schema";
import { DisplayFiltersSchema } from "./schemas/display-filters.schema";

export const knownFields = ["data", "cssProperties", "cssCustomProperties", "states", "displayFilters"];

export const formatEffectError = (errorData: { field: string; error: string }): string => {
  console.log("errorData", errorData);
  
  const { field: fieldName, error: message } = errorData;
  
  // Extract the field path using regex
  // Look for patterns like ["field1"] └─ ["field2"] └─ ["field3"]
  const fieldPathRegex = /\["([^"]+)"\]/g;
  const fieldMatches: string[] = [];
  let match;
  while ((match = fieldPathRegex.exec(message)) !== null) {
    fieldMatches.push(match[1]);
  }
  const fieldPath = fieldMatches.join('.');
  
  // Extract the error description
  const lines = message.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const errorDescription = lines.find(line => !line.includes('└─') && !line.includes('├─') && !line.includes('["') && !line.includes('readonly'))?.replace(/[└├]─\s*/, '') || lines[lines.length - 1];
  
  const fullFieldPath = fieldPath ? `${fieldName}.${fieldPath}` : fieldName;
  return `Field: ${fullFieldPath}. Description: ${errorDescription.replace(/[└├]─\s*/, '')}.`;
};

export const validateFieldWithSchema = (fieldValue: unknown, fieldName: string): unknown => {
  let schema: Schema.Schema<any>;
  switch (fieldName) {
    case "data":
      schema = DataSchema;
      break;
    case "cssProperties":
      schema = CssPropertiesSchema;
      break;
    case "cssCustomProperties":
      schema = CssCustomPropertiesSchema;
      break;
    case "states":
      schema = StatesSchema;
      break;
    case "displayFilters":
      schema = DisplayFiltersSchema;
      break;
    default:
      throw new Error(`Unknown field type: ${fieldName}`);
  }

  const result = Schema.decodeUnknownEither(schema)(fieldValue);
  if (Either.isLeft(result)) throw result.left;
  return result.right;
};

export const validateFieldWithSchemaAsync = async (
  fieldValue: unknown,
  fieldName: string
): Promise<{ success: true; result: unknown } | { success: false; error: string }> => {
  try {
    const result = validateFieldWithSchema(fieldValue, fieldName);
    return { success: true, result };
  } catch (error) {
    console.log("error", typeof error);
    const errorMessage = (error as ParseResult.ParseError).message;
    return { success: false, error: errorMessage };
  }
};

export const validateFieldsBatch = async (editorElement: Record<string, unknown>) => {
  const fieldsToValidate = Object.entries(editorElement).filter(([key]) => knownFields.includes(key));

  const validationPromises = fieldsToValidate.map(async ([fieldName, fieldValue]) => {
    const result = await validateFieldWithSchemaAsync(fieldValue, fieldName);
    return { fieldName, result };
  });

  const settledResults = await Promise.allSettled(validationPromises);

  const validationResults: Record<string, unknown> = {};
  const errors: Array<string> = [];

  settledResults.forEach((settledResult) => {
    if (settledResult.status === "fulfilled") {
      const { fieldName, result } = settledResult.value;
      if (result.success) {
        validationResults[fieldName] = result.result;
      }
      else {
        errors.push(formatEffectError({field: fieldName, error: result.error}));
      }
    } else {
      errors.push(formatEffectError({field: "unknown", error: String(settledResult.reason)}));
    }
  });

  return { validationResults, errors };
};

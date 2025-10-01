import { Schema } from 'effect';

// CSS Properties Schema - validates the cssProperties field structure
export const CssPropertiesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown 
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "CSS properties object cannot be empty"
})).pipe(Schema.filter((record) => {
  let errorPath = "";
  const checkForEmptyObjects = (obj: unknown, path: string = ""): boolean => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const objRecord = obj as Record<string, unknown>;
      if (Object.keys(objRecord).length === 0) {
        // Only reject empty objects at the exact path: statesDefaultValues
        if (path.endsWith('.statesDefaultValues')) {
          errorPath = path;
          return false;
        }
        // Allow all other empty objects
        return true;
      }
      // Recursively check nested objects with path tracking
      return Object.entries(objRecord).every(([key, value]) => 
        checkForEmptyObjects(value, `${path}.${key}`)
      );
    }
    return true; 
  };
  const isValid = checkForEmptyObjects(record);
  if (!isValid) {
    throw new Error(`Field: ${errorPath}. Description: statesDefaultValues object cannot be empty.`);
  }
  return true;
}, {
  message: () => "CSS properties object cannot be empty"
}));

// CSS Custom Properties Schema - validates the cssCustomProperties field structure
export const CssCustomPropertiesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown 
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "CSS custom properties object cannot be empty"
})).pipe(Schema.filter((record) => {
  let errorPath = "";
  const checkForEmptyObjects = (obj: unknown, path: string = ""): boolean => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const objRecord = obj as Record<string, unknown>;
      if (Object.keys(objRecord).length === 0) {
        // Only reject empty objects at the exact path: statesDefaultValues
        if (path.endsWith('.statesDefaultValues')) {
          errorPath = path;
          return false;
        }
        // Allow all other empty objects
        return true;
      }
      // Recursively check nested objects with path tracking
      return Object.entries(objRecord).every(([key, value]) => 
        checkForEmptyObjects(value, `${path}.${key}`)
      );
    }
    return true; 
  };
  const isValid = checkForEmptyObjects(record);
  if (!isValid) {
    throw new Error(`Field: ${errorPath}. Description: statesDefaultValues object cannot be empty.`);
  }
  return true;
}, {
  message: () => "CSS custom properties object cannot be empty"
}));

// Type inference
export type CssProperties = Schema.Schema.Type<typeof CssPropertiesSchema>;
export type CssCustomProperties = Schema.Schema.Type<typeof CssCustomPropertiesSchema>;
import { Schema } from 'effect';

export const NativeStateTypeSchema = Schema.Literal(
  'UNKNOWN_NativeStateType',
  'hover',
  'focus',
  'disabled',
  'invalid'
);

export const ElementStatePropsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown 
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "State props object cannot be empty"
})).pipe(Schema.filter((record) => {
  let errorPath = "";
  const checkForEmptyObjects = (obj: unknown, path: string = ""): boolean => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const objRecord = obj as Record<string, unknown>;
      if (Object.keys(objRecord).length === 0) {
        // Only reject empty objects at the exact path: props
        if (path.endsWith('.props')) {
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
    throw new Error(`Field: ${errorPath}. Description: State props object cannot be empty.`);
  }
  return true;
}, {
  message: () => "State props object cannot be empty"
}));

export type NativeStateType = Schema.Schema.Type<typeof NativeStateTypeSchema>;
export type ElementStateProps = Schema.Schema.Type<typeof ElementStatePropsSchema>;

import { Schema } from 'effect';

// Enum Schemas
export const NativeStateTypeSchema = Schema.Literal(
  'UNKNOWN_NativeStateType',
  'hover',
  'focus',
  'disabled',
  'invalid'
);

// Display Filter Schemas
export const DisplayFilterSchema = Schema.Struct({
  hide: Schema.optional(Schema.Array(Schema.String.pipe(Schema.maxLength(80)))),
  show: Schema.optional(Schema.Array(Schema.String.pipe(Schema.maxLength(80))))
});

export const DisplayFiltersSchema = Schema.Struct({
  elements: Schema.optional(DisplayFilterSchema),
  style: Schema.optional(DisplayFilterSchema), // deprecated
  data: Schema.optional(DisplayFilterSchema),
  customActions: Schema.optional(DisplayFilterSchema),
  actions: Schema.optional(DisplayFilterSchema),
  cssProperties: Schema.optional(DisplayFilterSchema),
  cssCustomProperties: Schema.optional(DisplayFilterSchema)
});

// State Schemas
export const ElementStateSchema = Schema.Struct({
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  className: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  pseudoClass: NativeStateTypeSchema,
  props: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown // google.protobuf.Value
  })),
  displayFilters: Schema.optional(DisplayFiltersSchema)
});

export const VisibleStateSchema = Schema.Struct({
  stateKey: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  elementPath: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(500))
});

// Type inference
export type NativeStateType = Schema.Schema.Type<typeof NativeStateTypeSchema>;
export type DisplayFilter = Schema.Schema.Type<typeof DisplayFilterSchema>;
export type DisplayFilters = Schema.Schema.Type<typeof DisplayFiltersSchema>;
export type ElementState = Schema.Schema.Type<typeof ElementStateSchema>;
export type VisibleState = Schema.Schema.Type<typeof VisibleStateSchema>;

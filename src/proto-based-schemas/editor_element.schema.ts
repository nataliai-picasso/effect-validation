import { Schema } from 'effect';

// Generated schemas for map types in editor_element.proto
// Source: /Users/nataliai/Projects/test/effect/src/proto/editor_element.proto
// Generated on: 2025-10-05T19:36:58.558Z

// Map type: map<string, StyleItem> style in message EditorElement (line 29)
export const EditorElementStyleSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import StyleItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "style cannot be empty"
}));

export type EditorElementStyle = Schema.Schema.Type<typeof EditorElementStyleSchema>;

// Map type: map<string, DataItem> data in message EditorElement (line 34)
export const EditorElementDataSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import DataItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "data cannot be empty"
}));

export type EditorElementData = Schema.Schema.Type<typeof EditorElementDataSchema>;

// Map type: map<string, ElementItem> elements in message EditorElement (line 36)
export const EditorElementElementsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import ElementItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "elements cannot be empty"
}));

export type EditorElementElements = Schema.Schema.Type<typeof EditorElementElementsSchema>;

// Map type: map<string, Action> custom_actions in message EditorElement (line 40)
export const EditorElementCustom_actionsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import ActionSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "custom_actions cannot be empty"
}));

export type EditorElementCustom_actions = Schema.Schema.Type<typeof EditorElementCustom_actionsSchema>;

// Map type: map<string, PresetItem> presets in message EditorElement (line 42)
export const EditorElementPresetsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import PresetItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "presets cannot be empty"
}));

export type EditorElementPresets = Schema.Schema.Type<typeof EditorElementPresetsSchema>;

// Map type: map<string, ElementState> states in message EditorElement (line 49)
export const EditorElementStatesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import ElementStateSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "states cannot be empty"
}));

export type EditorElementStates = Schema.Schema.Type<typeof EditorElementStatesSchema>;

// Map type: map<string, DisplayGroupItem> display_groups in message EditorElement (line 56)
export const EditorElementDisplay_groupsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import DisplayGroupItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "display_groups cannot be empty"
}));

export type EditorElementDisplay_groups = Schema.Schema.Type<typeof EditorElementDisplay_groupsSchema>;

// Map type: map<string, CssPropertyItem> css_properties in message EditorElement (line 58)
export const EditorElementCss_propertiesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import CssPropertyItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "css_properties cannot be empty"
}));

export type EditorElementCss_properties = Schema.Schema.Type<typeof EditorElementCss_propertiesSchema>;

// Map type: map<string, CssCustomPropertyItem> css_custom_properties in message EditorElement (line 60)
export const EditorElementCss_custom_propertiesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown // TODO: Import CssCustomPropertyItemSchema if needed
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "css_custom_properties cannot be empty"
}));

export type EditorElementCss_custom_properties = Schema.Schema.Type<typeof EditorElementCss_custom_propertiesSchema>;

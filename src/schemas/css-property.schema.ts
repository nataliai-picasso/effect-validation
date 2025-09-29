import { Schema } from 'effect';

// Enum Schemas
export const CssDataTypeSchema = Schema.Literal(
  'UNKNOWN_CssDataType',
  'number',
  'string',
  'angle',
  'color',
  'length',
  'percentage',
  'lengthPercentage',
  'blendMode',
  'customEnum',
  'time'
);

export const CssPropertyTypeSchema = Schema.Literal(
  'UNKNOWN_CssPropertyType',
  // css-data-types
  'number',
  'string',
  'angle',
  'length',
  'percentage',
  'lengthPercentage',
  'blendMode',
  'customEnum',
  'time',
  // background properties
  'background',
  'backgroundSize',
  'backgroundColor',
  'backgroundImage',
  'backgroundClip',
  'backgroundOrigin',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundAttachment',
  // margin properties
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginInlineStart',
  'marginInlineEnd',
  // padding properties
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingInlineStart',
  'paddingInlineEnd',
  // border properties
  'border',
  'borderWidth',
  'borderStyle',
  'borderColor',
  'borderTop',
  'borderTopColor',
  'borderTopWidth',
  'borderTopStyle',
  'borderRight',
  'borderRightColor',
  'borderRightWidth',
  'borderRightStyle',
  'borderBottom',
  'borderBottomColor',
  'borderBottomWidth',
  'borderBottomStyle',
  'borderLeft',
  'borderLeftColor',
  'borderLeftWidth',
  'borderLeftStyle',
  'borderInlineStart',
  'borderInlineStartColor',
  'borderInlineStartWidth',
  'borderInlineStartStyle',
  'borderInlineEnd',
  'borderInlineEndColor',
  'borderInlineEndWidth',
  'borderInlineEndStyle',
  // border-radius properties
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndEndRadius',
  // font properties
  'font',
  'fontFamily',
  'fontSize',
  'fontStretch',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'lineHeight',
  // text properties
  'color',
  'letterSpacing',
  'writingMode',
  'textAlign',
  'textTransform',
  'textShadow',
  'textOverflow',
  'textIndent',
  // text-decoration properties
  'textDecoration',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textDecorationThickness',
  // box related properties
  'boxShadow',
  'opacity',
  'overflow',
  // layout properties
  'display',
  'alignSelf',
  'justifyContent',
  'alignItems',
  'flexDirection',
  'height',
  'width',
  'gap',
  'columnGap',
  'rowGap',
  // filters
  'filter',
  'backdropFilter',
  // media sizing & alignment
  'objectFit',
  'objectPosition',
  // blending & compositing
  'mixBlendMode',
  'isolation',
  // stroke properties
  'stroke',
  'strokeWidth',
  'strokeOpacity',
  // fill properties
  'fill',
  'fillOpacity'
);

export const FilterFunctionSchema = Schema.Literal(
  'UNKNOWN_FilterFunctions',
  'blur',
  'brightness',
  'contrast',
  'drop_shadow',
  'grayscale',
  'hue_rotate',
  'invert',
  'opacity',
  'sepia',
  'saturate'
);

export const DisplayValueSchema = Schema.Literal(
  'UNKNOWN_DisplayValue',
  'none',
  'block',
  'inline',
  'flow',
  'flowRoot',
  'table',
  'flex',
  'grid',
  'list_item',
  'contents',
  'inline_block',
  'inline_table',
  'inline_flex',
  'inline_grid'
);

export const WritingModeValueSchema = Schema.Literal(
  'UNKNOWN_WritingModeValue',
  'horizontalTb',
  'verticalRl',
  'verticalLr',
  'sidewaysRl',
  'sidewaysLr'
);

export const BackgroundModeSchema = Schema.Literal(
  'UNKNOWN_BackgroundModeEnum',
  'shapeDividerSvg'
);

export const ImageCategoryTypesSchema = Schema.Literal(
  'UNKNOWN_CategoryName',
  'IMAGE',
  'IMAGE_BACKGROUND'
);

export const VideoCategoryTypesSchema = Schema.Literal(
  'UNKNOWN_VideoCategoryTypes',
  'VIDEO',
  'VIDEO_TRANSPARENT',
  'VIDEO_OPAQUE'
);

export const VectorArtCategoryTypesSchema = Schema.Literal(
  'UNKNOWN_VectorArtCategoryTypes',
  'SHAPE_ALL',
  'SHAPE_BASIC',
  'SHAPE_ART',
  'ICON_SOCIAL',
  'SHAPE_DIVIDERS',
  'SHAPE_LOCATION'
);

// Complex Type Schemas
export const FilterSchema = Schema.Struct({
  filterFunctions: Schema.optional(Schema.Array(FilterFunctionSchema))
});

export const BackdropFilterSchema = Schema.Struct({
  filterFunctions: Schema.optional(Schema.Array(FilterFunctionSchema))
});

export const CustomPropertyEnumOptionStyleSchema = Schema.Struct({
  property: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  value: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(300))
});

export const CustomPropertyEnumOptionSchema = Schema.Struct({
  value: Schema.String.pipe(Schema.maxLength(100)),
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  appliedStyles: Schema.optional(Schema.Array(CustomPropertyEnumOptionStyleSchema))
});

export const CustomPropertyEnumSchema = Schema.Struct({
  cssPropertyType: CssPropertyTypeSchema,
  options: Schema.Array(CustomPropertyEnumOptionSchema)
});

export const DisplaySchema = Schema.Struct({
  displayValues: Schema.optional(Schema.Array(DisplayValueSchema))
});

export const WritingModeSchema = Schema.Struct({
  writingModeValues: Schema.optional(Schema.Array(WritingModeValueSchema))
});

export const BackgroundSchema = Schema.Struct({
  backgroundMode: BackgroundModeSchema,
  imageCategory: Schema.optional(ImageCategoryTypesSchema),
  vectorArtCategory: Schema.optional(VectorArtCategoryTypesSchema)
});

export const CssNumberSchema = Schema.Struct({
  minimum: Schema.optional(Schema.Number),
  maximum: Schema.optional(Schema.Number),
  multipleOf: Schema.optional(Schema.Number)
});

// Main CSS Property Schemas
export const CssPropertyItemSchema = Schema.Struct({
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  defaultValue: Schema.optional(Schema.Unknown), // google.protobuf.Value
  statesDefaultValues: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown // google.protobuf.Value
  })),
  
  // Union type for SelectedCssPropertyType
  filter: Schema.optional(FilterSchema),
  backdropFilter: Schema.optional(BackdropFilterSchema),
  display: Schema.optional(DisplaySchema),
  writingMode: Schema.optional(WritingModeSchema),
  background: Schema.optional(BackgroundSchema)
});

export const CssCustomPropertyItemSchema = Schema.Struct({
  cssPropertyType: CssPropertyTypeSchema,
  deprecated: Schema.optional(Schema.Boolean),
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  defaultValue: Schema.optional(Schema.Unknown), // google.protobuf.Value
  statesDefaultValues: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown // google.protobuf.Value
  })),
  
  // Union type for SelectedCssPropertyType
  filter: Schema.optional(FilterSchema),
  backdropFilter: Schema.optional(BackdropFilterSchema),
  display: Schema.optional(DisplaySchema),
  writingMode: Schema.optional(WritingModeSchema),
  background: Schema.optional(BackgroundSchema),
  
  // Additional options for css-data-types
  customEnum: Schema.optional(CustomPropertyEnumSchema),
  number: Schema.optional(CssNumberSchema)
});

export const CssPropertyItemDefaultsSchema = Schema.Struct({
  defaultValue: Schema.optional(Schema.Unknown), // google.protobuf.Value
  statesDefaultValues: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown // google.protobuf.Value
  }))
});

export const CssPropertyItemDefinitionOverridesSchema = Schema.Struct({
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  disableEditing: Schema.optional(Schema.Boolean),
  defaultValue: Schema.optional(Schema.Unknown), // google.protobuf.Value
  statesDefaultValues: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown // google.protobuf.Value
  }))
});

// Type inference
export type CssDataType = Schema.Schema.Type<typeof CssDataTypeSchema>;
export type CssPropertyType = Schema.Schema.Type<typeof CssPropertyTypeSchema>;
export type FilterFunction = Schema.Schema.Type<typeof FilterFunctionSchema>;
export type DisplayValue = Schema.Schema.Type<typeof DisplayValueSchema>;
export type WritingModeValue = Schema.Schema.Type<typeof WritingModeValueSchema>;
export type BackgroundMode = Schema.Schema.Type<typeof BackgroundModeSchema>;
export type ImageCategoryTypes = Schema.Schema.Type<typeof ImageCategoryTypesSchema>;
export type VideoCategoryTypes = Schema.Schema.Type<typeof VideoCategoryTypesSchema>;
export type VectorArtCategoryTypes = Schema.Schema.Type<typeof VectorArtCategoryTypesSchema>;

export type Filter = Schema.Schema.Type<typeof FilterSchema>;
export type BackdropFilter = Schema.Schema.Type<typeof BackdropFilterSchema>;
export type CustomPropertyEnumOptionStyle = Schema.Schema.Type<typeof CustomPropertyEnumOptionStyleSchema>;
export type CustomPropertyEnumOption = Schema.Schema.Type<typeof CustomPropertyEnumOptionSchema>;
export type CustomPropertyEnum = Schema.Schema.Type<typeof CustomPropertyEnumSchema>;
export type Display = Schema.Schema.Type<typeof DisplaySchema>;
export type WritingMode = Schema.Schema.Type<typeof WritingModeSchema>;
export type Background = Schema.Schema.Type<typeof BackgroundSchema>;
export type CssNumber = Schema.Schema.Type<typeof CssNumberSchema>;

export type CssPropertyItem = Schema.Schema.Type<typeof CssPropertyItemSchema>;
export type CssCustomPropertyItem = Schema.Schema.Type<typeof CssCustomPropertyItemSchema>;
export type CssPropertyItemDefaults = Schema.Schema.Type<typeof CssPropertyItemDefaultsSchema>;
export type CssPropertyItemDefinitionOverrides = Schema.Schema.Type<typeof CssPropertyItemDefinitionOverridesSchema>;

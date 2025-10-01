import { Schema } from 'effect';

// Enum Schemas
export const DataTypeSchema = Schema.Literal(
  'UNKNOWN_DataType',
  'text',
  'textEnum',
  'number',
  'booleanValue',
  'a11y',
  'link',
  'image',
  'video',
  'vectorArt',
  'audio',
  'schema', // deprecated
  'localDate',
  'localTime',
  'localDateTime',
  'webUrl',
  'email',
  'phone',
  'hostname',
  'regex',
  'guid',
  'richText',
  'container',
  'arrayItems',
  'direction',
  'menuItems',
  'data'
);

export const A11yAttributesSchema = Schema.Literal(
  'Unknown_AriaAttributes',
  'tabIndex',
  'ariaLevel',
  'ariaExpanded',
  'ariaDisabled',
  'ariaAtomic',
  'ariaHidden',
  'ariaBusy',
  'multiline',
  'ariaAutocomplete',
  'ariaPressed',
  'ariaHaspopup',
  'ariaRelevant',
  'role',
  'ariaLive',
  'ariaCurrent',
  'ariaLabel',
  'ariaRoledescription',
  'ariaDescribedby',
  'ariaLabelledby',
  'ariaErrormessage',
  'ariaOwns',
  'ariaControls',
  'tag',
  'ariaMultiline',
  'ariaInvalid'
);

export const LinkTypeSchema = Schema.Literal(
  'UNKNOWN_LinkType',
  'externalLink',
  'anchorLink',
  'emailLink',
  'phoneLink',
  'dynamicPageLink',
  'pageLink',
  'whatsAppLink',
  'documentLink',
  'popupLink',
  'addressLink',
  'edgeAnchorLinks',
  'loginToWixLink'
);

export const RichTextAbilitiesSchema = Schema.Literal(
  'UNKNOWN_RichTextAbilities',
  'font',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'textDecoration',
  'color',
  'backgroundColor',
  'letterSpacing',
  'textAlign',
  'direction',
  'marginStart',
  'marginEnd',
  'bulletedList',
  'numberedList',
  'seoTag'
);

export const ContainerTypeSchema = Schema.Literal(
  'UNKNOWN_CONTAINER_TYPE',
  'simple',
  'slot',
  'placeholder',
  'template'
);

// Basic Type Schemas
export const TextSchema = Schema.Struct({
  maxLength: Schema.optional(Schema.Number),
  minLength: Schema.optional(Schema.Number),
  regexPattern: Schema.optional(Schema.String), // deprecated
  pattern: Schema.optional(Schema.String)
});

export const TextEnumOptionSchema = Schema.Struct({
  value: Schema.String,
  displayName: Schema.String
});

export const TextEnumSchema = Schema.Struct({
  options: Schema.Array(TextEnumOptionSchema)
});

export const NumberSchema = Schema.Struct({
  minimum: Schema.optional(Schema.Number),
  maximum: Schema.optional(Schema.Number),
  multipleOf: Schema.optional(Schema.Number)
});

export const A11ySchema = Schema.Struct({
  attributes: Schema.Array(A11yAttributesSchema)
});

export const LinkSchema = Schema.Struct({
  linkTypes: Schema.Array(LinkTypeSchema)
});

export const RichTextSchema = Schema.Struct({
  abilities: Schema.Array(RichTextAbilitiesSchema)
});

export const ImageSchema = Schema.Struct({
  category: Schema.String // MediaManagerEnum.ImageCategoryTypes
});

export const VideoSchema = Schema.Struct({
  category: Schema.String // MediaManagerEnum.VideoCategoryTypes
});

export const VectorArtSchema = Schema.Struct({
  category: Schema.String // MediaManagerEnum.VectorArtCategoryTypes
});

// Container related schemas
export const ContainerBehaviorsSchema = Schema.Struct({
  selectable: Schema.optional(Schema.Boolean)
});

export const ContainerLayoutSchema = Schema.Struct({
  resizeDirection: Schema.String // ResizeDirectionEnum.ResizeDirection
});

export const StyleItemOverridesSchema = Schema.Struct({
  disableEditing: Schema.optional(Schema.Boolean),
  displayName: Schema.optional(Schema.String)
});

export const ContainerStyleOverridesSchema = Schema.Struct({
  border: Schema.optional(StyleItemOverridesSchema),
  borderRadius: Schema.optional(StyleItemOverridesSchema),
  shadow: Schema.optional(StyleItemOverridesSchema),
  background: Schema.optional(StyleItemOverridesSchema)
});

export const SimpleContainerSchema = Schema.Struct({
  layout: Schema.optional(ContainerLayoutSchema),
  style: Schema.optional(ContainerStyleOverridesSchema),
  behaviors: Schema.optional(ContainerBehaviorsSchema),
  displayName: Schema.optional(Schema.String)
});

export const SlotSchema = Schema.Struct({
  slotId: Schema.String.pipe(Schema.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) // GUID format
});

export const PlaceHolderSchema = Schema.Struct({
  placeholderId: Schema.String.pipe(Schema.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) // GUID format
});

export const ReactElementContainerSchema = Schema.Struct({
  selector: Schema.String.pipe(Schema.minLength(2), Schema.maxLength(100)),
  containerType: ContainerTypeSchema,
  simple: Schema.optional(SimpleContainerSchema),
  slot: Schema.optional(SlotSchema),
  placeholder: Schema.optional(PlaceHolderSchema)
});

export const DataItemOverridesSchema = Schema.Struct({
  disableEditing: Schema.optional(Schema.Boolean),
  defaultValue: Schema.optional(Schema.Unknown), // google.protobuf.Value
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100)))
});

// Simple ArrayItems schema that validates the structure without deep recursion
export const ArrayItemsSchema = Schema.Struct({
  data: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown // Allow any nested structure for now
  }).pipe(
    Schema.filter((record) => Object.keys(record).length > 0, {
      message: () => "Data object cannot be empty"
    }),
    Schema.filter((record) => {
      // Check that each value in the record is not an empty object
      return Object.values(record).every(value => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return Object.keys(value).length > 0;
        }
        return true; // Non-objects are allowed
      });
    }, {
      message: () => "Items under arrayItems/data cannot be empty objects"
    })
  )),
  dataItem: Schema.optional(Schema.Unknown), // Allow any structure for single items
  maxSize: Schema.optional(Schema.Number)
});

// DataItem schema with arrayItems support but limited recursion
export const DataItemSchema = Schema.Struct({
  dataType: DataTypeSchema,
  displayName: Schema.optional(Schema.String.pipe(Schema.maxLength(100))),
  defaultValue: Schema.optional(Schema.Unknown), // google.protobuf.Value
  deprecated: Schema.optional(Schema.Boolean),
  
  // Union type for SelectedDataType - includes arrayItems with limited validation
  text: Schema.optional(TextSchema),
  textEnum: Schema.optional(TextEnumSchema),
  number: Schema.optional(NumberSchema),
  a11y: Schema.optional(A11ySchema),
  link: Schema.optional(LinkSchema),
  schema: Schema.optional(Schema.Unknown), // deprecated - google.protobuf.Struct
  arrayItems: Schema.optional(ArrayItemsSchema), // Added back with limited validation!
  container: Schema.optional(ReactElementContainerSchema),
  richText: Schema.optional(RichTextSchema),
  image: Schema.optional(ImageSchema),
  video: Schema.optional(VideoSchema),
  vectorArt: Schema.optional(VectorArtSchema)
});

// DataItems is a record where keys are strings and values are DataItems
export const DataItemsSchema = Schema.Record({
  key: Schema.String,
  value: DataItemSchema
}).pipe(Schema.filter((record) => Object.keys(record).length > 0, {
  message: () => "Data object cannot be empty"
}));

// Type inference
export type DataType = Schema.Schema.Type<typeof DataTypeSchema>;
export type A11yAttributes = Schema.Schema.Type<typeof A11yAttributesSchema>;
export type LinkType = Schema.Schema.Type<typeof LinkTypeSchema>;
export type RichTextAbilities = Schema.Schema.Type<typeof RichTextAbilitiesSchema>;
export type ContainerType = Schema.Schema.Type<typeof ContainerTypeSchema>;

export type Text = Schema.Schema.Type<typeof TextSchema>;
export type TextEnumOption = Schema.Schema.Type<typeof TextEnumOptionSchema>;
export type TextEnum = Schema.Schema.Type<typeof TextEnumSchema>;
export type Number = Schema.Schema.Type<typeof NumberSchema>;
export type A11y = Schema.Schema.Type<typeof A11ySchema>;
export type Link = Schema.Schema.Type<typeof LinkSchema>;
export type RichText = Schema.Schema.Type<typeof RichTextSchema>;
export type Image = Schema.Schema.Type<typeof ImageSchema>;
export type Video = Schema.Schema.Type<typeof VideoSchema>;
export type VectorArt = Schema.Schema.Type<typeof VectorArtSchema>;

export type ContainerBehaviors = Schema.Schema.Type<typeof ContainerBehaviorsSchema>;
export type ContainerLayout = Schema.Schema.Type<typeof ContainerLayoutSchema>;
export type StyleItemOverrides = Schema.Schema.Type<typeof StyleItemOverridesSchema>;
export type ContainerStyleOverrides = Schema.Schema.Type<typeof ContainerStyleOverridesSchema>;
export type SimpleContainer = Schema.Schema.Type<typeof SimpleContainerSchema>;
export type Slot = Schema.Schema.Type<typeof SlotSchema>;
export type PlaceHolder = Schema.Schema.Type<typeof PlaceHolderSchema>;
export type ReactElementContainer = Schema.Schema.Type<typeof ReactElementContainerSchema>;

export type ArrayItems = Schema.Schema.Type<typeof ArrayItemsSchema>;
export type DataItemOverrides = Schema.Schema.Type<typeof DataItemOverridesSchema>;
export type DataItem = Schema.Schema.Type<typeof DataItemSchema>;
export type DataItems = Schema.Schema.Type<typeof DataItemsSchema>;

// Root schema for validation
export const WixComponentDataSchema = Schema.Struct({
  items: DataItemsSchema
});

export type WixComponentData = Schema.Schema.Type<typeof WixComponentDataSchema>;

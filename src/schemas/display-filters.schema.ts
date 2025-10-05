import { Schema } from 'effect';

// Helper function to create filter schema with path context
const createFilterObjectSchema = (filterKey: string) => {
  return Schema.Struct({
    show: Schema.optional(Schema.Array(Schema.String)),
    hide: Schema.optional(Schema.Array(Schema.String))
  }).pipe(
    Schema.filter((filter) => {
      // Validation 1: Mutual Exclusivity - cannot have both show and hide
      const hasShow = filter.show && filter.show.length > 0;
      const hasHide = filter.hide && filter.hide.length > 0;
      
      if (hasShow && hasHide) {
        throw new Error(`.${filterKey}. Description: Show and hide filters are mutually exclusive - only one can be used at a time.`);
      }
      
      return true;
    }, {
      message: () => 'Show and hide filters are mutually exclusive'
    })
  ).pipe(
    Schema.filter((filter) => {
      // Validation 2: Required Property - at least one of show or hide must be present with values
      const hasShow = filter.show && filter.show.length > 0;
      const hasHide = filter.hide && filter.hide.length > 0;
      
      if (!hasShow && !hasHide) {
        throw new Error(`.${filterKey}. Description: At least one of show or hide must be provided with values.`);
      }
      
      return true;
    }, {
      message: () => 'At least one of show or hide is required'
    })
  );
};

// Valid action names based on ACTIONS.ACTION_NAME
const VALID_ACTION_NAMES = [
  'delete',
  'duplicate',
  'copy',
  'paste',
  'cut',
  'undo',
  'redo'
];

// Schema for actions filter with additional validation
const ActionsFilterObjectSchema = createFilterObjectSchema('actions').pipe(
  Schema.filter((filter) => {
    // Validation 3: Valid Action Names - all actions must be valid
    const filters = filter.show || filter.hide || [];
    const invalidActions = filters.filter(
      (action) => !VALID_ACTION_NAMES.includes(action)
    );
    
    if (invalidActions.length > 0) {
      throw new Error(`.actions. Description: Invalid action names found: ${invalidActions.join(', ')}`);
    }
    
    return true;
  }, {
    message: () => 'All action names must be valid'
  })
);

// Main DisplayFilters schema
export const DisplayFiltersSchema = Schema.Struct({
  elements: Schema.optional(createFilterObjectSchema('elements')),
  style: Schema.optional(createFilterObjectSchema('style')),
  data: Schema.optional(createFilterObjectSchema('data')),
  customActions: Schema.optional(createFilterObjectSchema('customActions')),
  actions: Schema.optional(ActionsFilterObjectSchema),
  cssProperties: Schema.optional(createFilterObjectSchema('cssProperties')),
  cssCustomProperties: Schema.optional(createFilterObjectSchema('cssCustomProperties'))
});

export type DisplayFilters = Schema.Schema.Type<typeof DisplayFiltersSchema>;


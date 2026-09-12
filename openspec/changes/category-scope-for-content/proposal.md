## Why

Categories are currently shared by Articles and Events without a way to express
where each category belongs. This makes irrelevant categories appear in editor
forms and filters, and forces admins to manage a single undifferentiated list.

## What Changes

- Add a category scope with three choices: Articles and Events, Articles only, or Events only.
- Let admins view and change the scope in `/admin/categories`.
- Let admins choose a scope when creating a category, defaulting to both content types.
- Filter article and event editor selectors and listing filters by the category scope.
- Preserve existing category relationships when a scope changes; never delete or rewrite existing content tags automatically.
- Give admins a clear notice when narrowing a scope that already has content using the category.

## Capabilities

### New Capabilities

- `category-scope`: Controls where shared categories can be selected and filtered across Articles and Events.

### Modified Capabilities

None.

## Impact

- Adds a persisted scope field and safe default for existing categories.
- Updates category create/edit actions and the `/admin/categories` table and dialogs.
- Updates server-side category loading for article forms, event forms, article filters, and event filters.
- Adds regression coverage for scope persistence, filtering, and preservation of existing links.
- No migration is needed for content relationships; existing article and event category links remain intact.

## Context

`categories` currently stores only a name and slug, while both article and
event flows load the same unfiltered category list. Events use a many-to-many
join (`event_categories`), whereas an article stores one `categoryId`, so the
scope must be applied at the category read boundary without changing either
content relationship.

The existing admin page uses an inline create form, an edit dialog, and a table.
Article and event forms already receive categories from their route loaders,
and the public event route already accepts a category query parameter. The blog
detail page links to a category query parameter, but the blog listing does not
yet apply that filter.

## Goals / Non-Goals

**Goals:**

- Persist a category scope and make it visible/editable in the existing admin UI.
- Scope article and event editor selectors independently.
- Make article and event category filters/navigations show only relevant categories.
- Default existing categories to both content types and preserve all existing links.

**Non-Goals:**

- Do not split the categories table or create separate article/event taxonomies.
- Do not migrate, delete, or automatically replace category assignments on existing content.
- Do not change the event form's fixed primary event-type options (`Workshop`, `Talk`, etc.).

## Decisions

1. **Use three internal scope values: `both`, `article`, and `event`.**
   The UI labels them `Artikel & Event`, `Artikel saja`, and `Event saja`.
   A non-null text column with a database check and a default of `both` matches
   the existing schema's status pattern and makes the migration straightforward.
   A database enum was considered, but would add a less flexible migration for
   a small controlled vocabulary.

2. **Keep one unfiltered admin catalog and add scope-aware read helpers.**
   `/admin/categories` uses `getAllCategories()` so every category can be
   managed. Article and event loaders use a helper that returns categories whose
   scope is `both` or matches the requested content type. This keeps filtering
   rules in the server layer instead of relying on hidden client options.

3. **Apply scope to query parameters as well as visible filter choices.**
   The article and event list loaders validate a requested slug against the
   relevant scoped catalog before filtering. A stale or out-of-scope slug is
   treated as no active filter rather than exposing an irrelevant result set.
   Both public listings receive a visible category navigation row from the same
   scoped catalog.

4. **Preserve existing assignments when scope narrows.**
   Scope changes affect future selection and filter navigation only. Existing
   `posts.category_id` and `event_categories` rows remain untouched. The edit
   dialog explains this when changing scope so admins understand that no
   content is silently retagged.

5. **Keep the existing form shapes and progressive enhancement.**
   The create form gains a compact radio/segmented scope control; the edit
   dialog gains the same control. Server actions continue using SvelteKit form
   actions and return validation errors through the existing `fail` flow.

## Risks / Trade-offs

- [Existing content has an out-of-scope category] → Keep the relationship in the database and only remove the category from new selectors/filter catalogs; never rewrite content automatically.
- [A stale bookmarked category URL is opened] → Validate the slug against the scoped catalog and render the unfiltered listing with no misleading active filter.
- [The database has existing rows without the new field] → Add the column as `NOT NULL DEFAULT 'both'` and enforce the allowed values with a check constraint.
- [The two content models drift in implementation] → Expose one scope-aware category read contract and cover both article and event callers with tests.

## Migration Plan

1. Add `categories.scope` with default `both` and the allowed-value check.
2. Deploy code that reads and writes the field and uses scoped catalogs.
3. Existing categories remain immediately usable in both contexts; admins may narrow them later.
4. Rollback is code-safe while the column remains present; if the migration must be reverted, restore the previous application and remove the column only after confirming no newer code depends on it.

## Open Questions

- None for the initial implementation. The event primary-type selector remains explicitly outside this feature's scope.

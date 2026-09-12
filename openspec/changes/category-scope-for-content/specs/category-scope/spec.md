## ADDED Requirements

### Requirement: Admins can manage category scope

The admin category management page at `/admin/categories` SHALL show and persist
one of three scopes for every category: `both`, `article`, or `event`. The UI
SHALL label these options `Artikel & Event`, `Artikel saja`, and `Event saja`.
New categories SHALL default to `both`, and the current scope SHALL be selected
when an existing category is edited.

#### Scenario: Admin creates a category without changing the default

- **WHEN** an admin submits the create form with a name and slug and leaves the scope at its default
- **THEN** the category is saved with scope `both` and the table shows `Artikel & Event`

#### Scenario: Admin changes an existing category scope

- **WHEN** an admin selects `Artikel saja` or `Event saja` in the edit dialog and saves
- **THEN** the new scope is persisted and is shown after the page reloads

#### Scenario: Admin sees scope options

- **WHEN** an admin opens the create form or edit dialog
- **THEN** exactly the three supported scope choices are available with clear Indonesian labels

### Requirement: Category scope controls article and event selection

Article category selectors SHALL include only categories with scope `both` or
`article`. Event category tag selectors SHALL include only categories with scope
`both` or `event`. The event form's fixed primary event-type options SHALL remain
unchanged and SHALL NOT be treated as shared category scope values.

#### Scenario: Article author chooses a category

- **WHEN** an article create or edit form is loaded
- **THEN** the category selector contains shared and article-only categories but no event-only categories

#### Scenario: Admin chooses event tags

- **WHEN** an event create or edit form is loaded
- **THEN** the category tag selector contains shared and event-only categories but no article-only categories

### Requirement: Public category filters contain only relevant categories

The article and event public listings SHALL expose category navigation/filter
choices from their respective scoped catalogs. A category query parameter SHALL
filter results only when its slug is valid for that listing's scope. An invalid
or out-of-scope slug SHALL not return content through that listing's filter.

#### Scenario: Visitor filters articles

- **WHEN** a visitor selects an article-capable category on the blog listing
- **THEN** the URL contains the category slug and only published articles assigned to that category are shown

#### Scenario: Visitor filters events

- **WHEN** a visitor selects an event-capable category on the event listing
- **THEN** the URL contains the category slug and only events assigned to that category are shown

#### Scenario: Visitor requests an article-only category on the event listing

- **WHEN** the event listing receives a category slug whose scope excludes events
- **THEN** the event listing ignores the stale filter and does not present it as an active event filter

### Requirement: Scope changes preserve existing content assignments

Changing a category's scope SHALL NOT delete, rewrite, or detach existing
`posts.category_id` or `event_categories` relationships. The admin edit flow
SHALL explain that narrowing a scope affects future selectors and filters while
existing content data remains intact.

#### Scenario: Admin narrows a category used by existing content

- **WHEN** an admin changes a shared category to `Artikel saja` while events still reference it
- **THEN** the event references remain in the database and no event is modified or deleted

#### Scenario: Existing categories are migrated safely

- **WHEN** the scope migration runs against categories created before this feature
- **THEN** every existing category receives scope `both` and remains available to both content types

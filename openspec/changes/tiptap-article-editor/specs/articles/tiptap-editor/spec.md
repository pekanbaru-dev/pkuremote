## Purpose

A Medium-like TipTap rich text editor for writing articles, with a minimal toolbar, drag-drop image upload to R2, and HTML output.

## ADDED Requirements

### Requirement: The article editor uses a TipTap rich text editor for the body

The system SHALL provide an article editor whose body is edited with a TipTap rich text editor (not a plain textarea). The editor SHALL support common rich text formatting: bold, italic, headings, bulleted/numbered lists, blockquote, and links. The editor SHALL output the body as HTML, bound to the form as the `body` field.

#### Scenario: An author formats text in the editor

- **WHEN** an author selects text and applies bold/heading/list formatting in the editor
- **THEN** the formatting is reflected in the editor and the serialized HTML body contains the corresponding tags

#### Scenario: The body is submitted as HTML

- **WHEN** an author submits the article form
- **THEN** the `body` form field contains the HTML serialization of the editor content

### Requirement: The editor supports drag-drop image upload to R2

The system SHALL let an author drag an image onto the editor (or use an image toolbar button) to upload it directly to R2 via a presigned PUT URL, then insert the resulting public CDN URL as an inline image in the body. Upload progress/failure SHALL be surfaced in the editor.

#### Scenario: An author drags an image onto the editor

- **WHEN** an author drags a supported image onto the editor
- **THEN** the image is uploaded to R2 via presigned PUT and an `<img src={publicUrl}>` node is inserted at the drop position

#### Scenario: Upload fails surfaces an error

- **WHEN** the image upload to R2 fails
- **THEN** the editor shows an inline error and does not insert a broken image node

### Requirement: The editor provides a clean, Medium-like writing experience

The editor SHALL render with a minimal, focused toolbar and comfortable reading/prose layout, consistent with the design system. It SHALL show placeholder text when empty.

#### Scenario: Empty editor shows a placeholder

- **WHEN** the editor is empty and focused
- **THEN** a placeholder like "Tulis cerita Anda..." is shown until the author types

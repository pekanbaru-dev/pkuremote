## Purpose

A reusable file upload component with drag & drop, image thumbnail + modal preview (or file-icon + name for non-images), client-side validation, and direct-to-R2 presigned upload, used across forms.

## ADDED Requirements

### Requirement: FileUpload renders a drag-drop area and supports file selection

The system SHALL provide a `FileUpload` component with a drop zone that accepts a single file via drag & drop or click-to-select. It SHALL accept an `accept` prop (default `image/png,image/jpeg,image/webp,image/gif,application/pdf`) and a `maxBytes` prop (default 2 MiB). The component SHALL be controlled via a `value` prop (the current public URL or empty string) and report changes via an `onChange` callback.

#### Scenario: User drags a file onto the drop zone

- **WHEN** a user drags an accepted file (e.g. PNG or PDF) onto the drop zone and releases it
- **THEN** the file is accepted, validated, and upload proceeds

#### Scenario: User clicks the drop zone to select a file

- **WHEN** a user clicks the drop zone and chooses an accepted file
- **THEN** the file is handled identically to a drag-drop

#### Scenario: Value and onChange reflect state

- **WHEN** `value` is set to a URL, the component shows the uploaded state
- **THEN** after a successful upload, `onChange` is called with the resulting public CDN URL

### Requirement: FileUpload validates file type and size client-side

The component SHALL reject files whose MIME type is not in `accept` and files larger than `maxBytes`, showing an inline error and NOT uploading. Validation SHALL happen before any network call.

#### Scenario: A disallowed type is rejected

- **WHEN** a user drops a file not in the accept list (e.g. a `.txt`)
- **THEN** the component shows an inline error and does not upload

#### Scenario: An oversized file is rejected

- **WHEN** a user drops a file larger than `maxBytes`
- **THEN** the component shows an inline error and does not upload

### Requirement: FileUpload accepts an external error prop for form/zod integration

The component SHALL accept an optional `error` prop (string or null) that is rendered as an inline alert alongside any internal validation/upload error. This allows integration with form libraries (e.g. `useForm`/`zodSchema`) that pass validation errors in from the parent. The drop zone SHALL be styled as errored when either the internal or external error is present.

#### Scenario: An external error is displayed

- **WHEN** a parent passes `error` (e.g. "File wajib diisi.")
- **THEN** the component renders the message as an alert without any upload happening

#### Scenario: Internal error takes precedence over external

- **WHEN** both an internal validation error and an external `error` are present
- **THEN** the internal error is shown

### Requirement: FileUpload previews images as a clickable thumbnail with modal, and non-images as an icon + name

For a file that is an image (based on its URL extension), the component SHALL render a thumbnail; clicking it SHALL open a modal (dialog) showing the image at full size with a close affordance. For a non-image file (e.g. PDF), the component SHALL render a file-type icon with the file name and NO modal preview.

#### Scenario: An image shows a thumbnail and opens a modal on click

- **WHEN** the uploaded file is an image and the user clicks the thumbnail
- **THEN** a modal opens showing the full-size image, dismissible via a close button or overlay click

#### Scenario: A non-image shows an icon and file name

- **WHEN** the uploaded file is a non-image (e.g. PDF)
- **THEN** the component renders a file-type icon and the file name, and clicking it does not open an image modal

### Requirement: FileUpload provides a remove action

The component SHALL provide a remove/delete affordance that clears the current value and, when the underlying R2 object should be deleted, invokes a configurable delete callback.

#### Scenario: User removes the current file

- **WHEN** a user clicks remove on an uploaded file
- **THEN** the value is cleared and the component returns to the empty drop-zone state

### Requirement: FileUpload uploads directly to R2 via a presigned URL provider

The component SHALL accept a `getPresignedUrl` async callback that returns `{ presignedUrl, publicUrl }` for a given `{ filename, contentType }`. The component SHALL PUT the file bytes directly to R2 using the presigned URL (fetch PUT), then call `onChange` with `publicUrl`. The component SHALL surface upload errors inline.

#### Scenario: A valid file uploads via presigned PUT

- **WHEN** a valid file is selected and `getPresignedUrl` returns a presigned PUT URL
- **THEN** the component PUTs the file to R2, waits for success, and calls `onChange` with the public URL

#### Scenario: Upload failure surfaces an error

- **WHEN** the presigned PUT fails or the presign request fails
- **THEN** the component shows an inline error and does not update `value`

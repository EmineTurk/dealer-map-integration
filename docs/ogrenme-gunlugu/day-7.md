# Day 7 — React Hook Form, Yup Validation & Parameterized Filtering

## What I Did Today
- Integrated `react-hook-form` and `@hookform/resolvers/yup` to refactor the filter form on the Transactions (`/transactions`) page.
- Created a validation schema using Yup to ensure the transaction capability is selected before submitting, presenting custom error messages under the field.
- Implemented multi-criteria parameterized filters (working hours, store type, and capability) that match the database fields.
- Fixed the Ant Design Drawer styling overrides in `Pages.css` to change the background to white and the text colors to black/dark gray, resolving the legibility issue.

## What I Understood
- **React Hook Form**: A performance-focused library that simplifies form management by utilizing uncontrolled inputs or controlled wraps (`Controller`), preventing unnecessary re-renders of the entire form layout on keypresses.
- **Yup Schema Validation**: Enables declarative schema-based validation. Instead of writing custom logic check branches, we define constraints (like `.required()`) and bind them directly to the form handler.
- **Contrast Ratios**: Designing accessible UIs requires verifying color contrast. Text like `#f3f4f6` (light grey) on `#ffffff` (white) is illegible; setting them to high-contrast colors like `var(--turkcell-blue)` or `#000000` is critical for usability.

## What I Didn't Understand / Doubts
- How we will handle dynamic validation schemas if the backend adds/removes capabilities dynamically at runtime, as Yup schemas are typically defined statically.

## What I Want to Ask in Tomorrow's Standup
- Confirm if the backend A/B teams will use query parameters like `workingHours=weekend` and `status=ACTIVE` exactly as modeled in our parameterized filters.

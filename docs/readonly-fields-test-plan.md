# Readonly Fields Test Plan

## Overview
This document outlines the test plan for verifying that fields marked with `readonly: true` in the CRUD controller are properly disabled and styled.

## Test Environment Setup

1. Start the application:
   ```bash
   go run cmd/server/main.go
   ```

2. Navigate to http://localhost:8080

3. Login with admin credentials

## Manual Test Cases

### 1. Visual Appearance Test

**Objective**: Verify that readonly fields are visually distinct from editable fields.

**Steps**:
1. Navigate to `/currencies`
2. Click "Edit" on any currency record
3. Observe the form fields

**Expected Results**:
- `created_at` and `updated_at` fields should have:
  - Gray background color
  - Reduced opacity (0.7)
  - "Not allowed" cursor when hovered
  - No focus outline when clicked

### 2. Interaction Test

**Objective**: Verify that readonly fields cannot be edited.

**Steps**:
1. Navigate to `/currencies/{id}/edit`
2. Try to click on the `created_at` field
3. Try to type in the field
4. Try to select text in the field

**Expected Results**:
- Field should not receive focus
- No text input should be possible
- Field value should remain unchanged

### 3. Form Submission Test

**Objective**: Verify that readonly fields are not submitted with form data.

**Steps**:
1. Navigate to `/currencies/{id}/edit`
2. Open browser developer tools (Network tab)
3. Modify a non-readonly field (e.g., name)
4. Submit the form
5. Inspect the POST request payload

**Expected Results**:
- Form data should NOT contain `created_at` or `updated_at` fields
- Only modified non-readonly fields should be in the payload

### 4. Different Field Types Test

**Objective**: Test readonly behavior across different field types.

**Test Matrix**:

| Field Type | Element | Test Action | Expected Result |
|------------|---------|-------------|-----------------|
| Text | `<input type="text">` | Click and type | No input accepted |
| Select | `<select>` | Click dropdown | Dropdown doesn't open |
| Checkbox | `<input type="checkbox">` | Click checkbox | State doesn't change |
| Textarea | `<textarea>` | Click and type | No input accepted |
| Date | `<input type="date">` | Click calendar | Calendar doesn't open |

### 5. Dark Mode Test

**Objective**: Verify readonly fields are properly styled in dark mode.

**Steps**:
1. Enable dark mode in the application
2. Navigate to `/currencies/{id}/edit`
3. Observe readonly fields

**Expected Results**:
- Readonly fields should have dark gray background
- Contrast should be maintained for readability

## Automated Test Execution

### Unit Tests
Run the readonly field tests:
```bash
go test ./modules/core/presentation/controllers -run TestEntityWithReadonlyFields -v
go test ./modules/core/presentation/controllers -run TestReadonlyFieldsStyling -v
```

### E2E Tests
Run Cypress tests:
```bash
cd e2e
npm test -- --spec "cypress/e2e/readonly-fields.cy.js"
```

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### CSS Compatibility Notes
- The `:has()` selector is used for some styles but has a fallback
- `pointer-events: none` is widely supported
- `opacity` and `background-color` are universally supported

## Accessibility Testing

1. **Keyboard Navigation**: Readonly fields should be skipped in tab order
2. **Screen Readers**: Fields should announce as "readonly" or "disabled"
3. **Color Contrast**: Gray background should maintain WCAG AA compliance

## Security Testing

1. **Direct POST Request**: Send POST with readonly field values
   ```bash
   curl -X POST http://localhost:8080/currencies/test-id \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "name=Updated&created_at=2099-01-01T00:00:00"
   ```
   Expected: `created_at` should be ignored

2. **Browser DevTools**: Modify readonly attribute and attempt submission
   Expected: Server should still ignore the field

## Performance Testing

1. **Large Forms**: Test with 50+ fields, half readonly
2. **CSS Performance**: Verify no layout thrashing with many readonly fields

## Regression Testing

After any changes to:
- `crud_controller.go`
- Form component templates
- CSS files

Re-run all tests to ensure readonly functionality remains intact.
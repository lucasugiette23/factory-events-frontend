import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that a string control contains non-whitespace characters.
 * Returns { whitespace: true } if the value consists solely of whitespace.
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined) {
      return null;
    }

    const value = String(control.value);
    // If empty string, let Validators.required handle it
    if (value.length === 0) {
      return null;
    }

    const isWhitespace = value.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  };
}

import { FormControl } from '@angular/forms';
import { noWhitespaceValidator } from './no-whitespace.validator';

describe('noWhitespaceValidator', () => {
  const validator = noWhitespaceValidator();

  it('should return null for null or undefined value (delegating to required)', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(undefined))).toBeNull();
  });

  it('should return null for empty string (delegating to required)', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('should return { whitespace: true } for strings containing only spaces, tabs, or newlines', () => {
    expect(validator(new FormControl('   '))).toEqual({ whitespace: true });
    expect(validator(new FormControl(' \t \n '))).toEqual({ whitespace: true });
  });

  it('should return null for strings containing valid text', () => {
    expect(validator(new FormControl('EVT-1001'))).toBeNull();
    expect(validator(new FormControl(' Valid text with spaces '))).toBeNull();
  });
});

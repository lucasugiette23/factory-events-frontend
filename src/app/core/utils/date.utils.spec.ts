import { ensureApiDateTime, formatToApiDateTime } from './date.utils';

describe('date.utils', () => {
  describe('formatToApiDateTime', () => {
    it('should format a Date object into YYYY-MM-DDTHH:mm:ss format', () => {
      const fixedDate = new Date(2026, 4, 20, 10, 5, 8); // May 20, 2026 10:05:08
      const formatted = formatToApiDateTime(fixedDate);
      expect(formatted).toBe('2026-05-20T10:05:08');
    });

    it('should pad single-digit months, days, hours, minutes, and seconds', () => {
      const earlyDate = new Date(2026, 0, 5, 3, 4, 9); // Jan 5, 2026 03:04:09
      const formatted = formatToApiDateTime(earlyDate);
      expect(formatted).toBe('2026-01-05T03:04:09');
    });
  });

  describe('ensureApiDateTime', () => {
    it('should return empty string if input is empty', () => {
      expect(ensureApiDateTime('')).toBe('');
    });

    it('should keep format if it is already YYYY-MM-DDTHH:mm:ss', () => {
      const input = '2026-05-20T10:30:45';
      expect(ensureApiDateTime(input)).toBe('2026-05-20T10:30:45');
    });

    it('should append :00 when format is YYYY-MM-DDTHH:mm', () => {
      const input = '2026-05-20T10:30';
      expect(ensureApiDateTime(input)).toBe('2026-05-20T10:30:00');
    });
  });
});

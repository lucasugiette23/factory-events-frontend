import { ApiProblem } from '../models/api-problem.model';

const supportedCodes = new Set([
  'VALIDATION_ERROR', 'INVALID_JSON', 'UNSUPPORTED_CONTENT_TYPE',
  'DUPLICATE_EVENT', 'DATA_INTEGRITY_ERROR', 'DATABASE_ERROR', 'INTERNAL_ERROR'
]);

const eventFields = new Set(['eventId', 'eventType', 'description', 'timestamp']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseApiProblem(value: unknown): ApiProblem | null {
  if (!isRecord(value) || typeof value['code'] !== 'string' || !supportedCodes.has(value['code'])) {
    return null;
  }

  const detail = typeof value['detail'] === 'string' ? value['detail'].trim() : undefined;
  const rawErrors: unknown[] = Array.isArray(value['errors']) ? value['errors'] : [];
  const errors = rawErrors.filter(isRecord)
    .filter(error => typeof error['field'] === 'string' && eventFields.has(error['field'])
      && typeof error['message'] === 'string' && error['message'].trim().length > 0)
    .map(error => ({ field: error['field'] as string, message: (error['message'] as string).trim() }));

  return { code: value['code'], detail: detail || undefined, errors };
}

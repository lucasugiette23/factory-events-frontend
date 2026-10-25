import { parseApiProblem } from './api-problem.utils';

describe('parseApiProblem', () => {
  it('should reject raw, missing and unknown error responses', () => {
    for (const value of [null, undefined, 'SQL details', [], {}, { code: 'UNKNOWN', detail: 'Internal data' }]) {
      expect(parseApiProblem(value)).toBeNull();
    }
  });

  it('should filter malformed field errors and unknown fields', () => {
    const problem = parseApiProblem({
      code: 'VALIDATION_ERROR', detail: ' Verifique os campos. ',
      errors: [null, {}, { field: 'id', message: 'Unknown field' },
        { field: 'description', message: 123 }, { field: 'eventId', message: ' ' },
        { field: 'description', message: ' Descrição obrigatória. ' }]
    });
    expect(problem?.detail).toBe('Verifique os campos.');
    expect(problem?.errors).toEqual([{ field: 'description', message: 'Descrição obrigatória.' }]);
  });

  it('should tolerate malformed optional properties', () => {
    expect(parseApiProblem({ code: 'DATABASE_ERROR', detail: {}, errors: 'invalid' }))
      .toEqual({ code: 'DATABASE_ERROR', detail: undefined, errors: [] });
  });
});

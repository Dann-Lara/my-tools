import { isExhaustedError } from '../registry';

describe('registry', () => {
  describe('isExhaustedError', () => {
    it('should return true for quota errors', () => {
      expect(isExhaustedError(new Error('quota exceeded'))).toBe(true);
      expect(isExhaustedError('rate limit exceeded')).toBe(true);
      expect(isExhaustedError('rate_limit exceeded')).toBe(true);
    });

    it('should return true for 429 status code', () => {
      expect(isExhaustedError(new Error('429 Too Many Requests'))).toBe(true);
    });

    it('should return true for billing errors', () => {
      expect(isExhaustedError('insufficient_quota')).toBe(true);
      expect(isExhaustedError('billing problem')).toBe(true);
      expect(isExhaustedError('credits depleted')).toBe(true);
    });

    it('should return true for auth errors', () => {
      expect(isExhaustedError('invalid_api_key')).toBe(true);
      expect(isExhaustedError('unauthorized')).toBe(true);
      expect(isExhaustedError(new Error('401 Unauthorized'))).toBe(true);
      expect(isExhaustedError(new Error('403 Forbidden'))).toBe(true);
    });

    it('should return true for 404 errors', () => {
      expect(isExhaustedError('404 not found')).toBe(true);
      expect(isExhaustedError('model not found')).toBe(true);
    });

    it('should return true for service unavailable', () => {
      expect(isExhaustedError('503 service unavailable')).toBe(true);
      expect(isExhaustedError('provider overloaded')).toBe(true);
    });

    it('should return false for other errors', () => {
      expect(isExhaustedError(new Error('invalid prompt format'))).toBe(false);
      expect(isExhaustedError('content policy violation')).toBe(false);
      expect(isExhaustedError(new Error('bad request 400'))).toBe(false);
    });

    it('should handle non-Error inputs', () => {
      expect(isExhaustedError('quota exceeded')).toBe(true);
      expect(isExhaustedError(123)).toBe(false);
      expect(isExhaustedError(null)).toBe(false);
      expect(isExhaustedError(undefined)).toBe(false);
    });
  });
});

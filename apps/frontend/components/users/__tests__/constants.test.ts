import { USER_ROLE_STYLES, getHeaders, type User } from '../constants';

describe('users/constants', () => {
  describe('USER_ROLE_STYLES', () => {
    it('has styles for all roles', () => {
      expect(USER_ROLE_STYLES.superadmin).toBeDefined();
      expect(USER_ROLE_STYLES.admin).toBeDefined();
      expect(USER_ROLE_STYLES.client).toBeDefined();
    });

    it('contains dark mode styles', () => {
      expect(USER_ROLE_STYLES.superadmin).toContain('dark:text-yellow-400');
      expect(USER_ROLE_STYLES.admin).toContain('dark:text-sky-400');
    });
  });

  describe('getHeaders', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns basic headers when no token', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      const headers = getHeaders();
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Authorization).toBeUndefined();
    });

    it('includes Authorization header when token exists', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token');
      const headers = getHeaders();
      expect(headers.Authorization).toBe('Bearer test-token');
    });
  });
});

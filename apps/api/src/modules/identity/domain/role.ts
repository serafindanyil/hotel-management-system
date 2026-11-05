export type Role = 'GUEST' | 'MANAGER';

const MANAGER_CLAIM = 'MANAGER';

// A missing or unknown claim reads as GUEST, so only an explicit grant makes a manager.
export const Role = {
  fromClaim: (claim: unknown): Role => (claim === MANAGER_CLAIM ? 'MANAGER' : 'GUEST'),
} as const;

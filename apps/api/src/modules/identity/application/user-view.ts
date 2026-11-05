import type { Role } from '../domain/role.js';
import type { User } from '../domain/user.js';

export interface UserView {
  id: string;
  email: string | null;
  displayName: string | null;
  role: Role;
}

// The role comes from the token's claim, since the database holds no role.
export const toUserView = (user: User, role: Role): UserView => ({
  id: user.id,
  email: user.email?.value ?? null,
  displayName: user.displayName,
  role,
});

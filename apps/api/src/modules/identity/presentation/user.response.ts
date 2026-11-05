import type { Role } from '../domain/role.js';

import { ApiProperty } from '@nestjs/swagger';

const ROLE_VALUES = ['GUEST', 'MANAGER'] as const satisfies readonly Role[];

export class UserResponse {
  @ApiProperty({ format: 'uuid' })
  id: string;

  /** Null until the email is verified. */
  email: string | null;

  displayName: string | null;

  @ApiProperty({ enum: ROLE_VALUES, enumName: 'Role' })
  role: Role;
}

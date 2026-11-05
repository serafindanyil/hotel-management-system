import type { VerifiedIdentity } from '../domain/verified-identity.js';
import type { UserView } from './user-view.js';

import { Injectable } from '@nestjs/common';

import { User } from '../domain/user.js';
import { UserRepository } from '../domain/user-repository.js';
import { toUserView } from './user-view.js';

@Injectable()
export class SyncUserHandler {
  constructor(private readonly users: UserRepository) {}

  async execute(identity: VerifiedIdentity): Promise<UserView> {
    const user = await this.syncRecord(identity);
    return toUserView(user, identity.role);
  }

  private async syncRecord(identity: VerifiedIdentity): Promise<User> {
    const existing = await this.users.findByFirebaseUid(identity.firebaseUid);
    if (!existing) return this.users.save(User.register(identity));
    return existing.syncFrom(identity) ? this.users.save(existing) : existing;
  }
}

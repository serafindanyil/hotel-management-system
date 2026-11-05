import type { User as UserRecord } from '../../../generated/prisma/client.js';
import type { UserRepository } from '../domain/user-repository.js';

import { Injectable } from '@nestjs/common';

import { Email } from '../domain/email.js';
import { EmailTakenError } from '../domain/errors.js';
import { User } from '../domain/user.js';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

import { Prisma } from '../../../generated/prisma/client.js';

const UNIQUE_VIOLATION = 'P2002';

const toDomain = (record: UserRecord): User =>
  User.restore({
    id: record.id,
    firebaseUid: record.firebaseUid,
    email: record.email === null ? null : Email.of(record.email),
    displayName: record.displayName,
  });

// The upsert resolves a second insert with the same firebaseUid into an update, so a unique
// violation here comes from the email column.
const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { firebaseUid } });
    return record ? toDomain(record) : null;
  }

  async save(user: User): Promise<User> {
    const fields = { email: user.email?.value ?? null, displayName: user.displayName };
    try {
      const record = await this.prisma.user.upsert({
        where: { firebaseUid: user.firebaseUid },
        create: { id: user.id, firebaseUid: user.firebaseUid, ...fields },
        update: fields,
      });
      return toDomain(record);
    } catch (error) {
      throw isUniqueViolation(error) ? new EmailTakenError() : error;
    }
  }
}

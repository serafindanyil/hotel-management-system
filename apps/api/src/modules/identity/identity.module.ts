import { Module } from '@nestjs/common';

import { AuthenticateCallerHandler } from './application/authenticate-caller.handler.js';
import { SyncUserHandler } from './application/sync-user.handler.js';
import { TokenVerifier } from './domain/token-verifier.js';
import { UserRepository } from './domain/user-repository.js';
import { firebaseAdminProvider } from './infrastructure/firebase-admin.provider.js';
import { FirebaseTokenVerifier } from './infrastructure/firebase-token-verifier.js';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository.js';
import { AdminPingController } from './presentation/admin-ping.controller.js';
import { MeController } from './presentation/me.controller.js';

@Module({
  controllers: [MeController, AdminPingController],
  providers: [
    firebaseAdminProvider,
    { provide: TokenVerifier, useClass: FirebaseTokenVerifier },
    { provide: UserRepository, useClass: PrismaUserRepository },
    SyncUserHandler,
    AuthenticateCallerHandler,
  ],
  exports: [AuthenticateCallerHandler],
})
export class IdentityModule {}

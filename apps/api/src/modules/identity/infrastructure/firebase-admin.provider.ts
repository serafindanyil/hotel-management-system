import type { Provider } from '@nestjs/common';
import type { Auth } from 'firebase-admin/auth';
import type { EnvironmentVariables } from '../../../config/environment-variables.js';

import { ConfigService } from '@nestjs/config';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const FIREBASE_AUTH = Symbol('FIREBASE_AUTH');

// The private key arrives with its line breaks escaped, as one line of the .env file.
const ESCAPED_NEWLINE = /\\n/g;

const createFirebaseAuth = (config: ConfigService<EnvironmentVariables, true>): Auth => {
  const projectId = config.get('FIREBASE_PROJECT_ID', { infer: true });
  const app = initializeApp({
    projectId,
    credential: cert({
      projectId,
      clientEmail: config.get('FIREBASE_CLIENT_EMAIL', { infer: true }),
      privateKey: config
        .get('FIREBASE_PRIVATE_KEY', { infer: true })
        .replace(ESCAPED_NEWLINE, '\n'),
    }),
  });
  return getAuth(app);
};

export const firebaseAdminProvider: Provider = {
  provide: FIREBASE_AUTH,
  inject: [ConfigService],
  useFactory: createFirebaseAuth,
};

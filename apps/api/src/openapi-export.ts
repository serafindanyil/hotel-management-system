import type { INestApplication } from '@nestjs/common';

import { rename, writeFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';

import { applyApiPrefix } from './infrastructure/http/api-prefix.js';
import { createOpenApiDocument } from './infrastructure/http/openapi-document.js';

// Inert values that only pass configuration validation; preview mode never connects with them.
// Keep one entry per required variable of EnvironmentVariables in src/config/environment-variables.ts.
const PLACEHOLDER_ENVIRONMENT: Record<string, string> = {
  DATABASE_URL: 'postgresql://openapi-export@localhost:5432/openapi-export',
  FIREBASE_PROJECT_ID: 'openapi-export',
  FIREBASE_CLIENT_EMAIL: 'openapi-export@example.invalid',
  FIREBASE_PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----\\n${'A'.repeat(64)}\\n-----END PRIVATE KEY-----\\n`,
  CORS_ORIGINS: 'http://localhost',
};

const OUTPUT_FILE = new URL('../openapi.json', import.meta.url);
const TEMPORARY_FILE = new URL('../openapi.json.tmp', import.meta.url);
const JSON_INDENT = 2;

const fillMissingEnvironment = (): void => {
  for (const [name, value] of Object.entries(PLACEHOLDER_ENVIRONMENT)) {
    if (!process.env[name]) process.env[name] = value;
  }
};

// Preview mode resolves the module graph without instantiating providers, so nothing connects.
const createPreviewApp = async (): Promise<INestApplication> => {
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule, { preview: true, logger: ['error'] });
  applyApiPrefix(app);
  return app;
};

// Written beside the target and renamed over it, so an interrupted export never leaves half a file.
const writeDocument = async (document: unknown): Promise<void> => {
  await writeFile(TEMPORARY_FILE, `${JSON.stringify(document, null, JSON_INDENT)}\n`);
  await rename(TEMPORARY_FILE, OUTPUT_FILE);
};

const exportDocument = async (): Promise<void> => {
  fillMissingEnvironment();
  const app = await createPreviewApp();
  try {
    await writeDocument(createOpenApiDocument(app));
  } finally {
    await app.close();
  }
};

await exportDocument();

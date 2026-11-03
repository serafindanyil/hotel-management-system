import type { INestApplication } from '@nestjs/common';

const API_PREFIX = 'api/v1';
const UNPREFIXED_ROUTES = ['health'];

export const applyApiPrefix = (app: INestApplication): void => {
  app.setGlobalPrefix(API_PREFIX, { exclude: UNPREFIXED_ROUTES });
};

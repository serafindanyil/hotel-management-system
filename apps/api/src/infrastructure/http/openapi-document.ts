import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Served without the API prefix, so the JSON document answers at /api/docs-json.
export const OPENAPI_PATH = 'api/docs';

const DOCUMENT_CONFIG = new DocumentBuilder()
  .setTitle('Hotel Management System API')
  .setVersion('1')
  .build();

const CONTROLLER_SUFFIX = /Controller$/;

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);
const upperFirst = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

// Operation ids name the generated client functions: HealthController.check → healthCheck.
const buildOperationId = (controllerKey: string, methodKey: string): string =>
  `${lowerFirst(controllerKey.replace(CONTROLLER_SUFFIX, ''))}${upperFirst(methodKey)}`;

export const createOpenApiDocument = (app: INestApplication): OpenAPIObject =>
  SwaggerModule.createDocument(app, DOCUMENT_CONFIG, { operationIdFactory: buildOperationId });

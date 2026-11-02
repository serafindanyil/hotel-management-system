import type { ValidationError } from 'class-validator';

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { EnvironmentVariables } from './environment-variables.js';

const describeError = (error: ValidationError): string =>
  `${error.property} (${Object.keys(error.constraints ?? {}).join(', ')})`;

export const validateEnvironment = (config: Record<string, unknown>): EnvironmentVariables => {
  const environment = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(environment);
  if (errors.length > 0) {
    throw new Error(`Invalid configuration: ${errors.map(describeError).join('; ')}`);
  }
  return environment;
};

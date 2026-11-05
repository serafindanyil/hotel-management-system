import { getSchemaPath } from '@nestjs/swagger';

// The OpenAPI document registers ErrorResponse as an extra model under this name.
const ERROR_RESPONSE_SCHEMA = 'ErrorResponse';

export const errorReply = (description: string) => ({
  description,
  schema: { $ref: getSchemaPath(ERROR_RESPONSE_SCHEMA) },
});

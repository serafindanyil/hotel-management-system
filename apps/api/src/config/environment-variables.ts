import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

const MIN_PORT = 1;
const MAX_PORT = 65_535;
// A PEM header followed by a full base64 line, with its line breaks escaped or real.
const PRIVATE_KEY_PATTERN = /^-----BEGIN PRIVATE KEY-----(?:\\n|\s)+[A-Za-z0-9+/]{64}/;
const ORIGIN_LIST_PATTERN = /^https?:\/\/[^\s,]+(\s*,\s*https?:\/\/[^\s,]+)*$/;

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  @Matches(PRIVATE_KEY_PATTERN)
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  @Matches(ORIGIN_LIST_PATTERN)
  CORS_ORIGINS: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_PORT)
  @Max(MAX_PORT)
  PORT?: number;
}

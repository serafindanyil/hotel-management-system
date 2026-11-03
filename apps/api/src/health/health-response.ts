import { ApiProperty } from '@nestjs/swagger';

const HEALTH_STATUSES = ['ok', 'unavailable'] as const;

type HealthStatus = (typeof HEALTH_STATUSES)[number];

export class HealthResponse {
  @ApiProperty({ enum: HEALTH_STATUSES, enumName: 'HealthStatus' })
  status: HealthStatus;
}
